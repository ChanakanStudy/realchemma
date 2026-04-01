import { RECIPES, matchRecipe } from '../features/battle/battleLogic';

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

function consumeSelectedSymbols(inventory, selectedSymbols) {
    const nextInventory = inventory.map(item => ({ ...item }));

    selectedSymbols.forEach(symbol => {
        let remaining = 1;

        for (let index = 0; index < nextInventory.length && remaining > 0; index += 1) {
            const currentItem = nextInventory[index];
            if (currentItem.id !== symbol || currentItem.quantity <= 0) continue;

            const consumeQuantity = Math.min(currentItem.quantity, remaining);
            currentItem.quantity -= consumeQuantity;
            remaining -= consumeQuantity;
        }
    });

    return nextInventory.filter(item => item.quantity > 0);
}

export function attemptExperimentFromInventory(userData, selectedSymbols = []) {
    if (!Array.isArray(selectedSymbols) || selectedSymbols.length < 2) {
        return {
            success: false,
            message: 'ต้องมีสารอย่างน้อย 2 ชนิดเพื่อเริ่มปฏิกิริยา',
            selectedSymbols: [],
        };
    }

    const inventory = Array.isArray(userData.inventory) ? userData.inventory : [];
    const selectedCounts = selectedSymbols.reduce((acc, symbol) => {
        acc[symbol] = (acc[symbol] || 0) + 1;
        return acc;
    }, {});

    const hasEnoughMaterials = Object.entries(selectedCounts).every(([symbol, quantity]) => {
        return getItemQuantity(inventory, symbol) >= quantity;
    });

    if (!hasEnoughMaterials) {
        return {
            success: false,
            message: 'วัตถุดิบไม่พอสำหรับการทดลองนี้',
            selectedSymbols,
        };
    }

    const recipe = matchRecipe(selectedSymbols);
    if (!recipe) {
        return {
            success: false,
            message: 'ปฏิกิริยาไม่เสถียร ลองเปลี่ยนสัดส่วนของสาร',
            selectedSymbols,
        };
    }

    const nextInventory = consumeSelectedSymbols(inventory, selectedSymbols);
    const existingCompound = nextInventory.find(item => item.id === recipe.id);

    if (existingCompound) {
        existingCompound.quantity += 1;
    } else {
        nextInventory.push({ id: recipe.id, quantity: 1 });
    }

    const discoveredCompounds = Array.from(new Set([...(userData.discoveredCompounds || []), recipe.id]));

    return {
        success: true,
        message: `เกิดการตกผลึก: ${recipe.name}`,
        recipe,
        inventory: nextInventory,
        discoveredCompounds,
        stats: {
            ...(userData.stats || {}),
            tempMixes: (userData.stats?.tempMixes || 0) + 1,
        },
    };
}