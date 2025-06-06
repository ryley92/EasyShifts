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
    """Represents different types/roles of employees."""
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
        isManager (bool): Indicates if the user is a manager.
        isActive (bool): Indicates if the user account is active. Default is True.
        isApproval (bool): Indicates if the user is approved. Default is False.
        name (str): User's name.
        employee_type (EmployeeType): The type or role of the employee.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, nullable=False)  # userID
    username = Column(String(NAMES_LEN), unique=True, nullable=False)
    password = Column(String(PASS_LEN), nullable=False)
    isManager = Column(Boolean, nullable=False)
    isActive = Column(Boolean, nullable=False, default=True)
    isApproval = Column(Boolean, nullable=False, default=False)
    name = Column(String(NAMES_LEN), nullable=False)
    employee_type = Column(Enum(EmployeeType), nullable=True)


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
        workplace_id (int): Foreign key to the User (manager) responsible for this job.
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True, nullable=False)
    name = Column(String(NAMES_LEN * 2), nullable=False)
    client_company_id = Column(Integer, ForeignKey('client_companies.id'), nullable=False)
    workplace_id = Column(Integer, ForeignKey('users.id'), nullable=False) # Manager's ID
    # Add other job details here, e.g., description, start_date, end_date


class WorkPlace(Base):
    """
    Represents a workplace associated with a user.
    This table links employees (users) to their managing entity (a manager user).

    Attributes:
        id (str): User's ID (employee).
        workPlaceID (int): Manager's User ID, representing the workplace.
    """
    __tablename__ = "workPlaces"

    id = Column(Integer, ForeignKey('users.id'), primary_key=True, index=True, nullable=False)  # userID (employee)
    workPlaceID = Column(Integer, ForeignKey('users.id'), nullable=False)  # managerID


class UserRequest(Base):
    """
    Represents user request for shifts.

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
    """
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True, nullable=False)  # shiftID
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    shiftDate = Column(Date, nullable=False)
    shiftPart = Column(Enum(ShiftPart), nullable=False)


class ShiftWorker(Base):
    """
    Represents all shifts of all workers.

    Attributes:
        shiftID (int): ID of the associated shift.
        userID (int): ID of the associated user.
        role_assigned (EmployeeType): The role the user is fulfilling for this shift.
    """
    __tablename__ = "shiftWorkers"

    shiftID = Column(Integer, ForeignKey('shifts.id'), nullable=False)
    userID = Column(Integer, ForeignKey('users.id'), nullable=False)
    role_assigned = Column(Enum(EmployeeType), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('shiftID', 'userID', 'role_assigned'), # A user might be assigned to the same shift in multiple capacities if needed, or this can be simplified if a user has one role per shift.
    )


class ShiftBoard(Base):
    """
    Represents the workplace's shift-board.

    Attributes:
        weekStartDate (Date): Start date of the week.
        workplaceID (str): ID of the associated workplace (Manager's ID).
        isPublished (bool): Indicates if the shift is published and visible to workers.
        content (JSON): Stores the shift-board content.
        preferences (JSON): Stores workplace's preferences/settings.
            - number_of_shifts_per_day
            - max_workers_per_shift
            - closed_days
            - etc.
        requests_window_start (DateTime): Start date and time of the requests window.
        requests_window_end (DateTime): End date and time of the requests window.
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
