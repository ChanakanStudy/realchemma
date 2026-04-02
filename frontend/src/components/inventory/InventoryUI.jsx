import React, { useEffect, useState } from 'react';
import PeriodicTable from '../codex/PeriodicTable';
import { ELEMENTS, RECIPES } from '../../features/battle/battleLogic';
import { formatFormula } from '../../core/utils';
import { eventBus } from '../../core/EventBus';
import { EVENTS } from '../../core/constants';
import { getQuestState } from '../../api/client';
import { useGameContext } from '../../core/GameContext';

export default function InventoryUI({
  activeTab = 'backpack',
  setActiveTab,
  userData,
  setUserData,
  onClose
}) {
  const [codexTab, setCodexTab] = useState('elements');
  const { questState, setQuestState } = useGameContext();
  const [questLoading, setQuestLoading] = useState(false);
  const [questError, setQuestError] = useState('');
  useEffect(() => {
    if (activeTab !== 'quests') return;

    let cancelled = false;

    const syncQuestState = async () => {
      setQuestLoading(true);
      setQuestError('');

      try {
        const latestQuestState = await getQuestState();
        if (cancelled) return;

        setQuestState(latestQuestState);
      } catch (error) {
        if (!cancelled) {
          setQuestError(error.message || 'Unable to load quest data');
        }
      } finally {
        if (!cancelled) {
          setQuestLoading(false);
        }
      }
    };

    syncQuestState();

    return () => {
      cancelled = true;
    };
  }, [activeTab, setQuestState]);

  const tabs = [
    { id: 'backpack', label: 'BACKPACK', icon: '🎒' },
    { id: 'codex', label: 'CODEX', icon: '📖' },
    { id: 'quests', label: 'QUESTS', icon: '📜' },
  ];
  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || 'BACKPACK';

  return (
    <div className="rpg-overlay dashboard-overlay animate-scale-up">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-avatar">{userData.level >= 10 ? '🧙‍♂️' : '🧪'}</div>
          <div className="sidebar-info">
            <span className="sidebar-name">Alchemist</span>
            <span className="sidebar-lvl">LVL {userData.level}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <button className="sidebar-close" onClick={onClose}>
          EXIT DASHBOARD
        </button>
      </div>

      <div className="dashboard-content">
        <div className="content-header">
          <div className="header-flex">
            <h2 className="content-title">
              {activeTabLabel}
            </h2>
            {activeTab === 'codex' && (
              <div className="codex-subnav">
                <button
                  className={`subnav-btn ${codexTab === 'elements' ? 'active' : ''}`}
                  onClick={() => setCodexTab('elements')}
                >ตารางธาตุ</button>
                <button
                  className={`subnav-btn ${codexTab === 'compounds' ? 'active' : ''}`}
                  onClick={() => setCodexTab('compounds')}
                >สูตรแปรธาตุ</button>
              </div>
            )}
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="content-body custom-scrollbar">
          {activeTab === 'backpack' && (
            <ItemsTab
              userData={userData}
              onClose={onClose}
            />
          )}
          {activeTab === 'codex' && (
            codexTab === 'elements'
              ? <PeriodicTable discoveredElements={userData.discovered} embedded={true} />
              : <CompoundCodex discovered={userData.discoveredCompounds || []} />
          )}
          {activeTab === 'quests' && (
            <QuestsTab
              questState={questState}
              isLoading={questLoading}
              error={questError}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CompoundCodex({ discovered }) {
  return (
    <div className="compound-codex animate-fade-in">
      <div className="recipe-grid">
        {RECIPES.map(recipe => {
          const isFound = discovered.includes(recipe.id);
          return (
            <div key={recipe.id} className={`recipe-card ${isFound ? 'discovered' : 'locked'}`}>
              <div className="recipe-icon" style={{ color: isFound ? recipe.color : '#444' }}>
                {isFound ? '🧪' : '❓'}
              </div>
              <div className="recipe-info">
                <h4 className="recipe-name" dangerouslySetInnerHTML={{ __html: isFound ? formatFormula(recipe.name) : '???' }} />
                <div className="recipe-formula">
                  {isFound ? (
                    Object.entries(recipe.formula).map(([el, qty]) => (
                      <span key={el} className="formula-part">
                        <span className="formula-el">{el}</span>
                        {qty > 1 && <sub className="formula-qty">{qty}</sub>}
                      </span>
                    ))
                  ) : (
                    <span className="formula-part">???</span>
                  )}
                </div>
                {isFound && (
                  <>
                    <div className="recipe-stats">
                      <span className="stat-dmg">DMG: {recipe.damage}</span>
                      <span className="stat-status">{recipe.status}</span>
                    </div>
                    {recipe.desc && <p className="recipe-desc">{recipe.desc}</p>}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/**
 * ItemsTab
 * Splits the inventory into Elements and Compounds sections.
 */
function ItemsTab({ userData, setUserData, onClose }) {
  const elements = userData.inventory.filter(item =>
    ELEMENTS.find(e => e.symbol === item.id)
  );

  const compounds = userData.inventory.filter(item =>
    RECIPES.find(r => r.id === item.id)
  );

  return (
    <div className="inventory-scroll animate-fade-in">
      <div className="inventory-resource-bar">
        <div className="resource-pill stardust">
          <span className="res-icon">✨</span>
          <span className="res-label">STARDUST:</span>
          <span className="res-value">{userData.stardust || 0}</span>
        </div>
      </div>
      {/* --- ELEMENTS SECTION --- */}
      {elements.length > 0 && (
        <section className="inventory-section">
          <h3 className="section-subtitle">ELEMENTS (ธาตุ)</h3>
          <div className="grid-container">
            {elements.map(item => {
              const info = ELEMENTS.find(e => e.symbol === item.id) || { name: item.id, color: '#aaa', desc: 'ข้อมูลธาตุลึกลับ' };
              return <ItemCard key={item.id} item={item} info={info} onCloseDashboard={onClose} />;
            })}
          </div>
        </section>
      )}

      {/* --- COMPOUNDS SECTION --- */}
      {compounds.length > 0 && (
        <section className="inventory-section">
          <h3 className="section-subtitle">COMPOUNDS (สารประกอบ)</h3>
          <div className="grid-container">
            {compounds.map(item => {
              const info = RECIPES.find(r => r.id === item.id) || { name: item.id, color: '#c084fc', desc: 'สารประกอบเคมีที่ยังไม่ถูกระบุ' };
              return <ItemCard key={item.id} item={item} info={info} isCompound={true} onCloseDashboard={onClose} />;
            })}
          </div>
        </section>
      )}

      {userData.inventory.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎒</div>
          <p>กระเป๋าว่างเปล่า... ออกเดินทางไปสะสมธาตุเพิ่มกันเถอะ!</p>
        </div>
      )}
    </div>
  );
}

function ItemCard({ item, info, isCompound = false, onCloseDashboard }) {
  const handleClick = () => {
    if (onCloseDashboard) onCloseDashboard();

    setTimeout(() => {
      eventBus.emit(EVENTS.TRIGGER_CHAT_WITH_PROMPT, `ช่วยอธิบายเกร็ดความรู้เกี่ยวกับ ${info.name} หน่อยครับ`);
    }, 200);
  };

  return (
    <div className={`item-card ${isCompound ? 'compound-card' : ''}`} onClick={handleClick} title="คลิกเพื่อถาม Oracle">
      <div className="item-qty">x{item.quantity}</div>
      <div className="item-symbol" style={{ color: info.color }} dangerouslySetInnerHTML={{ __html: formatFormula(info.symbol || info.id || item.id) }} />
      <div className="item-name" dangerouslySetInnerHTML={{ __html: formatFormula(info.name) }} />
      <div className="item-action-icon">💬</div>
      <div className="item-glow" style={{ background: info.color }}></div>
    </div>
  );
}

function QuestsTab({ questState, isLoading, error }) {
  const quests = (questState?.quests ?? []).filter(q => q.status === 'active' || q.status === 'completed');
  const activeQuest = questState?.active_quest ?? null;
  const completedCount = quests.filter(q => q.status === 'completed').length;

  return (
    <div className="quests-list animate-fade-in">
      {isLoading && (
        <div className="quest-summary-card">
          <div className="quest-summary-row">
            <span>Loading</span>
            <strong>Syncing quest progress from server...</strong>
          </div>
        </div>
      )}

      {error && (
        <div className="quest-summary-card quest-summary-error">
          <div className="quest-summary-row">
            <span>Quest sync error</span>
            <strong>{error}</strong>
          </div>
        </div>
      )}

      <div className="quest-summary-card">
        <div className="quest-summary-row">
          <span>Active</span>
          <strong>{activeQuest ? activeQuest.title : 'None'}</strong>
        </div>
        <div className="quest-summary-row">
          <span>Completed</span>
          <strong>{completedCount} / {quests.length}</strong>
        </div>
      </div>

      {quests.map(q => (
        <div key={q.id} className="quest-card">
          <div className="quest-status-icon">{q.status === 'completed' ? '✅' : '⏳'}</div>
          <div className="quest-details">
            <h3 className="quest-title">{q.title}</h3>
            <p className="quest-obj">เป้าหมาย: {q.objective}</p>
            {q.boss_name && <p className="quest-obj">บอส: {q.boss_name}</p>}
            {q.reward_xp ? <p className="quest-obj">รางวัล XP: {q.reward_xp}</p> : null}
            <span className={`quest-status-tag ${q.status}`}>{q.status}</span>
          </div>
        </div>
      ))}

      {!isLoading && quests.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📜</div>
          <p>ไม่พบข้อมูลเควสจากเซิร์ฟเวอร์</p>
        </div>
      )}
    </div>
  );
}
