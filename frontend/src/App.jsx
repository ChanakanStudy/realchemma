import React, { useEffect, useRef } from 'react';
import { GameProvider, useGameContext } from './core/GameContext';
import { GAME_STATES } from './core/constants';
import { createGame } from './features/world/phaserGame';

import MenuScreen from './features/menu/MenuScreen';
import WorldScreen from './features/world/WorldScreen';
import BattleScreen from './features/battle/BattleScreen';
import ChatScreen from './features/chat/ChatScreen';

function GameContent() {
  const { gameState } = useGameContext();
  const gameInitialized = useRef(false);

  // Initialize Phaser once game state becomes GAME
  useEffect(() => {
    if (gameState === GAME_STATES.GAME && !gameInitialized.current) {
      gameInitialized.current = true;
      createGame('game-container');
    }
  }, [gameState]);

  return (
    <>
      <div id="game-container"></div>

      {gameState === GAME_STATES.MENU && <MenuScreen />}
      
      {gameState === GAME_STATES.GAME && <WorldScreen />}
      
      <ChatScreen />

      {/* --- Battle UI Root --- */}
      {gameState === GAME_STATES.BATTLE && (
        <div id="battle-root" style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }}>
          <BattleScreen />
        </div>
      )}

      <div id="flashScreen" className="white-flash"></div>
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}
