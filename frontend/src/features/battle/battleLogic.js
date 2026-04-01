// ==========================================
// 🧪 ALCHEMY DATABASE & LOGIC
// ==========================================
export const ELEMENTS = [
  { symbol: 'H', name: 'Hydrogen', color: '#3b82f6', rune: '💧', desc: 'ธาตุที่เบาที่สุดในจักรวาล เป็นเชื้อเพลิงของดวงดาวและจุดเริ่มต้นของสสารทั้งหมด' },
  { symbol: 'O', name: 'Oxygen', color: '#10b981', rune: '🌪️', desc: 'แก๊สที่ว่องไวต่อการเกิดปฏิกิริยา จำเป็นอย่างยิ่งต่อการหายใจและการเผาไหม้' },
  { symbol: 'Na', name: 'Sodium', color: '#eab308', rune: '⚡', desc: 'โลหะที่ว่องไวต่อปฏิกิริยาสูงมาก สามารถทำปฏิกิริยารุนแรงจนระเบิดได้เมื่อสัมผัสกับน้ำ' },
  { symbol: 'Cl', name: 'Chlorine', color: '#84cc16', rune: '☣️', desc: 'แก๊สพิษสีเขียวอมเหลือง มีกลิ่นฉุน ใช้ในการฆ่าเชื้อโรคและผลิตเกลือแกง' },
  { symbol: 'C', name: 'Carbon', color: '#64748b', rune: '🌑', desc: 'ธาตุพื้นฐานของสิ่งมีชีวิต พบได้ทั้งในรูปของอัญมณีล้ำค่าอย่างเพชร และโครงสร้างของดีเอ็นเอ' },
  { symbol: 'N', name: 'Nitrogen', color: '#8b5cf6', rune: '💨', desc: 'ธาตุที่มีมากที่สุดในชั้นบรรยากาศโลก เป็นองค์ประกอบสำคัญของโปรตีนและปุ๋ย' },
  { symbol: 'S', name: 'Sulfur', color: '#f59e0b', rune: '🌋', desc: 'ธาตุสีเหลืองที่มีกลิ่นเป็นเอกลักษณ์ พบได้ในบริเวณภูเขาไฟ ใช้ในการทำดินปืนและยารักษาโรค' },
  { symbol: 'K', name: 'Potassium', color: '#ec4899', rune: '💥', desc: 'โลหะเนื้ออ่อนสีเงินที่ว่องไวต่อปฏิกิริยามาก จำเป็นต่อการทำงานของระบบประสาทและกล้ามเนื้อ' },
  { symbol: 'Fe', name: 'Iron', color: '#71717a', rune: '🛡️', desc: 'โลหะที่เป็นรากฐานของอารยธรรมมนุษย์ เป็นแกนกลางของโลกและอยู่ในเม็ดเลือดแดงของเรา' },
  { symbol: 'Ca', name: 'Calcium', color: '#d97706', rune: '🦴', desc: 'ธาตุสำคัญที่ทำให้กระดูกและฟันแข็งแรง และเป็นส่วนประกอบหลักของเปลือกหอยและหินปูน' }
];

export const RECIPES = [
  { id: 'H2O', name: 'Aqua Vitae (H2O)', formula: { H: 2, O: 1 }, damage: 30, status: 'Wet', color: '#60a5fa', desc: 'น้ำแห่งชีวิต มีสมบัติเป็นกลาง ล้างสถานะผิดปกติทางเคมีพื้นฐานได้' },
  { id: 'HCl', name: 'Acid Flask (HCl)', formula: { H: 1, Cl: 1 }, damage: 80, status: 'Corroded', color: '#4ade80', desc: 'กรดแก่ที่มีฤทธิ์กัดกร่อนสูง ระเหยง่ายและอันตรายต่อเนื้อเยื่อ' },
  { id: 'NaCl', name: 'Crystal Salt (NaCl)', formula: { Na: 1, Cl: 1 }, damage: 50, status: 'Crystalized', color: '#fef08a', desc: 'เกลือแกงใสบริสุทธิ์ ใช้ในการปรุงอาหารและรักษาความสมดุลของเหลวในร่างกาย' },
  { id: 'NaOH', name: 'Caustic Brew (NaOH)', formula: { Na: 1, O: 1, H: 1 }, damage: 100, status: 'Burn', color: '#c084fc', desc: 'โซดาไฟ มีฤทธิ์เป็นเบสแก่ กัดกร่อนรุนแรง มักใช้ในอุตสาหกรรมทำความสะอาด' },
  { id: 'CO2', name: 'Choking Smog (CO2)', formula: { C: 1, O: 2 }, damage: 20, status: 'Suffocated', color: '#94a3b8', desc: 'แก๊สไม่มีสีที่เกิดจากการหายใจและการเผาไหม้ หากเข้มข้นสูงจะทำให้ขาดอากาศหายใจ' },
  { id: 'NH3', name: 'Ammonia Gas (NH3)', formula: { N: 1, H: 3 }, damage: 40, status: 'Shock', color: '#c4b5fd', desc: 'แก๊สที่มีกลิ่นฉุนรุนแรง ใช้ในอุตสาหกรรมทำความเย็นและผลิตปุ๋ย' },
  { id: 'H2S', name: 'Rotten Egg Gas (H2S)', formula: { H: 2, S: 1 }, damage: 90, status: 'Toxin', color: '#fcd34d', desc: 'แก๊สที่มีกลิ่นเหม็นเน่าเหมือนไข่เน่า มีความเป็นพิษสูงและไวไฟ' },
  { id: 'Fe2O3', name: 'Rusted Iron (Fe2O3)', formula: { Fe: 2, O: 3 }, damage: 110, status: 'Crystalized', color: '#b45309', desc: 'รังแคของเหล็กหรือสนิม เกิดจากปฏิกิริยาระหว่างเหล็ก ออกซิเจน และความชื้น' },
  { id: 'KCl', name: 'Potassium Salt (KCl)', formula: { K: 1, Cl: 1 }, damage: 60, status: 'Marked', color: '#fbcfe8', desc: 'เกลือโพแทสเซียม ใช้ในทางการแพทย์เพื่อเพิ่มระดับโพแทสเซียมและในปุ๋ย' },
  { id: 'CH4', name: 'Methane Gas (CH4)', formula: { C: 1, H: 4 }, damage: 30, status: 'Flammable', color: '#d1d5db', desc: 'แก๊สชีวภาพที่ไวไฟสูงมาก เป็นส่วนประกอบหลักของแก๊สธรรมชาติ' },
  { id: 'CaO', name: 'Quicklime (CaO)', formula: { Ca: 1, O: 1 }, damage: 85, status: 'Burn', color: '#ffedd5', desc: 'ปูนขาว เมื่อสัมผัสน้ำจะคายความร้อนรุนแรง ใช้ในการปรับสภาพดินและฆ่าเชื้อ' },
];

export const ULTIMATES = [
  { 
    id: 'zero', name: 'ABSOLUTE ZERO', req: ['Wet', 'Suffocated'], 
    dmg: 1000000000, color: '#22d3ee', bgTheme: 'bg-cyan-950', fx: 'iceShatter', desc: 'Shatter targets frozen at atomic level.' 
  },
  { 
    id: 'hellfire', name: 'HELLFIRE ANNIHILATION', req: ['Burn', 'Corroded'], 
    dmg: 2000, color: '#ef4444', bgTheme: 'bg-red-950', fx: 'fireRise', desc: 'Ignite catalyzed elements for massive burst.' 
  },
  { 
    id: 'nuke', name: 'PHILOSOPHER\'S NUKE', req: ['Wet', 'Corroded', 'Crystalized'], 
    dmg: 3500, color: '#ffffff', bgTheme: 'bg-white', fx: 'whiteout', desc: 'Total matter erasure protocol.' 
  },
  { 
    id: 'thermobaric', name: 'THERMOBARIC IGNITION', req: ['Flammable', 'Burn'], 
    dmg: 2800, color: '#f97316', bgTheme: 'bg-orange-950', fx: 'fireRise', desc: 'Ignite methane gas for a devastating shockwave.' 
  },
  { 
    id: 'plague', name: 'NEUROTOXIC PLAGUE', req: ['Toxin', 'Shock'], 
    dmg: 2500, color: '#8b5cf6', bgTheme: 'bg-purple-950', fx: 'iceShatter', desc: 'Unleash a lethal cloud of heavy toxic compounds.' 
  },
  { 
    id: 'protocol_67', name: '67' ,req: ['Marked', 'Suffocated', 'Flammable', 'Toxin'], 
    dmg: 6767, color: '#10b981', bgTheme: 'bg-black', fx: 'glitchBlast', desc: '??? ERROR: UNAUTHORIZED REACTION ???' 
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