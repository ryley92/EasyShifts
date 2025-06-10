from config.constants import db
from db.controllers.users_controller import UsersController
from db.controllers.employee_certifications_controller import EmployeeCertificationsController
from user_session import UserSession

def handle_employee_list(user_session: UserSession) -> dict:
    request_id = 60
    if user_session is None:
        print("User session not found.")
        return {"request_id": request_id, "success": False, "error": "User session not found."}

    if user_session.can_access_manager_page():
        users_controller = UsersController(db)

        try:
            # For Hands on Labor: All managers can see all employees (no workplace restrictions)
            all_users = users_controller.get_all_entities()

            active_workers = []
            for user in all_users:
                # Only include non-manager users (employees)
                if not user.isManager and user.isActive:
                    active_workers.append({
                        "userName": user.username,
                        "name": user.name,
                        "approved": user.isApproval
                    })

            return {"request_id": request_id, "success": True, "data": active_workers}
        except Exception as e:
            print(f"Error fetching employee list: {e}")
            return {"request_id": request_id, "success": False, "error": f"An error occurred while fetching employee list: {str(e)}"}
    else:
        print("User does not have access to manager-specific pages.")
        return {"request_id": request_id, "success": False, "error": "User does not have access to manager-specific pages."}


def handle_get_all_approved_worker_details(user_session: UserSession) -> dict:
    """
    Get all approved workers with their certification details for Hands on Labor.
    Since there's only one company, all managers can see all approved workers.
    """
    request_id = 94
    if user_session is None:
        return {"request_id": request_id, "success": False, "error": "User session not found."}

    if user_session.can_access_manager_page():
        try:
            certifications_controller = EmployeeCertificationsController(db)

            # Get all employees with certifications for Hands on Labor (no workplace restriction)
            employees_with_certs = certifications_controller.get_all_employees_with_certifications(None)

            return {"request_id": request_id, "success": True, "data": employees_with_certs}

        except Exception as e:
            print(f"Error fetching employee details with certifications: {e}")
            return {"request_id": request_id, "success": False, "error": f"An error occurred: {str(e)}"}
    else:
        return {"request_id": request_id, "success": False, "error": "User does not have access to manager-specific pages."}


def handle_employee_approval(data: dict, user_session: UserSession) -> dict:
    request_id = 62
    if user_session is None:
        print("User session not found.")
        return {"request_id": request_id, "success": False, "error": "User session not found."}

    if user_session.can_access_manager_page():
        user_name = data.get('userName')
        if user_name:
            try:
                users_controller_instance = UsersController(db)
                users_controller_instance.approve_user(user_name) 
                return {"request_id": request_id, "success": True, "message": f"User {user_name} approved successfully."}
            except Exception as e:
                print(f"Error approving employee {user_name}: {e}")
                return {"request_id": request_id, "success": False, "error": f"Failed to approve user {user_name}: {str(e)}"}
        else:
            print("Employee userName not provided in the data.")
            return {"request_id": request_id, "success": False, "error": "Employee userName not provided."}
    else:
        print("User does not have access to manager-specific pages.")
        return {"request_id": request_id, "success": False, "error": "User does not have access to manager-specific pages."}


def handle_employee_rejection(data: dict, user_session: UserSession) -> dict:
    request_id = 64
    if user_session is None:
        print("User session not found.")
        return {"request_id": request_id, "success": False, "error": "User session not found."}

    if user_session.can_access_manager_page():
        users_controller = UsersController(db)
        user_name = data.get('userName')

        if not user_name:
            return {"request_id": request_id, "success": False, "error": "Employee userName not provided."}

        try:
            user_id = users_controller.get_user_id_by_username(user_name)

            if user_id is not None:
                # For Hands on Labor: No workplace entries to delete, just delete the user
                deleted_user_entity = users_controller.delete_entity(user_id)

                if deleted_user_entity:
                    print(f"Employee with userName {user_name} has been successfully deleted.")
                    return {"request_id": request_id, "success": True, "message": f"Employee {user_name} rejected and deleted."}
                else:
                    print(f"Failed to delete employee with userName {user_name}, entity might not have been found for deletion.")
                    return {"request_id": request_id, "success": False, "error": f"Failed to delete user {user_name}, user might have already been deleted."}
            else:
                print(f"No user found with userName {user_name}.")
                return {"request_id": request_id, "success": False, "error": f"No user found with userName {user_name}."}
        except Exception as e:
            print(f"Error rejecting employee {user_name}: {e}")
            return {"request_id": request_id, "success": False, "error": f"An error occurred while rejecting employee {user_name}: {str(e)}"}
    else:
        print("User does not have access to manager-specific pages.")
        return {"request_id": request_id, "success": False, "error": "User does not have access to manager-specific pages."}
