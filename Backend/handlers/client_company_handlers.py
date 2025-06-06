from config.constants import db
from db.controllers.client_companies_controller import ClientCompaniesController


def handle_get_all_client_companies(user_session):
    """
    Handles the request to get all client companies.
    Requires a user session but doesn't strictly need manager privileges for listing,
    though typically job creation (which uses this) is a manager function.
    """
    if not user_session:
        return {"success": False, "error": "User session not found."}

    # if not user_session.can_access_manager_page():
    #     return {"success": False, "error": "User does not have access to this feature."}

    try:
        controller = ClientCompaniesController(db)
        companies = controller.get_all_client_companies()
        return {"request_id": 200, "success": True, "data": companies} # New request_id for this
    except Exception as e:
        print(f"Error in handle_get_all_client_companies: {e}")
        return {"request_id": 200, "success": False, "error": str(e)}
