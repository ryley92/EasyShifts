# Extended Settings API Documentation

## Overview

The Extended Settings API provides comprehensive configuration management for EasyShifts, specifically designed for Hands on Labor's staffing operations. This API includes 25 endpoints covering 10 settings categories plus advanced management features.

## Authentication

All endpoints require manager-level authentication. Include a valid user session with manager privileges.

## Base Request Format

```javascript
{
    "request_id": <endpoint_id>,
    "data": {
        // Request-specific data
    }
}
```

## Response Format

```javascript
{
    "request_id": <endpoint_id>,
    "success": true|false,
    "data": {
        // Response data
    },
    "error": "Error message if success is false"
}
```

## Settings Categories Endpoints

### 1. Company Profile Settings (1100)

Update core company information and branding.

**Request:**
```javascript
{
    "request_id": 1100,
    "data": {
        "company_name": "Hands on Labor",
        "company_tagline": "Professional Event Staffing",
        "company_email": "info@handsonlabor.com",
        "company_phone": "(619) 555-0123",
        "default_hourly_rate": 28.50,
        "operating_hours_start": "06:00",
        "operating_hours_end": "22:00",
        "time_zone": "America/Los_Angeles"
    }
}
```

### 2. User Management Settings (1101)

Configure user accounts, roles, and premium rates.

**Request:**
```javascript
{
    "request_id": 1101,
    "data": {
        "auto_approve_employees": false,
        "require_manager_approval": true,
        "password_min_length": 8,
        "session_timeout_minutes": 480,
        "crew_chief_premium_rate": 5.00,
        "forklift_operators_premium_rate": 3.00,
        "truck_drivers_premium_rate": 4.00
    }
}
```

### 3. Certifications Settings (1102)

Manage certification requirements and tracking.

**Request:**
```javascript
{
    "request_id": 1102,
    "data": {
        "require_crew_chief_certification": true,
        "require_forklift_certification": true,
        "crew_chief_cert_validity_months": 24,
        "forklift_cert_validity_months": 36,
        "auto_notify_expiring_certs": true,
        "cert_expiry_warning_days": 30,
        "custom_certifications": [
            {
                "name": "Rigging Certification",
                "validity_months": 12,
                "required": true
            }
        ]
    }
}
```

### 4. Client Management Settings (1103)

Configure client relationships and billing.

**Request:**
```javascript
{
    "request_id": 1103,
    "data": {
        "auto_create_client_invoices": true,
        "default_payment_terms_days": 30,
        "late_payment_fee_percentage": 1.5,
        "require_client_approval_for_timesheets": true,
        "client_portal_enabled": true,
        "show_worker_names_to_clients": true
    }
}
```

### 5. Job Configuration Settings (1104)

Set up job templates and shift management.

**Request:**
```javascript
{
    "request_id": 1104,
    "data": {
        "enable_job_templates": true,
        "default_job_duration_hours": 8,
        "require_crew_chief_per_shift": true,
        "max_workers_per_crew_chief": 8,
        "require_job_location": true,
        "min_notice_hours_new_jobs": 24,
        "job_templates": [
            {
                "id": 1,
                "name": "Stage Setup",
                "duration_hours": 8,
                "required_roles": {
                    "crew_chief": 1,
                    "stagehand": 6,
                    "forklift_operator": 1
                }
            }
        ]
    }
}
```

### 6. Advanced Timesheet Settings (1105)

Configure detailed timesheet and payroll rules.

**Request:**
```javascript
{
    "request_id": 1105,
    "data": {
        "require_location_verification": true,
        "location_verification_radius_feet": 100,
        "max_clock_pairs_per_shift": 3,
        "overtime_threshold_daily": 8,
        "overtime_rate_multiplier": 1.5,
        "crew_chiefs_can_edit_team_times": true,
        "clients_can_view_timesheets": true,
        "round_time_to_nearest_minutes": 15
    }
}
```

### 7. Google Integration Settings (1106)

Set up Google services integration.

**Request:**
```javascript
{
    "request_id": 1106,
    "data": {
        "google_oauth_enabled": true,
        "google_client_id": "your_client_id",
        "google_client_secret": "your_client_secret",
        "google_calendar_sync_enabled": true,
        "gmail_notifications_enabled": true,
        "google_maps_enabled": true,
        "sync_frequency_minutes": 15
    }
}
```

### 8. Reporting Settings (1107)

Configure report generation and analytics.

**Request:**
```javascript
{
    "request_id": 1107,
    "data": {
        "auto_generate_reports": true,
        "report_generation_frequency": "weekly",
        "keep_timesheet_records_months": 24,
        "default_export_format": "xlsx",
        "track_employee_performance": true,
        "enable_custom_reports": true
    }
}
```

### 9. Mobile & Accessibility Settings (1109)

Configure mobile app and accessibility features.

**Request:**
```javascript
{
    "request_id": 1109,
    "data": {
        "mobile_app_enabled": true,
        "enable_offline_mode": true,
        "mobile_push_notifications": true,
        "gps_tracking_enabled": true,
        "high_contrast_mode": false,
        "large_text_support": true,
        "biometric_authentication": true
    }
}
```

### 10. System Administration Settings (1110)

Configure system maintenance and security.

**Request:**
```javascript
{
    "request_id": 1110,
    "data": {
        "auto_backup_enabled": true,
        "backup_frequency": "daily",
        "system_health_monitoring": true,
        "audit_logging_enabled": true,
        "enable_rate_limiting": true,
        "max_concurrent_users": 500
    }
}
```

## Core Management Endpoints

### Get All Extended Settings (1111)

Retrieve all extended settings for the workplace.

**Request:**
```javascript
{
    "request_id": 1111,
    "data": {}
}
```

**Response:**
```javascript
{
    "request_id": 1111,
    "success": true,
    "data": {
        "company_profile": { /* settings */ },
        "user_management": { /* settings */ },
        "certifications": { /* settings */ },
        // ... all other categories
    }
}
```

### Reset Settings to Defaults (1112)

Reset all extended settings to default values.

**Request:**
```javascript
{
    "request_id": 1112,
    "data": {}
}
```

## Utility Endpoints

### Test Google Connection (1113)

Test Google API connectivity and permissions.

**Request:**
```javascript
{
    "request_id": 1113,
    "data": {
        "google_client_id": "test_client_id",
        "google_client_secret": "test_secret"
    }
}
```

**Response:**
```javascript
{
    "request_id": 1113,
    "success": true,
    "data": {
        "connection_status": "success",
        "oauth_valid": true,
        "calendar_access": true,
        "gmail_access": true,
        "test_timestamp": "2024-01-15T10:30:00Z"
    }
}
```

### Manual Google Sync (1114)

Trigger immediate Google services synchronization.

**Request:**
```javascript
{
    "request_id": 1114,
    "data": {}
}
```

### System Health Check (1115)

Run comprehensive system health diagnostics.

**Request:**
```javascript
{
    "request_id": 1115,
    "data": {}
}
```

**Response:**
```javascript
{
    "request_id": 1115,
    "success": true,
    "data": {
        "overall_status": "healthy",
        "database_status": "connected",
        "memory_usage": "42%",
        "cpu_usage": "23%",
        "active_users": 45,
        "uptime": "99.9%"
    }
}
```

### Manual Backup (1116)

Trigger immediate system backup.

**Request:**
```javascript
{
    "request_id": 1116,
    "data": {}
}
```

## Advanced Management Endpoints

### Get Settings Summary (1117)

Get comprehensive settings analysis with recommendations.

**Request:**
```javascript
{
    "request_id": 1117,
    "data": {}
}
```

**Response:**
```javascript
{
    "request_id": 1117,
    "success": true,
    "data": {
        "total_categories": 10,
        "configuration_status": {
            "company_profile": {
                "status": "fully_configured",
                "completeness": 100
            }
        },
        "integration_status": {
            "google": {
                "oauth_configured": true,
                "calendar_enabled": true
            }
        },
        "recommendations": [
            {
                "category": "google_integration",
                "type": "integration",
                "priority": "high",
                "title": "Enable Google Integration",
                "description": "Set up Google OAuth for enhanced features"
            }
        ]
    }
}
```

### Bulk Update Settings (1118)

Update multiple settings categories in one operation.

**Request:**
```javascript
{
    "request_id": 1118,
    "data": {
        "settings": {
            "company_profile": {
                "company_name": "Updated Name"
            },
            "user_management": {
                "password_min_length": 10
            }
        }
    }
}
```

### Export Settings Backup (1119)

Export all settings for backup purposes.

**Request:**
```javascript
{
    "request_id": 1119,
    "data": {}
}
```

### Import Settings Backup (1120)

Import settings from backup data.

**Request:**
```javascript
{
    "request_id": 1120,
    "data": {
        "backup_data": {
            "export_metadata": { /* metadata */ },
            "settings": { /* all settings */ }
        }
    }
}
```

### Get Settings Templates (1121)

Retrieve available settings templates.

**Request:**
```javascript
{
    "request_id": 1121,
    "data": {}
}
```

### Apply Settings Template (1122)

Apply a pre-configured settings template.

**Request:**
```javascript
{
    "request_id": 1122,
    "data": {
        "template_id": "hands_on_labor_default"
    }
}
```

### Compare Settings (1123)

Compare current settings with provided data.

**Request:**
```javascript
{
    "request_id": 1123,
    "data": {
        "comparison_settings": {
            "company_profile": { /* settings to compare */ }
        }
    }
}
```

### Validate Settings Bulk (1124)

Validate multiple settings without saving.

**Request:**
```javascript
{
    "request_id": 1124,
    "data": {
        "settings": {
            "company_profile": {
                "company_name": "",  // This will fail validation
                "default_hourly_rate": -5  // This will also fail
            }
        }
    }
}
```

**Response:**
```javascript
{
    "request_id": 1124,
    "success": true,
    "data": {
        "is_valid": false,
        "errors": [
            "company_profile: Company name is required",
            "company_profile: Hourly rate must be positive"
        ],
        "validated_categories": ["company_profile"]
    }
}
```

## Error Handling

All endpoints return standardized error responses:

```javascript
{
    "request_id": <endpoint_id>,
    "success": false,
    "error": "Detailed error message"
}
```

Common error scenarios:
- **Unauthorized access**: User lacks manager privileges
- **Validation errors**: Invalid input data
- **Database errors**: Connection or constraint issues
- **Integration errors**: External service failures

## Rate Limiting

API endpoints are subject to rate limiting based on system administration settings. Default limits:
- 100 requests per minute per user
- Bulk operations may have lower limits
- System utility functions have additional restrictions
