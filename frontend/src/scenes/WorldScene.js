import Phaser from 'phaser';
import { DB } from '../core/config.js';

export default class WorldScene extends Phaser.Scene {
    constructor() { super('ChemmaScene'); }

    preload() {
        console.log('[CHEMMA] Loading V4 Final Perfection Assets...');
        const a = DB.Assets;
        // Correct frameWidth for high-res sheet (assuming 2x2 slicing for mockup)
        this.load.spritesheet('player', a.player, { frameWidth: 512, frameHeight: 512 });
        this.load.image('tree', a.tree);
        this.load.image('crystal', a.crystal);
        this.load.image('pillar', a.pillar);
        this.load.image('bridge', a.bridge);
        this.load.image('grass', a.grass);
        this.load.image('path', a.path);
        this.load.image('water', a.water);
    }

    create() {
        console.log('[CHEMMA] Building Perfect 2.5D Animated World...');
        this.tileSize = DB.TileSize;
        this.cameras.main.setBackgroundColor('#1B5E20');
        
        const mapWidth = DB.MapWidth * this.tileSize;
        const mapHeight = DB.MapHeight * this.tileSize;
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

        // Animations for high-res 2x2 sheet (0:Front, 1:Back, 2:Left, 3:Right)
        this.anims.create({
            key: 'walk-down',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: 'walk-up',
            frames: [{ key: 'player', frame: 1 }],
            frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: 'walk-left',
            frames: [{ key: 'player', frame: 2 }],
            frameRate: 10, repeat: -1
        });
        this.anims.create({
            key: 'walk-right',
            frames: [{ key: 'player', frame: 3 }],
            frameRate: 10, repeat: -1
        });

        this.trees = this.physics.add.staticGroup();
        this.walls = this.physics.add.staticGroup(); 
        this.collectibles = this.physics.add.staticGroup();
        this.npcs = this.physics.add.staticGroup();
        this.waterTiles = [];

        for (let y = 0; y < DB.MapHeight; y++) {
            for (let x = 0; x < DB.MapWidth; x++) {
                const cell = DB.MapLayout[y][x];
                const px = x * this.tileSize + (this.tileSize/2);
                const py = y * this.tileSize + (this.tileSize/2);

                // FIX: Tiles are 1024x1024, force them to tileSize+1 to hide gaps
                if (cell === 2) { // Water
                    const w = this.add.tileSprite(px, py, this.tileSize + 1, this.tileSize + 1, 'water').setDepth(0);
                    w.setTileScale(0.0625, 0.0625); // 64 / 1024
                    this.waterTiles.push(w);
                    this.walls.create(px, py, null).setSize(this.tileSize, this.tileSize).setVisible(false);
                } else if (cell === 3) { // Bridge
                    this.add.tileSprite(px, py, this.tileSize + 1, this.tileSize + 1, 'water').setDepth(0).setTileScale(0.0625, 0.0625);
                    this.add.image(px, py, 'bridge').setDisplaySize(this.tileSize + 1, this.tileSize + 1).setDepth(1);
                } else if (cell === 1) { // Path
                    this.add.image(px, py, 'path').setDisplaySize(this.tileSize + 1, this.tileSize + 1).setDepth(0);
                } else { // Grass
                    this.add.image(px, py, 'grass').setDisplaySize(this.tileSize + 1, this.tileSize + 1).setDepth(0);
                }

                if (cell === 4) { // Tree (1024px)
                    const tree = this.trees.create(px, py - 40, 'tree').setScale(0.15).setDepth(py + 40); // Slightly larger than tile
                    tree.body.setSize(60, 60).setOffset(450, 800); // Adjust collision for high-res
                } else if (cell === 5) { // Crystal (1024px)
                    const c = this.collectibles.create(px, py, 'crystal').setScale(0.08).setDepth(py);
                    c.itemId = 'H';
                    this.tweens.add({ targets: c, alpha: 0.7, scale: 0.09, duration: 1500, yoyo: true, repeat: -1 });
                } else if (cell === 6) { // Pillar (1024px)
                    const p = this.collectibles.create(px, py - 30, 'pillar').setScale(0.1).setDepth(py);
                    p.itemId = 'O';
                }
            }
        }
        
        this.player = this.physics.add.sprite(4 * this.tileSize, 3 * this.tileSize, 'player', 0).setScale(0.2).setDepth(3 * this.tileSize);
        this.player.body.setSize(200, 200).setOffset(150, 280);
        this.player.setCollideWorldBounds(true);
        
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.collider(this.player, this.trees);
        
        // Item Collection Logic
        this.physics.add.overlap(this.player, this.collectibles, (p, item) => {
            if (window.addItem) {
                window.addItem(item.itemId, 1);
                window.gainXP(20);
                
                // Visual feedback
                const text = this.add.text(item.x, item.y - 50, `+1 ${item.itemId}`, { fontSize: '24px', fill: '#d4af37', stroke: '#000', strokeThickness: 4 }).setDepth(1000);
                this.tweens.add({ targets: text, y: text.y - 100, alpha: 0, duration: 1000, onComplete: () => text.destroy() });
                
                item.destroy();
            }
        });

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.8);
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            action: Phaser.Input.Keyboard.KeyCodes.F
        });

        window.pScene = this;
    }

    update() {
        if (window.inChat || window.gameState !== 'GAME') { this.player.setVelocity(0, 0); return; }

        const speed = 250;
        let vx = 0, vy = 0, anim = null;

        if (this.keys.left.isDown || this.cursors.left.isDown) { vx = -speed; anim = 'walk-left'; }
        else if (this.keys.right.isDown || this.cursors.right.isDown) { vx = speed; anim = 'walk-right'; }
        
        if (this.keys.up.isDown || this.cursors.up.isDown) { vy = -speed; if (!anim) anim = 'walk-up'; }
        else if (this.keys.down.isDown || this.cursors.down.isDown) { vy = speed; if (!anim) anim = 'walk-down'; }
        
        this.player.setVelocity(vx, vy);
        this.player.setDepth(this.player.y + 100);

        if (vx !== 0 || vy !== 0) this.player.play(anim, true);
        else this.player.anims.stop();

        // Action key (F) for talk trigger (placeholder for NPC interaction)
        if (Phaser.Input.Keyboard.JustDown(this.keys.action)) {
            // Check proximity to NPC points or triggers
            if (window.openChat) window.openChat();
        }

        this.waterTiles.forEach(w => {
            w.tilePositionX += 0.8;
            w.tilePositionY += 0.4;
        });
    }
}
