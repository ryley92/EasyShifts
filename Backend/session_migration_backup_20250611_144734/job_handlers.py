from config.constants import db
from db.controllers.jobs_controller import JobsController
from user_session import UserSession


def handle_create_job(data: dict, user_session: UserSession):
    """
    Handles the request to create a new job with location information.
    Each job represents a specific project at a specific venue.
    data should include: name, client_company_id, venue_name, venue_address
    """
    if not user_session:
        return {"success": False, "error": "User session not found."}
    if not user_session.can_access_manager_page():
        return {"success": False, "error": "User does not have manager privileges."}

    # Required fields
    job_name = data.get("name")
    client_company_id = data.get("client_company_id")
    venue_name = data.get("venue_name")
    venue_address = data.get("venue_address")

    if not all([job_name, client_company_id, venue_name, venue_address]):
        return {"request_id": 210, "success": False, "error": "name, client_company_id, venue_name, and venue_address are required."}

    try:
        controller = JobsController(db)
        job_data = {
            "name": job_name,
            "client_company_id": int(client_company_id),
            "venue_name": venue_name,
            "venue_address": venue_address,
            "venue_contact_info": data.get("venue_contact_info"),
            "description": data.get("description"),
            "estimated_start_date": data.get("estimated_start_date"),
            "estimated_end_date": data.get("estimated_end_date"),
            "created_by": user_session.get_id
        }
        print(f"Creating job with data: {job_data}")
        created_job = controller.create_job(job_data)
        print(f"Job created successfully: {created_job}")

        # Verify the job was actually saved by trying to retrieve it
        all_jobs = controller.get_all_active_jobs()
        print(f"All jobs for Hands on Labor: {all_jobs}")

        return {"request_id": 210, "success": True, "data": created_job}
    except Exception as e:
        print(f"Error in handle_create_job: {e}")
        import traceback
        traceback.print_exc()
        return {"request_id": 210, "success": False, "error": str(e)}


def handle_get_jobs_by_manager(user_session: UserSession):
    """
    Handles the request to get all jobs for Hands on Labor.
    All managers can see and manage all jobs since there's only one company.
    """
    if not user_session:
        return {"success": False, "error": "User session not found."}
    if not user_session.can_access_manager_page():
        return {"success": False, "error": "User does not have manager privileges."}

    try:
        controller = JobsController(db)
        print(f"Fetching all jobs for Hands on Labor")
        jobs = controller.get_all_active_jobs()
        print(f"Found {len(jobs)} jobs: {jobs}")
        return {"request_id": 211, "success": True, "data": jobs}
    except Exception as e:
        print(f"Error in handle_get_jobs_by_manager: {e}")
        import traceback
        traceback.print_exc()
        return {"request_id": 211, "success": False, "error": str(e)}
