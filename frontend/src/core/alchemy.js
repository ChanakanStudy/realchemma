import { RECIPES } from '../features/battle/battleLogic';

export function getItemQuantity(items, id) {
    return items.reduce((total, item) => {
        if (item.id !== id) return total;
        return total + item.quantity;
    }, 0);
}

export function canCraftRecipe(inventory, recipe) {
    return Object.entries(recipe.formula).every(([symbol, requiredQuantity]) => {
        return getItemQuantity(inventory, symbol) >= requiredQuantity;
    });
}

export function craftRecipeFromInventory(userData, recipeId) {
    const recipe = RECIPES.find(item => item.id === recipeId);
    if (!recipe) {
        throw new Error('ไม่พบสูตรแปรธาตุนี้');
    }

    const inventory = Array.isArray(userData.inventory) ? userData.inventory : [];
    if (!canCraftRecipe(inventory, recipe)) {
        throw new Error('ธาตุไม่พอสำหรับสูตรนี้');
    }

    const nextInventory = inventory.map(item => ({ ...item }));

    Object.entries(recipe.formula).forEach(([symbol, requiredQuantity]) => {
        let remaining = requiredQuantity;

        for (let index = 0; index < nextInventory.length && remaining > 0; index += 1) {
            const currentItem = nextInventory[index];
            if (currentItem.id !== symbol || currentItem.quantity <= 0) continue;

            const consumeQuantity = Math.min(currentItem.quantity, remaining);
            currentItem.quantity -= consumeQuantity;
            remaining -= consumeQuantity;
        }
    });

    const filteredInventory = nextInventory.filter(item => item.quantity > 0);
    const existingCompound = filteredInventory.find(item => item.id === recipe.id);

    if (existingCompound) {
        existingCompound.quantity += 1;
    } else {
        filteredInventory.push({ id: recipe.id, quantity: 1 });
    }

    const discoveredCompounds = Array.from(new Set([...(userData.discoveredCompounds || []), recipe.id]));

    return {
        ...userData,
        inventory: filteredInventory,
        discoveredCompounds,
        stats: {
            ...(userData.stats || {}),
            tempMixes: (userData.stats?.tempMixes || 0) + 1,
        },
    };
}