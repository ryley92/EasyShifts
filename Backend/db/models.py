import datetime
from sqlalchemy import Column, String, Boolean, Date, Enum, PrimaryKeyConstraint, ForeignKey, DateTime, JSON, func, \
    Integer, Float
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from uuid import uuid4
import enum

Base = declarative_base()

NAMES_LEN = 20
PASS_LEN = 50
ID_LEN = 500
REQUEST_LEN = 255


class EmployeeType(enum.Enum):
    """Represents different types/roles of employees within the agency."""
    CREW_CHIEF = 'crew_chief'
    STAGEHAND = 'stagehand'
    FORK_OPERATOR = 'fork_operator'
    PICKUP_TRUCK_DRIVER = 'pickup_truck_driver'
    # Add other employee types as needed
    GENERAL_EMPLOYEE = 'general_employee'


class User(Base):
    """
    Represents a user in the system.

    Attributes:
        id (str): Unique identifier for the user.
        username (str): User's unique username.
        password (str): User's password.
        isManager (bool): Indicates if the user is a manager within the agency.
        isAdmin (bool): Indicates if the user is an admin within the agency.
        client_company_id (int): Foreign key to client_companies. If set, user is a client representative.
        isActive (bool): Indicates if the user account is active. Default is True.
        isApproval (bool): Indicates if the user is approved. Default is False.
        name (str): User's name or display name.
        employee_type (EmployeeType): The type or role of the agency employee. Null for clients or some admins.
        google_id (str): Google OAuth unique identifier. Null if not linked to Google account.
        email (str): User's email address. Required for Google OAuth users.
        google_picture (str): URL to user's Google profile picture.
        last_login (DateTime): Timestamp of user's last login.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, nullable=False)  # userID
    username = Column(String(NAMES_LEN), unique=True, nullable=False)
    password = Column(String(PASS_LEN), nullable=True)  # Made nullable for Google OAuth users
    isManager = Column(Boolean, nullable=False, default=False)
    isAdmin = Column(Boolean, nullable=False, default=False)
    client_company_id = Column(Integer, ForeignKey('client_companies.id'), nullable=True)
    isActive = Column(Boolean, nullable=False, default=True)
    isApproval = Column(Boolean, nullable=False, default=False)
    name = Column(String(NAMES_LEN), nullable=False)
    employee_type = Column(Enum(EmployeeType), nullable=True)

    # Google OAuth fields
    google_id = Column(String(100), unique=True, nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    google_picture = Column(String(500), nullable=True)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    certifications = relationship("EmployeeCertification", back_populates="user", uselist=False)


class ClientCompany(Base):
    """
    Represents a client company.

    Attributes:
        id (int): Unique identifier for the client company.
        name (str): Name of the client company.
    """
    __tablename__ = "client_companies"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    name = Column(String(NAMES_LEN * 2), unique=True, nullable=False)
    # Add other client company details here, e.g., address, contact_person


class Job(Base):
    """
    Represents a job or project.

    Attributes:
        id (int): Unique identifier for the job.
        name (str): Name of the job.
        client_company_id (int): Foreign key to the client company.
        workplace_id (int): Foreign key to the User (manager) responsible for this job within the agency. Can be null if created by a client.
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    name = Column(String(NAMES_LEN * 2), nullable=False)
    client_company_id = Column(Integer, ForeignKey('client_companies.id'), nullable=False)
    workplace_id = Column(Integer, ForeignKey('users.id'), nullable=True) # Agency Manager's ID, can be NULL
    # Add other job details here, e.g., description, start_date, end_date


class WorkPlace(Base):
    """
    Represents a workplace associated with a user (employee).
    This table links agency employees to their managing entity (an agency manager user).

    Attributes:
        id (str): User's ID (employee).
        workPlaceID (int): Manager's User ID, representing the workplace/agency branch.
    """
    __tablename__ = "workPlaces"

    id = Column(Integer, ForeignKey('users.id'), primary_key=True, index=True, nullable=False)  # userID (employee)
    workPlaceID = Column(Integer, ForeignKey('users.id'), nullable=False)  # managerID


class UserRequest(Base):
    """
    Represents user request for shifts (typically from agency employees).

    Attributes:
        id (str): Unique identifier for the user that send the request.
        modifyAt (DateTime): Date and time of the modification.
        requests (str): User's request details.
    """
    __tablename__ = "userRequests"

    id = Column(Integer, ForeignKey('users.id'), primary_key=True, index=True)  # userID
    modifyAt = Column(DateTime)
    requests = Column(String(REQUEST_LEN))


class ShiftPart(enum.Enum):
    """Represents possible shift parts."""
    Morning = 'morning'
    Noon = 'noon'
    Evening = 'evening'


class Shift(Base):
    """
    Represents shifts in the system.

    Attributes:
        id (int): Unique identifier for the shift.
        job_id (int): Identifier for the associated job.
        shift_start_datetime (DateTime): Start date and time of the shift.
        shift_end_datetime (DateTime): End date and time of the shift (optional).
        required_employee_counts (JSON): Stores the number of each employee type required for the shift.
                                         Example: {"stagehand": 5, "crew_chief": 1}
        client_po_number (str): Client's Purchase Order number related to this shift.

        # Legacy fields for backward compatibility
        shiftDate (Date): DEPRECATED - Use shift_start_datetime instead.
        shiftPart (str): DEPRECATED - Use shift_start_datetime instead.
    """
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True, nullable=False)  # shiftID
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)

    # New datetime fields
    shift_start_datetime = Column(DateTime, nullable=True)  # Will become required after migration
    shift_end_datetime = Column(DateTime, nullable=True)

    # Legacy fields for backward compatibility
    shiftDate = Column(Date, nullable=True)  # Made nullable for migration
    shiftPart = Column(Enum(ShiftPart), nullable=True)  # Made nullable for migration

    required_employee_counts = Column(JSON, nullable=True)
    client_po_number = Column(String(50), nullable=True)


class ShiftWorker(Base):
    """
    Represents agency employees assigned to shifts with enhanced time tracking.

    Attributes:
        shiftID (int): ID of the associated shift.
        userID (int): ID of the associated user (agency employee).
        role_assigned (EmployeeType): The role the user is fulfilling for this shift.

        # Multiple clock in/out pairs for breaks
        clock_in_time_1 (DateTime): First clock-in time (start of shift).
        clock_out_time_1 (DateTime): First clock-out time (first break/lunch).
        clock_in_time_2 (DateTime): Second clock-in time (return from first break).
        clock_out_time_2 (DateTime): Second clock-out time (second break/lunch).
        clock_in_time_3 (DateTime): Third clock-in time (return from second break).
        clock_out_time_3 (DateTime): Third clock-out time (end of shift).

        # Legacy fields for backward compatibility
        clock_in_time (DateTime): DEPRECATED - Use clock_in_time_1 instead.
        clock_out_time (DateTime): DEPRECATED - Use clock_out_time_3 instead.

        # Metadata
        times_submitted_at (DateTime): Timestamp when the times were submitted.
        times_submitted_by (int): ID of user who submitted the times (crew chief or manager).
        is_approved (Boolean): Indicates if the timesheet has been approved by a manager.
        approved_at (DateTime): Timestamp when timesheet was approved.
        approved_by (int): ID of manager who approved the timesheet.

        # Additional tracking
        total_hours_worked (Float): Calculated total hours worked (excluding breaks).
        overtime_hours (Float): Calculated overtime hours based on workplace settings.
        notes (String): Optional notes about the timesheet entry.
    """
    __tablename__ = "shiftWorkers"

    shiftID = Column(Integer, ForeignKey('shifts.id'), nullable=False)
    userID = Column(Integer, ForeignKey('users.id'), nullable=False) # Agency Employee's ID
    role_assigned = Column(Enum(EmployeeType), nullable=False)

    # Multiple clock in/out pairs for breaks and lunches
    clock_in_time_1 = Column(DateTime, nullable=True)   # Start of shift
    clock_out_time_1 = Column(DateTime, nullable=True)  # First break/lunch start
    clock_in_time_2 = Column(DateTime, nullable=True)   # Return from first break
    clock_out_time_2 = Column(DateTime, nullable=True)  # Second break/lunch start
    clock_in_time_3 = Column(DateTime, nullable=True)   # Return from second break
    clock_out_time_3 = Column(DateTime, nullable=True)  # End of shift

    # Legacy fields for backward compatibility
    clock_in_time = Column(DateTime, nullable=True)     # DEPRECATED
    clock_out_time = Column(DateTime, nullable=True)    # DEPRECATED

    # Submission and approval tracking
    times_submitted_at = Column(DateTime, nullable=True)
    times_submitted_by = Column(Integer, ForeignKey('users.id'), nullable=True)
    is_approved = Column(Boolean, nullable=False, default=False)
    approved_at = Column(DateTime, nullable=True)
    approved_by = Column(Integer, ForeignKey('users.id'), nullable=True)

    # Calculated fields
    total_hours_worked = Column(Float, nullable=True)
    overtime_hours = Column(Float, nullable=True)
    notes = Column(String(500), nullable=True)

    __table_args__ = (
        PrimaryKeyConstraint('shiftID', 'userID', 'role_assigned'),
    )

    def get_time_pairs(self):
        """Get all clock in/out time pairs as a list."""
        pairs = []

        # Pair 1
        if self.clock_in_time_1 or self.clock_out_time_1:
            pairs.append({
                'pair_number': 1,
                'clock_in': self.clock_in_time_1.isoformat() if self.clock_in_time_1 else None,
                'clock_out': self.clock_out_time_1.isoformat() if self.clock_out_time_1 else None,
                'description': 'Start of shift to first break'
            })

        # Pair 2
        if self.clock_in_time_2 or self.clock_out_time_2:
            pairs.append({
                'pair_number': 2,
                'clock_in': self.clock_in_time_2.isoformat() if self.clock_in_time_2 else None,
                'clock_out': self.clock_out_time_2.isoformat() if self.clock_out_time_2 else None,
                'description': 'Return from first break to second break'
            })

        # Pair 3
        if self.clock_in_time_3 or self.clock_out_time_3:
            pairs.append({
                'pair_number': 3,
                'clock_in': self.clock_in_time_3.isoformat() if self.clock_in_time_3 else None,
                'clock_out': self.clock_out_time_3.isoformat() if self.clock_out_time_3 else None,
                'description': 'Return from second break to end of shift'
            })

        return pairs

    def calculate_total_hours(self):
        """Calculate total hours worked across all time pairs."""
        from datetime import timedelta

        total_time = timedelta()

        # Calculate time for each pair
        pairs = [
            (self.clock_in_time_1, self.clock_out_time_1),
            (self.clock_in_time_2, self.clock_out_time_2),
            (self.clock_in_time_3, self.clock_out_time_3)
        ]

        for clock_in, clock_out in pairs:
            if clock_in and clock_out and clock_out > clock_in:
                total_time += (clock_out - clock_in)

        # Convert to hours
        total_hours = total_time.total_seconds() / 3600
        self.total_hours_worked = round(total_hours, 2)
        return self.total_hours_worked

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            'shift_id': self.shiftID,
            'user_id': self.userID,
            'role_assigned': self.role_assigned.value if self.role_assigned else None,
            'time_pairs': self.get_time_pairs(),
            'total_hours_worked': self.total_hours_worked,
            'overtime_hours': self.overtime_hours,
            'times_submitted_at': self.times_submitted_at.isoformat() if self.times_submitted_at else None,
            'times_submitted_by': self.times_submitted_by,
            'is_approved': self.is_approved,
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'approved_by': self.approved_by,
            'notes': self.notes,
            # Legacy fields for backward compatibility
            'clock_in_time': self.clock_in_time.isoformat() if self.clock_in_time else None,
            'clock_out_time': self.clock_out_time.isoformat() if self.clock_out_time else None,
        }


class ShiftBoard(Base):
    """
    Represents the agency's shift-board for a manager.

    Attributes:
        weekStartDate (Date): Start date of the week.
        workplaceID (str): ID of the associated workplace (Agency Manager's ID).
        isPublished (bool): Indicates if the shift is published and visible to workers.
        content (JSON): Stores the shift-board content.
        preferences (JSON): Stores workplace's preferences/settings.
            - number_of_shifts_per_day
            - max_workers_per_shift
            - closed_days
            - etc.
        requests_window_start (DateTime): Start date and time of the requests window for employees.
        requests_window_end (DateTime): End date and time of the requests window for employees.
    """
    __tablename__ = "shiftBoards"

    weekStartDate = Column(Date, nullable=False, default=lambda: next_sunday())
    workplaceID = Column(Integer, ForeignKey('users.id'), nullable=False)  # Manager's ID
    isPublished = Column(Boolean, nullable=False, default=False)
    content = Column(JSON, default=dict)
    preferences = Column(JSON, default={"closed_days": ["friday"], "number_of_shifts_per_day": 2})
    requests_window_start = Column(DateTime)
    requests_window_end = Column(DateTime)

    __table_args__ = (
        PrimaryKeyConstraint('weekStartDate', 'workplaceID'),
    )


# Define the next_sunday function to be used as the default value
def next_sunday():
    today = datetime.date.today()
    days_until_sunday = (6 - today.weekday() + 7) % 7
    return today + datetime.timedelta(days=days_until_sunday)


class EmployeeCertification(Base):
    """
    Model for tracking employee certifications/perks.
    All employees are stagehands by default, with optional additional certifications.
    """
    __tablename__ = 'employee_certifications'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)

    # Certification flags
    can_crew_chief = Column(Boolean, default=False, nullable=False)
    can_forklift = Column(Boolean, default=False, nullable=False)
    can_truck = Column(Boolean, default=False, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="certifications")

    def to_dict(self):
        """Convert certification to dictionary."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'can_crew_chief': self.can_crew_chief,
            'can_forklift': self.can_forklift,
            'can_truck': self.can_truck,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    def get_role_list(self):
        """Get list of roles this employee is certified for."""
        roles = ['Stagehand']  # Everyone is a stagehand

        if self.can_crew_chief:
            roles.append('Crew Chief')
        if self.can_forklift:
            roles.append('Forklift Operator')
        if self.can_truck:
            roles.append('Truck Driver')

        return roles

    def can_fill_role(self, role):
        """Check if employee can fill a specific role."""
        role_lower = role.lower()

        if role_lower in ['stagehand', 'sh']:
            return True  # Everyone can be a stagehand
        elif role_lower in ['crew chief', 'cc', 'crew_chief']:
            return self.can_crew_chief
        elif role_lower in ['forklift operator', 'forklift', 'fo', 'fork_operator']:
            return self.can_forklift
        elif role_lower in ['truck driver', 'truck', 'trk', 'pickup_truck_driver']:
            return self.can_truck

        return False


class WorkplaceSettings(Base):
    """
    Comprehensive settings model for workplace/manager preferences.
    Replaces the JSON preferences field in ShiftBoard with a proper relational model.
    """
    __tablename__ = 'workplace_settings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    workplace_id = Column(Integer, ForeignKey('users.id'), nullable=False, unique=True)  # Manager's ID

    # === SCHEDULING PREFERENCES ===
    # Basic scheduling
    shifts_per_day = Column(Integer, default=2, nullable=False)
    max_workers_per_shift = Column(Integer, default=10, nullable=False)
    min_workers_per_shift = Column(Integer, default=1, nullable=False)

    # Operating hours
    business_start_time = Column(DateTime, nullable=True)  # Default start time for shifts
    business_end_time = Column(DateTime, nullable=True)    # Default end time for shifts
    default_shift_duration_hours = Column(Integer, default=8, nullable=False)
    break_duration_minutes = Column(Integer, default=30, nullable=False)

    # Days and scheduling
    closed_days = Column(JSON, default=list, nullable=False)  # ["monday", "sunday"]
    operating_days = Column(JSON, default=["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], nullable=False)

    # === NOTIFICATION PREFERENCES ===
    # Email notifications
    email_notifications_enabled = Column(Boolean, default=True, nullable=False)
    notify_on_shift_requests = Column(Boolean, default=True, nullable=False)
    notify_on_worker_assignments = Column(Boolean, default=True, nullable=False)
    notify_on_timesheet_submissions = Column(Boolean, default=True, nullable=False)
    notify_on_schedule_changes = Column(Boolean, default=True, nullable=False)

    # SMS notifications
    sms_notifications_enabled = Column(Boolean, default=False, nullable=False)
    sms_urgent_only = Column(Boolean, default=True, nullable=False)

    # In-app notifications
    push_notifications_enabled = Column(Boolean, default=True, nullable=False)
    notification_sound_enabled = Column(Boolean, default=True, nullable=False)

    # === REQUEST WINDOW SETTINGS ===
    # Automatic request windows
    auto_open_request_windows = Column(Boolean, default=True, nullable=False)
    request_window_days_ahead = Column(Integer, default=7, nullable=False)  # Open requests X days before shift week
    request_window_duration_hours = Column(Integer, default=72, nullable=False)  # Keep open for X hours

    # Manual request windows
    requests_window_start = Column(DateTime, nullable=True)
    requests_window_end = Column(DateTime, nullable=True)

    # === WORKER MANAGEMENT ===
    # Auto-assignment
    auto_assign_workers = Column(Boolean, default=False, nullable=False)
    auto_assign_by_seniority = Column(Boolean, default=True, nullable=False)
    auto_assign_by_availability = Column(Boolean, default=True, nullable=False)
    auto_assign_by_skills = Column(Boolean, default=True, nullable=False)

    # Worker requirements
    require_certification_verification = Column(Boolean, default=True, nullable=False)
    allow_overtime_assignments = Column(Boolean, default=True, nullable=False)
    max_consecutive_days = Column(Integer, default=6, nullable=False)
    max_hours_per_week = Column(Integer, default=40, nullable=False)

    # === TIMESHEET & PAYROLL ===
    # Time tracking
    require_photo_clock_in = Column(Boolean, default=False, nullable=False)
    require_location_verification = Column(Boolean, default=False, nullable=False)
    auto_clock_out_hours = Column(Integer, default=12, nullable=False)  # Auto clock out after X hours

    # Overtime rules
    overtime_threshold_daily = Column(Integer, default=8, nullable=False)  # Hours per day
    overtime_threshold_weekly = Column(Integer, default=40, nullable=False)  # Hours per week
    overtime_rate_multiplier = Column(Float, default=1.5, nullable=False)

    # Approval workflow
    require_manager_approval = Column(Boolean, default=True, nullable=False)
    auto_approve_regular_hours = Column(Boolean, default=False, nullable=False)
    auto_approve_overtime = Column(Boolean, default=False, nullable=False)

    # === DISPLAY & UI PREFERENCES ===
    # Calendar view
    default_calendar_view = Column(String(20), default='week', nullable=False)  # 'day', 'week', 'month'
    show_worker_photos = Column(Boolean, default=True, nullable=False)
    show_certification_badges = Column(Boolean, default=True, nullable=False)
    color_code_by_role = Column(Boolean, default=True, nullable=False)

    # Time format
    use_24_hour_format = Column(Boolean, default=False, nullable=False)
    timezone = Column(String(50), default='America/New_York', nullable=False)

    # Language and locale
    language = Column(String(10), default='en', nullable=False)
    currency = Column(String(3), default='USD', nullable=False)
    date_format = Column(String(20), default='MM/DD/YYYY', nullable=False)

    # === SECURITY & COMPLIANCE ===
    # Access control
    require_two_factor_auth = Column(Boolean, default=False, nullable=False)
    session_timeout_minutes = Column(Integer, default=480, nullable=False)  # 8 hours
    password_expiry_days = Column(Integer, default=90, nullable=False)

    # Data retention
    keep_timesheet_records_months = Column(Integer, default=24, nullable=False)
    keep_schedule_history_months = Column(Integer, default=12, nullable=False)

    # === INTEGRATION SETTINGS ===
    # External systems
    payroll_system_integration = Column(Boolean, default=False, nullable=False)
    hr_system_integration = Column(Boolean, default=False, nullable=False)
    calendar_sync_enabled = Column(Boolean, default=False, nullable=False)

    # API settings
    api_access_enabled = Column(Boolean, default=False, nullable=False)
    webhook_notifications = Column(Boolean, default=False, nullable=False)

    # === CUSTOM FIELDS ===
    # Custom shift fields
    custom_shift_fields = Column(JSON, default=list, nullable=False)  # [{"name": "Equipment", "type": "text", "required": false}]
    custom_worker_fields = Column(JSON, default=list, nullable=False)  # [{"name": "Emergency Contact", "type": "phone", "required": true}]

    # === METADATA ===
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    workplace = relationship("User", foreign_keys=[workplace_id])

    def to_dict(self):
        """Convert settings to dictionary for API responses."""
        return {
            'id': self.id,
            'workplace_id': self.workplace_id,

            # Scheduling
            'scheduling': {
                'shifts_per_day': self.shifts_per_day,
                'max_workers_per_shift': self.max_workers_per_shift,
                'min_workers_per_shift': self.min_workers_per_shift,
                'business_start_time': self.business_start_time.isoformat() if self.business_start_time else None,
                'business_end_time': self.business_end_time.isoformat() if self.business_end_time else None,
                'default_shift_duration_hours': self.default_shift_duration_hours,
                'break_duration_minutes': self.break_duration_minutes,
                'closed_days': self.closed_days,
                'operating_days': self.operating_days,
            },

            # Notifications
            'notifications': {
                'email_enabled': self.email_notifications_enabled,
                'notify_shift_requests': self.notify_on_shift_requests,
                'notify_worker_assignments': self.notify_on_worker_assignments,
                'notify_timesheet_submissions': self.notify_on_timesheet_submissions,
                'notify_schedule_changes': self.notify_on_schedule_changes,
                'sms_enabled': self.sms_notifications_enabled,
                'sms_urgent_only': self.sms_urgent_only,
                'push_enabled': self.push_notifications_enabled,
                'notification_sound': self.notification_sound_enabled,
            },

            # Request windows
            'request_windows': {
                'auto_open': self.auto_open_request_windows,
                'days_ahead': self.request_window_days_ahead,
                'duration_hours': self.request_window_duration_hours,
                'manual_start': self.requests_window_start.isoformat() if self.requests_window_start else None,
                'manual_end': self.requests_window_end.isoformat() if self.requests_window_end else None,
            },

            # Worker management
            'worker_management': {
                'auto_assign': self.auto_assign_workers,
                'auto_assign_by_seniority': self.auto_assign_by_seniority,
                'auto_assign_by_availability': self.auto_assign_by_availability,
                'auto_assign_by_skills': self.auto_assign_by_skills,
                'require_certification_verification': self.require_certification_verification,
                'allow_overtime': self.allow_overtime_assignments,
                'max_consecutive_days': self.max_consecutive_days,
                'max_hours_per_week': self.max_hours_per_week,
            },

            # Timesheet & payroll
            'timesheet': {
                'require_photo_clock_in': self.require_photo_clock_in,
                'require_location_verification': self.require_location_verification,
                'auto_clock_out_hours': self.auto_clock_out_hours,
                'overtime_daily_threshold': self.overtime_threshold_daily,
                'overtime_weekly_threshold': self.overtime_threshold_weekly,
                'overtime_rate': self.overtime_rate_multiplier,
                'require_manager_approval': self.require_manager_approval,
                'auto_approve_regular': self.auto_approve_regular_hours,
                'auto_approve_overtime': self.auto_approve_overtime,
            },

            # Display preferences
            'display': {
                'default_calendar_view': self.default_calendar_view,
                'show_worker_photos': self.show_worker_photos,
                'show_certification_badges': self.show_certification_badges,
                'color_code_by_role': self.color_code_by_role,
                'use_24_hour_format': self.use_24_hour_format,
                'timezone': self.timezone,
                'language': self.language,
                'currency': self.currency,
                'date_format': self.date_format,
            },

            # Security
            'security': {
                'require_two_factor': self.require_two_factor_auth,
                'session_timeout_minutes': self.session_timeout_minutes,
                'password_expiry_days': self.password_expiry_days,
                'keep_timesheet_records_months': self.keep_timesheet_records_months,
                'keep_schedule_history_months': self.keep_schedule_history_months,
            },

            # Integrations
            'integrations': {
                'payroll_system': self.payroll_system_integration,
                'hr_system': self.hr_system_integration,
                'calendar_sync': self.calendar_sync_enabled,
                'api_access': self.api_access_enabled,
                'webhook_notifications': self.webhook_notifications,
            },

            # Custom fields
            'custom_fields': {
                'shift_fields': self.custom_shift_fields,
                'worker_fields': self.custom_worker_fields,
            },

            # Metadata
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }

    def get_notification_preferences(self):
        """Get notification preferences for this workplace."""
        return {
            'email': self.email_notifications_enabled,
            'sms': self.sms_notifications_enabled,
            'push': self.push_notifications_enabled,
            'types': {
                'shift_requests': self.notify_on_shift_requests,
                'worker_assignments': self.notify_on_worker_assignments,
                'timesheet_submissions': self.notify_on_timesheet_submissions,
                'schedule_changes': self.notify_on_schedule_changes,
            }
        }

    def get_scheduling_rules(self):
        """Get scheduling rules for validation."""
        return {
            'max_workers_per_shift': self.max_workers_per_shift,
            'min_workers_per_shift': self.min_workers_per_shift,
            'max_consecutive_days': self.max_consecutive_days,
            'max_hours_per_week': self.max_hours_per_week,
            'closed_days': self.closed_days,
            'operating_days': self.operating_days,
        }
