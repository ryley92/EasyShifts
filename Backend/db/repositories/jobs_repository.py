from sqlalchemy.orm import Session
from db.models import Job
from db.repositories.base_repository import BaseRepository
from typing import List


class JobsRepository(BaseRepository):
    def __init__(self, db: Session):
        super().__init__(db, Job)

    def get_jobs_by_workplace_id(self, workplace_id: int) -> List[Job]:
        """
        Retrieves all jobs associated with a specific workplace (manager).
        """
        return self.db.query(Job).filter(Job.workplace_id == workplace_id).all()
