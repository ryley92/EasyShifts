#!/usr/bin/env python3
"""
Script to check and fix workplace setup for managers.
"""

from main import initialize_database_and_session
from db.controllers.users_controller import UsersController
from db.controllers.workPlaces_controller import WorkPlacesController
from sqlalchemy import text

def check_workplace_setup():
    """Check current workplace setup and identify issues."""
    print("🔍 Checking workplace setup...")
    
    try:
        db, _ = initialize_database_and_session()
        users_controller = UsersController(db)
        workplaces_controller = WorkPlacesController(db)
        
        print("\n=== CURRENT USERS ===")
        users = users_controller.get_all_entities()
        managers = []
        workers = []
        
        for user in users:
            workplace_id = getattr(user, 'workplaceID', None)
            print(f"ID: {user.id}, Name: {user.name}, Username: {user.username}")
            print(f"    Manager: {user.isManager}, WorkplaceID: {workplace_id}")
            
            if user.isManager:
                managers.append(user)
            else:
                workers.append(user)
        
        print(f"\nFound {len(managers)} managers and {len(workers)} workers")
        
        print("\n=== CURRENT WORKPLACES ===")
        workplaces = workplaces_controller.get_all_entities()
        print(f"Found {len(workplaces)} workplaces:")
        
        for wp in workplaces:
            name = getattr(wp, 'name', 'Unknown')
            manager_id = getattr(wp, 'managerID', None)
            print(f"ID: {wp.workPlaceID}, Name: {name}, Manager ID: {manager_id}")
        
        print("\n=== WORKPLACE TABLE STRUCTURE ===")
        result = db.execute(text('DESCRIBE workPlaces'))
        for row in result:
            print(row)
        
        # Check for issues
        print("\n=== ISSUE ANALYSIS ===")
        issues = []
        
        for manager in managers:
            workplace_id = getattr(manager, 'workplaceID', None)
            if not workplace_id:
                issues.append(f"Manager {manager.name} (ID: {manager.id}) has no workplaceID")
            else:
                # Check if workplace exists
                try:
                    workplace = workplaces_controller.get_entity(workplace_id)
                    if not workplace:
                        issues.append(f"Manager {manager.name} (ID: {manager.id}) references non-existent workplace {workplace_id}")
                except:
                    issues.append(f"Manager {manager.name} (ID: {manager.id}) references invalid workplace {workplace_id}")
        
        if issues:
            print("❌ Issues found:")
            for issue in issues:
                print(f"   - {issue}")
        else:
            print("✅ No workplace issues found")
        
        return managers, workplaces, issues
        
    except Exception as e:
        print(f"❌ Error checking workplace setup: {e}")
        import traceback
        traceback.print_exc()
        return [], [], []

def create_workplace_for_manager(manager_id, manager_name):
    """Create or update workplace for a manager."""
    print(f"\n🏢 Setting up workplace for manager {manager_name} (ID: {manager_id})...")

    try:
        db, _ = initialize_database_and_session()
        users_controller = UsersController(db)
        workplaces_controller = WorkPlacesController(db)

        # Check if workplace entry already exists for this manager
        try:
            existing_workplace = workplaces_controller.get_entity(manager_id)
            if existing_workplace:
                print(f"✅ Workplace entry already exists for manager {manager_id}")
                # Update the workPlaceID if needed
                if existing_workplace.workPlaceID != manager_id:
                    existing_workplace.workPlaceID = manager_id
                    db.commit()
                    print(f"✅ Updated existing workplace entry for manager {manager_id}")
            else:
                # Create new workplace entry
                workplace_data = {
                    'id': manager_id,  # Manager's user ID (employee in this context)
                    'workPlaceID': manager_id  # Manager's ID (workplace they manage)
                }
                workplace = workplaces_controller.create_entity(workplace_data)
                print(f"✅ Created workplace entry: Manager {manager_id} manages workplace {workplace.workPlaceID}")
        except Exception:
            # If get_entity fails, try to create new entry
            workplace_data = {
                'id': manager_id,  # Manager's user ID (employee in this context)
                'workPlaceID': manager_id  # Manager's ID (workplace they manage)
            }
            workplace = workplaces_controller.create_entity(workplace_data)
            print(f"✅ Created workplace entry: Manager {manager_id} manages workplace {workplace.workPlaceID}")

        # Update the manager's workplaceID in the users table
        manager = users_controller.get_entity(manager_id)
        if manager:
            if manager.workplaceID != manager_id:
                manager.workplaceID = manager_id
                db.commit()
                print(f"✅ Updated manager {manager_name} workplaceID to {manager_id}")
            else:
                print(f"✅ Manager {manager_name} already has correct workplaceID")

        return True

    except Exception as e:
        print(f"❌ Error setting up workplace: {e}")
        db.rollback()  # Rollback on error
        return False

if __name__ == "__main__":
    managers, workplaces, issues = check_workplace_setup()
    
    if issues:
        print(f"\n🔧 Found {len(issues)} issues. Attempting to fix...")
        
        for manager in managers:
            workplace_id = getattr(manager, 'workplaceID', None)
            if not workplace_id:
                success = create_workplace_for_manager(manager.id, manager.name)
                if success:
                    print(f"✅ Fixed workplace setup for {manager.name}")
                else:
                    print(f"❌ Failed to fix workplace setup for {manager.name}")
        
        print("\n🔍 Re-checking workplace setup...")
        check_workplace_setup()
    else:
        print("\n✅ Workplace setup is correct!")
