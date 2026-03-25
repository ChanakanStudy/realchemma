// ==========================================
// 🧪 ALCHEMY DATABASE & LOGIC
// ==========================================
export const ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen', color: '#3b82f6', rune: '💧' },
  { symbol: 'O', name: 'Oxygen', color: '#10b981', rune: '🌪️' },
  { symbol: 'Na', name: 'Sodium', color: '#eab308', rune: '⚡' },
  { symbol: 'Cl', name: 'Chlorine', color: '#84cc16', rune: '☣️' },
  { symbol: 'C', name: 'Carbon', color: '#64748b', rune: '🌑' }
];

export const RECIPES = [
  { id: 'H2O', name: 'Aqua Vitae (H2O)', formula: { H: 2, O: 1 }, damage: 30, status: 'Wet', color: '#60a5fa' },
  { id: 'HCl', name: 'Acid Flask (HCl)', formula: { H: 1, Cl: 1 }, damage: 80, status: 'Corroded', color: '#4ade80' },
  { id: 'NaCl', name: 'Crystal Salt (NaCl)', formula: { Na: 1, Cl: 1 }, damage: 50, status: 'Crystalized', color: '#fef08a' },
  { id: 'NaOH', name: 'Caustic Brew (NaOH)', formula: { Na: 1, O: 1, H: 1 }, damage: 100, status: 'Burn', color: '#c084fc' },
  { id: 'CO2', name: 'Choking Smog (CO2)', formula: { C: 1, O: 2 }, damage: 20, status: 'Suffocated', color: '#94a3b8' }
];

export const ULTIMATES = [
  { 
    id: 'zero', name: 'ABSOLUTE ZERO', req: ['Wet', 'Suffocated'], 
    dmg: 1500, color: '#22d3ee', bgTheme: 'bg-cyan-950', fx: 'iceShatter', desc: 'Shatter targets frozen at atomic level.' 
  },
  { 
    id: 'hellfire', name: 'HELLFIRE ANNIHILATION', req: ['Burn', 'Corroded'], 
    dmg: 2000, color: '#ef4444', bgTheme: 'bg-red-950', fx: 'fireRise', desc: 'Ignite catalyzed elements for massive burst.' 
  },
  { 
    id: 'nuke', name: 'PHILOSOPHER\'S NUKE', req: ['Wet', 'Corroded', 'Crystalized'], 
    dmg: 3500, color: '#ffffff', bgTheme: 'bg-white', fx: 'whiteout', desc: 'Total matter erasure protocol.' 
  }
];

// 👹 BOSS DATABASE (ระบบรองรับบอสหลายตัว)
export const BOSS_DATABASE = {
  homunculus: {
    id: 'homunculus',
    name: 'HOMUNCULUS OMEGA',
    desc: 'สิ่งมีชีวิตทดลองที่ผิดพลาด พลังโจมตีสมดุล',
    maxHp: 3500,
    baseAtk: [40, 70],
    enrageThreshold: 0.5, // โกรธเมื่อเลือดต่ำกว่า 50%
    colorTheme: 'text-rose-500',
    coreFill: '#dc2626',
    auraColor: 'bg-red-600',
    svgPaths: [
      { d: "M10,2 h12 v4 h4 v16 h-4 v4 h-12 v-4 h-4 v-16 h4 z", fill: "#450a0a" },
      { d: "M12,6 h8 v2 h4 v12 h-4 v2 h-8 v-2 h-4 v-12 h4 z", fill: "#991b1b" }
    ]
  },
  crystal_golem: {
    id: 'crystal_golem',
    name: 'CRYSTAL GOLEM',
    desc: 'โกเลมผลึกแร่ ถึกทนทานแต่เชื่องช้า',
    maxHp: 5500,
    baseAtk: [20, 50],
    enrageThreshold: 0.3, // โกรธเมื่อเลือดต่ำกว่า 30%
    colorTheme: 'text-cyan-400',
    coreFill: '#06b6d4',
    auraColor: 'bg-cyan-600',
    svgPaths: [
      { d: "M8,6 h16 v20 h-16 z", fill: "#083344" },
      { d: "M10,8 h12 v16 h-12 z", fill: "#0e7490" },
      { d: "M4,10 h4 v12 h-4 z", fill: "#164e63" },
      { d: "M24,10 h4 v12 h-4 z", fill: "#164e63" }
    ]
  },
  toxic_spore: {
    id: 'toxic_spore',
    name: 'MUTATED SPORE',
    desc: 'สปอร์กลายพันธุ์ โจมตีรุนแรงและฉกฉวยโอกาส',
    maxHp: 2800,
    baseAtk: [60, 90], // ตีแรงมาก
    enrageThreshold: 0.6, // โกรธเร็วมาก
    colorTheme: 'text-purple-500',
    coreFill: '#9333ea',
    auraColor: 'bg-purple-600',
    svgPaths: [
      { d: "M6,14 h20 v8 h-20 z", fill: "#2e1065" },
      { d: "M8,10 h16 v4 h-16 z", fill: "#4c1d95" },
      { d: "M12,6 h8 v4 h-8 z", fill: "#581c87" }
    ]
  }
};

export const MAX_TIME = 30;
export const MAX_PLAYER_HP = 300;

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

export function calculateQTEResult(progress, isOvercharge) {
  if (isOvercharge) {
    if (progress >= 47 && progress <= 53) return { result: 'PERFECT', mult: 2.2, color: '#10b981' };
    if (progress >= 35 && progress <= 65) return { result: 'GOOD', mult: 1.7, color: '#eab308' };
    return { result: 'MISS', mult: 0.5, color: '#ef4444' };
  } else {
    if (progress >= 45 && progress <= 55) return { result: 'PERFECT', mult: 1.5, color: '#10b981' };
    if (progress >= 30 && progress <= 70) return { result: 'GOOD', mult: 1.0, color: '#eab308' };
    return { result: 'MISS', mult: 0.5, color: '#ef4444' };
  }
}