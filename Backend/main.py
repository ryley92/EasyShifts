from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.models import Base
from config.private_password import PASSWORD  # Create this file locally, set private_password.py.py = ... and DON'T upload to GitHub!


def initialize_database_and_session():
    """
    Explanation:

    - **create_engine():** Establishes a connection to the MySQL database file "easyshiftsdb".
    - **sessionmaker():** Constructs a session factory that creates new sessions tied to the engine.
        - `autocommit=False`: Prevents automatic commits for each operation, allowing for control over transactions.
        - `autoflush=False`: Delays flushing changes to the database until explicitly committed, potentially improving performance.
    """
    # Create a SQLAlchemy engine and session
    # TODO: Replace placeholders with your remote MySQL server details
    DB_HOST = "miano.h.filess.io"  # e.g., "mydb.example.com" or an IP address
    DB_PORT = "3305"  # Default MySQL port, change if different
    DB_USER = "easyshiftsdb_danceshall"
    DB_NAME = "easyshiftsdb_danceshall" # e.g., "easyshiftsdb"

    engine = create_engine(
        f'mariadb+pymysql://{DB_USER}:{PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    create_tables(engine)

    # Creating a session object
    db = SessionLocal()

    return db, SessionLocal


def create_tables(engine):
    # Create all tables if they don't exist
    Base.metadata.create_all(bind=engine)
