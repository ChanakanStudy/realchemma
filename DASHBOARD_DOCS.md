# 🗃️ CHEMMA Unified Dashboard & Codex Documentation

This document provides technical details and usage instructions for the new **Unified Inventory Dashboard** and **Periodic Table Codex** systems.

## 🌟 Overview
The Unified Dashboard replaces separate UI overlays with a single, high-performance tabbed interface. It centralizes player management, item tracking, and chemical research into one premium experience.

## 🛠️ Components & Architecture

### 1. Unified Dashboard (`InventoryUI.jsx`)
- **Path:** `frontend/src/components/inventory/InventoryUI.jsx`
- **Role:** The main container shell. It manages tab switching and provides the vertical navigation sidebar.
- **Tabs:**
  - `backpack`: Shows items currently in the player's inventory.
  - `codex`: Embeds the Periodic Table component.
  - `quests`: Displays the player's mission progress.

### 2. Periodic Table Codex (`PeriodicTable.jsx`)
- **Path:** `frontend/src/components/codex/PeriodicTable.jsx`
- **Role:** An interactive grid of elements based on real chemistry data.
- **Discovery Logic:** It automatically filters the `PERIODIC_TABLE_DATA` against the `userData.discovered` array.
- **Detail View:** Shows specific properties (Atomic Weight, Symbol, Category) and localized chemistry facts.

### 3. Element Data (`elementData.js`)
- **Path:** `frontend/src/services/elementData.js`
- **Role:** The central source of truth for element properties and positions in the grid.

## 🎹 Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `[I]` | Open Dashboard (Backpack Tab) |
| `[C]` | Open Dashboard (Codex Tab) |
| `[Q]` | Open Dashboard (Quest Tab) |
| `[Esc]` | Close Dashboard / Overlays |

## 🚀 How to Extend

### Adding New Elements
To add a new element (e.g., Titanium) to the Codex:
1. Open `frontend/src/services/elementData.js`.
2. Add a new object to `PERIODIC_TABLE_DATA`:
```javascript
{ 
  num: 22, 
  symbol: 'Ti', 
  name: 'Titanium', 
  category: 'transition', 
  x: 4, 
  y: 4, 
  weight: 47.86, 
  desc: 'A strong, low-density transition metal.' 
}
```

### Adding New Mixing Recipes
To allow players to craft new compounds:
1. Open `frontend/src/services/alchemyService.js`.
2. Add a new recipe to the `RECIPES` array:
```javascript
{ 
  id: 'MgO', 
  name: 'Magnesium Oxide', 
  formula: { Mg: 1, O: 1 }, 
  damage: 40, 
  status: 'Blinded', 
  color: '#ffffff' 
}
```

## 🎨 Styling
All premium visual effects (Glassmorphism, Neon Glow, 3D Tilt) are defined in the `/* --- Unified Dashboard Styles --- */` section of `frontend/src/index.css`.
