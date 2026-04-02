/**
 * CHEMMA Minigame Reward Configuration
 * Defines element tiers and reward calculation logic.
 */

export const ELEMENT_TIERS = {
    TIER_1: ['H', 'O', 'C', 'Na', 'Cl', 'N'], // Common
    TIER_2: ['Fe', 'Ag', 'Cu', 'Mg', 'Al', 'Si', 'P', 'K'], // Uncommon
    TIER_3: ['Au', 'Hg', 'Pb', 'Ne', 'Ti', 'Ni'], // Rare
    TIER_4: ['Pt', 'U', 'Pu', 'Ar', 'Kr', 'Xe'], // Legendary
};

export const DIFFICULTY_REWARDS = {
    easy: {
        minXP: 20,
        maxXP: 45,
        lootCount: 2,
        possibleTiers: ['TIER_1'],
        stardustRange: [2, 8]
    },
    med: {
        minXP: 55,
        maxXP: 105,
        lootCount: 3,
        possibleTiers: ['TIER_1', 'TIER_2'],
        stardustRange: [10, 25]
    },
    hard: {
        minXP: 180,
        maxXP: 420,
        lootCount: 4,
        possibleTiers: ['TIER_2', 'TIER_3', 'TIER_4'],
        stardustRange: [40, 100]
    }
};

/**
 * Calculates a random reward based on difficulty and score.
 * @param {string} difficulty - 'easy', 'med', or 'hard'
 * @param {number} score - Performance score (0-100+)
 */
export const calculateMinigameRewards = (difficulty, score) => {
    const config = DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.easy;

    // XP Calculation: Base + (Score Bonus)
    const baseXP = Math.floor(Math.random() * (config.maxXP - config.minXP + 1)) + config.minXP;
    const scoreBonus = Math.floor(score / 8);
    let xp = baseXP + scoreBonus;

    // Perfect Bonus (Score Check)
    let isPerfect = false;
    let perfectMultiplier = 1;
    if (score >= 450 || (difficulty === 'easy' && score >= 200)) {
        isPerfect = true;
        perfectMultiplier = 1.5;
        xp = Math.floor(xp * perfectMultiplier);
    }

    // Stardust Calculation
    const [minSD, maxSD] = config.stardustRange;
    let stardust = Math.floor(Math.random() * (maxSD - minSD + 1)) + minSD;
    if (isPerfect) stardust = Math.floor(stardust * 2);

    // Loot Generation
    const items = [];
    const count = isPerfect ? config.lootCount + 1 : config.lootCount;

    for (let i = 0; i < count; i++) {
        // Pick a random tier from possible tiers
        const tierKey = config.possibleTiers[Math.floor(Math.random() * config.possibleTiers.length)];
        const tierList = ELEMENT_TIERS[tierKey];

        // Pick a random element from the selected tier
        const itemId = tierList[Math.floor(Math.random() * tierList.length)];
        const rarity = tierKey === 'TIER_1' ? 'common' : 
                      tierKey === 'TIER_2' ? 'uncommon' : 
                      tierKey === 'TIER_3' ? 'rare' : 'legendary';

        // Check if item already in loot list, increment quantity instead of adding duplicate
        const existing = items.find(item => item.id === itemId);
        if (existing) {
            existing.qty += 1;
        } else {
            items.push({ id: itemId, qty: 1, rarity });
        }
    }

    return { xp, stardust, items, isPerfect };
};
