from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import logging
import time
from sqlalchemy import text

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.features.auth.router import router as auth_router
from app.features.battle.router import router as battle_router
from app.features.npc.router import router as npc_router
from app.features.questions.router import router as questions_router

app = FastAPI(title="CHEMMA API", version="1.0.0")

from app.core.database import engine, Base, SessionLocal
from app.models.user import User

# Function to wait for database to be ready
def wait_for_database(max_retries=30, delay=1):
    """Wait for database to be ready before creating tables"""
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
app.include_router(questions_router, prefix="/api", tags=["Questions"])
app.include_router(npc_router, prefix="/api/npc", tags=["NPC"])
app.include_router(battle_router, prefix="/api/battle", tags=["Battle"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
