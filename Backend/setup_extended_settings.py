#!/usr/bin/env python3
"""
Extended Settings Setup Script for EasyShifts
Initializes the extended settings system with default configurations.
"""

import os
import sys
import argparse
from datetime import datetime

# Add the current directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import initialize_database_and_session
from db.models import User
from db.controllers.extended_settings_controller import ExtendedSettingsController
from db.services.settings_templates import SettingsTemplates
from db.services.extended_settings_service import ExtendedSettingsService


def setup_extended_settings(template_id: str = 'hands_on_labor_default'):
    """
    Set up extended settings for Hands on Labor.
    Since this is a single company system, we don't need workplace_id.

    Args:
        template_id (str): The template to apply
    """
    print("🚀 Setting up EasyShifts Extended Settings for Hands on Labor...")

    # Initialize database
    try:
        db, session = initialize_database_and_session()
        print("✅ Database connection established")
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        return False

    try:
        # Initialize controllers and services
        controller = ExtendedSettingsController(session)
        service = ExtendedSettingsService(session)
        
        print(f"📋 Applying template: {template_id}")
        
        # Get template settings
        try:
            template_settings = SettingsTemplates.apply_template(template_id)
            print(f"✅ Template loaded with {len(template_settings)} categories")
        except ValueError as e:
            print(f"❌ {e}")
            return False
        
        # Apply template settings
        print("🔧 Applying settings...")
        updated_settings = service.update_settings_bulk(template_settings)

        print(f"✅ Successfully applied settings for {len(updated_settings)} categories:")
        for category in updated_settings.keys():
            print(f"   • {category}")

        # Generate summary
        print("\n📊 Generating settings summary...")
        summary = service.get_settings_summary()
        
        print(f"✅ Configuration complete!")
        print(f"   • Total categories: {summary['total_categories']}")
        print(f"   • Recommendations: {len(summary['recommendations'])}")
        
        if summary['recommendations']:
            print("\n💡 Recommendations:")
            for rec in summary['recommendations'][:3]:  # Show first 3
                print(f"   • {rec['title']}: {rec['description']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error setting up extended settings: {e}")
        session.rollback()
        return False
    finally:
        session.close()


def verify_setup():
    """
    Verify that extended settings are properly configured for Hands on Labor.
    """
    print("🔍 Verifying Extended Settings Setup...")

    try:
        db, session = initialize_database_and_session()

        controller = ExtendedSettingsController(session)
        service = ExtendedSettingsService(session)

        # Get all settings
        all_settings = controller.get_all_extended_settings()

        print(f"✅ Found {len(all_settings)} settings categories")

        # Check each category
        for category, settings in all_settings.items():
            if settings:
                print(f"   ✅ {category}: Configured")
            else:
                print(f"   ❌ {category}: Not configured")

        # Get summary
        summary = service.get_settings_summary()
        
        print(f"\n📊 Configuration Status:")
        for category, status in summary['configuration_status'].items():
            completeness = status.get('completeness', 0)
            status_text = status.get('status', 'unknown')
            print(f"   • {category}: {completeness}% ({status_text})")
        
        # Check integrations
        if summary['integration_status']:
            print(f"\n🔗 Integration Status:")
            for integration, status in summary['integration_status'].items():
                print(f"   • {integration}: {status}")
        
        # Check compliance
        if summary['compliance_status']:
            print(f"\n🛡️ Compliance Status:")
            for item, status in summary['compliance_status'].items():
                status_icon = "✅" if status else "❌"
                print(f"   {status_icon} {item}: {status}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verifying setup: {e}")
        return False
    finally:
        session.close()


def reset_settings():
    """
    Reset all extended settings to defaults for Hands on Labor.
    """
    print("🔄 Resetting Extended Settings to Defaults...")

    try:
        db, session = initialize_database_and_session()

        controller = ExtendedSettingsController(session)

        # Reset to defaults
        reset_settings = controller.reset_all_to_defaults()
        
        print(f"✅ Reset {len(reset_settings)} settings categories to defaults")
        
        return True
        
    except Exception as e:
        print(f"❌ Error resetting settings: {e}")
        return False
    finally:
        session.close()


def list_templates():
    """List all available settings templates."""
    print("📋 Available Settings Templates:")
    
    templates = SettingsTemplates.get_available_templates()
    
    for template in templates:
        print(f"\n🏷️  {template['name']} ({template['id']})")
        print(f"   Category: {template['category']}")
        print(f"   Description: {template['description']}")
        print(f"   Recommended for: {template['recommended_for']}")


def export_settings(output_file: str = None):
    """
    Export settings to a backup file for Hands on Labor.

    Args:
        output_file (str): Output file path
    """
    print("📤 Exporting Extended Settings...")

    try:
        db, session = initialize_database_and_session()

        service = ExtendedSettingsService(session)
        export_data = service.export_settings_for_backup()
        
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"easyshifts_settings_backup_{timestamp}.json"
        
        import json
        with open(output_file, 'w') as f:
            json.dump(export_data, f, indent=2, default=str)
        
        print(f"✅ Settings exported to: {output_file}")
        return True
        
    except Exception as e:
        print(f"❌ Error exporting settings: {e}")
        return False
    finally:
        session.close()


def main():
    """Main function to handle command line arguments."""
    parser = argparse.ArgumentParser(description='EasyShifts Extended Settings Setup')
    parser.add_argument('action', choices=['setup', 'verify', 'reset', 'templates', 'export'], 
                       help='Action to perform')
    parser.add_argument('--workplace-id', type=int, help='Workplace ID')
    parser.add_argument('--template', default='hands_on_labor_default', 
                       help='Template to apply (default: hands_on_labor_default)')
    parser.add_argument('--output', help='Output file for export')
    
    args = parser.parse_args()
    
    print("🎯 EasyShifts Extended Settings Manager")
    print("=" * 50)
    
    if args.action == 'setup':
        success = setup_extended_settings(args.template)
    elif args.action == 'verify':
        success = verify_setup()
    elif args.action == 'reset':
        success = reset_settings()
    elif args.action == 'templates':
        list_templates()
        success = True
    elif args.action == 'export':
        success = export_settings(args.output)
    else:
        print(f"❌ Unknown action: {args.action}")
        success = False
    
    if success:
        print("\n🎉 Operation completed successfully!")
    else:
        print("\n💥 Operation failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
