import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from db.models import Base # Assuming Base is correctly defined in db.models
from config.private_password import PASSWORD

_engine = None
_session_factory = None
_initialization_error = None

def initialize_database_and_session_factory():
    global _engine, _session_factory, _initialization_error

    if _engine and _session_factory:
        print("✅ Database engine and session factory already initialized.")
        return

    DB_HOST = os.getenv("DB_HOST", "miano.h.filess.io")
    DB_PORT = os.getenv("DB_PORT", "3305")
    DB_USER = os.getenv("DB_USER", "easyshiftsdb_danceshall")
    DB_NAME = os.getenv("DB_NAME", "easyshiftsdb_danceshall")
    DB_PASSWORD = PASSWORD 

    connection_url = f'mariadb+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    print(f"Attempting to initialize database engine: {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

    try:
        engine = create_engine(
            connection_url,
            echo=False, 
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={
                'connect_timeout': 10,
                'read_timeout': 30,
                'write_timeout': 30
            }
        )

        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        print("✅ Database engine connection successful.")
        
        Base.metadata.create_all(bind=engine, checkfirst=True)
        print("✅ Database tables created/verified successfully.")

        _engine = engine
        _session_factory = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
        _initialization_error = None
        print("✅ Database engine and session factory initialized successfully.")

    except Exception as e:
        _initialization_error = e
        print(f"❌ Database engine or session factory initialization failed: {e}")
        print(f"❌ Error type: {type(e).__name__}")

def get_engine():
    if not _engine and not _initialization_error:
        initialize_database_and_session_factory()
    if _initialization_error:
        raise RuntimeError(f"Database not initialized due to previous error: {_initialization_error}")
    if not _engine:
        raise RuntimeError("Database engine could not be initialized and no specific error was caught.")
    return _engine

def create_session():
    """
    Creates and returns a new SQLAlchemy session from the factory.
    Attempts to initialize the factory if it hasn't been already.
    """
    global _session_factory, _initialization_error
    
    if not _session_factory and not _initialization_error:
        print("Session factory not initialized. Attempting to initialize now...")
        initialize_database_and_session_factory()

    if _initialization_error:
        raise RuntimeError(f"Cannot create session: Database initialization failed: {_initialization_error}")
    if not _session_factory:
        raise RuntimeError("Cannot create session: Session factory could not be initialized.")
        
    return _session_factory()

if _engine is None and _session_factory is None:
    try:
        print("Initial attempt to initialize database and session factory from main.py module load...")
        initialize_database_and_session_factory()
    except Exception as e:
        print(f"⚠️ Initial attempt to initialize database failed during module load: {e}. Will retry on first session request.")
