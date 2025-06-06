from Backend.config.constants import db
from Backend.db.services.shiftWorkers_service import ShiftWorkersService
from Backend.user_session import UserSession
from Backend.db.models import EmployeeType, User
from Backend.db.controllers.users_controller import UsersController


def handle_get_crew_chief_shifts(user_session: UserSession):
    """
    Handles the request for a Crew Chief to view their supervised shifts.
    """
    if not user_session:
        return {"success": False, "error": "User session not found."}

    user_id = user_session.get_id

    # Verify user is a crew chief in general (optional, could rely on role_assigned in ShiftWorker)
    # user_controller = UsersController(db)
    # user = user_controller.get_entity(user_id)
    # if not user or user.employee_type != EmployeeType.CREW_CHIEF:
    #     return {"success": False, "error": "User is not authorized as a Crew Chief."}
    # The above check might be too restrictive if a user can be a crew chief for some shifts
    # and a regular employee for others. The primary check is role_assigned in ShiftWorker.

    shift_workers_service = ShiftWorkersService(db_session=db) # Assuming service takes db_session
    
    try:
        shifts_details = shift_workers_service.get_supervised_shifts_details(user_id)
        return {"request_id": 100, "success": True, "data": shifts_details}
    except Exception as e:
        print(f"Error in handle_get_crew_chief_shifts: {e}")
        return {"success": False, "error": str(e)}
