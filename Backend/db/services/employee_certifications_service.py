from typing import List, Optional
from ..repositories.employee_certifications_repository import EmployeeCertificationsRepository
from ..controllers.users_controller import UsersController
from ..controllers.workPlaces_controller import WorkPlacesController
from config.constants import db


class EmployeeCertificationsService:
    """
    Service layer for employee certifications business logic.
    """

    def __init__(self, repository: EmployeeCertificationsRepository):
        self.repository = repository

    def get_employees_by_role_capability(self, role: str, workplace_id: int = None) -> List[dict]:
        """
        Get all employees who can fill a specific role.
        
        Args:
            role (str): Role to filter by
            workplace_id (int): Optional workplace filter
            
        Returns:
            List[dict]: List of employee data with certification info
        """
        # Get certifications for users who can fill the role
        certifications = self.repository.get_users_with_role_capability(role)
        
        employees = []
        users_controller = UsersController(db)
        workplaces_controller = WorkPlacesController(db)
        
        for cert in certifications:
            try:
                user = users_controller.get_entity(cert.user_id)
                if not user or not user.isActive or not user.isApproval:
                    continue
                    
                # If workplace filter is specified, check if user belongs to that workplace
                if workplace_id:
                    try:
                        workplace = workplaces_controller.get_entity(cert.user_id)
                        if not workplace or workplace.workPlaceID != workplace_id:
                            continue
                    except:
                        continue
                
                employee_data = {
                    'id': user.id,
                    'name': user.name,
                    'username': user.username,
                    'employee_type': user.employee_type.value if user.employee_type else None,
                    'certifications': cert.to_dict(),
                    'available_roles': cert.get_role_list()
                }
                employees.append(employee_data)
                
            except Exception as e:
                print(f"Error processing certification for user {cert.user_id}: {e}")
                continue
                
        return employees

    def get_all_employees_with_certifications(self, workplace_id: int = None) -> List[dict]:
        """
        Get all employees with their certification information.
        
        Args:
            workplace_id (int): Optional workplace filter
            
        Returns:
            List[dict]: List of employee data with certification info
        """
        employees = []
        users_controller = UsersController(db)
        workplaces_controller = WorkPlacesController(db)
        
        # Get all active, approved employees
        if workplace_id:
            # Get employees for specific workplace
            try:
                active_workers = workplaces_controller.get_active_approve_workers_for_user(workplace_id)
                if not active_workers:
                    return []
                    
                for username, name in active_workers:
                    try:
                        user_id = users_controller.get_user_id_by_username(username)
                        user = users_controller.get_entity(user_id)
                        
                        if user and user.isActive and user.isApproval:
                            # Get certification for this user
                            cert = self.repository.get_by_user_id(user.id)
                            
                            employee_data = {
                                'id': user.id,
                                'name': user.name,
                                'username': user.username,
                                'employee_type': user.employee_type.value if user.employee_type else None,
                                'certifications': cert.to_dict() if cert else {
                                    'can_crew_chief': False,
                                    'can_forklift': False,
                                    'can_truck': False
                                },
                                'available_roles': cert.get_role_list() if cert else ['Stagehand']
                            }
                            employees.append(employee_data)
                            
                    except Exception as e:
                        print(f"Error processing employee {username}: {e}")
                        continue
                        
            except Exception as e:
                print(f"Error getting employees for workplace {workplace_id}: {e}")
                return []
        else:
            # Get all employees (for admin/system-wide operations)
            try:
                all_certifications = self.repository.get_all_with_users()
                
                for cert in all_certifications:
                    if cert.user and cert.user.isActive and cert.user.isApproval:
                        employee_data = {
                            'id': cert.user.id,
                            'name': cert.user.name,
                            'username': cert.user.username,
                            'employee_type': cert.user.employee_type.value if cert.user.employee_type else None,
                            'certifications': cert.to_dict(),
                            'available_roles': cert.get_role_list()
                        }
                        employees.append(employee_data)
                        
            except Exception as e:
                print(f"Error getting all employees with certifications: {e}")
                return []
                
        return employees
