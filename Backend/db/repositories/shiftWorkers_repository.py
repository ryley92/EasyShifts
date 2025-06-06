from datetime import date, datetime
from typing import List, Type, Tuple
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session, aliased
from Backend.db.models import ShiftWorker, Shift, Job, ClientCompany, EmployeeType
from Backend.db.repositories.base_repository import BaseRepository
from Backend.db.repositories.users_repository import UsersRepository


class ShiftWorkersRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, ShiftWorker)

    def get_entity_shift_worker(self, shift_id: str, user_id: str) -> Type[ShiftWorker]:
        """
        Retrieves a shift worker by shift ID and user ID.

        Args:
            shift_id (str): ID of the shift
            user_id (str): ID of the worker

        Returns: An entity of ShiftWorker

        """
        entity = self.db.query(ShiftWorker).filter(self.entity_type.shiftID == shift_id,
                                                   self.entity_type.userID == user_id).first()
        if entity is None:
            raise NoResultFound(f"No shift worker found with shiftID {shift_id} and userID {user_id}")
        return entity

    def get_entity_shift_worker_by_composite_key(self, shift_id: int, user_id: int, role_assigned: EmployeeType) -> Type[ShiftWorker] | None:
        """
        Retrieves a shift worker by its composite primary key (shiftID, userID, role_assigned).

        Args:
            shift_id (int): ID of the shift.
            user_id (int): ID of the worker.
            role_assigned (EmployeeType): The role assigned to the worker for this shift.

        Returns:
            ShiftWorker: The ShiftWorker entity if found, None otherwise.
        """
        return self.db.query(ShiftWorker).filter(
            ShiftWorker.shiftID == shift_id,
            ShiftWorker.userID == user_id,
            ShiftWorker.role_assigned == role_assigned
        ).first()

    def delete_entity_shift_worker(self, shift_id: str, user_id: str):
        db_entity = self.get_entity_shift_worker(shift_id, user_id)

        if db_entity is None:
            raise NoResultFound(f"No shift worker found with shiftID {shift_id} and userID {user_id}")

        self.db.delete(db_entity)
        self.db.commit()

    def update_shift_worker_times(self, shift_id: int, user_id: int, role_assigned: EmployeeType, clock_in_time: datetime | None, clock_out_time: datetime | None) -> Type[ShiftWorker] | None:
        """
        Updates the clock-in and clock-out times for a specific ShiftWorker entity.

        Args:
            shift_id (int): ID of the shift.
            user_id (int): ID of the worker.
            role_assigned (EmployeeType): The role assigned to the worker for this shift.
            clock_in_time (datetime | None): The new clock-in time.
            clock_out_time (datetime | None): The new clock-out time.

        Returns:
            ShiftWorker: The updated ShiftWorker entity if found, None otherwise.
        """
        db_entity = self.get_entity_shift_worker_by_composite_key(shift_id, user_id, role_assigned)

        if db_entity:
            db_entity.clock_in_time = clock_in_time
            db_entity.clock_out_time = clock_out_time
            db_entity.times_submitted_at = datetime.now()
            self.db.commit()
            self.db.refresh(db_entity)
        return db_entity

    def get_worker_shifts_by_worker_id(self, worker_id: str) -> List[ShiftWorker]:
        """
        Retrieves all shifts for a worker by worker ID.

        Parameters:
            worker_id (str): ID of the worker to retrieve shifts for.

        Returns:
            List[ShiftWorker]: A list of all shifts for the worker.
        """
        return self.db.query(ShiftWorker).filter(ShiftWorker.userID == worker_id).all()

    def get_shift_workers_by_shift_id(self, shift_id: str) -> List[ShiftWorker]:
        """
        Retrieves all workers for a shift by shift ID.

        Parameters:
            shift_id (str): ID of the shift to retrieve workers for.

        Returns:
            List[ShiftWorker]: A list of all workers for the shift.
        """
        return self.db.query(self.entity_type).filter(self.entity_type.shiftID == shift_id).all()

    def is_shift_assigned_to_worker(self, shift_id: str, worker_id: str) -> bool:
        """
        Checks if a shift is assigned to a worker.

        Parameters:
            shift_id (str): ID of the shift to check.
            worker_id (str): ID of the worker to check.

        Returns:
            bool: True if the shift is assigned to the worker, False otherwise.
        """

        # Check if the user exists in the database
        user_repository = UsersRepository(self.db)
        user_repository.get_entity(worker_id)  # Raises NoResultFound if the user is not found

        # Check if the shift is assigned to the worker
        return self.db.query(ShiftWorker).filter(
            ShiftWorker.shiftID == shift_id,
            ShiftWorker.userID == worker_id
        ).first() is not None

    def convert_shift_workers_by_shift_id_to_client(self, shift_id: str) -> list[str]:
        """
        Retrieves all workers for a shift by shift ID.
        Args:
            shift_id (str): ID of the shift to retrieve workers for.

        Returns:
            List[str]: A list of all workers for the shift.
        """
        users_repository = UsersRepository(self.db)
        workers = self.get_shift_workers_by_shift_id(shift_id)
        return [users_repository.get_entity(worker.userID).name for worker in workers]

    def get_supervised_shifts_details(self, user_id: int) -> List[dict]:
        """
        Retrieves detailed information about shifts supervised by a given user (Crew Chief).

        Args:
            user_id (int): The ID of the user (Crew Chief).

        Returns:
            List[dict]: A list of dictionaries, where each dictionary contains:
                - shift_id (int)
                - shift_date (Date)
                - shift_part (ShiftPart)
                - job_id (int)
                - job_name (str)
                - client_company_name (str)
        """
        results = (
            self.db.query(
                Shift.id.label("shift_id"),
                Shift.shiftDate.label("shift_date"),
                Shift.shiftPart.label("shift_part"),
                Job.id.label("job_id"),
                Job.name.label("job_name"),
                ClientCompany.name.label("client_company_name"),
            )
            .join(Shift, ShiftWorker.shiftID == Shift.id)
            .join(Job, Shift.job_id == Job.id)
            .join(ClientCompany, Job.client_company_id == ClientCompany.id)
            .filter(ShiftWorker.userID == user_id)
            .filter(ShiftWorker.role_assigned == EmployeeType.CREW_CHIEF)
            .order_by(Shift.shiftDate.desc(), Shift.shiftPart)
            .all()
        )

        return [
            {
                "shift_id": row.shift_id,
                "shift_date": row.shift_date.isoformat() if row.shift_date else None,
                "shift_part": row.shift_part.value if row.shift_part else None,
                "job_id": row.job_id,
                "job_name": row.job_name,
                "client_company_name": row.client_company_name,
            }
            for row in results
        ]
