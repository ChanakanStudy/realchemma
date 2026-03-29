import Phaser from 'phaser';
import WorldScene from './WorldScene';

let gameInstance = null;

export function createGame(containerId) {
  if (gameInstance) return gameInstance;

  const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: containerId,
    pixelArt: true,
    physics: { default: 'arcade', arcade: { gravity: { y: 0 } } },
    input: {
      keyboard: {
        capture: []
      }
    },
    scene: WorldScene,
  };

  gameInstance = new Phaser.Game(config);

  const handleResize = () => {
    if (gameInstance) {
      gameInstance.scale.resize(window.innerWidth, window.innerHeight);
    }
  };
  window.addEventListener('resize', handleResize);

  return gameInstance;
}

export function getGame() {
  return gameInstance;
}
