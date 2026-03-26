import React, { useEffect, useRef, useState } from 'react';
import { GameProvider, useGameContext } from './core/GameContext';
import { GAME_STATES } from './core/constants';
import { createGame } from './game/phaserGame';

import MenuScreen from './features/menu/MenuScreen';
import WorldScreen from './features/world/WorldScreen';
import BattleScreen from './features/battle/BattleScreen';
import ChatScreen from './features/chat/ChatScreen';
import DialogueScreen from './features/dialogue/DialogueScreen';

// Dashboard Imports
import InventoryUI from './components/inventory/InventoryUI';
import { loadGameState } from './core/userState';

function GameContent() {
  const { gameState, setChatOpen, setNpcDialogue, setGameState: setGlobalGameState } = useGameContext();
  const gameInitialized = useRef(false);
  
  // Dashboard State
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('backpack');
  const [userData, setUserData] = useState(loadGameState());

  // Toggle Dashboard with 'B' key
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't toggle if typing in a text field
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      
      // Don't toggle if in a dialogue menu
      if (gameState === GAME_STATES.DIALOGUE) return;

      if (e.key.toLowerCase() === 'b') {
        if (showDashboard) {
          setShowDashboard(false);
        } else {
          setUserData(loadGameState()); // Refresh data when opening
          setShowDashboard(true);
        }
      }
      if (e.key === 'Escape') setShowDashboard(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDashboard, gameState]); // Added gameState to dependencies

  // Initialize Phaser once game state becomes GAME
  useEffect(() => {
    if (gameState === GAME_STATES.GAME && !gameInitialized.current) {
      gameInitialized.current = true;
      createGame('game-container');
    }
  }, [gameState]);

  // Expose bridge functions for Phaser interaction
  useEffect(() => {
    window.openChat = () => {
      console.log("[CHEMMA] Open Chat Bridge Triggered");
      setChatOpen(true);
    };
    
    window.openDialogue = (data) => {
        console.log("[CHEMMA] Open Dialogue Bridge Triggered", data);
        setNpcDialogue(data);
        setGlobalGameState(GAME_STATES.DIALOGUE);
    };
  }, [setChatOpen, setNpcDialogue, setGlobalGameState]);

  return (
    <>
      <div id="game-container"></div>

      {gameState === GAME_STATES.MENU && <MenuScreen />}
                                        
      {gameState === GAME_STATES.GAME && <WorldScreen />}
      
      <ChatScreen />

      {gameState === GAME_STATES.DIALOGUE && <DialogueScreen />}

      {/* --- Battle UI Root --- */}
      {gameState === GAME_STATES.BATTLE && (
        <div id="battle-root" style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }}>
          <BattleScreen />
        </div>
      )}

      {/* --- Dashboard (Inventory, Codex, Quests) --- */}
      {showDashboard && (
        <InventoryUI 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userData={userData}
          onClose={() => setShowDashboard(false)} 
        />
      )}

      {/* --- Controls Hint (Only show in-game) --- */}
      {!showDashboard && gameState !== GAME_STATES.MENU && (
        <div className="controls-hint">
            กดปุ่ม <span style={{ color: '#d4af37', fontWeight: 'bold' }}>[ B ]</span> เพื่อเปิดกระเป๋า / Codex
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
