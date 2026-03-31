import Phaser from 'phaser';
import { MAP_LAYOUT } from '../../data/mapLayout';
import { PALETTE, ART_DATA } from '../../data/pixelArt';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';

export default class WorldScene extends Phaser.Scene {
    constructor() { super('ChemmaScene'); }

    preload() {
        // [PURE PROCEDURAL MODE] No external static images loaded.
    }

    create() {
        console.time('[CHEMMA] Scene Create');
        this.generateSmoothTextures();

        window.pScene = this;
        this.tileSize = 48;
        
        // 🌑 Original Dark RPG Background
        this.cameras.main.setBackgroundColor('#1a2130');

        const terrainData = MAP_LAYOUT.map(row => [...row]);
        this.trees = this.physics.add.staticGroup();
        this.walls = this.physics.add.staticGroup(); 
        this.npcs = this.physics.add.staticGroup();

        const mapWidth = 40 * this.tileSize;
        const mapHeight = 25 * this.tileSize;

        // Render the entire map from config arrays
        for (let r = 0; r < terrainData.length; r++) {
            for (let c = 0; c < terrainData[r].length; c++) {
                const cell = terrainData[r][c];
                const x = c * this.tileSize + this.tileSize / 2;
                const y = r * this.tileSize + this.tileSize / 2;

                if (cell !== 4 && cell !== 0 && cell !== 1 && cell !== 6) {
                    const grassKey = ((r + c) % 3 === 0) ? 't_grass2' : 't_grass';
                    this.add.sprite(x, y, grassKey).setDepth(0);
                }

                if (cell === 0) { // Building
                    this.add.sprite(x, y, 'building').setDepth(1);
                    this.walls.create(x, y, null).setSize(this.tileSize, this.tileSize).setVisible(false);
                } else if (cell === 1) { // House
                    this.add.sprite(x, y, 'house').setDepth(1);
                    this.walls.create(x, y, null).setSize(this.tileSize, this.tileSize).setVisible(false);
                } else if (cell === 4) { // Water
                    const water = this.add.sprite(x, y, 't_water').setDepth(0);
                    this.tweens.add({
                        targets: water,
                        alpha: { from: 0.8, to: 1.0 },
                        duration: 2000 + Math.random() * 1000,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                    this.walls.create(x, y, null).setSize(this.tileSize, this.tileSize).setVisible(false);
                } else if (cell === 5) { // Path
                    // base grass is enough
                } else if (cell === 6) { // Dirt Path
                    this.add.sprite(x, y, 't_dirt').setDepth(1);
                } else if (cell === 7) { // Fences
                    this.add.sprite(x, y, 't_fence').setDepth(y);
                    this.walls.create(x, y, null).setSize(this.tileSize, this.tileSize).setVisible(false);
                } else if (cell === 8) { // Crystals
                    const cry = this.add.sprite(x, y - 5, 'crystal').setDepth(y + 5);
                    this.tweens.add({ targets: cry, y: y - 15, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                } else if (cell === 9) { // Oracle NPC
                    const spark = this.physics.add.sprite(x, y, 'npc_oracle').setDepth(y);
                    spark.body.setSize(30, 20).setOffset(5, 20);
                    spark.setImmovable(true);
                    spark.npcId = 'oracle';
                    this.npcs.add(spark);
                    this.tweens.add({ targets: spark, y: y - 8, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                } else if (cell === 10) { // Battle Master NPC
                    const master = this.physics.add.sprite(x, y, 'npc_master').setDepth(y);
                    master.body.setSize(30, 20).setOffset(5, 20);
                    master.setImmovable(true);
                    master.npcId = 'battle_master';
                    this.npcs.add(master);
                    this.tweens.add({ targets: master, scale: 1.05, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                } else if (cell === 12) { // Pine Tree
                    // 🌲 Rendered procedurally
                    const tree = this.trees.create(x, y - 24, 't_pine_tree');
                    tree.setSize(16, 20).setOffset(24, 44); // Hitbox exactly at tree trunk
                    tree.setDepth(y + 20);
                } else if (cell === 13) { // Crop Field
                    this.add.sprite(x, y, 't_crop').setDepth(0);
                }
            }
        }
        
        // Player
        this.player = this.physics.add.sprite(20 * this.tileSize, 22 * this.tileSize, 'player');
        // Native 48x48 procedural texture hitbox mapping
        this.player.body.setSize(24, 20).setOffset(12, 28);
        this.player.isTalking = false;
        
        // Removed procedural additive light effect for a cleaner, fresh look
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
        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        // Smooth tween applied to player for moving aesthetic instead of frame swap
        this.playerWalkTween = this.tweens.add({
            targets: this.player,
            scaleY: 0.9,
            scaleX: 1.1,
            yoyo: true,
            repeat: -1,
            duration: 150,
            paused: true
        });

        this.input.keyboard.stopPropagation = false;

        this.fPrompt = this.add.text(0, 0, 'กด [F] โต้ตอบ', {
            fontSize: '14px', fill: '#000',
            backgroundColor: '#FFD700', padding: { x: 8, y: 4, left: 10, right: 10 },
            fontFamily: 'Mitr, sans-serif'
        }).setOrigin(0.5).setVisible(false).setDepth(300);

        this.unsubscribeInteraction = eventBus.on(EVENTS.UI_INTERACTION, () => {
            if (this.interactionTarget) {
                this.handleInteraction(this.interactionTarget);
            }
        });

        this.events.on('shutdown', () => {
           if (this.unsubscribeInteraction) this.unsubscribeInteraction();
        });

        this.input.keyboard.removeCapture('B,F,R,I,M');

        // --- REAL MINIMAP CAMERA ---
        const minimapSize = 140;
        const minimapPadding = 20;
        this.minimapCam = this.cameras.add(window.innerWidth - minimapSize - minimapPadding, minimapPadding, minimapSize, minimapSize)
            .setZoom(0.18)
            .setName('mini');
        
        this.minimapCam.setBackgroundColor(0x1a2130);
        this.minimapCam.startFollow(this.player, true);

        // Circular Mask for the minimap
        this.miniCircle = this.make.graphics();
        this.miniCircle.fillStyle(0xffffff);
        this.miniCircle.fillCircle(window.innerWidth - minimapPadding - (minimapSize/2), minimapPadding + (minimapSize/2), minimapSize/2);
        this.minimapCam.setMask(this.miniCircle.createGeometryMask());

        // Giant dot for player that only minimap sees
        this.minimapDot = this.add.circle(this.player.x, this.player.y, 40, 0xffff00).setDepth(200);
        this.cameras.main.ignore(this.minimapDot);
        this.minimapCam.ignore(this.fPrompt);
        
        // Hide fake glows from minimap to keep it clean
        if (this.playerLight) this.minimapCam.ignore(this.playerLight);

        // Handle Resize
        this.scale.on('resize', (gameSize) => {
            const w = gameSize.width;
            this.minimapCam.setPosition(w - minimapSize - minimapPadding, minimapPadding);
            this.miniCircle.clear();
            this.miniCircle.fillStyle(0xffffff);
            this.miniCircle.fillCircle(w - minimapPadding - (minimapSize/2), minimapPadding + (minimapSize/2), minimapSize/2);
        });

        console.timeEnd('[CHEMMA] Scene Create');
    }

    update(time, delta) {
        const isPaused = window.inChat || 
                         window.gameState === 'BATTLE' || 
                         window.gameState === 'DIALOGUE' || 
                         window.isDashboardOpen || 
                         this.player.isTalking;

        if (!isPaused) {
            const speed = 200;
            let vx = 0;
            let vy = 0;

            const left  = this.keys.A.isDown || this.cursors.left.isDown;
            const right = this.keys.D.isDown || this.cursors.right.isDown;
            const up    = this.keys.W.isDown || this.cursors.up.isDown;
            const down  = this.keys.S.isDown || this.cursors.down.isDown;

            if (left)  vx -= 1;
            if (right) vx += 1;
            if (up)    vy -= 1;
            if (down)  vy += 1;

            if (vx !== 0 && vy !== 0) {
                const diag = speed * 0.707;
                vx *= diag;
                vy *= diag;
            } else {
                vx *= speed;
                vy *= speed;
            }

            this.player.setVelocity(vx, vy);

            // Sync Fake Dynamic Light to Player
            if (this.playerLight) {
                this.playerLight.x = this.player.x;
                this.playerLight.y = this.player.y;
            }

            if (vx !== 0 || vy !== 0) {
                if (!this.playerWalkTween.isPlaying()) this.playerWalkTween.resume();
            } else {
                this.playerWalkTween.pause();
                this.player.setScale(1); // Reset
            }
        } else {
            this.player.setVelocity(0, 0);
            this.playerWalkTween.pause();
            this.player.setScale(1);
        }

        // Dynamic depth sorting
        this.player.setDepth(this.player.y);

        if (this.minimapDot) {
            this.minimapDot.setPosition(this.player.x, this.player.y);
        }

        this.interactionTarget = null;
        this.fPrompt.setVisible(false);

        let nearestNpc = null;
        let minDistance = 120; 

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
    }

    handleInteraction(target) {
        if (target === 'oracle') {
            eventBus.emit(EVENTS.OPEN_CHAT);      
        } else if (target === 'battle_master') {
            eventBus.emit(EVENTS.OPEN_NPC_POPUP, {
                npcId: 'battle_master',
                name: 'Battle Master - Quest Giver',
                message: 'ฉันมีบททดสอบการประลอง 3 ขั้นให้เจ้าเลือกทำทีละขั้น หากพร้อมแล้วรับภารกิจแรกได้เลย',
                choices: [
                    { id: 'start_quest', label: 'รับภารกิจ' },
                    { id: 'leave', label: 'กลับ' }
                ]
            });
        }
    }

    generateSmoothTextures() {
        if (this.textures.exists('t_grass')) return;

        console.time('[CHEMMA] Pixel Gen');
        
        // --- 👾 Prodedural Pixel Art Generator ---
        // Converts the ART_DATA string arrays into Phaser Textures at runtime.
        const createPixelTexture = (key, data, pixelSize = 3) => {
            if (this.textures.exists(key)) return;
            const height = data.length;
            const width = data[0].length;
            const gfx = this.make.graphics();
            
            for (let r = 0; r < height; r++) {
                for (let c = 0; c < width; c++) {
                    const char = data[r][c];
                    const color = PALETTE[char];
                    if (color) {
                        gfx.fillStyle(parseInt(color.replace('#', '0x')), 1);
                        gfx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
            gfx.generateTexture(key, width * pixelSize, height * pixelSize);
            gfx.destroy();
        };

        // Environment
        createPixelTexture('t_grass', ART_DATA.t_grass);
        createPixelTexture('t_grass2', ART_DATA.t_grass2);
        createPixelTexture('t_dirt', ART_DATA.t_dirt);
        createPixelTexture('t_water', ART_DATA.t_water);
        createPixelTexture('t_crop', ART_DATA.t_crop);
        createPixelTexture('t_fence', ART_DATA.t_fence);
        
        // Entities
        createPixelTexture('player', ART_DATA.player_d1); // Idle front
        createPixelTexture('npc_oracle', ART_DATA.npc_spark);
        createPixelTexture('npc_master', ART_DATA.battle_master);
        createPixelTexture('crystal', ART_DATA.crystal, 4);
        createPixelTexture('t_pine_tree', ART_DATA.t_pine_tree, 2);
        
        // Placeholder for house/building if not in ART_DATA (reusing patterns)
        createPixelTexture('building', [
            "KKKKKKKKKKKKKKKK", "K88888888888888K", "K88888888888888K", "K88888888888888K",
            "K88855555555888K", "K88855555555888K", "K88888888888888K", "KCCCCCCCCCCCCCCK",
            "KC777777777777CK", "KC777000000777CK", "KC777000000777CK", "KC777000000777CK",
            "KC777000000777CK", "KC777000000777CK", "KCCCCCCCCCCCCCCK", "KKKKKKKKKKKKKKKK"
        ]);
        createPixelTexture('house', [
            "000000DD00000000", "0000DDDDDD000000", "00DDDDDDDDDD0000", "DDDDDDDDDDDDDD00",
            "00000DDDD0000000", "000EEEEEEEEEE000", "000E00000000E000", "000E00000000E000",
            "000E00555500E000", "000E00555500E000", "000E00555500E000", "000E00000000E000",
            "000EEEEEEEEEE000", "0000000000000000"
        ], 4);

        console.timeEnd('[CHEMMA] Pixel Gen');
    }
}
