/**
 * CHEMMA Persistent Game State Manager
 * Handles saving and loading player progress from localStorage.
 */

const STORAGE_KEY = 'chemma_game_data';
const PENDING_INVENTORY_SYNC_KEY = 'chemma_pending_inventory_sync';

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
    stardust: 0,
    stats: {
        matches: 0,
        wins: 0,
        tempMixes: 0
    }
};

export const createDefaultGameState = () => JSON.parse(JSON.stringify(DEFAULT_STATE));

export const loadGameState = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                ...DEFAULT_STATE,
                ...parsed,
                inventory: Array.isArray(parsed.inventory) ? parsed.inventory : DEFAULT_STATE.inventory,
                discovered: Array.isArray(parsed.discovered) ? parsed.discovered : DEFAULT_STATE.discovered,
                discoveredCompounds: Array.isArray(parsed.discoveredCompounds)
                    ? parsed.discoveredCompounds
                    : DEFAULT_STATE.discoveredCompounds,
            };
        }
    } catch (e) {
        console.error("Failed to load game state", e);
    }
    return createDefaultGameState();
};

export const saveGameState = (state) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error("Failed to save game state", e);
    }
};

const normalizeInventory = (inventory = []) => {
    const map = new Map();

    inventory.forEach(item => {
        if (!item?.id) return;
        const quantity = Number(item.quantity || 0);
        map.set(item.id, (map.get(item.id) || 0) + quantity);
    });

    return Array.from(map.entries()).map(([id, quantity]) => ({ id, quantity }));
};

export const buildInventoryDelta = (previousInventory = [], nextInventory = []) => {
    const previousMap = new Map(normalizeInventory(previousInventory).map(item => [item.id, item.quantity]));
    const nextMap = new Map(normalizeInventory(nextInventory).map(item => [item.id, item.quantity]));
    const itemIds = new Set([...previousMap.keys(), ...nextMap.keys()]);

    return Array.from(itemIds)
        .map(id => ({
            id,
            quantity: (nextMap.get(id) || 0) - (previousMap.get(id) || 0),
        }))
        .filter(change => change.quantity !== 0);
};

export const loadPendingInventorySync = () => {
    try {
        const saved = localStorage.getItem(PENDING_INVENTORY_SYNC_KEY);
        if (!saved) return [];

        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
            ? parsed.filter(change => change && change.id && Number(change.quantity || 0) !== 0)
            : [];
    } catch (e) {
        console.error('Failed to load pending inventory sync', e);
        return [];
    }
};

export const queuePendingInventorySync = (changes) => {
    const pending = loadPendingInventorySync();
    const merged = new Map();

    [...pending, ...(Array.isArray(changes) ? changes : [])].forEach(change => {
        if (!change?.id) return;
        const quantity = Number(change.quantity || 0);
        if (quantity === 0) return;
        merged.set(change.id, (merged.get(change.id) || 0) + quantity);
    });

    try {
        localStorage.setItem(
            PENDING_INVENTORY_SYNC_KEY,
            JSON.stringify(Array.from(merged.entries()).map(([id, quantity]) => ({ id, quantity })))
        );
    } catch (e) {
        console.error('Failed to queue pending inventory sync', e);
    }
};

export const clearPendingInventorySync = () => {
    try {
        localStorage.removeItem(PENDING_INVENTORY_SYNC_KEY);
    } catch (e) {
        console.error('Failed to clear pending inventory sync', e);
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

export const addStardust = (currentState, amount) => {
    const currentStardust = currentState.stardust || 0;
    return { ...currentState, stardust: currentStardust + amount };
};
