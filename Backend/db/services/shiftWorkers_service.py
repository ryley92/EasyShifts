from Backend.db.repositories.shiftWorkers_repository import ShiftWorkersRepository
from Backend.db.services.base_service import BaseService
from typing import List


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
