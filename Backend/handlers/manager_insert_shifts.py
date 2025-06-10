from datetime import datetime, timedelta
from enum import Enum
from config.constants import db
from db.controllers.shiftWorkers_controller import ShiftWorkersController
from db.controllers.shifts_controller import ShiftsController
from db.controllers.userRequests_controller import UserRequestsController
from db.controllers.users_controller import UsersController
from db.controllers.jobs_controller import JobsController
from db.controllers.client_companies_controller import ClientCompaniesController
from db.models import ShiftPart
from user_session import UserSession
from db.controllers.workPlaces_controller import WorkPlacesController


def get_or_create_default_job(user_session):
    """
    Gets or creates a default job for legacy shift creation.
    For Hands on Labor, we need a default job to link shifts to.
    """
    try:
        jobs_controller = JobsController(db)
        client_companies_controller = ClientCompaniesController(db)

        # Try to get existing default job
        all_jobs = jobs_controller.get_all_active_jobs()
        if all_jobs:
            # Return the first active job as default
            return all_jobs[0]['id']

        # If no jobs exist, create a default one
        # First, get or create a default client company
        all_companies = client_companies_controller.get_all_entities()
        if not all_companies:
            # Create a default client company for Hands on Labor
            default_company_data = {
                "name": "Default Client",
                "contact_email": "default@handsonlabor.com",
                "contact_phone": "555-0000",
                "address": "San Diego, CA",
                "is_active": True
            }
            default_company = client_companies_controller.create_entity(default_company_data)
            client_company_id = default_company.id
        else:
            client_company_id = all_companies[0].id

        # Create default job
        default_job_data = {
            "name": "General Labor - Default",
            "client_company_id": client_company_id,
            "venue_name": "Various Locations",
            "venue_address": "San Diego, CA",
            "venue_contact_info": "Contact Hands on Labor for details",
            "description": "Default job for general labor assignments",
            "created_by": user_session.get_id,
            "is_active": True
        }

        created_job = jobs_controller.create_job(default_job_data)
        return created_job['id']

    except Exception as e:
        print(f"Error creating default job: {e}")
        # If we can't create a default job, we can't create shifts
        raise Exception("Cannot create shifts without a valid job_id. Please create a job first.")


def handle_manager_insert_shifts(data, user_session: UserSession):
    if user_session.can_access_manager_page():
        work_places_controller = WorkPlacesController(db)
        shifts_controller = ShiftsController(db)
        shift_workers_controller = ShiftWorkersController(db)
        user_request_controller = UserRequestsController(db)
        users_controller = UsersController(db)
        employee_id = users_controller.get_user_id_by_username(data["username"])
        employee_request = user_request_controller.get_request_by_userid(employee_id)
        days = [DayName.Sunday, DayName.Monday, DayName.Tuesday, DayName.Wednesday, DayName.Thursday, DayName.Friday,
                DayName.Saturday]
        shift_parts = [ShiftPart.Morning, ShiftPart.Noon, ShiftPart.Evening]
        shifts = employee_request.split('_')
        for shift in shifts:
            shift_time, insert = shift.split('-')
            if insert == 't':
                part = 'm'
                if shift_time[1] == 'n':
                    part = shift_parts[1].value
                elif shift_time[1] == 'e':
                    part = shift_parts[2].value
                shift_id = shifts_controller.get_shift_id_by_day_and_part_and_workplace(
                    days[int(shift_time[0]) - 1].name, part, user_session.get_id)
                if shift_id is not None:
                    shift_worker = {'shiftID': shift_id, 'userID': employee_id}
                    shift_workers_controller.create_entity(shift_worker)

    else:
        print("User does not have access to manager-specific pages.")
        return False

def make_shifts(user_session: UserSession):
    """
    Creates shifts for the next week using the new job-based system.
    This function has been updated to work with the new database schema.
    """
    if user_session.can_access_manager_page():
        try:
            # Get or create a default job for these shifts
            default_job_id = get_or_create_default_job(user_session)

            shifts_controller = ShiftsController(db)
            current_date = datetime.now()
            next_sunday = current_date + timedelta(days=(6 - current_date.weekday() + 1) % 7)
            next_week_dates = [next_sunday + timedelta(days=i) for i in range(7)]
            shift_parts = [ShiftPart.Morning, ShiftPart.Noon, ShiftPart.Evening]

            # Define shift times for each part
            shift_times = {
                ShiftPart.Morning: (8, 0, 12, 0),    # 8:00 AM - 12:00 PM
                ShiftPart.Noon: (12, 0, 17, 0),     # 12:00 PM - 5:00 PM
                ShiftPart.Evening: (17, 0, 22, 0)   # 5:00 PM - 10:00 PM
            }

            created_shifts = []
            for date in next_week_dates:
                for shift_part in shift_parts:
                    start_hour, start_min, end_hour, end_min = shift_times[shift_part]

                    # Create datetime objects for shift start and end
                    shift_start = datetime.combine(date.date(), datetime.min.time().replace(hour=start_hour, minute=start_min))
                    shift_end = datetime.combine(date.date(), datetime.min.time().replace(hour=end_hour, minute=end_min))

                    # Create shift with new schema
                    shift_data = {
                        "job_id": default_job_id,
                        "shift_start_datetime": shift_start,
                        "shift_end_datetime": shift_end,
                        "required_employee_counts": {"stagehand": 1, "crew_chief": 0, "forklift_operator": 0, "truck_driver": 0},
                        "shift_description": f"{shift_part.value} shift",
                        # Legacy fields for backward compatibility
                        "shiftDate": date.date(),
                        "shiftPart": shift_part
                    }

                    created_shift = shifts_controller.create_entity(shift_data)
                    created_shifts.append(created_shift)
                    print(f"Created shift: {shift_part.value} on {date.date()}")

            print(f"Successfully created {len(created_shifts)} shifts for the week starting {next_sunday.date()}")
            return True

        except Exception as e:
            print(f"Error creating shifts: {e}")
            import traceback
            traceback.print_exc()
            return False

    else:
        print("User does not have access to manager-specific pages.")
        return False


class DayName(Enum):  # I moved this class over here cuz it's not supposed to be in the models file
    Sunday = 'Sunday'
    Monday = 'Monday'
    Tuesday = 'Tuesday'
    Wednesday = 'Wednesday'
    Thursday = 'Thursday'
    Friday = 'Friday'
    Saturday = 'Saturday'
