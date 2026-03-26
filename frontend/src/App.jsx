import React, { useEffect, useRef, useState } from 'react';
import { GameProvider, useGameContext } from './core/GameContext';
import { AuthProvider, useAuth } from './core/AuthContext';
import { GAME_STATES } from './core/constants';
import { createGame } from './features/world/phaserGame';

import LoginScreen from './features/login/LoginScreen';
import MenuScreen from './features/menu/MenuScreen';
import WorldScreen from './features/world/WorldScreen';
import BattleScreen from './features/battle/BattleScreen';
import ChatScreen from './features/chat/ChatScreen';
import DialogueScreen from './features/dialogue/DialogueScreen';

// Dashboard Imports
import InventoryUI from './components/inventory/InventoryUI';
import { loadGameState } from './core/userState';

function GameContent() {
  const { gameState } = useGameContext();
  const { currentPlayer, isLoading } = useAuth();
  const gameInitialized = useRef(false);
  
  // Dashboard State
  const [showDashboard, setShowDashboard] = useState(false);
  const [activeTab, setActiveTab] = useState('backpack');
  const [userData, setUserData] = useState(loadGameState());

  // Toggle Dashboard with 'B' key
  useEffect(() => {
    const handleKeyDown = (e) => {
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
  }, [showDashboard]);

  // Initialize Phaser once game state becomes GAME
  useEffect(() => {
    if (gameState === GAME_STATES.GAME && !gameInitialized.current) {
      gameInitialized.current = true;
      createGame('game-container');
    }
  }, [gameState]);

  // While checking localStorage for an existing session — show nothing to avoid flicker
  if (isLoading) return null;

  // Not logged in → show Login screen (blocks ALL game content)
  if (!currentPlayer) return <LoginScreen />;

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

      <div id="flashScreen" className="white-flash"></div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </AuthProvider>
  );
}

