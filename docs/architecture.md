# CHEMMA Architecture Overview

This document describes the modular architecture of the CHEMMA web game after the 2026-03-19 reorganization.

## Project Structure

### Backend (FastAPI)
Located in `/backend/app/`, following a standard service-oriented pattern:
- `main.py`: Entry point, CORS setup, and router inclusion.
- `core/config.py`: Centralized environment variables and system prompts.
- `models/schemas.py`: Pydantic models for request/response validation.
- `services/`: Business logic, including Gemini AI integration.
- `routes/`: API endpoints grouped by functionality.

### Frontend (Phaser + React)
Located in `/frontend/`, using modern ES Modules:
- `public/index.html`: Minimal HTML structure and CDN injections.
- `src/main.js`: Main entry point. Initializes Phaser and React, and manages global game state.
- `src/core/config.js`: Shared game data (Map, Palette, Player DB).
- `src/scenes/WorldScene.js`: Phaser 3 logic for the exploration map.
- `src/systems/battle/BattleApp.js`: React-based turn-based combat system.
- `src/systems/dialogue/dialogueManager.js`: Oracle Chat handling and API communication.
- `src/api/client.js`: Generic fetch wrapper for backend communication.
- `src/index.css`: Global styles and UI themes.

## Data Flow
1. **Exploration**: `WorldScene.js` handles player movement and NPC interaction triggers.
2. **Dialogue**: NPCs trigger `dialogueManager.js`, which calls `client.js` to fetch AI responses from the backend.
3. **Combat**: Triggered by `WorldScene.js`, the React `BattleApp` mounts to `#battle-root` and takes over the UI.

## Deployment
Managed via `docker-compose.yml`:
- **Frontend**: Nginx serving static files from the root, with a fallback to `public/index.html`.
- **Backend**: Uvicorn running the `app.main:app` module.
