from config.constants import db
from db.controllers.userRequests_controller import UserRequestsController
from db.controllers.users_controller import UsersController


def handle_get_employee_requests(data, user_session):
    if user_session.can_access_manager_page():
        users_controller = UsersController(db)
        user_requests_controller = UserRequestsController(db)

        # For Hands on Labor: Get all active employees (no workplace restrictions)
        all_users = users_controller.get_all_entities()
        active_workers = [user for user in all_users if not user.isManager and user.isActive and user.isApproval]

        employees_requests = {}
        for worker in active_workers:
            employees_requests[worker.name] = user_requests_controller.get_request_by_userid(worker.id)

        return {"success": True, "data": employees_requests}
    else:
        error_message = "User does not have access to manager-specific pages."
        print(error_message)
        return {"success": False, "error": error_message}
