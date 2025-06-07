from config.constants import db
from db.controllers.users_controller import UsersController
from db.controllers.workPlaces_controller import WorkPlacesController
from user_session import UserSession

def handle_employee_list(user_session: UserSession) -> dict:
    request_id = 60
    if user_session is None:
        print("User session not found.")
        return {"request_id": request_id, "success": False, "error": "User session not found."}

    if user_session.can_access_manager_page():
        work_places_controller = WorkPlacesController(db)
        manager_id = user_session.get_id
        
        try:
            active_workers_approved = work_places_controller.get_active_approve_workers_for_user(manager_id)
            active_workers_unapproved = work_places_controller.get_active_unapprove_workers_for_user(manager_id)

            active_workers = []
            if active_workers_approved: 
                for worker_username, worker_name in active_workers_approved:
                    active_workers.append({"userName": worker_username, "name": worker_name, "approved": True})
            if active_workers_unapproved: 
                for worker_username, worker_name in active_workers_unapproved:
                    active_workers.append({"userName": worker_username, "name": worker_name, "approved": False})
            
            return {"request_id": request_id, "success": True, "data": active_workers}
        except Exception as e:
            print(f"Error fetching employee list: {e}")
            return {"request_id": request_id, "success": False, "error": f"An error occurred while fetching employee list: {str(e)}"}
    else:
        print("User does not have access to manager-specific pages.")
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
        workplaces_controller = WorkPlacesController(db) 
        user_name = data.get('userName')

        if not user_name:
            return {"request_id": request_id, "success": False, "error": "Employee userName not provided."}

        try:
            user_id = users_controller.get_user_id_by_username(user_name)

            if user_id is not None:
                try:
                    workplace_entry = workplaces_controller.get_entity(user_id)
                    if workplace_entry:
                         workplaces_controller.delete_entity(user_id)
                except Exception as e: 
                    print(f"No workplace entry found for user ID {user_id} or error deleting: {e}")
                
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
