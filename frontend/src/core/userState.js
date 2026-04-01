/**
 * CHEMMA Persistent Game State Manager
 * Handles saving and loading player progress from localStorage.
 */

const STORAGE_KEY = 'chemma_game_data';

const DEFAULT_STATE = {
    level: 1,
    xp: 0,
    nextLevelXP: 100,
    hp: 300,
    mp: 100,
    inventory: [
        { id: 'H', quantity: 10 },
        { id: 'O', quantity: 10 },
        { id: 'Na', quantity: 10 },
        { id: 'Cl', quantity: 10 },
        { id: 'C', quantity: 10 },
        { id: 'H2O', quantity: 3 },
        { id: 'NaCl', quantity: 2 }
    ],
    quests: [
        { id: 'intro', title: 'ปฐมนิเทศนักเล่นแร่แปรธาตุ', status: 'active', objective: 'คุยกับ Lab Assistant' }
    ],
    discovered: ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'Fe', 'Au', 'Ag', 'Cu', 'Hg', 'Pb', 'Ne'],
    discoveredCompounds: ['H2O', 'NaCl'],
    stats: {
        matches: 0,
        wins: 0,
        tempMixes: 0
    }
};

export const loadGameState = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // FOR PRESENTATION: We override inventory and discovered to ensure they match our code
            return { 
                ...DEFAULT_STATE, 
                ...parsed, 
                inventory: DEFAULT_STATE.inventory,
                discovered: DEFAULT_STATE.discovered,
                discoveredCompounds: DEFAULT_STATE.discoveredCompounds || ['H2O', 'NaCl']
            };
        }
    } catch (e) {
        console.error("Failed to load game state", e);
    }
    return DEFAULT_STATE;
};

export const saveGameState = (state) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save game state", e);
    }
};

export const calculateNextLevelXP = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const addXP = (currentState, amount) => {
    let { xp, level, nextLevelXP } = currentState;
    xp += amount;

    let leveledUp = false;
    while (xp >= nextLevelXP) {
        xp -= nextLevelXP;
        level += 1;
        nextLevelXP = calculateNextLevelXP(level);
        leveledUp = true;
    }

    return { ...currentState, xp, level, nextLevelXP, leveledUp };
};

export const acceptQuest = (currentState, questData) => {
    const quests = [...(currentState.quests || [])];
    if (quests.find(q => q.id === questData.id)) return currentState;
    
    quests.push({
        ...questData,
        status: 'active'
    });
    return { ...currentState, quests };
};

export const completeQuest = (currentState, questId) => {
    const quests = (currentState.quests || []).map(q => 
        q.id === questId ? { ...q, status: 'completed' } : q
    );
    return { ...currentState, quests };
};

export const addInventoryItem = (currentState, itemId, quantity) => {
    const inventory = [...(currentState.inventory || [])];
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    
    if (itemIndex > -1) {
        inventory[itemIndex].quantity += quantity;
    } else {
        inventory.push({ id: itemId, quantity });
    }
    
    return { ...currentState, inventory };
};
