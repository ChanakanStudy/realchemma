import React, { useState } from 'react';
import PeriodicTable from '../codex/PeriodicTable';
import { ELEMENTS, RECIPES } from '../../services/alchemyService';
import { formatFormula } from '../../core/utils';

export default function InventoryUI({
  activeTab = 'backpack',
  setActiveTab,
  userData,
  onClose
}) {
  const [codexTab, setCodexTab] = useState('elements');

  const tabs = [
    { id: 'backpack', label: 'BACKPACK', icon: '🎒' },
    { id: 'codex', label: 'CODEX', icon: '📖' },
    { id: 'quests', label: 'QUESTS', icon: '📜' },
  ];

  return (
    <div className="rpg-overlay dashboard-overlay">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-avatar">🧙</div>
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
              {tabs.find(t => t.id === activeTab)?.label}
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

        <div className="content-body">
          {activeTab === 'backpack' && <ItemsTab userData={userData} />}
          {activeTab === 'codex' && (
            codexTab === 'elements'
              ? <PeriodicTable discoveredElements={userData.discovered} embedded={true} />
              : <CompoundCodex discovered={userData.discoveredCompounds || []} />
          )}
          {activeTab === 'quests' && <QuestsTab quests={userData.quests} />}
        </div>
      </div>
    </div>
  );
}

function CompoundCodex({ discovered }) {
  return (
    <div className="compound-codex">
      <div className="recipe-grid">
        {RECIPES.map(recipe => {
          const isFound = discovered.includes(recipe.id);
          return (
            <div key={recipe.id} className={`recipe-card ${isFound ? 'discovered' : 'locked'}`}>
              <div className="recipe-icon" style={{ color: isFound ? recipe.color : '#444' }}>
                {isFound ? '🧪' : '❓'}
              </div>
              <div className="recipe-info">
                <h4 className="recipe-name">{isFound ? formatFormula(recipe.name) : '???'}</h4>
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
                  <div className="recipe-stats">
                    <span className="stat-dmg">DMG: {recipe.damage}</span>
                    <span className="stat-status">{recipe.status}</span>
                  </div>
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
function ItemsTab({ userData }) {
  const elements = userData.inventory.filter(item =>
    ELEMENTS.find(e => e.symbol === item.id)
  );

  const compounds = userData.inventory.filter(item =>
    RECIPES.find(r => r.id === item.id)
  );

  return (
    <div className="inventory-scroll">
      {/* --- ELEMENTS SECTION --- */}
      {elements.length > 0 && (
        <section className="inventory-section">
          <h3 className="section-subtitle">ELEMENTS (ธาตุ)</h3>
          <div className="grid-container">
            {elements.map(item => {
              const info = ELEMENTS.find(e => e.symbol === item.id) || { name: item.id, color: '#aaa' };
              return <ItemCard key={item.id} item={item} info={info} />;
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
              const info = RECIPES.find(r => r.id === item.id) || { name: item.id, color: '#c084fc' };
              return <ItemCard key={item.id} item={item} info={info} isCompound={true} />;
            })}
          </div>
        </section>
      )}

      {userData.inventory.length === 0 && (
        <div className="empty-state">
          <p>ไม่มีไอเทมในกระเป๋า... ออกไปสะสมธาตุเพิ่มเลย!</p>
        </div>
      )}
    </div>
  );
}

// Helper to render chemical formulas with subscripts (REMOVED: Moved to utils.js)

function ItemCard({ item, info, isCompound = false }) {
  return (
    <div className={`item-card ${isCompound ? 'compound-card' : ''}`}>
      <div className="item-qty">x{item.quantity}</div>
      <div className="item-symbol" style={{ color: info.color }}>
        {isCompound ? formatFormula(info.id || item.id) : item.id}
      </div>
      <div className="item-name">{isCompound ? formatFormula(info.name) : info.name}</div>
    </div>
  );
}

function QuestsTab({ quests }) {
  return (
    <div className="quests-list">
      {quests.map(q => (
        <div key={q.id} className="quest-card">
          <div className="quest-status-icon">{q.status === 'completed' ? '✅' : '⏳'}</div>
          <div className="quest-details">
            <h3 className="quest-title">{q.title}</h3>
            <p className="quest-obj">เป้าหมาย: {q.objective}</p>
            <span className={`quest-status-tag ${q.status}`}>{q.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
