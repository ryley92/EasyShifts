from datetime import datetime
from typing import List, Type
from Backend.db.repositories.shiftWorkers_repository import ShiftWorkersRepository
from Backend.db.services.base_service import BaseService
from Backend.db.models import EmployeeType, ShiftWorker


class ShiftWorkersService(BaseService):
    """
    Service class for handling complexes operations.
    """

    def __init__(self, repository: ShiftWorkersRepository):
        """
        Initializes the UsersService with a user repository.

        Parameters:
            repository: An instance of ShiftWorkersRepository.
        """
        super().__init__(repository)

    def custom_operation(self):
        """
        Placeholder for a custom operation.
        Actual implementation is not provided yet.
        """
        pass

    def get_supervised_shifts_details(self, user_id: int) -> List[dict]:
        """
        Service method to get detailed information about shifts supervised by a Crew Chief.
        """
        return self.repository.get_supervised_shifts_details(user_id)

    def record_shift_times(self, shift_id: int, user_id: int, role_assigned: EmployeeType, clock_in_time_str: str | None, clock_out_time_str: str | None) -> Type[ShiftWorker] | None:
        """
        Records the clock-in and clock-out times for a specific ShiftWorker entity.

        Args:
            shift_id (int): ID of the shift.
            user_id (int): ID of the worker.
            role_assigned (EmployeeType): The role assigned to the worker for this shift.
            clock_in_time_str (str | None): The clock-in time in ISO 8601 format (e.g., "YYYY-MM-DDTHH:MM:SS").
            clock_out_time_str (str | None): The clock-out time in ISO 8601 format.

        Returns:
            ShiftWorker: The updated ShiftWorker entity if found, None otherwise.
        """
        clock_in_time = datetime.fromisoformat(clock_in_time_str) if clock_in_time_str else None
        clock_out_time = datetime.fromisoformat(clock_out_time_str) if clock_out_time_str else None

        return self.repository.update_shift_worker_times(shift_id, user_id, role_assigned, clock_in_time, clock_out_time)
