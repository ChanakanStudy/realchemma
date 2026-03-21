console.log("Main.js loading [v2]...");
import WorldScene from '/src/scenes/WorldScene.js?v=2';
import BattleApp from '/src/systems/battle/BattleApp.js?v=2';
import * as dialogue from '/src/systems/dialogue/dialogueManager.js?v=2';

console.log("Modules imported.");
// Global State
window.gameState = 'MENU';
window.inChat = false;
window.pScene = null;

// Phaser Config
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    pixelArt: true,
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
    scene: WorldScene
};

const game = new Phaser.Game(config);
window.addEventListener('resize', () => game.scale.resize(window.innerWidth, window.innerHeight));

// Game Flow Functions
window.enterGame = function() {
    const flash = document.getElementById('flashScreen');
    document.getElementById('menuUI').style.display = 'none';
    flash.style.opacity = '1';
    
    setTimeout(() => {
        window.gameState = 'GAME'; 
        document.getElementById('game-container').style.display = 'block';
        document.getElementById('gameHUD').style.display = 'block'; 
        if (window.pScene) window.pScene.scene.resume();
        flash.style.transition = 'opacity 2s ease-out';
        flash.style.opacity = '0';
    }, 1000);
};

window.startBattle = function() {
    window.gameState = 'BATTLE';
    if (window.pScene) window.pScene.scene.pause();
    document.getElementById('gameHUD').style.display = 'none';
    document.getElementById('battle-root').style.display = 'block';
    window.renderBattle();
};

window.quitBattle = function() {
    window.gameState = 'GAME';
    if (window.pScene) window.pScene.scene.resume();
    document.getElementById('gameHUD').style.display = 'block';
    document.getElementById('game-container').style.display = 'block';
    document.getElementById('battle-root').style.display = 'none';
};

// Dialogue
window.openChat = dialogue.openChat;
window.closeChat = dialogue.closeChat;
window.sendMessage = dialogue.sendMessage;

// React Root for Battle
const root = ReactDOM.createRoot(document.getElementById('battle-root'));
window.renderBattle = () => {
    root.render(React.createElement(BattleApp));
};
