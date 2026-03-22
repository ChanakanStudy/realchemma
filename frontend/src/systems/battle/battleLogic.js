export const ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen', color: '#3b82f6', rune: '💧' },
  { symbol: 'O', name: 'Oxygen', color: '#10b981', rune: '🌪️' },
  { symbol: 'Na', name: 'Sodium', color: '#eab308', rune: '⚡' },
  { symbol: 'Cl', name: 'Chlorine', color: '#84cc16', rune: '☣️' },
  { symbol: 'C', name: 'Carbon', color: '#64748b', rune: '🌑' },
];

export const RECIPES = [
  { id: 'H2O', name: 'Aqua Vitae (H2O)', formula: { H: 2, O: 1 }, damage: 30, status: 'Wet', color: '#60a5fa' },
  { id: 'HCl', name: 'Acid Flask (HCl)', formula: { H: 1, Cl: 1 }, damage: 80, status: 'Corroded', color: '#4ade80' },
  { id: 'NaCl', name: 'Crystal Salt (NaCl)', formula: { Na: 1, Cl: 1 }, damage: 50, status: 'Crystalized', color: '#fef08a' },
  { id: 'NaOH', name: 'Caustic Brew (NaOH)', formula: { Na: 1, O: 1, H: 1 }, damage: 100, status: 'Burned', color: '#c084fc' },
  { id: 'CO2', name: 'Choking Smog (CO2)', formula: { C: 1, O: 2 }, damage: 20, status: 'Suffocated', color: '#94a3b8' },
];

export const ULTIMATES = [
  {
    id: 'zero', name: 'ABSOLUTE ZERO', req: ['Wet', 'Suffocated'],
    dmg: 800, color: 'bg-cyan-500 text-black border-white', desc: 'Freeze the target to atomic standstill.',
  },
  {
    id: 'hellfire', name: 'HELLFIRE ANNIHILATION', req: ['Burned', 'Corroded'],
    dmg: 1000, color: 'bg-red-600 text-white border-yellow-400', desc: 'Ignite a chain reaction of pure agony.',
  },
  {
    id: 'nuke', name: "PHILOSOPHER'S NUKE", req: ['Wet', 'Corroded', 'Crystalized'],
    dmg: 9999, color: 'bg-white text-black border-black', desc: 'Erase matter from existence.',
  },
];

export const MAX_TIME = 30;
export const MAX_PLAYER_HP = 300;
export const MAX_MONSTER_HP = 1500;

export function matchRecipe(crucible) {
  if (crucible.length === 0) return null;
  const counts = crucible.reduce((acc, el) => { acc[el] = (acc[el] || 0) + 1; return acc; }, {});
  return RECIPES.find(recipe => {
    const formulaKeys = Object.keys(recipe.formula);
    const currentKeys = Object.keys(counts);
    if (formulaKeys.length !== currentKeys.length) return false;
    return formulaKeys.every(key => recipe.formula[key] === counts[key]);
  }) || null;
}

export function calculateQTEResult(progress) {
  if (progress >= 45 && progress <= 55) return { result: 'PERFECT', mult: 1.5 };
  if (progress >= 30 && progress <= 70) return { result: 'GOOD', mult: 1.0 };
  return { result: 'MISS', mult: 0.5 };
}
