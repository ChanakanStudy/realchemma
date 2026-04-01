/**
 * constants.js
 * Global constants shared across the application.
 */

export const GAME_STATES = {
    LOGIN: 'LOGIN',      // ← Initial state — shows LoginScreen
    MENU: 'MENU',
    GAME: 'GAME',
    BATTLE: 'BATTLE',
    CHAT: 'CHAT',
    DIALOGUE: 'DIALOGUE'
};

export const EVENTS = {
    CHANGE_STATE: 'gameState:change',
    OPEN_CHAT: 'chat:open',
    CLOSE_CHAT: 'chat:close',
    START_BATTLE: 'battle:start',
    QUIT_BATTLE: 'battle:quit',
    UI_INTERACTION: 'ui:interaction',
    OPEN_NPC_POPUP: 'OPEN_NPC_POPUP',
    CLOSE_NPC_POPUP: 'CLOSE_NPC_POPUP',
    TRIGGER_CHAT_WITH_PROMPT: 'chat:trigger-with-prompt',
    OPEN_CRAFT_LAB: 'craft:open-lab',
    QUEST_ACCEPTED: 'quest:accepted',
    QUEST_COMPLETED: 'quest:completed',
    BATTLE_WON: 'battle:won'
};

export const MAX_PLAYER_HP = 300;
export const MAX_BATTLE_TIME = 30;
