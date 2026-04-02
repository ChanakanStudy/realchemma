from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from .schemas import QuestCompleteRequest, QuestStateResponse
from .service import accept_quest, complete_quest, get_quest_state

router = APIRouter()

@router.get("/state", response_model=QuestStateResponse)
async def read_quest_state(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_quest_state(db, current_user.uuid)


@router.post("/accept/{quest_id}", response_model=QuestStateResponse)
async def accept_quest_for_user(quest_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return accept_quest(db, current_user.uuid, quest_id)


@router.post("/complete", response_model=QuestStateResponse)
async def complete_quest_for_user(payload: QuestCompleteRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return complete_quest(db, current_user.uuid, payload.quest_id, payload.boss_id)