import React from 'react';
import { useGameContext } from '../../core/GameContext';
import { acceptQuest } from '../../api/client';
import { GAME_STATES } from '../../core/constants';

export default function DialogueScreen() {
    const { npcDialogue, questState, setQuestState, setGameState, setNpcDialogue } = useGameContext();

    if (!npcDialogue) return null;

    const questNpc = npcDialogue.npcId === 'quest_giver';
    const battleNpc = npcDialogue.npcId === 'battle_master';
    const activeQuest = questState?.active_quest ?? null;
    const nextQuest = questState?.available_quests?.[0] ?? null;

    const acceptQuestAndClose = async () => {
        try {
            const questToAccept = activeQuest || nextQuest;

            if (!questToAccept) {
                return;
            }

            if (!activeQuest) {
                const updatedState = await acceptQuest(questToAccept.id);
                setQuestState(updatedState);
            }

            setNpcDialogue(null);
            setGameState(GAME_STATES.GAME);
        } catch (error) {
            console.error('[CHEMMA] Failed to accept quest:', error);
        }
    };

    const handleChoice = (choiceId) => {
        if (battleNpc && choiceId === 'fight') {
            setNpcDialogue(null);
            setGameState(GAME_STATES.BATTLE);
            return;
        }

        if (questNpc && choiceId === 'quest_brief') {
            void acceptQuestAndClose();
            return;
        }

        if (choiceId === 'leave') {
            setNpcDialogue(null);
            setGameState(GAME_STATES.GAME);
        }
    };

    return (
        <div className="dialogue-container">
            <div className="dialogue-box">
                <div className="dialogue-npc-name">{npcDialogue.name}</div>

                {questNpc ? (
                    <>
                        <div className="dialogue-message">{npcDialogue.message}</div>

                        <div className="quest-briefing-panel">
                            <div className="quest-briefing-title">
                                {activeQuest ? activeQuest.title : nextQuest?.title || 'No quest available'}
                            </div>
                            <div className="quest-briefing-text">
                                {activeQuest ? activeQuest.description : nextQuest?.description || 'กลับมาใหม่เมื่อมีภารกิจใหม่'}
                            </div>
                            <div className="quest-briefing-target">
                                Target: {activeQuest?.boss_name || nextQuest?.boss_name || '-'}
                            </div>
                            <div className="quest-briefing-objective">
                                Objective: {activeQuest?.objective || nextQuest?.objective || '-'}
                            </div>
                        </div>

                        <div className="dialogue-choices">
                            <button className="dialogue-choice-btn primary" onClick={acceptQuestAndClose} disabled={!activeQuest && !nextQuest}>
                                {activeQuest ? 'รับทราบภารกิจ' : 'รับภารกิจ'}
                            </button>
                            <button
                                className="dialogue-choice-btn"
                                onClick={() => handleChoice('leave')}
                            >
                                กลับ
                            </button>
                        </div>
                    </>
                ) : battleNpc ? (
                    <>
                        <div className="dialogue-message">{npcDialogue.message}</div>

                        <div className="dialogue-choices">
                            <button
                                className="dialogue-choice-btn primary"
                                onClick={() => handleChoice('fight')}
                            >
                                เข้าสู่การประลอง
                            </button>
                            <button
                                className="dialogue-choice-btn"
                                onClick={() => handleChoice('leave')}
                            >
                                กลับ
                            </button>
                        </div>
                    </>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
        
    );
}