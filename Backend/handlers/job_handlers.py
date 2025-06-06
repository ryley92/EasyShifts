from config.constants import db
from db.controllers.jobs_controller import JobsController
from user_session import UserSession


def handle_create_job(data: dict, user_session: UserSession):
    """
    Handles the request to create a new job.
    data should include: name, client_company_id
    workplace_id will be derived from the manager's user_session.
    """
    if not user_session:
        return {"success": False, "error": "User session not found."}
    if not user_session.can_access_manager_page():
        return {"success": False, "error": "User does not have manager privileges."}

    job_name = data.get("name")
    client_company_id = data.get("client_company_id")

    if not job_name or client_company_id is None:
        return {"request_id": 210, "success": False, "error": "Job name and client_company_id are required."}

    try:
        controller = JobsController(db)
        job_data = {
            "name": job_name,
            "client_company_id": int(client_company_id),
            "workplace_id": user_session.get_id  # Manager's user_id is the workplace_id for the job
        }
        created_job = controller.create_job(job_data)
        return {"request_id": 210, "success": True, "data": created_job}
    except Exception as e:
        print(f"Error in handle_create_job: {e}")
        return {"request_id": 210, "success": False, "error": str(e)}


def handle_get_jobs_by_manager(user_session: UserSession):
    """
    Handles the request to get all jobs associated with the logged-in manager.
    """
    if not user_session:
        return {"success": False, "error": "User session not found."}
    if not user_session.can_access_manager_page():
        return {"success": False, "error": "User does not have manager privileges."}

    try:
        controller = JobsController(db)
        manager_id = user_session.get_id
        jobs = controller.get_jobs_by_workplace_id(manager_id)
        return {"request_id": 211, "success": True, "data": jobs}
    except Exception as e:
        print(f"Error in handle_get_jobs_by_manager: {e}")
        return {"request_id": 211, "success": False, "error": str(e)}
