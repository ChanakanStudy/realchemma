export const DB = {
    Player: {
        id: 1, username: "Alchemist_01", level: 1, exp: 0, hp: 100, maxHp: 100,
        x: 696, y: 840,
        elements: { 'H': 2, 'O': 1, 'Na': 1, 'Cl': 1, 'C': 0 },
        compounds: [], 
        deck: [],
        questState: 0, 
        questRoute: null 
    },
    
    Elements: {
        'H':  { id: 1, name: 'Hydrogen', symbol: 'H', power: 1, color: '#ffffff' },
        'O':  { id: 8, name: 'Oxygen', symbol: 'O', power: 8, color: '#88ccff' },
        'C':  { id: 6, name: 'Carbon', symbol: 'C', power: 6, color: '#aaaaaa' },
        'Na': { id: 11, name: 'Sodium', symbol: 'Na', power: 11, color: '#ffffaa' },
        'Cl': { id: 17, name: 'Chlorine', symbol: 'Cl', power: 17, color: '#aaffaa' },
        'S':  { id: 16, name: 'Sulfur', symbol: 'S', power: 16, color: '#fff59d' }
    },
    
    Compounds: {
        'H2O':   { id: 'c1', name: 'Water', formula: { 'H': 2, 'O': 1 }, effect_type: 'heal', effect_value: 40, tags: ['water'], desc: 'เวทแห่งน้ำ: ฟื้นฟู 40 HP' },
        'NaCl':  { id: 'c2', name: 'Salt', formula: { 'Na': 1, 'Cl': 1 }, effect_type: 'buff', effect_value: 20, tags: ['mineral'], desc: 'โล่ผลึกเกลือ: ป้องกัน 20 Dmg' },
        'CO2':   { id: 'c3', name: 'Carbon Dioxide', formula: { 'C': 1, 'O': 2 }, effect_type: 'attack', effect_value: 30, tags: ['gas'], desc: 'ศรหมอกควัน: โจมตี 30 Dmg' },
        'H2SO4': { id: 'c4', name: 'Sulfuric Acid', formula: { 'H': 2, 'S': 1, 'O': 4 }, effect_type: 'attack', effect_value: 80, tags: ['acid'], desc: 'ระเบิดกรดมรณะ: โจมตี 80 Dmg' }
    },
    
    MapLayout: [
        [7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7],
        [7,5,5,5,5,5,5,5,1,1,1,1,1,1,1,1,1,1,1,1,5,5,5,5,5,5,5,5,5,7],
        [7,5,5,5,5,5,5,5,1,0,0,0,0,0,0,0,0,0,0,1,5,5,5,5,5,5,5,5,5,7],
        [7,5,5,5,5,5,5,5,1,0,0,0,0,0,0,0,0,0,0,1,5,5,5,5,5,5,5,5,5,7],
        [7,5,5,5,5,5,5,5,1,1,1,1,1,1,3,1,1,1,1,1,5,5,5,5,5,5,5,5,5,7],
        [7,5,5,5,5,5,5,5,5,5,5,5,5,5,6,5,5,5,5,5,5,5,5,5,5,5,5,5,5,7],
        [7,5,1,1,1,1,1,1,1,5,5,5,5,5,6,5,5,5,5,5,1,1,1,1,1,1,1,1,1,7],
        [7,5,1,0,0,2,0,0,1,5,5,5,5,5,6,5,5,5,5,5,1,4,4,0,0,0,4,4,1,7],
        [7,5,1,0,0,0,0,0,1,5,5,8,5,5,6,5,5,8,5,5,1,0,0,0,0,0,0,0,1,7],
        [7,5,1,0,0,0,0,0,1,5,5,5,5,5,6,5,5,5,5,5,1,4,0,0,0,0,0,4,1,7],
        [7,5,1,1,1,6,1,1,1,5,5,5,5,5,6,5,5,5,5,5,1,1,1,1,6,1,1,1,1,7],
        [7,5,5,5,5,6,5,5,5,5,5,5,5,5,6,5,5,5,5,5,5,5,5,5,6,5,5,5,5,7],
        [7,5,5,5,5,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,5,5,5,5,7],
        [7,5,5,5,5,5,5,5,5,5,5,5,5,5,9,10,5,5,5,5,5,5,5,5,5,5,5,5,5,7], 
        [7,5,8,5,5,5,5,5,5,5,5,5,5,5,6,5,5,5,5,5,5,5,5,5,5,5,8,5,5,7],
        [7,7,7,7,7,7,7,7,7,7,7,7,7,6,6,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7]
    ]
};

export const P = {
    '0': null, '1': '#2A0845', '2': '#4A148C', '3': '#7B1FA2', '4': '#9C27B0',
    '5': '#CE93D8', '6': '#E1BEE7', '7': '#FFFFFF', 
    'r': '#FF1744', 'R': '#D50000', 'g': '#00E676', 'G': '#00C853',
    'b': '#00B0FF', 'B': '#0091EA', 'y': '#FFEA00', 'Y': '#FFD600',
    'w': '#FF9100', 'W': '#FF6D00', 's': '#FFCCBC', 'S': '#FFAB91',
    'f': '#F50057', 'F': '#C51162', 'h': '#FFFF00', 'p': '#E040FB',
    'P': '#D500F9', 'e': '#00E5FF', 'k': '#311B92', 'c': '#FF4081',
    'i': '#B388FF', 'j': '#7C4DFF', 'l': '#651FFF', 'm': '#FFF9C4',
    'n': '#FFF59D', 'o': '#00E5FF', 'q': '#00B8D4', 'v': '#B2FF59',
    'V': '#76FF03', 'x': '#FF00FF'
};

export const ArtData = {
    player_d1: [
        "0000kkkkkk0000", "000khhhhhhk000", "00khhhhhhhhk00", "00khhsssshhk00", "0khhsssssshhk0",
        "0kssessssessk0", "0kscsssssscsk0", "00kssssssssk00", "000kkkkkkkk000", "00kppppppppk00",
        "0kpppprrppppk0", "0kpPpprrppPpk0", "0ksPppppppPsk0", "00kkppppppkk00", "000kWWkkWWk000", "000kkk00kkk000"
    ],
    npc_spark: [
        "0000kkkkkk0000", "000khhhhhhk000", "00khhbbbbhhk00", "00khhbssbhhk00", "0khhsssssshhk0",
        "0kssessssessk0", "0kscsssssscsk0", "00kssssssssk00", "000kkkkkkkk000", "00kvvvvvvvvk00",
        "0kvvvvvvvvvvk0", "0kvvvvvvvvvvk0"
    ],
    battle_master: [
        "0000kkkkkk0000", "000kRRRRRRk000", "00kRRRRRRRRk00", "00kRRssssRRk00", "0kRRssssssRRk0",
        "0kssessssessk0", "0kscsssssscsk0", "00kssssssssk00", "000kkkkkkkk000", "00kRRRRRRRRk00",
        "0kRRRRRRRRRRk0", "0kRRRRRRRRRRk0"
    ],
    crystal: [
        "0000ee0000", "000eeee000", "00eeeeee00", "0eeeeeeee0", "00eeeeee00", "000eeee000", "0000ee0000"
    ]
};
