# Battle System Integration Guide

## Overview
A complete alchemy-themed turn-based battle system for Realchemma with:
- 🧪 Element synthesis and crafting system
- ⚔️ Turn-based combat with QTE mechanics
- 💥 Ultimate abilities with status requirements
- 🎬 Cinematic animations and visual effects

## Files Added/Modified

### Frontend
- **`frontend/src/components/battle/BattleApp.jsx`** - Main battle component
  - React component with full battle UI and mechanics
  - Handles phases: Synthesis → Arsenal → Judgement → Defense
  - QTE engine for throw accuracy
  - Cinematic effects system

- **`frontend/src/api/battleAPI.js`** - API client
  - Encapsulates all battle backend calls
  - Methods: `startBattle()`, `craftCompound()`, `executeThrow()`, `executeUltimate()`, `monsterTurn()`, `getBattleData()`

### Backend
- **`backend/app/routes/battle.py`** - Battle API endpoints
  - `/api/battle/start` - Initialize new battle
  - `/api/battle/craft` - Validate and craft compounds
  - `/api/battle/throw` - Execute throw with QTE damage calculation
  - `/api/battle/ultimate` - Execute ultimate abilities
  - `/api/battle/monster-turn` - Calculate monster damage
  - `/api/battle/data` - Get all battle data

- **`backend/app/services/battle_service.py`** - Battle logic service
  - `validate_recipe()` - Check if elements match a recipe
  - `calculate_qte_damage()` - Apply QTE multiplier to damage
  - `check_ultimate_ready()` - Verify ultimate requirements
  - `calculate_monster_damage()` - Random monster attack damage

- **`backend/app/main.py`** - Updated to include battle router

## Game Mechanics

### 1. Synthesis Phase (Phase 1)
- Select elements from available runes
- Maximum 5 elements in crucible
- Click "SYNTHESIZE" to craft matching recipe
- Available recipes:
  - H₂O (Aqua Vitae) - 30 DMG, Wet status
  - HCl (Acid Flask) - 80 DMG, Corroded status
  - NaCl (Crystal Salt) - 50 DMG, Crystalized status
  - NaOH (Caustic Brew) - 100 DMG, Burned status
  - CO₂ (Choking Smog) - 20 DMG, Suffocated status

### 2. Arsenal Phase (Phase 2)
- Select crafted compounds to throw
- Press button to throw and trigger QTE

### 3. QTE System
- Bar moves left-right, player presses **SPACEBAR** to hit
- Green zone = PERFECT (1.5x damage)
- Yellow zone = GOOD (1.0x damage)
- Red zone = MISS (0.5x damage)

### 4. Judgement Phase (Phase 3)
- Execute Ultimate abilities (if requirements met)
- **ABSOLUTE ZERO** - Requires: Wet + Suffocated (800 DMG)
- **HELLFIRE ANNIHILATION** - Requires: Burned + Corroded (1000 DMG)
- **PHILOSOPHER'S NUKE** - Requires: Wet + Corroded + Crystalized (9999 DMG)

### 5. Monster Turn (Phase 4)
- Monster attacks player
- Damage: 40-70 HP
- Screen shake effect

## Usage

### Import in Your App
```jsx
import BattleApp from './components/battle/BattleApp';

function GameScreen() {
  return <BattleApp />;
}
```

### Optional: Use Battle API in Other Components
```jsx
import battleAPI from './api/battleAPI';

// Start a battle
const battleData = await battleAPI.startBattle();

// Craft a compound
const recipe = await battleAPI.craftCompound({ H: 2, O: 1 });

// Execute a throw
const result = await battleAPI.executeThrow('H2O', 'PERFECT');
```

## Customization

### Modify Game Constants
Edit the constants in **BattleApp.jsx**:
```jsx
const MAX_TIME = 30;           // Phase time limit
const MAX_PLAYER_HP = 300;     // Player starting HP
const MAX_MONSTER_HP = 3000;   // Monster starting HP
```

### Add New Elements
Update `ELEMENTS` array and add recipes to `RECIPES`:
```jsx
const ELEMENTS = [
  { symbol: 'Fe', name: 'Iron', color: '#8b5a3c', rune: '⚒️' },
  // ...
];
```

### Add New Recipes
Update `RECIPES` array:
```jsx
const RECIPES = [
  { 
    id: 'Fe2O3', 
    name: 'Iron Oxide', 
    formula: { Fe: 2, O: 3 }, 
    damage: 120, 
    status: 'Rusted', 
    color: '#d97706' 
  }
];
```

## API Response Examples

### Start Battle
```json
{
  "status": "Battle started",
  "player_hp": 300,
  "monster_hp": 3000,
  "turn": 1,
  "message": "AN ANCIENT HOMUNCULUS BLOCKS YOUR PATH!"
}
```

### Execute Throw
```json
{
  "status": "Throw executed",
  "compound": "H2O",
  "qte_result": "PERFECT",
  "damage": 45,
  "hit": true
}
```

### Monster Turn
```json
{
  "damage": 55,
  "message": "HOMUNCULUS STRIKES! YOU TOOK 55 DMG.",
  "player_hp_remaining": 245
}
```

## Performance Notes
- All game logic runs client-side for responsive gameplay
- Backend can be used for:
  - Server-side battle validation
  - Damage calculation logging
  - Statistics tracking
  - Multiplayer synchronization

## Browser Requirements
- Modern browser with ES6 support
- Tailwind CSS
- requestAnimationFrame support (animations)

## Future Enhancements
- [ ] Multiplayer battles (send actions to server)
- [ ] Persistent battle statistics
- [ ] Battle replays
- [ ] Additional ultimates and recipes
- [ ] Difficulty levels/Scaling
- [ ] Boss encounters
- [ ] Achievements/Rewards system
