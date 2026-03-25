/**
 * elements.js
 * Database of elements and compounds available in the game.
 */

export const DB_ELEMENTS = {
    'H':  { id: 1, name: 'Hydrogen', symbol: 'H', power: 1, color: '#ffffff' },
    'O':  { id: 8, name: 'Oxygen', symbol: 'O', power: 8, color: '#88ccff' },
    'C':  { id: 6, name: 'Carbon', symbol: 'C', power: 6, color: '#aaaaaa' },
    'Na': { id: 11, name: 'Sodium', symbol: 'Na', power: 11, color: '#ffffaa' },
    'Cl': { id: 17, name: 'Chlorine', symbol: 'Cl', power: 17, color: '#aaffaa' },
    'S':  { id: 16, name: 'Sulfur', symbol: 'S', power: 16, color: '#fff59d' }
};

export const DB_COMPOUNDS = {
    'H2O':   { id: 'c1', name: 'Water', formula: { 'H': 2, 'O': 1 }, effect_type: 'heal', effect_value: 40, tags: ['water'], desc: 'เวทแห่งน้ำ: ฟื้นฟู 40 HP' },
    'NaCl':  { id: 'c2', name: 'Salt', formula: { 'Na': 1, 'Cl': 1 }, effect_type: 'buff', effect_value: 20, tags: ['mineral'], desc: 'โล่ผลึกเกลือ: ป้องกัน 20 Dmg' },
    'CO2':   { id: 'c3', name: 'Carbon Dioxide', formula: { 'C': 1, 'O': 2 }, effect_type: 'attack', effect_value: 30, tags: ['gas'], desc: 'ศรหมอกควัน: โจมตี 30 Dmg' },
    'H2SO4': { id: 'c4', name: 'Sulfuric Acid', formula: { 'H': 2, 'S': 1, 'O': 4 }, effect_type: 'attack', effect_value: 80, tags: ['acid'], desc: 'ระเบิดกรดมรณะ: โจมตี 80 Dmg' }
};
