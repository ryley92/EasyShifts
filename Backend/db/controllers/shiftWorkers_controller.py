from __future__ import annotations
from typing import Type
from sqlalchemy.orm import Session
from db.controllers.base_controller import BaseController
from db.repositories.shiftWorkers_repository import ShiftWorkersRepository
from db.services.shiftWorkers_service import ShiftWorkersService
from db.models import EmployeeType, ShiftWorker


class ShiftWorkersController(BaseController):
    """
    ShiftWorkersController Class

    Controller class for managing ShiftWorker entities.
    """

    def __init__(self, db: Session):
        """
        Initializes the ShiftWorkersController with a database session.

        Parameters:
            db (Session): SQLAlchemy Session for database interactions.
        """
        self.repository = ShiftWorkersRepository(db)
        self.service = ShiftWorkersService(self.repository)
        super().__init__(self.repository, self.service)

    def get_entity_shift_worker(self, shift_id: str, user_id: str):
        """
        Retrieves a shift worker by shift ID and user ID.

        Args:
            shift_id (str): ID of the shift
            user_id (str): ID of the worker

        Returns: An entity of ShiftWorker

        """
        return self.repository.get_entity_shift_worker(shift_id, user_id)

    def delete_entity_shift_worker(self, shift_id: str, user_id: str):
        """
        Deletes a shift worker by shift ID and user ID.

        Args:
            shift_id (str): ID of the shift
            user_id (str): ID of the worker

        """
        self.repository.delete_entity_shift_worker(shift_id, user_id)

    def get_worker_shifts_by_worker_id(self, worker_id: str):
        """
        Retrieves all shifts for a worker by worker ID.
        Args:
            worker_id (str): ID of the worker to retrieve shifts for.

        Returns:
            List[ShiftWorker]: A list of all shifts for the worker.
        """
        return self.repository.get_worker_shifts_by_worker_id(worker_id)

    def get_shift_workers_by_shift_id(self, shift_id: str):
        """
        Retrieves all workers for a shift by shift ID.
        Args:
            shift_id (str): ID of the shift to retrieve workers for.

        Returns:
            List[ShiftWorker]: A list of all workers for the shift.
        """
        return self.repository.get_shift_workers_by_shift_id(shift_id)

    def is_shift_assigned_to_worker(self, shift_id: str, worker_id: str):
        """
        Checks if a shift is assigned to a worker.
        Args:
            shift_id (str): ID of the shift
            worker_id (str): ID of the worker

        Returns:
            bool: True if the shift is assigned to the worker, False otherwise.
        """
        return self.repository.is_shift_assigned_to_worker(shift_id, worker_id)

    def convert_shift_workers_by_shift_id_to_client(self, shift_id: str) -> list[str]:
        """
        Retrieves all workers for a shift by shift ID.
        Args:
            shift_id (str): ID of the shift to retrieve workers for.

        Returns:
            List[str]: A list of all workers for the shift.
        """
        return self.repository.convert_shift_workers_by_shift_id_to_client(shift_id)

    def delete_entity_by_composite_key(self, shift_id: int, user_id: int, role_assigned_str: str):
        """
        Deletes a ShiftWorker entity by its composite primary key.
        Converts role_assigned_str to EmployeeType enum.
        """
        try:
            role_assigned = EmployeeType(role_assigned_str)
            return self.repository.delete_entity_by_composite_key(shift_id, user_id, role_assigned)
        except ValueError:
            # Handle invalid role_assigned_str
            print(f"Invalid role assigned string: {role_assigned_str}")
            return None

    def submit_times_for_worker_on_shift(self, shift_id: int, user_id: int, role_assigned_str: str, clock_in_time_str: str | None, clock_out_time_str: str | None) -> Type[ShiftWorker] | None:
        """
        Submits clock-in and clock-out times for a specific worker on a shift.

        Args:
            shift_id (int): ID of the shift.
            user_id (int): ID of the worker.
            role_assigned_str (str): The role assigned to the worker for this shift (string representation of EmployeeType).
            clock_in_time_str (str | None): The clock-in time in ISO 8601 format (e.g., "YYYY-MM-DDTHH:MM:SS").
            clock_out_time_str (str | None): The clock-out time in ISO 8601 format.

        Returns:
            ShiftWorker: The updated ShiftWorker entity if found, None otherwise.
        """
        role_assigned = EmployeeType(role_assigned_str)
        return self.service.record_shift_times(shift_id, user_id, role_assigned, clock_in_time_str, clock_out_time_str)

    def get_shift_worker(self, shift_id: int, user_id: int, role_assigned_str: str):
        """
        Get a specific shift worker record.

        Args:
            shift_id (int): The shift ID
            user_id (int): The user ID
            role_assigned_str (str): The role assigned as string

        Returns:
            ShiftWorker: The shift worker record if found, None otherwise
        """
        from ..models import EmployeeType
        role_assigned = EmployeeType(role_assigned_str)
        return self.repository.get_shift_worker(shift_id, user_id, role_assigned)

    def update_shift_worker_times(self, shift_id: int, user_id: int, role_assigned_str: str, update_data: dict):
        """
        Update timesheet data for a shift worker.

        Args:
            shift_id (int): The shift ID
            user_id (int): The user ID
            role_assigned_str (str): The role assigned as string
            update_data (dict): Dictionary of fields to update

        Returns:
            ShiftWorker: The updated shift worker record
        """
        from ..models import EmployeeType
        role_assigned = EmployeeType(role_assigned_str)
        shift_worker = self.repository.get_shift_worker(shift_id, user_id, role_assigned)

        if shift_worker:
            for key, value in update_data.items():
                if hasattr(shift_worker, key):
                    setattr(shift_worker, key, value)

            self.repository.db.commit()
            self.repository.db.refresh(shift_worker)
            return shift_worker
        return None

    def submit_timesheet_for_worker(self, shift_id: int, worker_id: int, submitted_by_id: int) -> bool:
        """
        Mark timesheet as submitted for a worker.

        Args:
            shift_id (int): The shift ID
            worker_id (int): The worker's user ID
            submitted_by_id (int): ID of user submitting (crew chief or manager)

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            from datetime import datetime

            # Get all shift worker records for this worker on this shift
            shift_workers = self.repository.get_workers_for_shift_and_user(shift_id, worker_id)

            for sw in shift_workers:
                sw.times_submitted_at = datetime.now()
                sw.times_submitted_by = submitted_by_id
                # Recalculate hours when submitting
                sw.calculate_total_hours()

            self.repository.db.commit()
            return True
        except Exception as e:
            print(f"Error submitting timesheet: {e}")
            self.repository.db.rollback()
            return False

    def approve_timesheet_for_worker(self, shift_id: int, worker_id: int, approved_by_id: int) -> bool:
        """
        Approve timesheet for a worker.

        Args:
            shift_id (int): The shift ID
            worker_id (int): The worker's user ID
            approved_by_id (int): ID of manager approving

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            from datetime import datetime

            # Get all shift worker records for this worker on this shift
            shift_workers = self.repository.get_workers_for_shift_and_user(shift_id, worker_id)

            for sw in shift_workers:
                sw.is_approved = True
                sw.approved_at = datetime.now()
                sw.approved_by = approved_by_id

            self.repository.db.commit()
            return True
        except Exception as e:
            print(f"Error approving timesheet: {e}")
            self.repository.db.rollback()
            return False

    def get_employee_timesheet_history(self, employee_id: int, start_date: str = None, end_date: str = None) -> list:
        """
        Get timesheet history for an employee.

        Args:
            employee_id (int): The employee's user ID
            start_date (str): Optional start date filter (YYYY-MM-DD)
            end_date (str): Optional end date filter (YYYY-MM-DD)

        Returns:
            list: List of timesheet records with shift details
        """
        return self.service.get_employee_timesheet_history(employee_id, start_date, end_date)
