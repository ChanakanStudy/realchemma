import React from 'react';
import { useGameContext } from '../../core/GameContext';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';

export default function DialogueScreen() {
    const { npcDialogue } = useGameContext();

    if (!npcDialogue) return null;
    console.log('DialogueScreen', npcDialogue);
    const handleChoice = (choiceId) => {
        if (choiceId === 'fight') {
            eventBus.emit(EVENTS.START_BATTLE);
        } else if (choiceId === 'leave') {
            eventBus.emit(EVENTS.CLOSE_NPC_POPUP);
        } else if (choiceId === 'accept_quest' && npcDialogue.questData) {
            eventBus.emit(EVENTS.QUEST_ACCEPTED, npcDialogue.questData);
            eventBus.emit(EVENTS.CLOSE_NPC_POPUP);
        } else if (choiceId === 'complete_quest' && npcDialogue.rewardData) {
            eventBus.emit(EVENTS.QUEST_COMPLETED, npcDialogue.rewardData);
            eventBus.emit(EVENTS.CLOSE_NPC_POPUP);
        }
    };

    return (
        <div className="dialogue-container">
            <div className="dialogue-box">
                <div className="dialogue-npc-name">{npcDialogue.name}</div>
                <div className="dialogue-message">{npcDialogue.message}</div>

                <div className="dialogue-choices">
                    {npcDialogue.choices.map(choice => (
                        <button
                            key={choice.id}
                            className="dialogue-choice-btn"
                            onClick={() => handleChoice(choice.id)}
                        >
                            {choice.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        
    );
}