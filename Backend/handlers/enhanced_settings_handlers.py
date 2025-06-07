from datetime import datetime
from config.constants import db
from db.controllers.workplace_settings_controller import WorkplaceSettingsController
from user_session import UserSession


def handle_get_all_settings(user_session: UserSession) -> dict:
    """
    Get all settings for the current workplace.
    """
    request_id = 995
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        settings_dict = controller.get_settings_dict(user_session.get_id)
        return {"request_id": request_id, "success": True, "data": settings_dict}
    except Exception as e:
        print(f"Error getting settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to retrieve settings."}


def handle_update_scheduling_settings(data: dict, user_session: UserSession) -> dict:
    """
    Update scheduling-related settings.
    """
    request_id = 996
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        
        # Validate the data
        service = controller.service
        errors = service.validate_scheduling_settings(data)
        if errors:
            return {"request_id": request_id, "success": False, "error": "; ".join(errors)}
        
        # Update settings
        updated_settings = controller.update_scheduling_settings(user_session.get_id, data)
        return {"request_id": request_id, "success": True, "data": updated_settings.to_dict()}
    except Exception as e:
        print(f"Error updating scheduling settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to update scheduling settings."}


def handle_update_notification_settings(data: dict, user_session: UserSession) -> dict:
    """
    Update notification-related settings.
    """
    request_id = 997
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        updated_settings = controller.update_notification_settings(user_session.get_id, data)
        return {"request_id": request_id, "success": True, "data": updated_settings.to_dict()}
    except Exception as e:
        print(f"Error updating notification settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to update notification settings."}


def handle_update_request_window_settings(data: dict, user_session: UserSession) -> dict:
    """
    Update request window settings.
    """
    request_id = 998
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        
        # Validate the data
        service = controller.service
        errors = service.validate_request_window_settings(data)
        if errors:
            return {"request_id": request_id, "success": False, "error": "; ".join(errors)}
        
        # Convert datetime strings to datetime objects if needed
        if 'requests_window_start' in data and isinstance(data['requests_window_start'], str):
            data['requests_window_start'] = datetime.fromisoformat(data['requests_window_start'].replace('Z', '+00:00'))
        if 'requests_window_end' in data and isinstance(data['requests_window_end'], str):
            data['requests_window_end'] = datetime.fromisoformat(data['requests_window_end'].replace('Z', '+00:00'))
        
        updated_settings = controller.update_request_window_settings(user_session.get_id, data)
        return {"request_id": request_id, "success": True, "data": updated_settings.to_dict()}
    except Exception as e:
        print(f"Error updating request window settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to update request window settings."}


def handle_update_worker_management_settings(data: dict, user_session: UserSession) -> dict:
    """
    Update worker management settings.
    """
    request_id = 999
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        
        # Validate the data
        service = controller.service
        errors = service.validate_worker_management_settings(data)
        if errors:
            return {"request_id": request_id, "success": False, "error": "; ".join(errors)}
        
        updated_settings = controller.update_worker_management_settings(user_session.get_id, data)
        return {"request_id": request_id, "success": True, "data": updated_settings.to_dict()}
    except Exception as e:
        print(f"Error updating worker management settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to update worker management settings."}


def handle_update_timesheet_settings(data: dict, user_session: UserSession) -> dict:
    """
    Update timesheet and payroll settings.
    """
    request_id = 1000
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        
        # Validate the data
        service = controller.service
        errors = service.validate_timesheet_settings(data)
        if errors:
            return {"request_id": request_id, "success": False, "error": "; ".join(errors)}
        
        updated_settings = controller.update_timesheet_settings(user_session.get_id, data)
        return {"request_id": request_id, "success": True, "data": updated_settings.to_dict()}
    except Exception as e:
        print(f"Error updating timesheet settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to update timesheet settings."}


def handle_update_display_settings(data: dict, user_session: UserSession) -> dict:
    """
    Update display and UI settings.
    """
    request_id = 1001
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        
        # Validate the data
        service = controller.service
        errors = service.validate_display_settings(data)
        if errors:
            return {"request_id": request_id, "success": False, "error": "; ".join(errors)}
        
        updated_settings = controller.update_display_settings(user_session.get_id, data)
        return {"request_id": request_id, "success": True, "data": updated_settings.to_dict()}
    except Exception as e:
        print(f"Error updating display settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to update display settings."}


def handle_reset_settings_to_defaults(user_session: UserSession) -> dict:
    """
    Reset all settings to defaults.
    """
    request_id = 1002
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        reset_settings = controller.reset_to_defaults(user_session.get_id)
        return {"request_id": request_id, "success": True, "data": reset_settings.to_dict()}
    except Exception as e:
        print(f"Error resetting settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to reset settings."}


def handle_get_settings_template(user_session: UserSession) -> dict:
    """
    Get a template of default settings for reference.
    """
    request_id = 1003
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        template = controller.service.get_default_settings_template()
        return {"request_id": request_id, "success": True, "data": template}
    except Exception as e:
        print(f"Error getting settings template: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to get settings template."}


def handle_export_settings(user_session: UserSession) -> dict:
    """
    Export current settings as JSON for backup/import.
    """
    request_id = 1004
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        settings_dict = controller.get_settings_dict(user_session.get_id)
        
        # Add export metadata
        export_data = {
            "exported_at": datetime.now().isoformat(),
            "workplace_id": user_session.get_id,
            "version": "1.0",
            "settings": settings_dict
        }
        
        return {"request_id": request_id, "success": True, "data": export_data}
    except Exception as e:
        print(f"Error exporting settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to export settings."}


def handle_import_settings(data: dict, user_session: UserSession) -> dict:
    """
    Import settings from exported JSON.
    """
    request_id = 1005
    if not user_session or not user_session.can_access_manager_page():
        return {"request_id": request_id, "success": False, "error": "Unauthorized access."}
    
    try:
        controller = WorkplaceSettingsController(db)
        
        # Validate import data structure
        if "settings" not in data:
            return {"request_id": request_id, "success": False, "error": "Invalid import data: missing settings."}
        
        settings_data = data["settings"]
        
        # Validate all settings
        service = controller.service
        errors = service.validate_all_settings(settings_data)
        if errors:
            return {"request_id": request_id, "success": False, "error": f"Invalid settings: {'; '.join(errors)}"}
        
        # Import settings
        updated_settings = controller.update_settings(user_session.get_id, settings_data)
        return {"request_id": request_id, "success": True, "data": updated_settings.to_dict()}
    except Exception as e:
        print(f"Error importing settings: {e}")
        return {"request_id": request_id, "success": False, "error": "Failed to import settings."}
