import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.features.quests.schemas import QuestStateResponse
from app.models.quest import QuestDefinition, UserQuestProgress

DEFAULT_QUESTS = [
    {
        "id": "trial_homunculus",
        "title": "Trial I: Homunculus Omega",
        "description": "บททดสอบแรกของนักเล่นแร่แปรธาตุ เพื่อพิสูจน์ว่าพร้อมออกสู่เส้นทางประลองแล้ว",
        "objective": "Defeat Homunculus Omega",
        "npc_id": "battle_master",
        "boss_id": "homunculus",
        "boss_name": "Homunculus Omega",
        "order_index": 1,
        "reward_xp": 100,
        "intro_text": "เริ่มด้วยการกำจัด Homunculus Omega เพื่อพิสูจน์ฝีมือพื้นฐานของเจ้า",
        "completion_text": "ยอดเยี่ยม เจ้าเอาชนะบททดสอบแรกได้แล้ว",
    },
    {
        "id": "trial_crystal_golem",
        "title": "Trial II: Crystal Golem",
        "description": "บททดสอบถัดไปที่เน้นความแม่นยำและการรับมือกับสิ่งมีชีวิตที่ถึกและหนักแน่น",
        "objective": "Defeat Crystal Golem",
        "npc_id": "battle_master",
        "boss_id": "crystal_golem",
        "boss_name": "Crystal Golem",
        "order_index": 2,
        "reward_xp": 150,
        "intro_text": "เมื่อเจ้าพร้อมแล้ว จงไปหยุด Crystal Golem ผู้แข็งแกร่งแต่เชื่องช้า",
        "completion_text": "เจ้าผ่านบททดสอบที่สองได้อย่างสง่างาม",
    },
    {
        "id": "trial_toxic_spore",
        "title": "Trial III: Mutated Spore",
        "description": "บททดสอบสุดท้ายที่ผสมความเสี่ยง ความเร็ว และพิษร้ายแรง",
        "objective": "Defeat Mutated Spore",
        "npc_id": "battle_master",
        "boss_id": "toxic_spore",
        "boss_name": "Mutated Spore",
        "order_index": 3,
        "reward_xp": 200,
        "intro_text": "บททดสอบสุดท้ายรอเจ้าอยู่ที่ Mutated Spore จงเตรียมตัวให้พร้อม",
        "completion_text": "ภารกิจสุดท้ายจบลงแล้ว เจ้าพิสูจน์ตัวเองได้ครบถ้วน",
    },
]


def _quest_state_payload(definitions, progress_rows, user_id):
    progress_by_quest = {row.quest_id: row for row in progress_rows}

    quests = []
    active_quest = None
    available_quests = []
    completed_quests = []

    for definition in definitions:
        progress = progress_by_quest[definition.id]
        quest_payload = {
            "id": definition.id,
            "title": definition.title,
            "description": definition.description,
            "objective": definition.objective,
            "npc_id": definition.npc_id,
            "boss_id": definition.boss_id,
            "boss_name": definition.boss_name,
            "order_index": definition.order_index,
            "reward_xp": definition.reward_xp,
            "intro_text": definition.intro_text,
            "completion_text": definition.completion_text,
            "status": progress.status,
        }
        quests.append(quest_payload)

        if progress.status == "active":
            active_quest = quest_payload
        elif progress.status == "available":
            available_quests.append(quest_payload)
        elif progress.status == "completed":
            completed_quests.append(quest_payload)

    return {
        "user_id": user_id,
        "quests": quests,
        "active_quest": active_quest,
        "available_quests": available_quests,
        "completed_quests": completed_quests,
        "quest_chain_complete": len(completed_quests) == len(definitions),
    }


def seed_default_quest_definitions(db: Session):
    changed = False
    for quest_data in DEFAULT_QUESTS:
        existing = db.query(QuestDefinition).filter(QuestDefinition.id == quest_data["id"]).first()
        if existing:
            continue
        db.add(QuestDefinition(**quest_data))
        changed = True

    if changed:
        db.commit()


def get_quest_state(db: Session, user_id: int):
    seed_default_quest_definitions(db)

    definitions = db.query(QuestDefinition).order_by(QuestDefinition.order_index.asc()).all()
    if not definitions:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Quest catalog is not configured")

    progress_rows = db.query(UserQuestProgress).filter(UserQuestProgress.user_id == user_id).all()
    if not progress_rows:
        for index, definition in enumerate(definitions):
            db.add(
                UserQuestProgress(
                    user_id=user_id,
                    quest_id=definition.id,
                    status="available" if index == 0 else "locked",
                )
            )
        db.commit()
        progress_rows = db.query(UserQuestProgress).filter(UserQuestProgress.user_id == user_id).all()

    return _quest_state_payload(definitions, progress_rows, user_id)


def accept_quest(db: Session, user_id: int, quest_id: str):
    state = get_quest_state(db, user_id)
    quests = {quest["id"]: quest for quest in state["quests"]}
    selected_quest = quests.get(quest_id)

    if not selected_quest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest not found")

    active_quest = state["active_quest"]
    if active_quest and active_quest["id"] != quest_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Finish the current quest before starting another one")

    if selected_quest["status"] == "completed":
        return state

    available_quest = state["available_quests"][0] if state["available_quests"] else None
    if not available_quest or available_quest["id"] != quest_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quest is locked")

    progress = db.query(UserQuestProgress).filter(
        UserQuestProgress.user_id == user_id,
        UserQuestProgress.quest_id == quest_id,
    ).first()

    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest progress not found")

    progress.status = "active"
    progress.started_at = progress.started_at or datetime.datetime.utcnow()
    progress.updated_at = datetime.datetime.utcnow()
    db.commit()

    return get_quest_state(db, user_id)


def complete_quest(db: Session, user_id: int, quest_id: str, boss_id: str):
    state = get_quest_state(db, user_id)
    active_quest = state["active_quest"]

    if not active_quest:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active quest to complete")

    if active_quest["id"] != quest_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quest mismatch")

    if active_quest["boss_id"] != boss_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Boss mismatch for quest completion")

    progress = db.query(UserQuestProgress).filter(
        UserQuestProgress.user_id == user_id,
        UserQuestProgress.quest_id == quest_id,
    ).first()

    if not progress:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quest progress not found")

    progress.status = "completed"
    progress.completed_at = datetime.datetime.utcnow()
    progress.updated_at = datetime.datetime.utcnow()

    definitions = db.query(QuestDefinition).order_by(QuestDefinition.order_index.asc()).all()
    quest_index = next((idx for idx, item in enumerate(definitions) if item.id == quest_id), None)
    if quest_index is not None and quest_index + 1 < len(definitions):
        next_definition = definitions[quest_index + 1]
        next_progress = db.query(UserQuestProgress).filter(
            UserQuestProgress.user_id == user_id,
            UserQuestProgress.quest_id == next_definition.id,
        ).first()
        if next_progress and next_progress.status == "locked":
            next_progress.status = "available"
            next_progress.updated_at = datetime.datetime.utcnow()

    db.commit()
    return get_quest_state(db, user_id)