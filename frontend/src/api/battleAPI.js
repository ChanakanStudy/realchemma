/**
 * Battle API Client
 * Handles all communication with the battle backend
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const battleAPI = {
  /**
   * Start a new battle session
   */
  async startBattle() {
    const res = await fetch(`${API_BASE}/battle/start`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to start battle');
    return res.json();
  },

  /**
   * Validate and craft a compound from elements
   * @param {Object} formula - Element formula {H: 2, O: 1}
   */
  async craftCompound(formula) {
    const res = await fetch(`${API_BASE}/battle/craft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formula })
    });
    if (!res.ok) throw new Error('Failed to craft compound');
    return res.json();
  },

  /**
   * Execute a throw action
   * @param {string} compoundId - ID of compound being thrown
   * @param {string} qteResult - QTE result ('PERFECT', 'GOOD', 'MISS')
   */
  async executeThrow(compoundId, qteResult) {
    const res = await fetch(`${API_BASE}/battle/throw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compound_id: compoundId, qte_result: qteResult })
    });
    if (!res.ok) throw new Error('Failed to execute throw');
    return res.json();
  },

  /**
   * Execute an ultimate ability
   * @param {string} ultimateId - ID of ultimate
   * @param {Array<string>} monsterStatus - Current monster statuses
   */
  async executeUltimate(ultimateId, monsterStatus) {
    const res = await fetch(`${API_BASE}/battle/ultimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ultimate_id: ultimateId, monster_status: monsterStatus })
    });
    if (!res.ok) throw new Error('Failed to execute ultimate');
    return res.json();
  },

  /**
   * Calculate monster turn damage
   * @param {number} playerHp - Current player HP
   */
  async monsterTurn(playerHp) {
    const res = await fetch(`${API_BASE}/battle/monster-turn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_player_hp: playerHp })
    });
    if (!res.ok) throw new Error('Failed to calculate monster turn');
    return res.json();
  },

  /**
   * Get all battle data (elements, recipes, ultimates)
   */
  async getBattleData() {
    const res = await fetch(`${API_BASE}/battle/data`);
    if (!res.ok) throw new Error('Failed to fetch battle data');
    return res.json();
  }
};

export default battleAPI;
