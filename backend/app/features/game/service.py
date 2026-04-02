from collections import Counter
from copy import deepcopy

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.features.game.schemas import LabExperimentResponse
from app.models.inventory import UserInventoryItem
from app.models.game_state import UserGameState
from app.models.quest import QuestDefinition, UserQuestProgress
from app.models.user import User


DEFAULT_GAME_STATE = {
    "inventory": [
        {"id": "H", "quantity": 10},
        {"id": "O", "quantity": 10},
        {"id": "Na", "quantity": 10},
        {"id": "Cl", "quantity": 10},
        {"id": "C", "quantity": 10},
        {"id": "H2O", "quantity": 3},
        {"id": "NaCl", "quantity": 2},
    ],
    "discovered": ["H", "He", "Li", "Be", "B", "C", "N", "O", "Fe", "Au", "Ag", "Cu", "Hg", "Pb", "Ne"],
    "discovered_compounds": ["H2O", "NaCl"],
}

RECIPES = [
    {"id": "H2O", "name": "Aqua Vitae (H2O)", "formula": {"H": 2, "O": 1}, "damage": 30, "status": "Wet", "color": "#60a5fa", "desc": "น้ำแห่งชีวิต มีสมบัติเป็นกลาง ล้างสถานะผิดปกติทางเคมีพื้นฐานได้"},
    {"id": "HCl", "name": "Acid Flask (HCl)", "formula": {"H": 1, "Cl": 1}, "damage": 80, "status": "Corroded", "color": "#4ade80", "desc": "กรดแก่ที่มีฤทธิ์กัดกร่อนสูง ระเหยง่ายและอันตรายต่อเนื้อเยื่อ"},
    {"id": "NaCl", "name": "Crystal Salt (NaCl)", "formula": {"Na": 1, "Cl": 1}, "damage": 50, "status": "Crystalized", "color": "#fef08a", "desc": "เกลือแกงใสบริสุทธิ์ ใช้ในการปรุงอาหารและรักษาความสมดุลของเหลวในร่างกาย"},
    {"id": "NaOH", "name": "Caustic Brew (NaOH)", "formula": {"Na": 1, "O": 1, "H": 1}, "damage": 100, "status": "Burn", "color": "#c084fc", "desc": "โซดาไฟ มีฤทธิ์เป็นเบสแก่ กัดกร่อนรุนแรง มักใช้ในอุตสาหกรรมทำความสะอาด"},
    {"id": "CO2", "name": "Choking Smog (CO2)", "formula": {"C": 1, "O": 2}, "damage": 20, "status": "Suffocated", "color": "#94a3b8", "desc": "แก๊สไม่มีสีที่เกิดจากการหายใจและการเผาไหม้ หากเข้มข้นสูงจะทำให้ขาดอากาศหายใจ"},
    {"id": "NH3", "name": "Ammonia Gas (NH3)", "formula": {"N": 1, "H": 3}, "damage": 40, "status": "Shock", "color": "#c4b5fd", "desc": "แก๊สที่มีกลิ่นฉุนรุนแรง ใช้ในอุตสาหกรรมทำความเย็นและผลิตปุ๋ย"},
    {"id": "H2S", "name": "Rotten Egg Gas (H2S)", "formula": {"H": 2, "S": 1}, "damage": 90, "status": "Toxin", "color": "#fcd34d", "desc": "แก๊สที่มีกลิ่นเหม็นเน่าเหมือนไข่เน่า มีความเป็นพิษสูงและไวไฟ"},
    {"id": "Fe2O3", "name": "Rusted Iron (Fe2O3)", "formula": {"Fe": 2, "O": 3}, "damage": 110, "status": "Crystalized", "color": "#b45309", "desc": "รังแคของเหล็กหรือสนิม เกิดจากปฏิกิริยาระหว่างเหล็ก ออกซิเจน และความชื้น"},
    {"id": "KCl", "name": "Potassium Salt (KCl)", "formula": {"K": 1, "Cl": 1}, "damage": 60, "status": "Marked", "color": "#fbcfe8", "desc": "เกลือโพแทสเซียม ใช้ในทางการแพทย์เพื่อเพิ่มระดับโพแทสเซียมและในปุ๋ย"},
    {"id": "CH4", "name": "Methane Gas (CH4)", "formula": {"C": 1, "H": 4}, "damage": 30, "status": "Flammable", "color": "#d1d5db", "desc": "แก๊สชีวภาพที่ไวไฟสูงมาก เป็นส่วนประกอบหลักของแก๊สธรรมชาติ"},
    {"id": "CaO", "name": "Quicklime (CaO)", "formula": {"Ca": 1, "O": 1}, "damage": 85, "status": "Burn", "color": "#ffedd5", "desc": "ปูนขาว เมื่อสัมผัสน้ำจะคายความร้อนรุนแรง ใช้ในการปรับสภาพดินและฆ่าเชื้อ"},
    {"id": "H2O2", "name": "Peroxide Spark (H2O2)", "formula": {"H": 2, "O": 2}, "damage": 55, "status": "Reactive", "color": "#38bdf8", "desc": "ไฮโดรเจนเปอร์ออกไซด์ สารออกซิไดซ์แรง ใช้ในงานฆ่าเชื้อและอุตสาหกรรม"},
    {"id": "CO", "name": "Silent Poison (CO)", "formula": {"C": 1, "O": 1}, "damage": 35, "status": "Toxin", "color": "#64748b", "desc": "คาร์บอนมอนอกไซด์ แก๊สพิษที่มองไม่เห็นและอันตรายต่อการหายใจ"},
    {"id": "SO2", "name": "Sulfur Smoke (SO2)", "formula": {"S": 1, "O": 2}, "damage": 45, "status": "Suffocated", "color": "#eab308", "desc": "ซัลเฟอร์ไดออกไซด์ แก๊สฉุนที่ระคายเคืองทางเดินหายใจ"},
    {"id": "SO3", "name": "Acid Mist (SO3)", "formula": {"S": 1, "O": 3}, "damage": 70, "status": "Corroded", "color": "#f59e0b", "desc": "ซัลเฟอร์ไตรออกไซด์ สารตั้งต้นของกรดกำมะถันและเกิดละอองกัดกร่อน"},
    {"id": "H2SO4", "name": "Vitriol Core (H2SO4)", "formula": {"H": 2, "S": 1, "O": 4}, "damage": 140, "status": "Corroded", "color": "#7c3aed", "desc": "กรดกำมะถัน เข้มข้นและกัดกร่อนรุนแรง ใช้ในอุตสาหกรรมหนัก"},
    {"id": "HNO3", "name": "Aqua Fortis (HNO3)", "formula": {"H": 1, "N": 1, "O": 3}, "damage": 130, "status": "Corroded", "color": "#06b6d4", "desc": "กรดไนตริก กรดออกซิไดซ์แรง ใช้ในอุตสาหกรรมและงานสังเคราะห์"},
    {"id": "NH4Cl", "name": "Sal Ammoniac (NH4Cl)", "formula": {"N": 1, "H": 4, "Cl": 1}, "damage": 45, "status": "Crystalized", "color": "#cbd5e1", "desc": "แอมโมเนียมคลอไรด์ เกลือผลึกที่ใช้ในปฏิกิริยาและงานทดลอง"},
    {"id": "Na2CO3", "name": "Soda Ash (Na2CO3)", "formula": {"Na": 2, "C": 1, "O": 3}, "damage": 65, "status": "Crystalized", "color": "#f8fafc", "desc": "โซดาแอช ใช้ผลิตแก้ว ทำความสะอาด และปรับสภาพสารละลาย"},
    {"id": "CaCO3", "name": "Limestone Shard (CaCO3)", "formula": {"Ca": 1, "C": 1, "O": 3}, "damage": 50, "status": "Crystalized", "color": "#e2e8f0", "desc": "แคลเซียมคาร์บอเนต พบในหินปูน เปลือกหอย และวัสดุธรรมชาติ"},
    {"id": "MgO", "name": "Magnesia Ward (MgO)", "formula": {"Mg": 1, "O": 1}, "damage": 75, "status": "Burn", "color": "#bae6fd", "desc": "แมกนีเซียมออกไซด์ วัสดุทนความร้อนและใช้ในอุตสาหกรรมเซรามิก"},
    {"id": "Al2O3", "name": "Alumina Shell (Al2O3)", "formula": {"Al": 2, "O": 3}, "damage": 95, "status": "Crystalized", "color": "#dbeafe", "desc": "อะลูมินา วัสดุแข็งทนทาน ใช้ในเซรามิกและสารกัดกร่อน"},
    {"id": "SiO2", "name": "Quartz Prism (SiO2)", "formula": {"Si": 1, "O": 2}, "damage": 90, "status": "Crystalized", "color": "#67e8f9", "desc": "ซิลิกอนไดออกไซด์ โครงสร้างหลักของควอตซ์และทราย"},
    {"id": "C2H5OH", "name": "Spirit Flame (C2H5OH)", "formula": {"C": 2, "H": 6, "O": 1}, "damage": 60, "status": "Flammable", "color": "#fb7185", "desc": "เอทานอล ของเหลวไวไฟ ใช้เป็นเชื้อเพลิงและตัวทำละลาย"},
    {"id": "Fe3O4", "name": "Magnetite Core (Fe3O4)", "formula": {"Fe": 3, "O": 4}, "damage": 125, "status": "Crystalized", "color": "#374151", "desc": "แมกนีไทต์ สนิมชนิดแม่เหล็กที่มีความเสถียรสูง"},
    {"id": "Ca(OH)2", "name": "Slaked Lime (Ca(OH)2)", "formula": {"Ca": 1, "O": 2, "H": 2}, "damage": 70, "status": "Burn", "color": "#f8fafc", "desc": "ปูนขาวดอง ใช้ปรับสภาพดินและในกระบวนการเคมีหลายชนิด"},
    {"id": "Na2SO4", "name": "Glauber Salt (Na2SO4)", "formula": {"Na": 2, "S": 1, "O": 4}, "damage": 85, "status": "Crystalized", "color": "#bae6fd", "desc": "โซเดียมซัลเฟต เกลือผลึกที่พบในงานอุตสาหกรรมและการทดลอง"},
    {"id": "K2SO4", "name": "Potash Bloom (K2SO4)", "formula": {"K": 2, "S": 1, "O": 4}, "damage": 90, "status": "Crystalized", "color": "#f9a8d4", "desc": "โพแทสเซียมซัลเฟต ใช้ในปุ๋ยและสารเคมีเฉพาะทาง"},
]


def _clone_default_state():
    return deepcopy(DEFAULT_GAME_STATE)


def _normalize_game_state(raw_state):
    state = _clone_default_state()
    if isinstance(raw_state, dict):
        state.update(raw_state)

    inventory = state.get("inventory") or []
    discovered = state.get("discovered") or []
    discovered_compounds = state.get("discovered_compounds") or []

    state["inventory"] = [item for item in inventory if item.get("quantity", 0) > 0]
    state["discovered"] = list(dict.fromkeys(discovered))
    state["discovered_compounds"] = list(dict.fromkeys(discovered_compounds))
    return state


def _state_payload(user_uuid, state):
    return {
        "user_uuid": user_uuid,
        "inventory": state["inventory"],
        "discovered": state["discovered"],
        "discovered_compounds": state["discovered_compounds"],
    }


def _legacy_inventory_seed(state_row: UserGameState | None):
    if state_row and isinstance(state_row.inventory_json, list) and state_row.inventory_json:
        return [
            {"id": item.get("id"), "quantity": int(item.get("quantity", 0))}
            for item in state_row.inventory_json
            if item.get("id") and int(item.get("quantity", 0)) > 0
        ]

    return _clone_default_state()["inventory"]


def _get_or_create_state_row(db: Session, user_id: int, user_uuid: str):
    row = db.query(UserGameState).filter(UserGameState.user_uuid == user_uuid).first()
    if row:
        return row

    initial_state = _clone_default_state()
    row = UserGameState(
        user_id=user_id,
        user_uuid=user_uuid,
        inventory_json=initial_state["inventory"],
        discovered_json=initial_state["discovered"],
        discovered_compounds_json=initial_state["discovered_compounds"],
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _get_or_create_inventory_rows(db: Session, user_id: int, user_uuid: str):
    rows = db.query(UserInventoryItem).filter(UserInventoryItem.user_uuid == user_uuid).all()
    if rows:
        return rows

    state_row = _get_or_create_state_row(db, user_id, user_uuid)
    seed_inventory = _legacy_inventory_seed(state_row)
    for item in seed_inventory:
        db.add(UserInventoryItem(user_id=user_id, user_uuid=user_uuid, item_id=item["id"], quantity=int(item["quantity"])))

    db.commit()
    return db.query(UserInventoryItem).filter(UserInventoryItem.user_uuid == user_uuid).all()


def ensure_user_game_data(db: Session, user: User):
    state_row = _get_or_create_state_row(db, user.id, user.uuid)
    inventory_rows = _get_or_create_inventory_rows(db, user.id, user.uuid)

    quest_rows = db.query(UserQuestProgress).filter(UserQuestProgress.user_uuid == user.uuid).all()
    if not quest_rows:
        quest_definitions = db.query(QuestDefinition).order_by(QuestDefinition.order_index.asc()).all()
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

    return {
        "state_row": state_row,
        "inventory_rows": inventory_rows,
    }


def _serialize_inventory(rows):
    return [
        {"id": row.item_id, "quantity": row.quantity}
        for row in sorted(rows, key=lambda row: (row.item_id, row.id))
        if row.quantity > 0
    ]


def _sync_legacy_inventory_snapshot(db: Session, user_id: int, user_uuid: str, inventory):
    state_row = _get_or_create_state_row(db, user_id, user_uuid)
    state_row.inventory_json = inventory
    db.commit()
    db.refresh(state_row)


def _apply_inventory_changes(db: Session, user_id: int, user_uuid: str, changes):
    if not isinstance(changes, list):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid inventory changes payload")

    normalized_changes = Counter()
    for change in changes:
        if not isinstance(change, dict):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid inventory change entry")

        item_id = change.get("id")
        quantity = int(change.get("quantity", 0))
        if not item_id or quantity == 0:
            continue
        normalized_changes[item_id] += quantity

    if not normalized_changes:
        return get_game_state(db, user_id, user_uuid)

    rows = {row.item_id: row for row in _get_or_create_inventory_rows(db, user_id, user_uuid)}

    for item_id, delta in normalized_changes.items():
        current_quantity = rows.get(item_id).quantity if item_id in rows else 0
        next_quantity = current_quantity + delta
        if next_quantity < 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Not enough quantity for {item_id}")

    for item_id, delta in normalized_changes.items():
        row = rows.get(item_id)
        current_quantity = row.quantity if row else 0
        next_quantity = current_quantity + delta

        if row and next_quantity <= 0:
            db.delete(row)
            continue

        if row:
            row.quantity = next_quantity
        else:
            db.add(UserInventoryItem(user_id=user_id, user_uuid=user_uuid, item_id=item_id, quantity=next_quantity))

    db.commit()
    inventory_rows = _get_or_create_inventory_rows(db, user_id, user_uuid)
    inventory = _serialize_inventory(inventory_rows)
    _sync_legacy_inventory_snapshot(db, user_id, user_uuid, inventory)
    return _state_payload(user_uuid, {
        "inventory": inventory,
        "discovered": _get_or_create_state_row(db, user_id, user_uuid).discovered_json,
        "discovered_compounds": _get_or_create_state_row(db, user_id, user_uuid).discovered_compounds_json,
    })


def _save_state_row(db: Session, row: UserGameState, state: dict):
    row.inventory_json = state["inventory"]
    row.discovered_json = state["discovered"]
    row.discovered_compounds_json = state["discovered_compounds"]
    db.commit()
    db.refresh(row)


def get_game_state(db: Session, user_id: int, user_uuid: str):
    row = _get_or_create_state_row(db, user_id, user_uuid)
    inventory_rows = _get_or_create_inventory_rows(db, user_id, user_uuid)
    state = _normalize_game_state({
        "inventory": _serialize_inventory(inventory_rows),
        "discovered": row.discovered_json,
        "discovered_compounds": row.discovered_compounds_json,
    })
    _sync_legacy_inventory_snapshot(db, user_id, user_uuid, state["inventory"])
    return _state_payload(user_uuid, state)


def _count_symbols(selected_symbols):
    counts = {}
    for symbol in selected_symbols:
        counts[symbol] = counts.get(symbol, 0) + 1
    return counts


def _get_quantity(items, item_id):
    return sum(item.get("quantity", 0) for item in items if item.get("id") == item_id)


def _consume_symbols(inventory, selected_symbols):
    next_inventory = [dict(item) for item in inventory]

    for symbol in selected_symbols:
        remaining = 1
        for item in next_inventory:
            if item.get("id") != symbol or item.get("quantity", 0) <= 0:
                continue

            consume_quantity = min(item["quantity"], remaining)
            item["quantity"] -= consume_quantity
            remaining -= consume_quantity

            if remaining <= 0:
                break

    return [item for item in next_inventory if item.get("quantity", 0) > 0]


def _match_recipe(selected_symbols):
    counts = _count_symbols(selected_symbols)
    for recipe in RECIPES:
        formula = recipe["formula"]
        if len(formula) != len(counts):
            continue
        if all(counts.get(symbol) == required for symbol, required in formula.items()):
            return recipe
    return None


def run_experiment(db: Session, user_id: int, user_uuid: str, selected_symbols):
    if not isinstance(selected_symbols, list) or len(selected_symbols) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ต้องมีสารอย่างน้อย 2 ชนิดเพื่อเริ่มปฏิกิริยา")

    row = _get_or_create_state_row(db, user_id, user_uuid)
    _get_or_create_inventory_rows(db, user_id, user_uuid)
    state = _normalize_game_state({
        "inventory": _serialize_inventory(_get_or_create_inventory_rows(db, user_id, user_uuid)),
        "discovered": row.discovered_json,
        "discovered_compounds": row.discovered_compounds_json,
    })

    selected_counts = _count_symbols(selected_symbols)
    has_enough_materials = all(_get_quantity(state["inventory"], symbol) >= quantity for symbol, quantity in selected_counts.items())
    if not has_enough_materials:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="วัตถุดิบไม่พอสำหรับการทดลองนี้")

    recipe = _match_recipe(selected_symbols)
    if not recipe:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ปฏิกิริยาไม่เสถียร ลองเปลี่ยนสัดส่วนของสาร")

    next_inventory = _consume_symbols(state["inventory"], selected_symbols)
    existing_compound = next((item for item in next_inventory if item.get("id") == recipe["id"]), None)
    if existing_compound:
        existing_compound["quantity"] += 1
    else:
        next_inventory.append({"id": recipe["id"], "quantity": 1})

    next_state = {
        "inventory": next_inventory,
        "discovered": state["discovered"],
        "discovered_compounds": list(dict.fromkeys([*state["discovered_compounds"], recipe["id"]])),
    }

    _save_state_row(db, row, next_state)

    inventory_rows = {item["id"]: item["quantity"] for item in next_inventory}
    existing_rows = {row.item_id: row for row in _get_or_create_inventory_rows(db, user_id, user_uuid)}

    for item_id, quantity in inventory_rows.items():
        row_item = existing_rows.get(item_id)
        if row_item:
            row_item.quantity = quantity
        else:
            db.add(UserInventoryItem(user_id=user_id, user_uuid=user_uuid, item_id=item_id, quantity=quantity))

    for item_id, row_item in existing_rows.items():
        if item_id not in inventory_rows:
            db.delete(row_item)

    db.commit()
    _sync_legacy_inventory_snapshot(db, user_id, user_uuid, next_inventory)

    payload = _state_payload(user_uuid, next_state)
    return LabExperimentResponse(
        **payload,
        success=True,
        message=f"เกิดการตกผลึก: {recipe['name']}",
        recipe={
            "id": recipe["id"],
            "name": recipe["name"],
            "damage": recipe["damage"],
            "status": recipe["status"],
            "color": recipe["color"],
            "desc": recipe["desc"],
        },
    )


def adjust_inventory(db: Session, user_id: int, user_uuid: str, changes):
    return _apply_inventory_changes(db, user_id, user_uuid, changes)