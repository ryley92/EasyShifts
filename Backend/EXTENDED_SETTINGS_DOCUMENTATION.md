# Extended Settings Documentation

## Overview

The Extended Settings system provides comprehensive configuration options for EasyShifts, specifically tailored for Hands on Labor's staffing operations. This system expands beyond basic workplace settings to include detailed configuration for all aspects of the application.

## Settings Categories

### 1. Company Profile Settings (`CompanyProfile`)
**Purpose**: Core company information and branding
**Database Table**: `company_profile`
**API Endpoint**: Request ID `1100`

**Key Fields**:
- `company_name`: Company display name (default: "Hands on Labor")
- `company_tagline`: Marketing tagline
- `company_email`: Primary contact email
- `company_phone`: Primary contact phone
- `company_address`: Physical address
- `default_hourly_rate`: Base hourly rate for stagehands
- `operating_hours_start/end`: Business hours
- `time_zone`: Company timezone
- `company_logo_url`: Logo image URL
- `website_url`: Company website
- `social_media_links`: JSON object with social links

### 2. User Management Settings (`UserManagementSettings`)
**Purpose**: User account and role management configuration
**Database Table**: `user_management_settings`
**API Endpoint**: Request ID `1101`

**Key Fields**:
- `auto_approve_employees`: Automatically approve new employee registrations
- `require_manager_approval`: Require manager approval for various actions
- `password_min_length`: Minimum password length requirement
- `session_timeout_minutes`: User session timeout
- `crew_chief_premium_rate`: Additional hourly rate for crew chiefs
- `forklift_operators_premium_rate`: Additional rate for forklift operators
- `truck_drivers_premium_rate`: Additional rate for truck drivers
- `allow_employee_self_registration`: Allow employees to register themselves
- `require_email_verification`: Require email verification for new accounts

### 3. Certifications Settings (`CertificationsSettings`)
**Purpose**: Certification requirements and tracking
**Database Table**: `certifications_settings`
**API Endpoint**: Request ID `1102`

**Key Fields**:
- `require_crew_chief_certification`: Mandate crew chief certification
- `require_forklift_certification`: Mandate forklift certification
- `crew_chief_cert_validity_months`: Crew chief cert validity period
- `forklift_cert_validity_months`: Forklift cert validity period
- `safety_training_validity_months`: Safety training validity
- `background_check_validity_months`: Background check validity
- `auto_notify_expiring_certs`: Auto-notify before expiration
- `cert_expiry_warning_days`: Days before expiry to warn
- `custom_certifications`: JSON array of custom certification types

### 4. Client Management Settings (`ClientManagementSettings`)
**Purpose**: Client relationship and billing configuration
**Database Table**: `client_management_settings`
**API Endpoint**: Request ID `1103`

**Key Fields**:
- `auto_create_client_invoices`: Automatically generate invoices
- `default_payment_terms_days`: Default payment terms
- `late_payment_fee_percentage`: Late payment penalty
- `require_client_approval_for_timesheets`: Client timesheet approval
- `allow_client_direct_booking`: Allow clients to book directly
- `client_portal_enabled`: Enable client portal access
- `show_worker_names_to_clients`: Display worker names to clients
- `client_rating_system_enabled`: Enable client rating system

### 5. Job Configuration Settings (`JobConfigurationSettings`)
**Purpose**: Job and shift management configuration
**Database Table**: `job_configuration_settings`
**API Endpoint**: Request ID `1104`

**Key Fields**:
- `enable_job_templates`: Enable job template system
- `default_job_duration_hours`: Default job duration
- `require_crew_chief_per_shift`: Mandate crew chief on shifts
- `max_workers_per_crew_chief`: Maximum workers per crew chief
- `require_job_location`: Require location for all jobs
- `min_notice_hours_new_jobs`: Minimum notice for new jobs
- `auto_assign_workers`: Enable automatic worker assignment
- `job_templates`: JSON array of job templates
- `equipment_categories`: JSON array of equipment types

### 6. Advanced Timesheet Settings (`TimesheetAdvancedSettings`)
**Purpose**: Detailed timesheet and payroll configuration
**Database Table**: `timesheet_advanced_settings`
**API Endpoint**: Request ID `1105`

**Key Fields**:
- `require_location_verification`: GPS verification for clock in/out
- `location_verification_radius_feet`: Allowed GPS radius
- `max_clock_pairs_per_shift`: Maximum clock in/out pairs
- `overtime_threshold_daily`: Daily overtime threshold
- `overtime_rate_multiplier`: Overtime pay multiplier
- `crew_chiefs_can_edit_team_times`: Crew chief editing permissions
- `clients_can_view_timesheets`: Client timesheet access
- `round_time_to_nearest_minutes`: Time rounding precision

### 7. Google Integration Settings (`GoogleIntegrationSettings`)
**Purpose**: Google services integration configuration
**Database Table**: `google_integration_settings`
**API Endpoint**: Request ID `1106`

**Key Fields**:
- `google_oauth_enabled`: Enable Google OAuth
- `google_client_id/secret`: OAuth credentials
- `google_calendar_sync_enabled`: Calendar synchronization
- `gmail_notifications_enabled`: Gmail integration
- `google_drive_enabled`: Drive backup integration
- `google_maps_enabled`: Maps integration for locations
- `sync_frequency_minutes`: Sync frequency

### 8. Reporting Settings (`ReportingSettings`)
**Purpose**: Report generation and analytics configuration
**Database Table**: `reporting_settings`
**API Endpoint**: Request ID `1107`

**Key Fields**:
- `auto_generate_reports`: Automatic report generation
- `report_generation_frequency`: Report frequency
- `keep_timesheet_records_months`: Data retention period
- `default_export_format`: Default export format
- `track_employee_performance`: Performance tracking
- `enable_custom_reports`: Custom report builder

### 9. Mobile & Accessibility Settings (`MobileAccessibilitySettings`)
**Purpose**: Mobile app and accessibility configuration
**Database Table**: `mobile_accessibility_settings`
**API Endpoint**: Request ID `1109`

**Key Fields**:
- `mobile_app_enabled`: Enable mobile app access
- `enable_offline_mode`: Offline functionality
- `mobile_push_notifications`: Push notification settings
- `gps_tracking_enabled`: GPS tracking
- `high_contrast_mode`: Accessibility features
- `font_size_multiplier`: Text size adjustment

### 10. System Administration Settings (`SystemAdminSettings`)
**Purpose**: System maintenance and security configuration
**Database Table**: `system_admin_settings`
**API Endpoint**: Request ID `1110`

**Key Fields**:
- `auto_backup_enabled`: Automatic backups
- `backup_frequency`: Backup schedule
- `system_health_monitoring`: Health monitoring
- `audit_logging_enabled`: Audit trail logging
- `enable_rate_limiting`: API rate limiting
- `maintenance_mode_enabled`: Maintenance mode

## API Endpoints

### Core Settings Operations
- `1111`: Get All Extended Settings
- `1112`: Reset All Settings to Defaults

### Utility Operations
- `1113`: Test Google Connection
- `1114`: Manual Google Sync
- `1115`: System Health Check
- `1116`: Manual Backup

## Usage Examples

### Updating Company Profile
```javascript
const updateCompanyProfile = {
    request_id: 1100,
    data: {
        company_name: "Hands on Labor",
        company_tagline: "Professional Event Staffing",
        default_hourly_rate: 28.50,
        operating_hours_start: "06:00",
        operating_hours_end: "22:00"
    }
};
```

### Configuring Certifications
```javascript
const updateCertifications = {
    request_id: 1102,
    data: {
        require_crew_chief_certification: true,
        crew_chief_cert_validity_months: 24,
        auto_notify_expiring_certs: true,
        cert_expiry_warning_days: 30,
        custom_certifications: [
            {
                name: "Rigging Certification",
                validity_months: 12,
                required: true
            }
        ]
    }
};
```

### Setting Up Google Integration
```javascript
const updateGoogleIntegration = {
    request_id: 1106,
    data: {
        google_oauth_enabled: true,
        google_client_id: "your_client_id",
        google_client_secret: "your_client_secret",
        google_calendar_sync_enabled: true,
        gmail_notifications_enabled: true,
        sync_frequency_minutes: 15
    }
};
```

## Database Migration

To set up the extended settings tables, run:

```bash
cd Backend/db/migrations
python add_extended_settings_tables.py migrate
```

To create default settings for a workplace:

```bash
python add_extended_settings_tables.py create-defaults --workplace-id 1
```

## Security Considerations

1. **Access Control**: All settings endpoints require manager-level access
2. **Data Validation**: Comprehensive validation on all input data
3. **Audit Logging**: All settings changes are logged for audit trails
4. **Sensitive Data**: OAuth secrets and API keys are stored securely

## Testing

Run the comprehensive test suite:

```bash
cd Backend
python -m pytest tests/test_extended_settings.py -v
```

## Integration with Frontend

The frontend settings interface should:
1. Group settings by category with tabbed interface
2. Provide real-time validation feedback
3. Show help text and examples for complex fields
4. Include test buttons for integrations (Google, etc.)
5. Display current values and allow bulk reset to defaults

## Future Enhancements

1. **Settings Templates**: Pre-configured setting packages
2. **Import/Export**: Backup and restore settings configurations
3. **Multi-tenant**: Different settings per client company
4. **Advanced Scheduling**: More complex scheduling rules
5. **Integration APIs**: Additional third-party integrations
