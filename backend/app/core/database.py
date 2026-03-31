import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

load_dotenv()  # Load environment variables from .env file first!

SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./realchemma.db")

# Debug: Check if DATABASE_URL is properly loaded
if SQLALCHEMY_DATABASE_URL == "sqlite:///./realchemma.db":
    print("⚠️  Using SQLite (development mode). DATABASE_URL not explicitly set.")
else:
    db_host = SQLALCHEMY_DATABASE_URL.split('@')[1] if '@' in SQLALCHEMY_DATABASE_URL else 'Unknown'
    print(f"✅ Using PostgreSQL: {db_host}")

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL with connection pooling and retry settings
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,  # Test connections before using them
        pool_recycle=3600,   # Recycle connections after 1 hour
        pool_size=10,        # Number of connections to keep in pool
        max_overflow=20,     # Maximum overflow connections
        echo=False,          # Set to True for SQL debugging
        connect_args={
            "connect_timeout": 10,
            "options": "-c statement_timeout=30000"  # 30 second statement timeout
        }
    )
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
