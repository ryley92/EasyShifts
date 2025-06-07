from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from typing import Optional
from .base_repository import BaseRepository
from ..models import WorkplaceSettings


class WorkplaceSettingsRepository(BaseRepository):
    """
    Repository for managing workplace settings.
    """

    def __init__(self, db: Session):
        super().__init__(db, WorkplaceSettings)

    def get_by_workplace_id(self, workplace_id: int) -> Optional[WorkplaceSettings]:
        """
        Get settings for a specific workplace.
        
        Args:
            workplace_id (int): The workplace/manager ID
            
        Returns:
            WorkplaceSettings or None
        """
        try:
            return self.db.query(WorkplaceSettings).filter(
                WorkplaceSettings.workplace_id == workplace_id
            ).first()
        except NoResultFound:
            return None

    def create_or_update(self, workplace_id: int, settings_data: dict) -> WorkplaceSettings:
        """
        Create new settings or update existing ones for a workplace.
        
        Args:
            workplace_id (int): The workplace/manager ID
            settings_data (dict): The settings data
            
        Returns:
            WorkplaceSettings: The created or updated settings
        """
        existing = self.get_by_workplace_id(workplace_id)
        
        if existing:
            # Update existing settings
            for key, value in settings_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            # Create new settings
            settings_data['workplace_id'] = workplace_id
            return self.create_entity(settings_data)

    def get_notification_preferences(self, workplace_id: int) -> dict:
        """
        Get notification preferences for a workplace.
        
        Args:
            workplace_id (int): The workplace/manager ID
            
        Returns:
            dict: Notification preferences
        """
        settings = self.get_by_workplace_id(workplace_id)
        if settings:
            return settings.get_notification_preferences()
        return {
            'email': True,
            'sms': False,
            'push': True,
            'types': {
                'shift_requests': True,
                'worker_assignments': True,
                'timesheet_submissions': True,
                'schedule_changes': True,
            }
        }

    def get_scheduling_rules(self, workplace_id: int) -> dict:
        """
        Get scheduling rules for a workplace.
        
        Args:
            workplace_id (int): The workplace/manager ID
            
        Returns:
            dict: Scheduling rules
        """
        settings = self.get_by_workplace_id(workplace_id)
        if settings:
            return settings.get_scheduling_rules()
        return {
            'max_workers_per_shift': 10,
            'min_workers_per_shift': 1,
            'max_consecutive_days': 6,
            'max_hours_per_week': 40,
            'closed_days': [],
            'operating_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        }

    def get_request_window_settings(self, workplace_id: int) -> dict:
        """
        Get request window settings for a workplace.
        
        Args:
            workplace_id (int): The workplace/manager ID
            
        Returns:
            dict: Request window settings
        """
        settings = self.get_by_workplace_id(workplace_id)
        if settings:
            return {
                'auto_open': settings.auto_open_request_windows,
                'days_ahead': settings.request_window_days_ahead,
                'duration_hours': settings.request_window_duration_hours,
                'manual_start': settings.requests_window_start.isoformat() if settings.requests_window_start else None,
                'manual_end': settings.requests_window_end.isoformat() if settings.requests_window_end else None,
            }
        return {
            'auto_open': True,
            'days_ahead': 7,
            'duration_hours': 72,
            'manual_start': None,
            'manual_end': None,
        }

    def get_display_preferences(self, workplace_id: int) -> dict:
        """
        Get display preferences for a workplace.
        
        Args:
            workplace_id (int): The workplace/manager ID
            
        Returns:
            dict: Display preferences
        """
        settings = self.get_by_workplace_id(workplace_id)
        if settings:
            return {
                'default_calendar_view': settings.default_calendar_view,
                'show_worker_photos': settings.show_worker_photos,
                'show_certification_badges': settings.show_certification_badges,
                'color_code_by_role': settings.color_code_by_role,
                'use_24_hour_format': settings.use_24_hour_format,
                'timezone': settings.timezone,
                'language': settings.language,
                'currency': settings.currency,
                'date_format': settings.date_format,
            }
        return {
            'default_calendar_view': 'week',
            'show_worker_photos': True,
            'show_certification_badges': True,
            'color_code_by_role': True,
            'use_24_hour_format': False,
            'timezone': 'America/New_York',
            'language': 'en',
            'currency': 'USD',
            'date_format': 'MM/DD/YYYY',
        }

    def get_timesheet_settings(self, workplace_id: int) -> dict:
        """
        Get timesheet settings for a workplace.
        
        Args:
            workplace_id (int): The workplace/manager ID
            
        Returns:
            dict: Timesheet settings
        """
        settings = self.get_by_workplace_id(workplace_id)
        if settings:
            return {
                'require_photo_clock_in': settings.require_photo_clock_in,
                'require_location_verification': settings.require_location_verification,
                'auto_clock_out_hours': settings.auto_clock_out_hours,
                'overtime_daily_threshold': settings.overtime_threshold_daily,
                'overtime_weekly_threshold': settings.overtime_threshold_weekly,
                'overtime_rate': settings.overtime_rate_multiplier,
                'require_manager_approval': settings.require_manager_approval,
                'auto_approve_regular': settings.auto_approve_regular_hours,
                'auto_approve_overtime': settings.auto_approve_overtime,
            }
        return {
            'require_photo_clock_in': False,
            'require_location_verification': False,
            'auto_clock_out_hours': 12,
            'overtime_daily_threshold': 8,
            'overtime_weekly_threshold': 40,
            'overtime_rate': 1.5,
            'require_manager_approval': True,
            'auto_approve_regular': False,
            'auto_approve_overtime': False,
        }
