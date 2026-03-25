/**
 * constants.js
 * Global constants shared across the application.
 */

export const GAME_STATES = {
    MENU: 'MENU',
    GAME: 'GAME',
    BATTLE: 'BATTLE',
    CHAT: 'CHAT'
};

export const EVENTS = {
    CHANGE_STATE: 'gameState:change',
    OPEN_CHAT: 'chat:open',
    CLOSE_CHAT: 'chat:close',
    START_BATTLE: 'battle:start',
    QUIT_BATTLE: 'battle:quit',
    UI_INTERACTION: 'ui:interaction'
};

export const MAX_PLAYER_HP = 300;
export const MAX_BATTLE_TIME = 30;
