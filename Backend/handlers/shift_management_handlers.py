from datetime import datetime
import json
from config.constants import db
from db.controllers.shifts_controller import ShiftsController
from db.controllers.shiftWorkers_controller import ShiftWorkersController
from db.controllers.employee_certifications_controller import EmployeeCertificationsController
from db.controllers.users_controller import UsersController
from db.models import ShiftPart, EmployeeType # Import Enums
from user_session import UserSession

def handle_create_shift(data: dict, user_session: UserSession):
    """
    Handles the request to create a new shift.
    'data' should include: job_id, shiftDate (YYYY-MM-DD), shiftPart (morning/noon/evening),
                         required_employee_counts (JSON string or dict), client_po_number (optional)
    """
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": 220, "success": False, "error": "Unauthorized access."}

    try:
        job_id = data.get("job_id")
        shift_date_str = data.get("shiftDate")
        shift_part_str = data.get("shiftPart")
        required_counts_input = data.get("required_employee_counts")
        client_po_number = data.get("client_po_number")

        if not all([job_id, shift_date_str, shift_part_str, required_counts_input is not None]):
            return {"request_id": 220, "success": False, "error": "Missing required fields (job_id, shiftDate, shiftPart, required_employee_counts)."}

        shift_date = datetime.strptime(shift_date_str, "%Y-%m-%d").date()
        shift_part = ShiftPart(shift_part_str) # Convert string to Enum

        if isinstance(required_counts_input, str):
            required_employee_counts = json.loads(required_counts_input)
        elif isinstance(required_counts_input, dict):
            required_employee_counts = required_counts_input
        else:
            return {"request_id": 220, "success": False, "error": "required_employee_counts must be a JSON string or a dictionary."}
        
        # Validate required_employee_counts keys against EmployeeType enum
        for role_key in required_employee_counts.keys():
            if role_key not in EmployeeType._value2member_map_:
                return {"request_id": 220, "success": False, "error": f"Invalid role '{role_key}' in required_employee_counts."}


        shift_data = {
            "job_id": int(job_id),
            "shiftDate": shift_date,
            "shiftPart": shift_part,
            "required_employee_counts": required_employee_counts,
            "client_po_number": client_po_number
        }

        controller = ShiftsController(db)
        created_shift = controller.create_entity(shift_data)
        # Assuming create_entity returns the model instance, convert it for client
        # The convert_shift_for_client function needs to be accessible or redefined here
        # For simplicity, let's assume the controller's get_entity can re-fetch and convert
        
        # Re-fetch and convert to include all details like ID
        new_shift_details = controller.get_entity(created_shift.id) # Base controller get_entity
        
        # Manually construct the response if get_entity doesn't format it
        response_data = {
            "id": new_shift_details.id,
            "job_id": new_shift_details.job_id,
            "shiftDate": new_shift_details.shiftDate.isoformat(),
            "shiftPart": new_shift_details.shiftPart.value,
            "required_employee_counts": new_shift_details.required_employee_counts,
            "client_po_number": new_shift_details.client_po_number,
            "workers": [] # New shift has no workers initially
        }
        return {"request_id": 220, "success": True, "data": response_data}
    except ValueError as ve:
        return {"request_id": 220, "success": False, "error": f"Invalid data: {str(ve)}"}
    except Exception as e:
        print(f"Error in handle_create_shift: {e}")
        return {"request_id": 220, "success": False, "error": "An unexpected error occurred."}

def handle_get_shifts_by_job(data: dict, user_session: UserSession):
    """
    Handles the request to get all shifts for a specific job.
    'data' should include: job_id
    """
    if not user_session or not user_session.can_access_manager_page(): # Or other appropriate permission
        return {"request_id": 221, "success": False, "error": "Unauthorized access."}

    job_id = data.get("job_id")
    if job_id is None:
        return {"request_id": 221, "success": False, "error": "job_id is required."}

    try:
        controller = ShiftsController(db)
        shifts = controller.get_shifts_by_job_id(int(job_id)) # This method now returns formatted dicts
        return {"request_id": 221, "success": True, "data": shifts}
    except Exception as e:
        print(f"Error in handle_get_shifts_by_job: {e}")
        return {"request_id": 221, "success": False, "error": "An unexpected error occurred."}

def _validate_role_assignment(user_id: int, role_assigned: str) -> tuple[bool, str]:
    """
    Validate if a user can be assigned to a specific role based on their certifications.

    Args:
        user_id (int): The user's ID
        role_assigned (str): The role to assign (EmployeeType value)

    Returns:
        tuple[bool, str]: (is_valid, error_message)
    """
    try:
        certifications_controller = EmployeeCertificationsController(db)
        cert = certifications_controller.get_certification_by_user_id(user_id)

        # If no certification record exists, create a default one (everyone can be stagehand)
        if not cert:
            cert_data = {
                'can_crew_chief': False,
                'can_forklift': False,
                'can_truck': False
            }
            cert = certifications_controller.create_or_update_certification(user_id, cert_data)

        # Check if user can fill the requested role
        if cert.can_fill_role(role_assigned):
            return True, ""
        else:
            users_controller = UsersController(db)
            user = users_controller.get_entity(user_id)
            user_name = user.name if user else f"User {user_id}"
            return False, f"{user_name} is not certified for the role: {role_assigned}"

    except Exception as e:
        return False, f"Error validating role assignment: {str(e)}"


def handle_assign_worker_to_shift(data: dict, user_session: UserSession):
    """
    Handles assigning a worker to a shift.
    'data' should include: shift_id, user_id (employee_id), role_assigned (string value of EmployeeType)
    """
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": 230, "success": False, "error": "Unauthorized access."}

    try:
        shift_id = data.get("shift_id")
        user_id = data.get("user_id")
        role_assigned_str = data.get("role_assigned")

        if not all([shift_id, user_id, role_assigned_str]):
            return {"request_id": 230, "success": False, "error": "Missing required fields (shift_id, user_id, role_assigned)."}

        # Validate role_assigned_str against EmployeeType enum
        if role_assigned_str not in EmployeeType._value2member_map_:
             return {"request_id": 230, "success": False, "error": f"Invalid role: {role_assigned_str}"}

        role_assigned = EmployeeType(role_assigned_str)

        # Validate that the user is certified for this role
        is_valid, error_msg = _validate_role_assignment(int(user_id), role_assigned_str)
        if not is_valid:
            return {"request_id": 230, "success": False, "error": error_msg}

        shift_worker_data = {
            "shiftID": int(shift_id),
            "userID": int(user_id),
            "role_assigned": role_assigned
        }
        controller = ShiftWorkersController(db)
        created_assignment = controller.create_entity(shift_worker_data)
        
        # Format response
        response_data = {
            "shiftID": created_assignment.shiftID,
            "userID": created_assignment.userID,
            "role_assigned": created_assignment.role_assigned.value
        }
        return {"request_id": 230, "success": True, "data": response_data}
    except ValueError as ve: # For int conversion or invalid enum value
        return {"request_id": 230, "success": False, "error": f"Invalid data: {str(ve)}"}
    except Exception as e:
        print(f"Error in handle_assign_worker_to_shift: {e}")
        # Consider checking for specific database errors like integrity violations (e.g., duplicate assignment)
        return {"request_id": 230, "success": False, "error": "An unexpected error occurred or assignment already exists."}


def handle_unassign_worker_from_shift(data: dict, user_session: UserSession):
    """
    Handles unassigning a worker from a shift.
    'data' should include: shift_id, user_id (employee_id), role_assigned (string value of EmployeeType)
    """
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": 231, "success": False, "error": "Unauthorized access."}

    try:
        shift_id = data.get("shift_id")
        user_id = data.get("user_id")
        role_assigned_str = data.get("role_assigned")

        if not all([shift_id, user_id, role_assigned_str]):
            return {"request_id": 231, "success": False, "error": "Missing required fields (shift_id, user_id, role_assigned)."}

        controller = ShiftWorkersController(db)
        # Uses the new delete_entity_by_composite_key method
        deleted_assignment = controller.delete_entity_by_composite_key(int(shift_id), int(user_id), role_assigned_str)

        if deleted_assignment:
            return {"request_id": 231, "success": True, "message": "Worker unassigned successfully."}
        else:
            return {"request_id": 231, "success": False, "error": "Assignment not found or invalid role."}
            
    except ValueError as ve: # For int conversion or invalid enum value
        return {"request_id": 231, "success": False, "error": f"Invalid data: {str(ve)}"}
    except Exception as e:
        print(f"Error in handle_unassign_worker_from_shift: {e}")
        return {"request_id": 231, "success": False, "error": "An unexpected error occurred."}
