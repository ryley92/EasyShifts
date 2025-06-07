import datetime
from sqlalchemy import Column, String, Boolean, Date, Enum, PrimaryKeyConstraint, ForeignKey, DateTime, JSON, func, \
    Integer
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
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, nullable=False)  # userID
    username = Column(String(NAMES_LEN), unique=True, nullable=False)
    password = Column(String(PASS_LEN), nullable=False)
    isManager = Column(Boolean, nullable=False, default=False)
    isAdmin = Column(Boolean, nullable=False, default=False)
    client_company_id = Column(Integer, ForeignKey('client_companies.id'), nullable=True)
    isActive = Column(Boolean, nullable=False, default=True)
    isApproval = Column(Boolean, nullable=False, default=False)
    name = Column(String(NAMES_LEN), nullable=False)
    employee_type = Column(Enum(EmployeeType), nullable=True)

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
        shiftDate (Date): Date and time of the shift.
        shiftPart (str): Part of the day for the shift (e.g., 'morning', 'noon', 'evening').
        required_employee_counts (JSON): Stores the number of each employee type required for the shift.
                                         Example: {"stagehand": 5, "crew_chief": 1}
        client_po_number (str): Client's Purchase Order number related to this shift.
    """
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True, nullable=False)  # shiftID
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    shiftDate = Column(Date, nullable=False)
    shiftPart = Column(Enum(ShiftPart), nullable=False)
    required_employee_counts = Column(JSON, nullable=True)
    client_po_number = Column(String(50), nullable=True)


class ShiftWorker(Base):
    """
    Represents agency employees assigned to shifts.

    Attributes:
        shiftID (int): ID of the associated shift.
        userID (int): ID of the associated user (agency employee).
        role_assigned (EmployeeType): The role the user is fulfilling for this shift.
        clock_in_time (DateTime): The actual clock-in time for the employee on this shift.
        clock_out_time (DateTime): The actual clock-out time for the employee on this shift.
        times_submitted_at (DateTime): Timestamp when the Crew Chief submitted the times for this worker on this shift.
        is_approved (Boolean): Indicates if the timesheet has been approved by a manager. Default is False.
    """
    __tablename__ = "shiftWorkers"

    shiftID = Column(Integer, ForeignKey('shifts.id'), nullable=False)
    userID = Column(Integer, ForeignKey('users.id'), nullable=False) # Agency Employee's ID
    role_assigned = Column(Enum(EmployeeType), nullable=False)
    clock_in_time = Column(DateTime, nullable=True)
    clock_out_time = Column(DateTime, nullable=True)
    times_submitted_at = Column(DateTime, nullable=True)
    is_approved = Column(Boolean, nullable=False, default=False)

    __table_args__ = (
        PrimaryKeyConstraint('shiftID', 'userID', 'role_assigned'), 
    )


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
