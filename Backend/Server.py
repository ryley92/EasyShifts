from __future__ import annotations
from user_session import UserSession
from main import initialize_database_and_session
import websockets
import asyncio
import json
from handlers import login, employee_signin, manager_signin, employee_shifts_request, \
    get_employee_requests, manager_insert_shifts, employee_list, send_profile, manager_schedule, \
    send_shifts_to_employee, make_shifts, timesheet_management_handlers, enhanced_schedule_handlers
from handlers import crew_chief_handlers, client_company_handlers, job_handlers, shift_management_handlers
from handlers.google_auth import google_auth_handler
from db.controllers.shiftBoard_controller import convert_shiftBoard_to_client

# Initialize the database and session
db, _ = initialize_database_and_session()

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
        manager_schedule.handle_schedules(user_session.get_id, data)
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

    elif request_id == 210: # Create Job
        print("Received Create Job request")
        return job_handlers.handle_create_job(data, user_session)

    elif request_id == 211: # Get Jobs by Manager
        print("Received Get Jobs by Manager request")
        return job_handlers.handle_get_jobs_by_manager(user_session)

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

    else:
        print("Unknown request ID:", request_id)
        return {"request_id": request_id, "success": False, "error": f"Unknown request ID: {request_id}"}


async def handle_client(websocket, path=None): # Add default value for path
    print("new client connected")
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
        print(f"Connection closed for {websocket.remote_address}")
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
    try:
        async with websockets.serve(handle_client, "localhost", 8080):
            print("Server started")
            await asyncio.Future()  # Keep the server running until Enter is pressed
    except asyncio.CancelledError:
        print("Server stopped.")
        exit(0)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    asyncio.run(start_server())
