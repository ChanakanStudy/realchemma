from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import time
from uuid import uuid4

from sqlalchemy import inspect, text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.features.auth.router import router as auth_router
from app.features.game.router import router as game_router
from app.features.quests.router import router as quests_router
from app.features.npc.router import router as npc_router

app = FastAPI(title="CHEMMA API", version="1.0.0")

from app.core.database import engine, Base, SessionLocal
from app.features.quests.service import seed_default_quest_definitions
from app.models.inventory import UserInventoryItem
from app.models.game_state import UserGameState
from app.models.quest import QuestDefinition, UserQuestProgress
from app.models.user import User


def _ensure_user_columns(db):
    inspector = inspect(db.bind)
    columns = {column["name"] for column in inspector.get_columns("users")}

    if "uuid" not in columns:
        db.execute(text("ALTER TABLE users ADD COLUMN uuid VARCHAR(36)"))

    if "chem_coin" not in columns:
        db.execute(text("ALTER TABLE users ADD COLUMN chem_coin INTEGER NOT NULL DEFAULT 0"))

    db.commit()

    users_without_uuid = db.query(User).filter((User.uuid.is_(None)) | (User.uuid == "")).all()
    for user in users_without_uuid:
        user.uuid = str(uuid4())

    users_with_null_coin = db.query(User).filter(User.chem_coin.is_(None)).all()
    for user in users_with_null_coin:
        user.chem_coin = 0

    db.commit()

    dialect_name = db.bind.dialect.name
    if dialect_name == "sqlite":
        db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ux_users_uuid ON users (uuid)"))
    else:
        db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ux_users_uuid ON users (uuid)"))
    db.commit()


def _ensure_uuid_relation_column(db, table_name, column_name="user_uuid"):
    inspector = inspect(db.bind)
    columns = {column["name"] for column in inspector.get_columns(table_name)}

    if column_name not in columns:
        db.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} VARCHAR(36)"))
        db.commit()

    db.execute(
        text(
            f"""
            UPDATE {table_name}
            SET {column_name} = (
                SELECT users.uuid
                FROM users
                WHERE users.id = {table_name}.user_id
            )
            WHERE {column_name} IS NULL OR {column_name} = ''
            """
        )
    )
    db.commit()

    db.execute(text(f"CREATE INDEX IF NOT EXISTS ix_{table_name}_{column_name} ON {table_name} ({column_name})"))
    db.commit()


def _ensure_uuid_unique_indexes(db):
    db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ux_user_inventory_items_user_uuid_item_id ON user_inventory_items (user_uuid, item_id)"))
    db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ux_user_game_states_user_uuid ON user_game_states (user_uuid)"))
    db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ux_user_quest_progress_user_uuid_quest_id ON user_quest_progress (user_uuid, quest_id)"))
    db.commit()

# Function to wait for database to be ready
def wait_for_database(max_retries=30, delay=1):
    for attempt in range(max_retries):
        try:
            with SessionLocal() as session:
                session.execute(text("SELECT 1"))
            logger.info("✅ Database connection successful!")
            return True
        except Exception as e:
            if attempt < max_retries - 1:
                logger.warning(f"⏳ Database not ready (attempt {attempt + 1}/{max_retries}), retrying in {delay}s...")
                time.sleep(delay)
            else:
                logger.error(f"❌ Database connection failed after {max_retries} attempts: {str(e)}")
                return False
    return False

# Initialize database with error handling
logger.info("🔄 Waiting for database to be ready...")
if wait_for_database():
    try:
        logger.info("🔄 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            seed_default_quest_definitions(db)
            _ensure_user_columns(db)
            _ensure_uuid_relation_column(db, "user_inventory_items")
            _ensure_uuid_relation_column(db, "user_game_states")
            _ensure_uuid_relation_column(db, "user_quest_progress")
            _ensure_uuid_unique_indexes(db)
        logger.info("✅ Database tables created successfully")
    except Exception as e:
        logger.error(f"❌ Table creation failed: {str(e)}")
        logger.warning("   Starting backend with existing tables...\n")
else:
    logger.error("❌ Could not connect to database. Running in limited mode.\n")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def health_check():
    return {"status": "ok", "message": "Chemma Oracle Backend is running"}

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(game_router, prefix="/api/game", tags=["Game"])
app.include_router(quests_router, prefix="/api/quests", tags=["Quests"])
app.include_router(npc_router, prefix="/api/npc", tags=["NPC"])
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
