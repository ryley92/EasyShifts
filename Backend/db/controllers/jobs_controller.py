from sqlalchemy.orm import Session
from db.models import Job
from db.repositories.jobs_repository import JobsRepository
from db.services.jobs_service import JobsService
from db.controllers.base_controller import BaseController
from typing import List, dict


class JobsController(BaseController):
    def __init__(self, db: Session):
        self.repository = JobsRepository(db)
        self.service = JobsService(self.repository)
        super().__init__(self.repository, self.service)

    def create_job(self, job_data: dict) -> dict:
        """
        Creates a new job and returns its details.
        job_data should include: name, client_company_id, workplace_id (manager's user_id)
        """
        job = self.service.create_job(job_data)
        return {
            "id": job.id,
            "name": job.name,
            "client_company_id": job.client_company_id,
            "workplace_id": job.workplace_id
        }

    def get_jobs_by_workplace_id(self, workplace_id: int) -> List[dict]:
        """
        Retrieves jobs for a given workplace ID (manager's user_id).
        """
        jobs = self.service.get_jobs_by_workplace_id(workplace_id)
        return [
            {
                "id": job.id,
                "name": job.name,
                "client_company_id": job.client_company_id, # Consider joining to get company name
                "workplace_id": job.workplace_id
            } for job in jobs
        ]
