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
import MinigameOverlay from './features/minigames/MinigameOverlay';
import LabScreen from './features/lab/LabScreen';
import { eventBus } from './core/EventBus';
import { EVENTS } from './core/constants';

// Dashboard Imports
import InventoryUI from './components/inventory/InventoryUI';
import {
  loadGameState,
  saveGameState,
  addXP,
  addInventoryItem,
  addStardust,
  acceptQuest,
  completeQuest
} from './core/userState';
import { getQuestState } from './api/client';
import { calculateMinigameRewards } from './features/minigames/rewardData';

function GameContent() {
  const { gameState, setGameState, showDashboard, setShowDashboard, chatOpen, setChatOpen, questState, setQuestState } = useGameContext();
  const { currentPlayer, isLoading } = useAuth();
  const gameInitialized = useRef(false);

  // Local Dashboard state moved to GameContext
  const [activeTab, setActiveTab] = useState('backpack');
  const [userData, setUserData] = useState(loadGameState());
  const [labOpen, setLabOpen] = useState(false);

  useEffect(() => {
    if (!currentPlayer) {
      setQuestState(null);
      return;
    }

    setQuestState(null);

    let cancelled = false;

    const syncQuestState = async () => {
      try {
        const serverQuestState = await getQuestState();
        if (cancelled) return;

        setQuestState(serverQuestState);
        setUserData(prev => ({
          ...prev,
          quests: serverQuestState.quests,
          questRoute: serverQuestState.active_quest?.id ?? null,
        }));
      } catch (error) {
        console.error('[CHEMMA] Failed to load quest state:', error);
      }
    };

    syncQuestState();

    return () => {
      cancelled = true;
    };
  }, [currentPlayer, setQuestState]);

  useEffect(() => {
    if (!questState) return;

    setUserData(prev => ({
      ...prev,
      quests: questState.quests,
      questRoute: questState.active_quest?.id ?? null,
    }));
  }, [questState]);

  // Toggle Dashboard with 'B' key
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      console.log(`[CHEMMA] Key pressed: ${key} (State: ${gameState}, Dashboard: ${showDashboard}, Chat: ${chatOpen})`);

      // If we are in an overlay state, allow ESC to close it
      if (key === 'escape' || e.code === 'Escape') {
        if (labOpen) {
          console.log('[CHEMMA] Closing Lab via ESC');
          setLabOpen(false);
          return;
        }
        if (showDashboard) {
          console.log('[CHEMMA] Closing Dashboard via ESC');
          setShowDashboard(false);
        }
        if (chatOpen) {
          console.log('[CHEMMA] Closing Chat via ESC');
          setChatOpen(false);
        }
        return;
      }

      if (labOpen) {
        return;
      }

      // Priority: Handle 'B' (Inventory) - Always toggle unless in a blocking state like typing
      if (key === 'b' || e.code === 'KeyB') {
        const nextState = !showDashboard;
        console.log(`[CHEMMA] Toggling Dashboard to: ${nextState}`);
        setShowDashboard(nextState);
        if (nextState) {
          setUserData(loadGameState());
        }
        return;
      }

      // Handle 'F' (Interaction) - Blocked if Dashboard is open
      if (key === 'f' || e.code === 'KeyF') {
        if (showDashboard) {
          console.log('[CHEMMA] "F" blocked because Dashboard is open');
          return;
        }
        // If chat is already open, maybe we don't want to re-trigger? 
        // But for now, App.jsx handles the 'F' to emit interaction but WorldScene handles the response
        console.log('[CHEMMA] Emitting UI_INTERACTION');
        eventBus.emit(EVENTS.UI_INTERACTION);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDashboard, labOpen, gameState, chatOpen, setShowDashboard, setChatOpen]);

  // Initialize Phaser once game state becomes GAME
  useEffect(() => {
    if (gameState === GAME_STATES.GAME && !gameInitialized.current) {
      gameInitialized.current = true;
      createGame('game-container');
    }
  }, [gameState]);

  // Handle Quest & Battle events and state persistence
  useEffect(() => {
    const unsubs = [
      eventBus.on(EVENTS.QUEST_ACCEPTED, (questData) => {
        setUserData(prev => {
          const next = acceptQuest(prev, questData);
          saveGameState(next);
          return next;
        });
      }),
      eventBus.on(EVENTS.QUEST_COMPLETED, (data) => {
        // data: { id, xp, items: [{id, qty}] }
        setUserData(prev => {
          let next = completeQuest(prev, data.id);
          next = addXP(next, data.xp || 0);
          if (data.items) {
            data.items.forEach(item => {
              next = addInventoryItem(next, item.id, item.qty);
            });
          }
          saveGameState(next);
          return next;
        });

        // Visual feedback
        const flash = document.getElementById('flashScreen');
        if (flash) {
          flash.classList.add('active');
          setTimeout(() => flash.classList.remove('active'), 1000);
        }
      }),
      eventBus.on(EVENTS.BATTLE_WON, () => {
        setUserData(prev => {
          const next = {
            ...prev,
            stats: {
              ...(prev.stats || {}),
              wins: (prev.stats?.wins || 0) + 1
            }
          };
          saveGameState(next);
          return next;
        });
      }),
      eventBus.on(EVENTS.OPEN_CRAFT_LAB, () => {
        setShowDashboard(false);
        setLabOpen(true);
      }),
      eventBus.on(EVENTS.MINIGAME_WON, (data) => {
        // data: { gameId, score, difficulty }
        const rewards = calculateMinigameRewards(data.difficulty || 'easy', data.score || 0);
        
        let didLevelUp = false;

        setUserData(prev => {
            let next = addXP(prev, rewards.xp);
            didLevelUp = next.leveledUp;

            if (rewards.items) {
                rewards.items.forEach(item => {
                    next = addInventoryItem(next, item.id, item.qty);
                });
            }

            if (rewards.stardust) {
                next = addStardust(next, rewards.stardust);
            }

            saveGameState(next);
            return next;
        });

        // Trigger the reward UI in MinigameOverlay with potential level up info
        eventBus.emit('minigame:show_rewards', { 
            ...rewards, 
            leveledUp: didLevelUp 
        });
      })
    ];
    return () => unsubs.forEach(u => u());
  }, [setShowDashboard, setLabOpen]);

  // While checking  for an existing session — show nothing to avoid flicker
  if (isLoading) return null;

  // Not logged in → show Login screen (blocks ALL game content)
  if (!currentPlayer) return <LoginScreen />;

  return (
    <>
      <div id="game-container"></div>

      {gameState === GAME_STATES.MENU && <MenuScreen />}

      {(gameState === GAME_STATES.GAME || gameState === GAME_STATES.DIALOGUE) && <WorldScreen userData={userData} />}

      <ChatScreen />

      {gameState === GAME_STATES.DIALOGUE && <DialogueScreen />}

      {labOpen && (
        <LabScreen
          userData={userData}
          setUserData={setUserData}
          onClose={() => setLabOpen(false)}
        />
      )}

      {/* --- Battle UI Root --- */}
      {gameState === GAME_STATES.BATTLE && (
        <div id="battle-root" style={{ display: 'block', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }}>
          <BattleScreen onQuitBattle={() => setGameState(GAME_STATES.GAME)} />
        </div>
      )}

      {/* --- Dashboard (Inventory, Codex, Quests) --- */}
      {showDashboard && (
        <InventoryUI
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userData={userData}
          setUserData={setUserData}
          questState={questState}
          onClose={() => setShowDashboard(false)} 
        />
      )}

      <MinigameOverlay />

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
