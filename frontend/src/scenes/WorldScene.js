import Phaser from 'phaser';
import { DB, P, ArtData } from '../core/config.js';

export default class WorldScene extends Phaser.Scene {
    constructor() { super('ChemmaScene'); }

    preload() {
        this.generateAllTextures();
    }

    create() {
        window.pScene = this;
        this.tileSize = 48;
        const map = DB.MapLayout;

        // 🧱 Create Map
        this.walls = this.physics.add.staticGroup();
        for (let r = 0; r < map.length; r++) {
            for (let c = 0; c < map[r].length; c++) {
                const cell = map[r][c];
                const x = c * this.tileSize + this.tileSize / 2;
                const y = r * this.tileSize + this.tileSize / 2;

                // Default Floor
                this.add.rectangle(x, y, this.tileSize, this.tileSize, 0x1a0f25);

                if (cell === 1 || cell === 7) { // Walls / Fences
                    this.walls.create(x, y, null).setSize(this.tileSize, this.tileSize).setVisible(false);
                    this.add.rectangle(x, y, this.tileSize, this.tileSize, 0x2A0845);
                } else if (cell === 5) { // Grass
                    this.add.rectangle(x, y, this.tileSize, this.tileSize, 0x1b4b2a);
                } else if (cell === 6) { // Path
                    this.add.rectangle(x, y, this.tileSize, this.tileSize, 0x3d155f);
                } else if (cell === 8) { // Crystal
                    const cry = this.add.sprite(x, y, 'crystal').setScale(2);
                    this.tweens.add({ targets: cry, y: y - 10, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
                } else if (cell === 9) { // Oracle/Spark
                    this.spark = this.physics.add.sprite(x, y, 'npc_spark').setScale(3);
                    this.addInteraction(this.spark, 'ORACLE');
                } else if (cell === 10) { // Battle Master
                    this.master = this.physics.add.sprite(x, y, 'battle_master').setScale(3);
                    this.addInteraction(this.master, 'BATTLE');
                }
            }
        }

        // 🧙 Player
        this.player = this.physics.add.sprite(696, 840, 'player_d1').setScale(3);
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.walls);

        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,F');
        
        // Fix: Prevent Phaser from blocking keys in HTML inputs (Chatbox) but still allow walking
        this.input.keyboard.removeCapture('W,A,S,D,F,UP,DOWN,LEFT,RIGHT,SPACE');

        this.interactionTarget = null;
        this.fPrompt = this.add.text(0, 0, 'กด [F] เพื่อโต้ตอบ', { fontSize: '16px', fill: '#d4af37', backgroundColor: '#000000aa', padding: 5 }).setOrigin(0.5).setVisible(false).setDepth(100);

        this.scene.pause(); // Start paused for Menu
    }

    addInteraction(obj, type) {
        obj.interactType = type;
    }

    update() {
        if (window.inChat || window.gameState === 'BATTLE') return;

        const speed = 200;
        this.player.setVelocity(0);

        if (this.keys.A.isDown || this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.keys.D.isDown || this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.keys.W.isDown || this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.keys.S.isDown || this.cursors.down.isDown) this.player.setVelocityY(speed);

        // Interaction Detection
        const distSpark = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.spark.x, this.spark.y);
        const distMaster = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.master.x, this.master.y);

        if (distSpark < 80) {
            this.interactionTarget = 'ORACLE';
            this.fPrompt.setPosition(this.spark.x, this.spark.y - 60).setVisible(true);
        } else if (distMaster < 80) {
            this.interactionTarget = 'BATTLE';
            this.fPrompt.setPosition(this.master.x, this.master.y - 60).setVisible(true);
        } else {
            this.interactionTarget = null;
            this.fPrompt.setVisible(false);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.F) && this.interactionTarget) {
            if (this.interactionTarget === 'ORACLE') window.openChat();
            else if (this.interactionTarget === 'BATTLE') window.startBattle();
        }
    }

    generateAllTextures() {
        for (const [key, data] of Object.entries(ArtData)) {
            this.generateTexture(key, data);
        }
    }

    generateTexture(key, data) {
        const h = data.length;
        const w = data[0].length;
        const canvas = this.textures.createCanvas(key, w, h);
        const ctx = canvas.getContext();
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const colorCode = data[y][x];
                if (P[colorCode]) {
                    ctx.fillStyle = P[colorCode];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        canvas.refresh();
    }
}
