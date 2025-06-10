from __future__ import annotations
import sys
import os
print(f"🚀 Starting EasyShifts Backend Server...")
print(f"🐍 Python version: {sys.version}")
print(f"📁 Working directory: {os.getcwd()}")
print(f"🌍 Environment variables:")
print(f"   HOST: {os.getenv('HOST', 'not set')}")
print(f"   PORT: {os.getenv('PORT', 'not set')}")

from user_session import UserSession
from main import initialize_database_and_session
import websockets
import asyncio
import json
from handlers import login, employee_signin, manager_signin, employee_shifts_request, \
    get_employee_requests, manager_insert_shifts, employee_list, send_profile, manager_schedule, \
    send_shifts_to_employee, make_shifts, timesheet_management_handlers, enhanced_schedule_handlers, \
    enhanced_settings_handlers
from handlers import crew_chief_handlers, client_company_handlers, client_directory_handlers, job_handlers, shift_management_handlers, user_management_handlers
from handlers.google_auth import google_auth_handler
from db.controllers.shiftBoard_controller import convert_shiftBoard_to_client

# Initialize the database and session
try:
    db, _ = initialize_database_and_session()
    print("✅ Database initialized successfully")
except Exception as e:
    print(f"⚠️  Database initialization failed: {e}")
    print("⚠️  Server will start but database operations may fail")
    db = None

# Global variable declaration
user_session: UserSession | None = None


def handle_request(request_id, data):
    global user_session
    if request_id == 10:
        # Login request handling
        print("Received Login request")
        print(data)

        response, user_session = login.handle_login(data)
        return {"request_id": request_id, "data": response}

    elif request_id == 20:
        # Employee Sign in request handling
        print("Received Employee Sign in request")
        user_session = employee_signin.handle_employee_signin(data)
        # Assuming employee_signin returns user_session or raises error
        # For consistency, let's ensure a response structure
        if user_session: # Simplified check, actual logic might be more complex
            return {"request_id": request_id, "success": True, "message": "Employee sign-in successful."}
        else: # This path might not be hit if handle_employee_signin raises errors for failure
            return {"request_id": request_id, "success": False, "message": "Employee sign-in failed."}


    elif request_id == 30:
        # Manager Sign in request handling
        print("Received Manager Sign in request")
        # handle_manager_signin in manager_signin.py returns a dict {'success': True/False, 'message': ...}
        response_data = manager_signin.handle_manager_signin(data)
        if response_data.get("success"):
            # If sign-in is successful, we might need to establish a session.
            # For now, assuming handle_login is called separately or this handler also sets user_session.
            # The original code assigned user_session = manager_signin.handle_manager_signin(data)
            # but the handler returns a dict, not a session object directly.
            # This part might need further review based on how session is truly established for managers.
            # For now, let's assume a successful sign-in implies a session is managed internally or by a subsequent login.
            pass # Placeholder for potential session establishment logic if needed here
        return {"request_id": request_id, "data": response_data}


    elif request_id == 40:
        # Employee's Shifts Request handling (Submit availability)
        print("Received Employee's Shifts Request")
        employee_shifts_request.handle_employee_shifts_request(data, user_session)
        return {"request_id": request_id, "success": True, "message": "Shift request submitted."}

    elif request_id == 41:
        # Check if employee is in shift request window
        print("Received Is In Request Window check")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        is_in_window = employee_shifts_request.handle_is_in_request_window(user_session)
        return {"request_id": request_id, "success": True, "data": {"is_in_window": is_in_window}}

    elif request_id == 42:
        # Get request window times
        print("Received Get Request Window Times")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        window_times = employee_shifts_request.handle_get_request_window_times(user_session)
        return {"request_id": request_id, "success": True, "data": window_times}

    elif request_id == 50:
        # Manager Get Employees Requests Request
        print("Received Manager Get Employees Requests Request")
        # This handler returns data directly
        return get_employee_requests.handle_get_employee_requests(data, user_session)

    elif request_id == 55:
        # Manager Shifts inserting Request handling
        print("Received Manager Shifts inserting Request")
        manager_insert_shifts.handle_manager_insert_shifts(data, user_session)
        return {"request_id": request_id, "success": True, "message": "Shifts inserted."}


    elif request_id == 60:
        # Employees list request handling
        print("Received Employees list request")
        # This handler returns data directly
        return employee_list.handle_employee_list(user_session)

    elif request_id == 62:
        # Employee approval request handling
        print("Received Employee Approval request")
        success = employee_list.handle_employee_approval(data, user_session)
        return {"request_id": request_id, "success": success}

    elif request_id == 64:
        # Employee rejection request handling
        print("Received Employee Rejection request")
        success = employee_list.handle_employee_rejection(data, user_session)
        return {"request_id": request_id, "success": success}

    elif request_id == 65: # CREATE_EMPLOYEE_BY_MANAGER
        print("Received Create Employee by Manager request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return employee_list.handle_create_employee_by_manager(data, user_session)

    elif request_id == 70:
        # Send user profile handling
        print("Send user profile")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        profile_data = send_profile.handle_send_profile(user_session)
        return {"request_id": request_id, "success": True, "data": profile_data}

    elif request_id == 80:
        # Make new week shifts (original ID 80)
        print("Make new week shifts")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        make_shifts.make_shifts(user_session) # This function doesn't return a client response
        return {"request_id": request_id, "success": True, "message": "Attempted to make new week shifts."}

    elif request_id == 81:
        # Manager creates new shift board
        print("Received Create New Shift Board request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        board = manager_schedule.handle_create_new_board(user_session)
        converted_board = convert_shiftBoard_to_client(board)
        return {"request_id": request_id, "success": True, "data": converted_board}

    elif request_id == 82:
        # Manager saves shift board content
        print("Received Save Shift Board Content request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        # data here is request_data from handle_client
        board = manager_schedule.handle_save_board(data, user_session)
        converted_board = convert_shiftBoard_to_client(board)
        return {"request_id": request_id, "success": True, "data": converted_board}

    elif request_id == 83:
        # Manager resets shift board content
        print("Received Reset Shift Board Content request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        board = manager_schedule.handle_reset_board(user_session)
        converted_board = convert_shiftBoard_to_client(board)
        return {"request_id": request_id, "success": True, "data": converted_board}

    elif request_id == 84:
        # Manager publishes shift board
        print("Received Publish Shift Board request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        is_published = manager_schedule.handle_publish_board(user_session)
        return {"request_id": request_id, "success": True, "data": {"is_published": is_published}}

    elif request_id == 85:
        # Manager unpublishes shift board
        print("Received Unpublish Shift Board request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        # handle_unpublish_board returns True if successfully unpublished (board.is_published is False)
        # So, if result is True, it means is_published is False.
        result_is_unpublished_successfully = manager_schedule.handle_unpublish_board(user_session)
        return {"request_id": request_id, "success": result_is_unpublished_successfully, "data": {"is_published": not result_is_unpublished_successfully}}


    elif request_id == 90:
        # Get Employee's shifts handling
        print("Send employees shifts")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        employees_shifts = send_shifts_to_employee.handle_send_shifts(user_session)
        print(employees_shifts)
        return {"request_id": request_id, "success": True, "data": employees_shifts}

    elif request_id == 91:
        # Get Employees Requests Data for Manager Schedule
        print("Get Employees Requests Data for Manager Schedule")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        res = manager_schedule.watch_workers_requests(user_session)
        print(res)
        return {"request_id": request_id, "success": True, "data": res}

    elif request_id == 93:
        # Get all workers for Manager Schedule
        print("Get all workers for Manager Schedule")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        res = manager_schedule.get_all_workers_names_by_workplace_id(user_session)
        print(res)
        return {"request_id": request_id, "success": True, "data": res}

    elif request_id == 94: # Get All Approved Worker Details
        print("Received Get All Approved Worker Details request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return employee_list.handle_get_all_approved_worker_details(user_session)

    elif request_id == 95:
        # Get preferences for Manager Schedule
        print("Get preferences for Manager Schedule")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        res = manager_schedule.handle_get_preferences(user_session)
        print(res)
        return {"request_id": request_id, "success": True, "data": res}

    elif request_id == 97:
        # Get start date for Manager Schedule
        print("Get start date for Manager Schedule")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        res = manager_schedule.handle_get_start_date(user_session).isoformat()  # Convert to ISO format
        print(res)
        return {"request_id": request_id, "success": True, "data": res}

    elif request_id == 98:
        # Get assigned shifts for Manager Schedule
        print("Get assigned shifts for Manager Schedule")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        res = manager_schedule.handle_get_assigned_shifts(user_session, data)
        print(res)
        return {"request_id": request_id, "success": True, "data": res}

    elif request_id == 99:
        # Change schedule (assign/unassign worker to/from shift)
        print("Received Change Schedule request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        manager_schedule.handle_schedules(user_session, data)
        return {"request_id": request_id, "success": True, "message": "Schedule change processed."}


    elif request_id == 100: # New request ID for Crew Chief to get their shifts
        print("Received Get Crew Chief Shifts request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        # This handler returns data directly in the desired format
        return crew_chief_handlers.handle_get_crew_chief_shifts(user_session)

    elif request_id == 101: # Get Crew Members for Shift (Crew Chief)
        print("Received Get Crew Members for Shift request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return crew_chief_handlers.handle_get_crew_members_for_shift(data, user_session)

    elif request_id == 102: # Submit Shift Times (Crew Chief)
        print("Received Submit Shift Times request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return crew_chief_handlers.handle_submit_shift_times(data, user_session)

    elif request_id == 103: # Get all submitted timesheets for manager
        print("Received Get All Submitted Timesheets request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return timesheet_management_handlers.handle_get_all_submitted_timesheets(user_session)

    elif request_id == 104: # Update timesheet status (approve/reject)
        print("Received Update Timesheet Status request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return timesheet_management_handlers.handle_update_timesheet_status(data, user_session)

    elif request_id == 200: # Get All Client Companies
        print("Received Get All Client Companies request")
        return client_company_handlers.handle_get_all_client_companies(user_session)

    elif request_id == 201: # Create Client Company
        print("Received Create Client Company request")
        return client_company_handlers.handle_create_client_company(data, user_session)

    elif request_id == 202: # Update Client Company
        print("Received Update Client Company request")
        return client_company_handlers.handle_update_client_company(data, user_session)

    elif request_id == 203: # Delete Client Company
        print("Received Delete Client Company request")
        return client_company_handlers.handle_delete_client_company(data, user_session)

    # === JOB MANAGEMENT HANDLERS ===
    elif request_id == 210: # Create Job
        print("Received Create Job request")
        return job_handlers.handle_create_job(data, user_session)

    elif request_id == 211: # Get Jobs by Manager
        print("Received Get Jobs by Manager request")
        return job_handlers.handle_get_jobs_by_manager(user_session)

    # === CLIENT DIRECTORY HANDLERS ===
    elif request_id == 212: # Get Client Directory
        print("Received Get Client Directory request")
        return client_directory_handlers.handle_get_client_directory(user_session)

    elif request_id == 213: # Get Client Company Details
        print("Received Get Client Company Details request")
        return client_directory_handlers.handle_get_client_company_details(data, user_session)

    elif request_id == 214: # Update Client User Status
        print("Received Update Client User Status request")
        return client_directory_handlers.handle_update_client_user_status(data, user_session)

    elif request_id == 215: # Get Client Analytics
        print("Received Get Client Analytics request")
        return client_directory_handlers.handle_get_client_analytics(user_session)

    elif request_id == 220: # Create Shift
        print("Received Create Shift request")
        return shift_management_handlers.handle_create_shift(data, user_session)

    elif request_id == 221: # Get Shifts by Job ID
        print("Received Get Shifts by Job ID request")
        return shift_management_handlers.handle_get_shifts_by_job(data, user_session)

    elif request_id == 230: # Assign Worker to Shift
        print("Received Assign Worker to Shift request")
        return shift_management_handlers.handle_assign_worker_to_shift(data, user_session)

    elif request_id == 231: # Unassign Worker from Shift
        print("Received Unassign Worker from Shift request")
        return shift_management_handlers.handle_unassign_worker_from_shift(data, user_session)

    # === TIMECARD MANAGEMENT HANDLERS ===
    elif request_id == 240: # Get Shift Timecard
        print("Received Get Shift Timecard request")
        from handlers.timecard_handlers import handle_get_shift_timecard
        return handle_get_shift_timecard(data, user_session)

    elif request_id == 241: # Clock In/Out Worker
        print("Received Clock In/Out Worker request")
        from handlers.timecard_handlers import handle_clock_in_out_worker
        return handle_clock_in_out_worker(data, user_session)

    elif request_id == 242: # Mark Worker Absent
        print("Received Mark Worker Absent request")
        from handlers.timecard_handlers import handle_mark_worker_absent
        return handle_mark_worker_absent(data, user_session)

    elif request_id == 243: # Update Worker Notes
        print("Received Update Worker Notes request")
        from handlers.timecard_handlers import handle_update_worker_notes
        return handle_update_worker_notes(data, user_session)

    elif request_id == 244: # End Shift - Clock Out All
        print("Received End Shift - Clock Out All request")
        from handlers.timecard_handlers import handle_end_shift_clock_out_all
        return handle_end_shift_clock_out_all(data, user_session)

    elif request_id == 991:
        # Set preferences
        print("Set preferences")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        manager_schedule.handle_save_preferences(user_session.get_id, data)
        return {"request_id": request_id, "success": True, "message": "Preferences saved."}


    elif request_id == 992:
        # Set schedule window time
        print("Set schedule window time")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        manager_schedule.open_requests_windows(user_session.get_id, data)
        # manager_schedule.get_last_shift_board_window_times(user_session.get_id) # This seems like a debug/logging line
        return {"request_id": request_id, "success": True, "message": "Schedule window time set."}

    # === TIMESHEET MANAGEMENT HANDLERS ===
    elif request_id == 1010: # Get shift timesheet details
        print("Received Get Shift Timesheet Details request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return timesheet_management_handlers.handle_get_shift_timesheet_details(data, user_session)

    elif request_id == 1011: # Update worker timesheet
        print("Received Update Worker Timesheet request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return timesheet_management_handlers.handle_update_worker_timesheet(data, user_session)

    elif request_id == 1012: # Submit shift timesheet
        print("Received Submit Shift Timesheet request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return timesheet_management_handlers.handle_submit_shift_timesheet(data, user_session)

    elif request_id == 1013: # Approve shift timesheet
        print("Received Approve Shift Timesheet request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return timesheet_management_handlers.handle_approve_shift_timesheet(data, user_session)

    elif request_id == 1014: # Get employee timesheet history
        print("Received Get Employee Timesheet History request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return timesheet_management_handlers.handle_get_employee_timesheet_history(data, user_session)

    # === ENHANCED SCHEDULE HANDLERS ===
    elif request_id == 2001: # Get schedule data
        print("Received Get Schedule Data request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_schedule_handlers.handle_get_schedule_data(data, user_session)

    elif request_id == 2002: # Assign worker to shift (enhanced)
        print("Received Assign Worker to Shift (Enhanced) request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_schedule_handlers.handle_assign_worker_to_shift_enhanced(data, user_session)

    elif request_id == 2003: # Unassign worker from shift (enhanced)
        print("Received Unassign Worker from Shift (Enhanced) request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_schedule_handlers.handle_unassign_worker_from_shift_enhanced(data, user_session)

    elif request_id == 2004: # Create shift (enhanced)
        print("Received Create Shift (Enhanced) request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_schedule_handlers.handle_create_shift_enhanced(data, user_session)

    elif request_id == 2005: # Update shift (enhanced)
        print("Received Update Shift (Enhanced) request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_schedule_handlers.handle_update_shift_enhanced(data, user_session)

    elif request_id == 2006: # Delete shift (enhanced)
        print("Received Delete Shift (Enhanced) request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_schedule_handlers.handle_delete_shift_enhanced(data, user_session)

    # Google OAuth Authentication handlers
    elif request_id == 66: # GOOGLE_AUTH_LOGIN
        print("Received Google Auth Login request")
        response = google_auth_handler.handle_google_auth_login(data)

        # If login successful and user exists, set user_session
        if response.get('success') and response.get('data', {}).get('user_exists'):
            user_session = response['data'].get('user_session')
            # Remove user_session from response data as it's not JSON serializable
            response['data'].pop('user_session', None)

        return {"request_id": request_id, **response}

    elif request_id == 67: # LINK_GOOGLE_ACCOUNT
        print("Received Link Google Account request")
        response = google_auth_handler.handle_link_google_account(data)

        # If linking successful, set user_session
        if response.get('success'):
            user_session = response['data'].get('user_session')
            # Remove user_session from response data as it's not JSON serializable
            response['data'].pop('user_session', None)

        return {"request_id": request_id, **response}

    elif request_id == 68: # CREATE_ACCOUNT_WITH_GOOGLE
        print("Received Create Account with Google request")
        response = google_auth_handler.handle_create_account_with_google(data)

        # If account creation successful, set user_session
        if response.get('success'):
            user_session = response['data'].get('user_session')
            # Remove user_session from response data as it's not JSON serializable
            response['data'].pop('user_session', None)

        return {"request_id": request_id, **response}

    elif request_id == 69: # GOOGLE_SIGNUP_EMPLOYEE
        print("Received Google Signup Employee request")
        response = google_auth_handler.handle_google_signup_employee(data)

        # If signup successful, set user_session
        if response.get('success'):
            user_session = response['data'].get('user_session')
            # Remove user_session from response data as it's not JSON serializable
            response['data'].pop('user_session', None)

        return {"request_id": request_id, **response}

    elif request_id == 70: # GOOGLE_SIGNUP_MANAGER
        print("Received Google Signup Manager request")
        response = google_auth_handler.handle_google_signup_manager(data)

        # If signup successful, set user_session
        if response.get('success'):
            user_session = response['data'].get('user_session')
            # Remove user_session from response data as it's not JSON serializable
            response['data'].pop('user_session', None)

        return {"request_id": request_id, **response}

    elif request_id == 71: # GOOGLE_SIGNUP_CLIENT
        print("Received Google Signup Client request")
        response = google_auth_handler.handle_google_signup_client(data)

        # If signup successful, set user_session
        if response.get('success'):
            user_session = response['data'].get('user_session')
            # Remove user_session from response data as it's not JSON serializable
            response['data'].pop('user_session', None)

        return {"request_id": request_id, **response}

    # === USER MANAGEMENT HANDLERS ===
    elif request_id == 300: # Create Manager
        print("Received Create Manager request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return user_management_handlers.handle_create_manager(data, user_session)

    elif request_id == 301: # Create Admin
        print("Received Create Admin request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return user_management_handlers.handle_create_admin(data, user_session)

    elif request_id == 302: # Get All Users
        print("Received Get All Users request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return user_management_handlers.handle_get_all_users(user_session)

    elif request_id == 303: # Update User Role
        print("Received Update User Role request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return user_management_handlers.handle_update_user_role(data, user_session)

    # === EXTENDED SETTINGS HANDLERS ===
    elif request_id == 1100: # Update Company Profile Settings
        print("Received Update Company Profile Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_company_profile_settings(data, user_session)

    elif request_id == 1101: # Update User Management Settings
        print("Received Update User Management Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_user_management_settings(data, user_session)

    elif request_id == 1102: # Update Certifications Settings
        print("Received Update Certifications Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_certifications_settings(data, user_session)

    elif request_id == 1103: # Update Client Management Settings
        print("Received Update Client Management Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_client_management_settings(data, user_session)

    elif request_id == 1104: # Update Job Configuration Settings
        print("Received Update Job Configuration Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_job_configuration_settings(data, user_session)

    elif request_id == 1105: # Update Advanced Timesheet Settings
        print("Received Update Advanced Timesheet Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_timesheet_advanced_settings(data, user_session)

    elif request_id == 1106: # Update Google Integration Settings
        print("Received Update Google Integration Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_google_integration_settings(data, user_session)

    elif request_id == 1107: # Update Reporting Settings
        print("Received Update Reporting Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_reporting_settings(data, user_session)

    elif request_id == 1108: # Update Security Settings
        print("Received Update Security Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_security_settings(data, user_session)

    elif request_id == 1109: # Update Mobile Accessibility Settings
        print("Received Update Mobile Accessibility Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_mobile_accessibility_settings(data, user_session)

    elif request_id == 1110: # Update System Admin Settings
        print("Received Update System Admin Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_update_system_admin_settings(data, user_session)

    elif request_id == 1111: # Get All Extended Settings
        print("Received Get All Extended Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_get_extended_settings(user_session)

    elif request_id == 1112: # Reset Extended Settings to Defaults
        print("Received Reset Extended Settings to Defaults request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_reset_extended_settings_to_defaults(user_session)

    elif request_id == 1113: # Test Google Connection
        print("Received Test Google Connection request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_test_google_connection(data, user_session)

    elif request_id == 1114: # Manual Google Sync
        print("Received Manual Google Sync request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_manual_google_sync(user_session)

    elif request_id == 1115: # System Health Check
        print("Received System Health Check request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_system_health_check(user_session)

    elif request_id == 1116: # Manual Backup
        print("Received Manual Backup request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_manual_backup(user_session)

    # === ADVANCED SETTINGS MANAGEMENT ===
    elif request_id == 1117: # Get Settings Summary
        print("Received Get Settings Summary request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_get_settings_summary(user_session)

    elif request_id == 1118: # Bulk Update Settings
        print("Received Bulk Update Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_bulk_update_settings(data, user_session)

    elif request_id == 1119: # Export Settings Backup
        print("Received Export Settings Backup request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_export_settings_backup(user_session)

    elif request_id == 1120: # Import Settings Backup
        print("Received Import Settings Backup request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_import_settings_backup(data, user_session)

    elif request_id == 1121: # Get Settings Templates
        print("Received Get Settings Templates request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_get_settings_templates(user_session)

    elif request_id == 1122: # Apply Settings Template
        print("Received Apply Settings Template request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_apply_settings_template(data, user_session)

    elif request_id == 1123: # Compare Settings
        print("Received Compare Settings request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_compare_settings(data, user_session)

    elif request_id == 1124: # Validate Settings Bulk
        print("Received Validate Settings Bulk request")
        if not user_session:
            return {"request_id": request_id, "success": False, "error": "User session not found."}
        return enhanced_settings_handlers.handle_validate_settings_bulk(data, user_session)

    else:
        print("Unknown request ID:", request_id)
        return {"request_id": request_id, "success": False, "error": f"Unknown request ID: {request_id}"}


async def handle_client(websocket, path=None): # Add default value for path
    print(f"🔌 New client connected from {websocket.remote_address}")
    if path is not None:
        print(f"Connection path: {path}")
    else:
        print("Connection path not provided.")
 
        
    try:
        async for message in websocket:
            # Parse the JSON message
            data = json.loads(message)
            print("Received data:", data)

            # Extract the request_id and data
            request_id = data.get('request_id', None)
            request_data = data.get('data', None)

            print("Request ID:", request_id)
            print("Data:", request_data)

            response = handle_request(request_id, request_data)
            json_data = json.dumps(response)
            await websocket.send(json_data)
            print(response)
    except websockets.exceptions.ConnectionClosed:
        print(f"🔌 Connection closed for {websocket.remote_address}")
    except Exception as e:
        if "User session not found" in str(e):
            # Handle the "User session not found" exception here
            print("User session not found. Sending an appropriate response.")
            await websocket.send(json.dumps({"success": False, "error": "User session not found. Please log in."}))
        else:
            # Handle other exceptions
            print(f"An unexpected error occurred: {e}")
            await websocket.send(json.dumps({"success": False, "error": "An unexpected error occurred. Please try again later."}))


async def start_server():
    import os
    from aiohttp import web, WSMsgType
    import aiohttp_cors
    import json
    from datetime import datetime

    # Get host and port from environment variables (Cloud Run compatibility)
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 8080))

    async def health_check(request):
        """Health check endpoint for Cloud Run"""
        return web.Response(
            text=json.dumps({
                "status": "healthy",
                "timestamp": datetime.utcnow().isoformat(),
                "service": "easyshifts-backend"
            }),
            content_type='application/json'
        )

    async def websocket_handler(request):
        """WebSocket handler using aiohttp"""
        ws = web.WebSocketResponse()
        await ws.prepare(request)

        print(f"🔌 New WebSocket client connected from {request.remote}")

        try:
            async for msg in ws:
                if msg.type == WSMsgType.TEXT:
                    try:
                        # Parse the JSON message
                        data = json.loads(msg.data)
                        print("Received data:", data)

                        # Extract the request_id and data
                        request_id = data.get('request_id', None)
                        request_data = data.get('data', None)

                        print("Request ID:", request_id)
                        print("Data:", request_data)

                        response = handle_request(request_id, request_data)
                        json_data = json.dumps(response)
                        await ws.send_str(json_data)
                        print(response)
                    except json.JSONDecodeError as e:
                        print(f"JSON decode error: {e}")
                        await ws.send_str(json.dumps({"success": False, "error": "Invalid JSON"}))
                    except Exception as e:
                        print(f"Error handling WebSocket message: {e}")
                        await ws.send_str(json.dumps({"success": False, "error": str(e)}))
                elif msg.type == WSMsgType.ERROR:
                    print(f'WebSocket error: {ws.exception()}')
                    break
        except Exception as e:
            print(f"WebSocket connection error: {e}")
        finally:
            print(f"🔌 WebSocket connection closed for {request.remote}")

        return ws

    try:
        # Create aiohttp application
        app = web.Application()

        # Configure CORS
        cors = aiohttp_cors.setup(app, defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
                allow_methods="*"
            )
        })

        # Add routes
        app.router.add_get('/health', health_check)
        app.router.add_get('/', health_check)  # Root path also returns health
        app.router.add_get('/ws', websocket_handler)  # WebSocket endpoint

        # Add CORS to all routes
        for route in list(app.router.routes()):
            cors.add(route)

        # Start the server
        runner = web.AppRunner(app)
        await runner.setup()
        site = web.TCPSite(runner, host, port)
        await site.start()

        print(f"🚀 EasyShifts server started on {host}:{port}")
        print(f"📡 WebSocket endpoint: ws://{host}:{port}/ws")
        print(f"🏥 Health check endpoint: http://{host}:{port}/health")

        # Keep the server running
        await asyncio.Future()

    except asyncio.CancelledError:
        print("Server stopped.")
        if 'runner' in locals():
            await runner.cleanup()
        exit(0)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        if 'runner' in locals():
            await runner.cleanup()


if __name__ == "__main__":
    asyncio.run(start_server())
