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


DEFAULT_INVENTORY_ITEMS = [
    {"id": "H", "quantity": 10},
    {"id": "O", "quantity": 10},
    {"id": "Na", "quantity": 10},
    {"id": "Cl", "quantity": 10},
    {"id": "C", "quantity": 10},
    {"id": "H2O", "quantity": 3},
    {"id": "NaCl", "quantity": 2},
]


DEFAULT_DISCOVERED = ["H", "He", "Li", "Be", "B", "C", "N", "O", "Fe", "Au", "Ag", "Cu", "Hg", "Pb", "Ne"]
DEFAULT_DISCOVERED_COMPOUNDS = ["H2O", "NaCl"]


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


def _seed_user_game_data(db):
    users = db.query(User).all()
    if not users:
        return

    quest_definitions = db.query(QuestDefinition).order_by(QuestDefinition.order_index.asc()).all()

    for user in users:
        state_row = db.query(UserGameState).filter(UserGameState.user_uuid == user.uuid).first()
        if not state_row:
            state_row = UserGameState(
                user_id=user.id,
                user_uuid=user.uuid,
                inventory_json=DEFAULT_INVENTORY_ITEMS,
                discovered_json=DEFAULT_DISCOVERED,
                discovered_compounds_json=DEFAULT_DISCOVERED_COMPOUNDS,
            )
            db.add(state_row)
            db.commit()
            db.refresh(state_row)

        inventory_rows = db.query(UserInventoryItem).filter(UserInventoryItem.user_uuid == user.uuid).all()
        if not inventory_rows:
            seed_inventory = state_row.inventory_json if isinstance(state_row.inventory_json, list) and state_row.inventory_json else DEFAULT_INVENTORY_ITEMS
            for item in seed_inventory:
                item_id = item.get("id")
                quantity = int(item.get("quantity", 0))
                if not item_id or quantity <= 0:
                    continue
                db.add(UserInventoryItem(user_id=user.id, user_uuid=user.uuid, item_id=item_id, quantity=quantity))
            db.commit()

        quest_rows = db.query(UserQuestProgress).filter(UserQuestProgress.user_uuid == user.uuid).all()
        if not quest_rows and quest_definitions:
            for index, definition in enumerate(quest_definitions):
                db.add(
                    UserQuestProgress(
                        user_id=user.id,
                        user_uuid=user.uuid,
                        quest_id=definition.id,
                        status="available" if index == 0 else "locked",
                    )
                )
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
            _seed_user_game_data(db)
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
