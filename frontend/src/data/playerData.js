/**
 * playerData.js
 * Default stats and inventory for the player character.
 */

export const PLAYER_DEFAULTS = {
    id: 1, 
    username: "Alchemist_01", 
    level: 1, 
    exp: 0, 
    hp: 100, 
    maxHp: 100,
    x: 696, 
    y: 840,
    elements: { 'H': 2, 'O': 1, 'Na': 1, 'Cl': 1, 'C': 0 },
    compounds: [], 
    deck: [],
    questState: 0, 
    questRoute: null 
};
