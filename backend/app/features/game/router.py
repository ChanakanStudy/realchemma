from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

from .schemas import GameStateResponse, InventoryAdjustRequest, LabExperimentRequest, LabExperimentResponse
from .service import adjust_inventory, get_game_state, run_experiment

router = APIRouter()


@router.get("/state", response_model=GameStateResponse)
async def read_game_state(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_game_state(db, current_user.id, current_user.uuid)


@router.post("/experiment", response_model=LabExperimentResponse)
async def run_lab_experiment(payload: LabExperimentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return run_experiment(db, current_user.id, current_user.uuid, payload.selected_symbols)


@router.post("/inventory/adjust", response_model=GameStateResponse)
async def adjust_game_inventory(payload: InventoryAdjustRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return adjust_inventory(db, current_user.id, current_user.uuid, [change.model_dump() for change in payload.changes])