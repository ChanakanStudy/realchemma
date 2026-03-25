import Phaser from 'phaser';
import { PLAYER_DEFAULTS } from '../../data/playerData';
import { DB_ELEMENTS } from '../../data/elements';
import { ART_DATA, PALETTE } from '../../data/pixelArt';
import { MAP_LAYOUT } from '../../data/mapLayout';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';

export default class WorldScene extends Phaser.Scene {
    constructor() { super('ChemmaScene'); }

    preload() {
        // Nothing to load — all textures are generated programmatically in create()
    }

    create() {
        // CRITICAL: Generate all textures FIRST before any sprites reference them
        // This MUST be in create(), NOT preload() — Phaser's loader can clear
        // canvas textures created during preload when the load phase completes,
        // causing intermittent "invisible sprite" bugs.
        this.generateAllTextures();

        window.pScene = this;
        this.tileSize = 48;
        this.facing = 'down';
        
        this.cameras.main.setBackgroundColor('#388E3C');

        const terrainData = MAP_LAYOUT.map(row => [...row]);
        this.trees = this.physics.add.staticGroup();
        this.walls = this.physics.add.staticGroup(); 
        this.npcs = this.physics.add.staticGroup(); // Group for NPCs

        const mapWidth = 40 * this.tileSize;
        const mapHeight = 25 * this.tileSize;

        // Render the entire map from config arrays
        for (let r = 0; r < terrainData.length; r++) {
            for (let c = 0; c < terrainData[r].length; c++) {
                const cell = terrainData[r][c];
                const x = c * this.tileSize + this.tileSize / 2;
                const y = r * this.tileSize + this.tileSize / 2;

                // Base ground layer — alternate grass variants for visual richness
                if (cell !== 4 && cell !== 0 && cell !== 1) {
                    const grassKey = ((r + c) % 3 === 0) ? 't_grass2' : 't_grass';
                    this.add.sprite(x, y, grassKey).setScale(3).setDepth(0);
                }

                if (cell === 0) { // Building
                    this.add.rectangle(x, y, this.tileSize, this.tileSize, 0x37474F).setDepth(0);
                } else if (cell === 1) { // House
                    this.add.rectangle(x, y, this.tileSize, this.tileSize, 0x546E7A).setDepth(1);
                    // Roof stripe
                    this.add.rectangle(x, y - 12, this.tileSize, 8, 0x8D6E63).setDepth(2);
                    this.walls.create(x, y, null).setSize(this.tileSize, this.tileSize).setVisible(false);
                } else if (cell === 4) { // Water
                    const water = this.add.sprite(x, y, 't_water').setScale(3).setDepth(0);
                    // Animate water shimmer
                    this.tweens.add({
                        targets: water,
                        alpha: { from: 0.85, to: 1.0 },
                        duration: 1500 + Math.random() * 500,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut',
                        delay: Math.random() * 800
                    });
                    this.walls.create(x, y, null).setSize(this.tileSize, this.tileSize).setVisible(false);
                } else if (cell === 5) { // Path (ground only)
                    // Already has grass base, no overlay needed
                } else if (cell === 6) { // Dirt Path
                    this.add.sprite(x, y, 't_dirt').setScale(3).setDepth(1);
                } else if (cell === 7) { // Fences
                    this.add.sprite(x, y, 't_fence').setScale(3).setDepth(y);
                    this.walls.create(x, y, null).setSize(this.tileSize, this.tileSize).setVisible(false);
                } else if (cell === 8) { // Crystals
                    const cry = this.add.sprite(x, y - 10, 'crystal').setScale(3).setDepth(y + 5);
                    this.tweens.add({ targets: cry, y: y - 22, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                } else if (cell === 9) { // Oracle NPC
                    const spark = this.physics.add.sprite(x, y, 'npc_spark').setScale(3).setDepth(y);
                    spark.body.setSize(12, 10).setOffset(2, 6);
                    spark.setImmovable(true);
                    spark.npcId = 'oracle'; // Custom property for identification
                    this.npcs.add(spark);
                    // Idle floating glow
                    this.tweens.add({ targets: spark, y: y - 4, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                } else if (cell === 10) { // Battle Master NPC
                    const master = this.physics.add.sprite(x, y, 'battle_master').setScale(3).setDepth(y);
                    master.body.setSize(12, 10).setOffset(2, 6);
                    master.setImmovable(true);
                    master.npcId = 'battle_master'; // Custom property for identification
                    this.npcs.add(master);
                } else if (cell === 12) { // Pine Tree
                    const tree = this.trees.create(x, y - 48, 't_pine_tree').setScale(5);
                    tree.setSize(20, 20).setOffset(11, 26);
                    tree.setDepth(y + 30);
                } else if (cell === 13) { // Crop Field
                    this.add.sprite(x, y, 't_crop').setScale(3).setDepth(0);
                }
            }
        }
        
        // Player
        this.player = this.physics.add.sprite(20 * this.tileSize, 22 * this.tileSize, 'player_d1').setScale(3);
        this.player.body.setSize(10, 8).setOffset(3, 8);
        this.player.isTalking = false; // Custom flag to prevent movement during interaction
        
        // Physics Boundaries
        this.physics.world.setBounds(0, 0, mapWidth, mapHeight);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.walls); 
        this.physics.add.collider(this.player, this.trees); 
        this.physics.add.collider(this.player, this.npcs);

        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
        this.cameras.main.setZoom(1.0);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,F');

        // Animation definitions — higher frame rate for smoother walking
        this.anims.create({ key: 'walk-down',  frames: [{ key: 'player_d2' }, { key: 'player_d1' }, { key: 'player_d3' }, { key: 'player_d1' }], frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-up',    frames: [{ key: 'player_u2' }, { key: 'player_u1' }, { key: 'player_u3' }, { key: 'player_u1' }], frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-left',  frames: [{ key: 'player_l2' }, { key: 'player_l1' }, { key: 'player_l2' }, { key: 'player_l1' }], frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'walk-right', frames: [{ key: 'player_r2' }, { key: 'player_r1' }, { key: 'player_r2' }, { key: 'player_r1' }], frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'idle-down',  frames: [{ key: 'player_d1' }], frameRate: 1 });
        this.anims.create({ key: 'idle-up',    frames: [{ key: 'player_u1' }], frameRate: 1 });
        this.anims.create({ key: 'idle-left',  frames: [{ key: 'player_l1' }], frameRate: 1 });
        this.anims.create({ key: 'idle-right', frames: [{ key: 'player_r1' }], frameRate: 1 });
        
        this.input.keyboard.removeCapture('W,A,S,D,F,UP,DOWN,LEFT,RIGHT,SPACE');

        this.fPrompt = this.add.text(0, 0, 'กด [F] เพื่อโต้ตอบ', {
            fontSize: '14px', fill: '#FFD700',
            backgroundColor: '#000000cc', padding: { x: 8, y: 4 },
            fontFamily: 'VT323'
        }).setOrigin(0.5).setVisible(false).setDepth(100);

        console.log('[CHEMMA] Scene created — player at', this.player.x, this.player.y);
    }

    addInteraction(obj, type) {
        obj.interactType = type;
    }

    update(time, delta) {
        if (window.inChat || window.gameState === 'BATTLE' || this.player.isTalking) {
            this.player.setVelocity(0, 0);
            return;
        }

        const speed = 180;
        let vx = 0;
        let vy = 0;
        let moving = false;

        // Gather input — allows diagonal movement!
        const left  = this.keys.A.isDown || this.cursors.left.isDown;
        const right = this.keys.D.isDown || this.cursors.right.isDown;
        const up    = this.keys.W.isDown || this.cursors.up.isDown;
        const down  = this.keys.S.isDown || this.cursors.down.isDown;

        if (left)  vx -= 1;
        if (right) vx += 1;
        if (up)    vy -= 1;
        if (down)  vy += 1;

        // Normalize diagonal speed (prevents faster speed at 45°)
        if (vx !== 0 && vy !== 0) {
            const diag = speed * 0.707; // ~1/√2
            vx *= diag;
            vy *= diag;
        } else {
            vx *= speed;
            vy *= speed;
        }

        this.player.setVelocity(vx, vy);

        // Determine facing direction & play animation
        if (vx !== 0 || vy !== 0) {
            moving = true;
            // Pick dominant direction for animation
            if (Math.abs(vx) >= Math.abs(vy)) {
                this.facing = vx < 0 ? 'left' : 'right';
            } else {
                this.facing = vy < 0 ? 'up' : 'down';
            }
            this.player.anims.play(`walk-${this.facing}`, true);
        } else {
            this.player.anims.play(`idle-${this.facing}`, true);
        }
        this.player.facing = this.facing; // Store facing direction for interaction

        // Dynamic depth sorting — walk behind/in front of trees
        this.player.setDepth(this.player.y);

        // Reset interaction
        this.interactionTarget = null;
        this.fPrompt.setVisible(false);

        // Find nearest NPC
        let nearestNpc = null;
        let minDistance = 90; // Interaction range

        this.npcs.getChildren().forEach(npc => {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
            if (d < minDistance) {
                minDistance = d;
                nearestNpc = npc;
            }
        });

        if (nearestNpc) {
            this.interactionTarget = nearestNpc.npcId;
            this.fPrompt.setPosition(nearestNpc.x, nearestNpc.y - 50).setVisible(true);
        }

        // Handle interaction input
        if (Phaser.Input.Keyboard.JustDown(this.keys.F) && this.interactionTarget) {
            if (this.interactionTarget === 'oracle') {
                eventBus.emit(EVENTS.OPEN_CHAT);      
            } else if (this.interactionTarget === 'battle_master') {
                eventBus.emit(EVENTS.OPEN_NPC_POPUP, {
                npcId: 'battle_master',
                name: 'Battle Master',
                message: 'พร้อมจะพิสูจน์ฝีมือแล้วหรือยัง?',
                choices: [
                    { id: 'fight', label: 'สู้' },
                    { id: 'leave', label: 'ยังไม่สู้' }
                    ]
                });
            }
        }
    }

    generateAllTextures() {
        const keys = Object.keys(ART_DATA);
        console.log(`[CHEMMA] Generating ${keys.length} textures...`);
        for (const key of keys) {
            this.generateTexture(key, ART_DATA[key]);
        }
        console.log(`[CHEMMA] All ${keys.length} textures generated successfully.`);
    }

    generateTexture(key, data) {
        const h = data.length;
        const w = data[0].length;
        
        // Use Phaser's native Graphics API — the standard way to create textures
        const gfx = this.make.graphics({ add: false });
        
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const ch = data[y][x];
                if (ch !== '0' && PALETTE[ch]) {
                    gfx.fillStyle(parseInt(PALETTE[ch].slice(1), 16), 1);
                    gfx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        gfx.generateTexture(key, w, h);
        gfx.destroy();
    }
}
