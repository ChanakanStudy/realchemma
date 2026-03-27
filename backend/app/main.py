from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

from app.features.auth.router import router as auth_router
from app.features.battle.router import router as battle_router
from app.features.npc.router import router as npc_router
from app.features.questions.router import router as questions_router

app = FastAPI(title="CHEMMA API", version="1.0.0")

from app.core.database import engine, Base
from app.models.user import User

Base.metadata.create_all(bind=engine)

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
