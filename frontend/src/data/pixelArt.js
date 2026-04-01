/**
 * pixelArt.js
 * Definitions for color palettes and pixel art arrays
 * used out-of-the-box by Phaser to dynamically generate textures.
 */

// P: Color Palette mapping characters to hex colors
export const PALETTE = {
    '0': null, 
    'k': '#2A0845', 'K': '#212121', 'w': '#FFFFFF', 'g': '#9E9E9E', 'G': '#424242', 
    's': '#FFCCBC', 'h': '#795548', 'c': '#FAFAFA', 'C': '#BDBDBD', 
    'p': '#3F51B5', 'b': '#3E2723', 'o': '#00BCD4', 'O': '#006064',
    'U': '#4A148C', 'y': '#FFFF00', 'r': '#FF5252', 'R': '#D32F2F', 'Z': '#000000',
    '1': '#4CAF50', '2': '#2E7D32', '3': '#81C784', '4': '#29B6F6', '5': '#0277BD',
    '6': '#81D4FA', '7': '#8D6E63', '8': '#5D4037', '9': '#BCAAA4', 'A': '#212121',
    'B': '#1B5E20', 'D': '#3E2723', 'E': '#795548', 'F': '#A1887F',
    'f': '#FF69B4', 'L': '#FFD700', 'n': '#66BB6A', 'm': '#43A047', 'q': '#1565C0',
    'i': '#E8F5E9', 'j': '#C8E6C9'
};

// ArtData: Pixel art representations for game objects
export const ART_DATA = {
    player_d1: [ // Front Idle
        "000000KKKK000000",
        "00000KhhhhK00000",
        "0000KhhhhhhK0000",
        "000KssssssssK000",
        "000KsKooKooKsK00",
        "000KsKooKooKsK00",
        "000KssssssssK000",
        "0000KssZZssK0000",
        "00000KssssK00000",
        "0000KKwwwwKK0000",
        "000KppppppppK000",
        "000KppKppKppK000",
        "000KppppppppK000",
        "0000KppKKppK0000",
        "0000KkkKKkkK0000",
        "0000KKK00KKK0000"
    ],
    player_d2: [ // Front Walk Left foot
        "000000KKKK000000",
        "00000KhhhhK00000",
        "0000KhhhhhhK0000",
        "000KssssssssK000",
        "000KsKooKooKsK00",
        "000KsKooKooKsK00",
        "000KssssssssK000",
        "0000KssZZssK0000",
        "00000KssssK00000",
        "0000KKwwwwKK0000",
        "000KppppppppK000",
        "000KppKppKppK000",
        "000KppppppppK000",
        "000KKppK0KppK000",
        "000KkkK00KkkK000",
        "00KKK0000KKK0000"
    ],
    player_d3: [ // Front Walk Right foot
        "000000KKKK000000",
        "00000KhhhhK00000",
        "0000KhhhhhhK0000",
        "000KssssssssK000",
        "000KsKooKooKsK00",
        "000KsKooKooKsK00",
        "000KssssssssK000",
        "0000KssZZssK0000",
        "00000KssssK00000",
        "0000KKwwwwKK0000",
        "000KppppppppK000",
        "000KppKppKppK000",
        "000KppppppppK000",
        "000KppK0KppKK000",
        "000KkkK00KkkK000",
        "0000KKK0000KKK00"
    ],
    player_l1: [ // Left Idle
        "000000KKKK000000",
        "00000KhhhhK00000",
        "0000KhhhhhK00000",
        "000KhssssK000000",
        "000KsKooKK000000",
        "000KsKooKK000000",
        "000KssssK0000000",
        "0000KsZsK0000000",
        "00000KssK0000000",
        "0000KKwwKK000000",
        "000KppppppK00000",
        "000KppKppK000000",
        "000KppppppK00000",
        "0000KppKppK00000",
        "0000KkkKkkK00000",
        "0000KKK0KKK00000"
    ],
    player_l2: [ // Left Walk
        "000000KKKK000000",
        "00000KhhhhK00000",
        "0000KhhhhhK00000",
        "000KhssssK000000",
        "000KsKooKK000000",
        "000KsKooKK000000",
        "000KssssK0000000",
        "0000KsZsK0000000",
        "00000KssK0000000",
        "0000KKwwKK000000",
        "000KppppppK00000",
        "000KppKppK000000",
        "000KppppK0000000",
        "000KppK0K0000000",
        "00KkkK00K0000000",
        "00KKK000K0000000"
    ],
    player_r1: [ // Right Idle
        "000000KKKK000000",
        "00000KhhhhK00000",
        "00000KhhhhhK0000",
        "000000KsssshK000",
        "000000KKooKsK000",
        "000000KKooKsK000",
        "0000000KssssK000",
        "0000000KsZsK0000",
        "0000000KssK00000",
        "000000KKwwKK0000",
        "00000KppppppK000",
        "000000KppKppK000",
        "00000KppppppK000",
        "00000KppKppK0000",
        "00000KkkKkkK0000",
        "00000KKK0KKK0000"
    ],
    player_r2: [ // Right Walk
        "000000KKKK000000",
        "00000KhhhhK00000",
        "00000KhhhhhK0000",
        "000000KsssshK000",
        "000000KKooKsK000",
        "000000KKooKsK000",
        "0000000KssssK000",
        "0000000KsZsK0000",
        "0000000KssK00000",
        "000000KKwwKK0000",
        "00000KppppppK000",
        "000000KppKppK000",
        "0000000KppppK000",
        "0000000K0KppK000",
        "0000000K00KkkK00",
        "0000000K000KKK00"
    ],
    player_u1: [ // Back Idle
        "000000KKKK000000",
        "00000KhhhhK00000",
        "0000KhhhhhhK0000",
        "000KhhhhhhhhK000",
        "000KhhhhhhhhK000",
        "000KhhhhhhhhK000",
        "0000KhhhhhhK0000",
        "00000KhhhhK00000",
        "0000KKwwwwKK0000",
        "000KppppppppK000",
        "000KppKppKppK000",
        "000KppppppppK000",
        "000KppppppppK000",
        "0000KppKKppK0000",
        "0000KkkKKkkK0000",
        "0000KKK00KKK0000"
    ],
    player_u2: [ // Back Walk Left
        "000000KKKK000000",
        "00000KhhhhK00000",
        "0000KhhhhhhK0000",
        "000KhhhhhhhhK000",
        "000KhhhhhhhhK000",
        "000KhhhhhhhhK000",
        "0000KhhhhhhK0000",
        "00000KhhhhK00000",
        "0000KKwwwwKK0000",
        "000KppppppppK000",
        "000KppKppKppK000",
        "000KppppppppK000",
        "000KppppppppK000",
        "000KKppK0KppK000",
        "000KkkK00KkkK000",
        "00KKK0000KKK0000"
    ],
    player_u3: [ // Back Walk Right
        "000000KKKK000000",
        "00000KhhhhK00000",
        "0000KhhhhhhK0000",
        "000KhhhhhhhhK000",
        "000KhhhhhhhhK000",
        "000KhhhhhhhhK000",
        "0000KhhhhhhK0000",
        "00000KhhhhK00000",
        "0000KKwwwwKK0000",
        "000KppppppppK000",
        "000KppKppKppK000",
        "000KppppppppK000",
        "000KppppppppK000",
        "000KppK0KppKK000",
        "000KkkK00KkkK000",
        "0000KKK0000KKK00"
    ],
    npc_spark: [
        "0000000KK0000000", "000000KUUK000000", "00000KUUUUK00000", "0000KpUUUUpK0000",
        "0000KpUUUUpK0000", "000KpUUUUUUpK000", "00KKKKKKKKKKKK00", "00000KyyyyK00000",
        "0000KKwwwwKK0000", "000KUUKwwKUUK000", "00KUUUKwwKUUUK00", "000KUUUwwUUUK000",
        "0000KUUUUUUK0000", "0000KUUUUUUK0000", "0000KCCCCCCK0000", "00000KKKKKK00000"
    ],
    quest_giver: [
        "000000KKKK000000", "00000KccccK00000", "0000KccccccK0000", "000KcKyyKyyKc000",
        "000KccccccccK000", "0000KccccccK0000", "0000KKKKKKKK0000", "000KLLKccKLLK000",
        "00KLLLLLLLLLLK00", "000KLLLLLLLLK000", "000KLLLcLLLLK000", "000KLLccccLLK000",
        "0000KccccccK0000", "0000KcK00KcK0000", "0000KkkKKkkK0000", "0000KKK00KKK0000"
    ],
    battle_master: [
        "000000KKKK000000", "00000KggggK00000", "0000KggggggK0000", "000KgKgZgZgK0000",
        "000KggZgZggK0000", "0000KgggggK00000", "0000KKKKKKK00000", "000KRRKgkKRRK000",
        "00KRRRRRRRRRRK00", "000KRRRRRRRRK000", "000KRRRgRRRRK000", "000KRRgggRRRK000",
        "0000KggggggK0000", "0000KgK00KgK0000", "0000KkkKKkkK0000", "0000KKK00KKK0000"
    ],
    professor: [
        "000000KKKK000000",
        "00000KhhhhK00000",
        "0000KhhhhhhK0000",
        "000KssssssssK000",
        "000KsKwwKwwKsK00", // Glasses
        "000KsKw0Kw0KsK00", 
        "000KssssssssK000",
        "0000KssZZssK0000",
        "00000KssssK00000",
        "0000KKwwwwKK0000", // White Lab Coat
        "000KwwwwwwwwK000",
        "000KwwKppKwwK000",
        "000KwwwwwwwwK000",
        "0000KppKKppK0000",
        "0000KkkKKkkK0000",
        "0000KKK00KKK0000"
    ],
    crystal: [
        "0000440000", "0004444000", "0044444400", "0444444440", "0044444400", "0004444000", "0000440000"
    ],
    tree: [
        "00000B0000",
        "000BB2BB00",
        "00B22121B0",
        "0B1111111B",
        "0000DD0000",
        "0000DD0000"
    ],
    crop: [
        "00000000", "000gG000", "00ggGG00", "00GGgg00", "000Gg000", "00000000"
    ],
    t_grass: [
        "1111311111111111", "11132n1111111111", "1311121111311111", "1112111111n11111",
        "11111111131f1111", "1131111121111111", "111211111113j211", "11111f1111111111",
        "1111321111111111", "1111121111131111", "11111111111121n1", "1132111111111111",
        "1112n11131111111", "1111111112111111", "3111111111111f11", "2111111111111111"
    ],
    t_grass2: [
        "111111111111m111", "1111111111111111", "11f11111113n1111", "1111111111211111",
        "1111311111111111", "1n11211111111f11", "1111111111131111", "1111111111121111",
        "1111111f11111111", "111311111111m111", "1112111111111111", "11111111111n1111",
        "1111111131111111", "11n1111121111111", "1111111111113111", "1111f11111112111"
    ],
    t_dirt: [
        "7777777777777777", "7877977777799777", "7777797777777777", "7777787777777787",
        "7777777979777777", "7777999777777797", "7777877777977787", "7977777777777777",
        "7877777777997777", "7777797777777977", "7777777787777777", "7779997777777877",
        "7777877779777777", "7777777777977777", "7797777777877777", "7777778777777977"
    ],
    t_water: [
        "4444444444444444", "4444666644444444", "4444q55444444444", "4444444444444444",
        "4444444444666644", "44444444444q5444", "4444444444444444", "446666q444444444",
        "44q5544444444444", "4444444444444444", "44444444q6666444", "4444444444q54444",
        "4444444444444444", "444446666q444444", "444444q544444444", "4444444444444444"
    ],
    t_crop: [
        "8888888888888888", "8877777777777788", "8777777777777778", "8777777777777778",
        "8777m79m77m77778", "8778777777778778", "8777777777777778", "88000n31n0000088",
        "87777n112n777778", "87787n12n7778778", "8777777777777778", "877m797m78m77778",
        "8787777777777788", "8877777777777788", "8888888888888888", "8888888888888888"
    ],
    t_fence: [
        "111111E111111111", "000000E000000000", "000000E000000000", "DEEEEDEEEDEEEEDD",
        "788887E888888877", "000000E000000000", "000000E000000000", "000000E000000000",
        "DEEEEDEEEDEEEEDD", "788887E888888877", "000000E000000000", "000000E000000000",
        "000000E000000000", "000000E000000000", "111111E111111111", "111321E111131111"
    ],
    t_pine_tree: [ // Huge 22x32 Hand-Crafted Tree Array
        "0000000000B00000000000",
        "000000000BBB0000000000",
        "00000000BBBBB000000000",
        "0000000BBBB3B000000000",
        "000000BCBBBBBC00000000",
        "00000BBBBBB33BB0000000",
        "0000BBCBBBBBBBC0000000",
        "000BBBBBB3B33BBB000000",
        "00BBCBBBBBBBBBBBC00000",
        "0BBBBBBBB33BB33BBB0000",
        "BBBBBBBBBBBBBBBBBBBB00",
        "BCBBBCBBBCBBBCBBBCBB00",
        "0000000BBBBB0000000000",
        "000000BBBBB3BB00000000",
        "00000BBCBBBBBBC0000000",
        "0000BBBBBBBBB3BBB00000",
        "000BBBBCBBBBBBBBBC0000",
        "00BBBBB3B33BBBBBBBB000",
        "0BBBCBBBBBBBBBBBBCBB00",
        "BBBBBBBB3333BBBBBBBB00",
        "BBBBBBBBCBBBBBBBBCBB00",
        "BCBBBCBBBCBBBCBBBCBB00",
        "0000000000D00000000000",
        "0000000000D00000000000",
        "000000000DD00000000000",
        "000000000DF00000000000",
        "000000000DDF0000000000",
        "000000000D0F0000000000",
        "000000000F0F0000000000",
        "00000000FFF00000000000"
    ],
    lab_table: [
        "0000000000000000",
        "0000000000000000",
        "00yyyy0000000000", // Beaker with yellow liquid
        "00yyyy00000rr000", // Beaker + Burner (red)
        "00yyyy00000rr000",
        "00000000000rr000",
        "CCCCCCCCCCCCCCCC", // Table Surface
        "CCkkcccccccckkCC",
        "CkkkkkkkkkkkkkkC",
        "CkkkkkkkkkkkkkkC",
        "CCkkkkkkkkkkkkCC",
        "0CkkkkkkkkkkkkC0",
        "0Ckk00000000kkC0",
        "0Ckk00000000kkC0",
        "0Ckk00000000kkC0",
        "0CCK00000000KCC0"
    ],
    lab_shelf: [
        "CCCCCCCCCCCCCCCC",
        "Crr00yy00000000C", // Flasks on top
        "Crr00yy000ff000C",
        "Crr00yy000ff000C",
        "C000000000ff000C",
        "CCCCCCCCCCCCCCCC", // Shelf 1
        "C000pp000000000C",
        "C000pp000qqqq00C",
        "C000pp000qqqq00C",
        "C000pp000qqqq00C",
        "CCCCCCCCCCCCCCCC", // Shelf 2
        "Cnn000000000000C",
        "Cnn0000kkkkkk00C",
        "Cnn0000kkkkkk00C",
        "Cnn0000kkkkkk00C",
        "CCCCCCCCCCCCCCCC"  // Bottom
    ],
    t_lab_floor: [
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "wwwwwwwwwwwwwwcw",
        "cccccccccccccccc",
        "wwwwwwwwwwwwwwcw"
    ],
    lab_wall: [
        "CCCCCCCCCCCCCCCC",
        "CooooooooooooooC", // Cyan LED strip
        "CooooooooooooooC",
        "CCCCCCCCCCCCCCCC",
        "CGGGGGGGGGGGGGGC",
        "CGGGGGGGGGGGGGGC",
        "CGGGGGGGGGGGGGGC",
        "CCCCCCCCCCCCCCCC",
        "CGGGGGGGGGGGGGGC",
        "CGGGGGGGGGGGGGGC",
        "CGGGGGGGGGGGGGGC",
        "CCCCCCCCCCCCCCCC",
        "CGGGGGGGGGGGGGGC",
        "CGGGGGGGGGGGGGGC",
        "CGGGGGGGGGGGGGGC",
        "CCCCCCCCCCCCCCCC"
    ],
    lab_door: [
        "CCCCCCCCCCCCCCCC",
        "CCooooooooooooCC",
        "CooCCCCCCCCCCooC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC",
        "CoC0000000000CoC"
    ]
};
