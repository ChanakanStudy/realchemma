import React, { createContext, useContext, useState, useEffect } from 'react';
import { GAME_STATES, EVENTS, MAX_PLAYER_HP } from './constants';
import { eventBus } from './EventBus';

const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState(GAME_STATES.MENU);
    const [playerHP, setPlayerHP] = useState(MAX_PLAYER_HP);
    const [chatOpen, setChatOpen] = useState(false);

    // Listen to EventBus for state changes from outside React (e.g. Phaser)
    useEffect(() => {
        const unsubs = [
            eventBus.on(EVENTS.CHANGE_STATE, (newState) => {
                setGameState(newState);
            }),
            eventBus.on(EVENTS.OPEN_CHAT, () => {
                setChatOpen(true);
            }),
            eventBus.on(EVENTS.CLOSE_CHAT, () => {
                setChatOpen(false);
            }),
            eventBus.on(EVENTS.START_BATTLE, () => {
                setGameState(GAME_STATES.BATTLE);
            }),
            eventBus.on(EVENTS.QUIT_BATTLE, () => {
                setGameState(GAME_STATES.GAME);
            })
        ];

        return () => {
            unsubs.forEach(unsub => unsub());
        };
    }, []);

    // Sync state back to window ONLY for debugging if needed, but primary communication is Context/EventBus
    useEffect(() => {
        window.gameState = gameState;
        window.inChat = chatOpen;
    }, [gameState, chatOpen]);

    const value = {
        gameState,
        setGameState: (state) => {
            setGameState(state);
            eventBus.emit(EVENTS.CHANGE_STATE, state);
        },
        playerHP,
        setPlayerHP,
        chatOpen,
        setChatOpen: (isOpen) => {
            setChatOpen(isOpen);
            eventBus.emit(isOpen ? EVENTS.OPEN_CHAT : EVENTS.CLOSE_CHAT);
        }
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGameContext = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used within a GameProvider');
    }
    return context;
};
