"""
Script to initialize test data for the EasyShifts application.
This creates sample client companies and ensures proper workplace setup.
"""

from main import initialize_database_and_session
from db.controllers.client_companies_controller import ClientCompaniesController
from db.controllers.users_controller import UsersController
from db.controllers.workPlaces_controller import WorkPlacesController

def init_test_data():
    """Initialize test data for the application."""
    db, _ = initialize_database_and_session()
    
    try:
        # Initialize controllers
        client_companies_controller = ClientCompaniesController(db)
        users_controller = UsersController(db)
        workplaces_controller = WorkPlacesController(db)
        
        # Create sample client companies
        sample_companies = [
            {"name": "ABC Construction Co."},
            {"name": "XYZ Manufacturing Ltd."},
            {"name": "Tech Solutions Inc."},
            {"name": "Green Energy Corp."},
            {"name": "Metro Healthcare"}
        ]
        
        print("Creating sample client companies...")
        for company_data in sample_companies:
            try:
                existing_companies = client_companies_controller.get_all_client_companies()
                if not any(c['name'] == company_data['name'] for c in existing_companies):
                    client_companies_controller.create_entity(company_data)
                    print(f"Created client company: {company_data['name']}")
                else:
                    print(f"Client company already exists: {company_data['name']}")
            except Exception as e:
                print(f"Error creating client company {company_data['name']}: {e}")
        
        # Ensure manager has a workplace entry
        print("\nChecking manager workplace setup...")
        try:
            # Get all managers
            all_users = users_controller.get_all_entities()
            managers = [user for user in all_users if user.isManager]
            
            for manager in managers:
                try:
                    # Check if manager has a workplace entry
                    workplace = workplaces_controller.get_workplace_id_by_user_id(manager.id)
                    print(f"Manager {manager.name} (ID: {manager.id}) already has workplace: {workplace}")
                except Exception:
                    # Manager doesn't have a workplace, create one
                    try:
                        workplace_data = {
                            "id": manager.id,
                            "workPlaceID": manager.id  # Manager manages their own workplace
                        }
                        workplaces_controller.create_entity(workplace_data)
                        print(f"Created workplace for manager {manager.name} (ID: {manager.id})")
                    except Exception as e:
                        print(f"Error creating workplace for manager {manager.name}: {e}")
                        
        except Exception as e:
            print(f"Error checking manager workplaces: {e}")
        
        print("\nTest data initialization completed!")
        
    except Exception as e:
        print(f"Error during test data initialization: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_test_data()
