from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

import random

router = APIRouter()

# ==========================================
# Battle Data Models
# ==========================================
class ElementData(BaseModel):
    symbol: str
    name: str
    color: str

class RecipeData(BaseModel):
    id: str
    name: str
    formula: dict
    damage: int
    status: str
    color: str

class UltimateData(BaseModel):
    id: str
    name: str
    req: List[str]
    dmg: int
    color: str
    desc: str

class BattleActionRequest(BaseModel):
    action_type: str  # 'throw', 'ultimate', 'start'
    compound_id: Optional[str] = None
    ultimate_id: Optional[str] = None
    qte_result: Optional[str] = None  # 'PERFECT', 'GOOD', 'MISS'

class BattleStateResponse(BaseModel):
    player_hp: int
    monster_hp: int
    turn: int
    status_effects: List[str]

# ==========================================
# Battle Endpoints
# ==========================================

@router.post("/battle/start")
async def start_battle():
    """Initialize a new battle session"""
    return {
        "status": "Battle started",
        "player_hp": 300,
        "monster_hp": 3000,
        "turn": 1,
        "message": "AN ANCIENT HOMUNCULUS BLOCKS YOUR PATH!"
    }

@router.post("/battle/craft")
async def craft_compound(formula: dict):
    """Validate and craft a compound from elements"""
    # This would validate the recipe against the database
    # and return crafting success/failure
    try:
        # Recipe validation logic
        return {
            "success": True,
            "compound": "H2O",
            "name": "Aqua Vitae",
            "damage": 30,
            "status": "Wet"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/battle/throw")
async def execute_throw(compound_id: str, qte_result: str):
    """Execute a throw action with QTE result"""
    # Damage multiplier based on QTE
    multipliers = {
        "PERFECT": 1.5,
        "GOOD": 1.0,
        "MISS": 0.5
    }
    
    mult = multipliers.get(qte_result, 0.5)
    
    return {
        "status": "Throw executed",
        "compound": compound_id,
        "qte_result": qte_result,
        "damage": int(30 * mult),
        "hit": qte_result != "MISS"
    }

@router.post("/battle/ultimate")
async def execute_ultimate(ultimate_id: str, monster_status: List[str]):
    """Execute an ultimate ability if requirements are met"""
    ultimates = {
        "zero": {"name": "ABSOLUTE ZERO", "dmg": 800, "req": ["Wet", "Suffocated"]},
        "hellfire": {"name": "HELLFIRE ANNIHILATION", "dmg": 1000, "req": ["Burned", "Corroded"]},
        "nuke": {"name": "PHILOSOPHER'S NUKE", "dmg": 9999, "req": ["Wet", "Corroded", "Crystalized"]}
    }
    
    ult = ultimates.get(ultimate_id)
    if not ult:
        raise HTTPException(status_code=404, detail="Ultimate not found")
    
    # Check if all requirements are met
    requirements_met = all(status in monster_status for status in ult["req"])
    
    if not requirements_met:
        raise HTTPException(status_code=400, detail="Ultimate requirements not met")
    
    return {
        "status": "Ultimate executed",
        "ultimate": ultimate_id,
        "name": ult["name"],
        "damage": ult["dmg"]
    }

@router.post("/battle/monster-turn")
async def monster_turn(current_player_hp: int):
    """Calculate monster attack damage"""
    import random
    damage = random.randint(40, 70)
    
    return {
        "damage": damage,
        "message": f"HOMUNCULUS STRIKES! YOU TOOK {damage} DMG.",
        "player_hp_remaining": max(0, current_player_hp - damage)
    }

@router.get("/battle/data")
async def get_battle_data():
    """Get all battle data (elements, recipes, ultimates)"""
    return {
        "elements": [
            {"symbol": "H", "name": "Hydrogen", "color": "#3b82f6", "rune": "💧"},
            {"symbol": "O", "name": "Oxygen", "color": "#10b981", "rune": "🌪️"},
            {"symbol": "Na", "name": "Sodium", "color": "#eab308", "rune": "⚡"},
            {"symbol": "Cl", "name": "Chlorine", "color": "#84cc16", "rune": "☣️"},
            {"symbol": "C", "name": "Carbon", "color": "#64748b", "rune": "🌑"}
        ],
        "recipes": [
            {"id": "H2O", "name": "Aqua Vitae (H2O)", "damage": 30, "status": "Wet", "color": "#60a5fa"},
            {"id": "HCl", "name": "Acid Flask (HCl)", "damage": 80, "status": "Corroded", "color": "#4ade80"},
            {"id": "NaCl", "name": "Crystal Salt (NaCl)", "damage": 50, "status": "Crystalized", "color": "#fef08a"},
            {"id": "NaOH", "name": "Caustic Brew (NaOH)", "damage": 100, "status": "Burned", "color": "#c084fc"},
            {"id": "CO2", "name": "Choking Smog (CO2)", "damage": 20, "status": "Suffocated", "color": "#94a3b8"}
        ],
        "ultimates": [
            {"id": "zero", "name": "ABSOLUTE ZERO", "dmg": 800, "color": "#22d3ee"},
            {"id": "hellfire", "name": "HELLFIRE ANNIHILATION", "dmg": 1000, "color": "#ef4444"},
            {"id": "nuke", "name": "PHILOSOPHER'S NUKE", "dmg": 9999, "color": "#ffffff"}
        ]
    }
