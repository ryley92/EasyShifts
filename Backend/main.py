from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.models import Base
from config.private_password import PASSWORD  # Create this file locally, set private_password.py.py = ... and DON'T upload to GitHub!

# Global variables for singleton pattern
_db_session = None
_session_factory = None

def initialize_database_and_session():
    """
    Singleton pattern for database initialization.
    Returns the same database session and factory on subsequent calls.

    Explanation:
    - **create_engine():** Establishes a connection to the MySQL database file "easyshiftsdb".
    - **sessionmaker():** Constructs a session factory that creates new sessions tied to the engine.
        - `autocommit=False`: Prevents automatic commits for each operation, allowing for control over transactions.
        - `autoflush=False`: Delays flushing changes to the database until explicitly committed, potentially improving performance.
    """
    global _db_session, _session_factory

    # Return existing session if already initialized
    if _db_session is not None and _session_factory is not None:
        return _db_session, _session_factory

    # Create a SQLAlchemy engine and session
    # TODO: Replace placeholders with your remote MySQL server details
    DB_HOST = "miano.h.filess.io"  # e.g., "mydb.example.com" or an IP address
    DB_PORT = "3305"  # Default MySQL port, change if different
    DB_USER = "easyshiftsdb_danceshall"
    DB_NAME = "easyshiftsdb_danceshall" # e.g., "easyshiftsdb"

    try:
        print(f"Connecting to database: {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")
        engine = create_engine(
            f'mariadb+pymysql://{DB_USER}:{PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}',
            echo=False,  # Set to True for SQL debugging
            pool_pre_ping=True,  # Verify connections before use
            pool_recycle=3600,   # Recycle connections every hour
            connect_args={
                'connect_timeout': 30,  # 30 second connection timeout
                'read_timeout': 30,     # 30 second read timeout
                'write_timeout': 30     # 30 second write timeout
            }
        )

        # Test the connection
        with engine.connect() as connection:
            from sqlalchemy import text
            connection.execute(text("SELECT 1"))
            print("✅ Database connection successful")

        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

        create_tables(engine)

        # Creating a session object
        db = SessionLocal()
        print("✅ Database session created")

        # Store in global variables for singleton pattern
        _db_session = db
        _session_factory = SessionLocal

        return db, SessionLocal

    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print(f"❌ Error type: {type(e).__name__}")
        print(f"❌ Error details: {str(e)}")
        raise


def get_database_session():
    """
    Get the existing database session without reinitializing.
    If no session exists, initialize one.

    Returns:
        The database session
    """
    global _db_session
    if _db_session is None:
        _db_session, _ = initialize_database_and_session()
    return _db_session

def create_tables(engine):
    # Create all tables if they don't exist
    try:
        Base.metadata.create_all(bind=engine, checkfirst=True)
        print("✅ Database tables created/verified successfully")
    except Exception as e:
        print(f"⚠️  Warning during table creation: {e}")
        # Continue anyway - tables might already exist
        pass
