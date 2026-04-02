import React, { useState } from 'react';
import { ELEMENTS } from '../battle/battleLogic';
import { attemptExperimentFromInventory } from '../../core/alchemy';
import { buildInventoryDelta, queuePendingInventorySync, saveGameState } from '../../core/userState';
import { adjustInventory, runLabExperiment } from '../../api/client';

export default function LabScreen({ userData, setUserData, onClose }) {
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [craftNotice, setCraftNotice] = useState('LAB ONLINE. CHAMBER STABILIZED.');
  const [lastResult, setLastResult] = useState(null);
  const [labLog, setLabLog] = useState(['LAB ONLINE. CHAMBER STABILIZED.']);

  const elements = userData.inventory.filter(item =>
    ELEMENTS.find(e => e.symbol === item.id)
  );

  const currentCounts = selectedSymbols.reduce((acc, symbol) => {
    acc[symbol] = (acc[symbol] || 0) + 1;
    return acc;
  }, {});

  const availableCountFor = (symbol) => {
    const inventoryCount = userData.inventory.find(item => item.id === symbol)?.quantity || 0;
    return inventoryCount - (currentCounts[symbol] || 0);
  };

  const pushLabLog = (message) => {
    setLabLog(prev => [message, ...prev].slice(0, 8));
  };

  const addSymbol = (symbol) => {
    if (selectedSymbols.length >= 6) {
      const message = 'ห้องทดลองรับสารได้สูงสุด 6 ช่องต่อรอบ';
      setCraftNotice(message);
      pushLabLog(`REACTOR: ${message}`);
      return;
    }

    if (availableCountFor(symbol) <= 0) return;
    setCraftNotice('READY FOR TEST');
    setSelectedSymbols(prev => [...prev, symbol]);
    setLastResult(null);
  };

  const removeSymbol = (index) => {
    setSelectedSymbols(prev => prev.filter((_, i) => i !== index));
    setCraftNotice('READY FOR TEST');
    setLastResult(null);
  };

  const clearSymbols = () => {
    setSelectedSymbols([]);
    setCraftNotice('CHAMBER CLEARED');
    setLastResult(null);
  };

  const runExperiment = async () => {
    let result;
    let usedBackend = true;
    const previousInventory = userData.inventory;

    try {
      result = await runLabExperiment(selectedSymbols);
    } catch (error) {
      usedBackend = false;
      result = attemptExperimentFromInventory(userData, selectedSymbols);
    }

    if (!result.success) {
      setCraftNotice(result.message);
      setLastResult(result);
      pushLabLog(`REACTOR: ${result.message}`);
      return;
    }

    const nextState = {
      ...userData,
      inventory: result.inventory,
      discovered: result.discovered || userData.discovered,
      discoveredCompounds: result.discovered_compounds || result.discoveredCompounds || userData.discoveredCompounds,
      stats: result.stats || userData.stats,
    };

    if (setUserData) {
      setUserData(nextState);
    }
    saveGameState(nextState);

    if (!usedBackend) {
      const inventoryDelta = buildInventoryDelta(previousInventory, nextState.inventory);
      try {
        const syncedState = await adjustInventory(inventoryDelta);
        if (setUserData) {
          setUserData(prev => ({
            ...prev,
            inventory: syncedState.inventory,
            discovered: syncedState.discovered ?? prev.discovered,
            discoveredCompounds: syncedState.discovered_compounds ?? prev.discoveredCompounds,
          }));
        }
      } catch (syncError) {
        console.error('[CHEMMA] Failed to sync local craft to DB, queueing delta:', syncError);
        queuePendingInventorySync(inventoryDelta);
      }
    }

    setCraftNotice(result.message);
    setLastResult(result);
    pushLabLog(`REACTOR: ${result.message}`);
    setSelectedSymbols([]);
  };

  return (
    <div className="lab-overlay animate-scale-up">
      <div className="lab-backdrop" />
      <div className="lab-vfx lab-vfx-left" />
      <div className="lab-vfx lab-vfx-right" />
      <div className="lab-scanlines" />

      <div className="lab-shell">
        <div className="lab-shell-header">
          <div className="lab-shell-title-block">
            <div className="lab-shell-kicker">EXPERIMENTAL CHEMISTRY BAY</div>
            <div className="lab-shell-title">CRAFT LAB</div>
          </div>
          <div className="lab-shell-chip-row">
            <span className="lab-shell-chip">MANUAL MODE</span>
            <span className="lab-shell-chip">NO RECIPE LIST</span>
            <button className="lab-exit-button" onClick={onClose}>EXIT LAB</button>
          </div>
        </div>

        <div className="lab-shell-meta">
          <div className="lab-meta-card">
            <span>CHAMBER</span>
            <strong>{selectedSymbols.length} / 6</strong>
          </div>
          <div className="lab-meta-card">
            <span>FOCUS</span>
            <strong>{selectedSymbols.length >= 2 ? 'STABLE' : 'IDLE'}</strong>
          </div>
          <div className="lab-meta-card lab-meta-card-wide">
            <span>DIRECTIVE</span>
            <strong>ทดลองด้วยตัวเองและสังเกตผลลัพธ์</strong>
          </div>
        </div>

        <div className="lab-shell-body">
          <div className="lab-scene-body">
            <div className="lab-column lab-column-left">
              <div className="lab-panel lab-chamber-panel lab-panel-tall">
                <div className="lab-panel-title">REACTION CHAMBER</div>
                <div className="lab-chamber-core">
                  <div className="lab-chamber-glow" />
                  <div className="lab-chamber-content">
                    {selectedSymbols.length > 0 ? selectedSymbols.map((symbol, index) => (
                      <button
                        key={`${symbol}-${index}`}
                        type="button"
                        className="lab-token"
                        onClick={() => removeSymbol(index)}
                      >
                        <span>{symbol}</span>
                      </button>
                    )) : (
                      <div className="lab-empty-state">DROP REAGENTS INTO THE CHAMBER</div>
                    )}
                  </div>
                </div>

                <div className="lab-readout-grid">
                  <div className="lab-readout">
                    <span>CHAMBER</span>
                    <strong>{selectedSymbols.length} / 6</strong>
                  </div>
                  <div className="lab-readout">
                    <span>STABILITY</span>
                    <strong>{selectedSymbols.length >= 2 ? 'READY' : 'IDLE'}</strong>
                  </div>
                </div>

                <div className="lab-action-row">
                  <button className="lab-button lab-button-secondary" onClick={clearSymbols} disabled={selectedSymbols.length === 0}>
                    CLEAR
                  </button>
                  <button className="lab-button lab-button-primary" onClick={runExperiment} disabled={selectedSymbols.length < 2}>
                    RUN EXPERIMENT
                  </button>
                </div>
                <div className="lab-divider" />

                <div className="lab-observation-block">
                  <div className="lab-panel-title">OBSERVATION</div>
                  <div className="lab-status-badge">{craftNotice || 'NO REACTION YET'}</div>
                  {lastResult?.success && lastResult.recipe && (
                    <>
                      <div className="lab-status-line">
                        <span>OUTPUT</span>
                        <strong>{lastResult.recipe.name}</strong>
                      </div>
                      <div className="lab-status-line">
                        <span>TYPE</span>
                        <strong>{lastResult.recipe.status}</strong>
                      </div>
                      <div className="lab-status-line">
                        <span>POWER</span>
                        <strong>DMG {lastResult.recipe.damage}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="lab-column lab-column-center">
              <div className="lab-panel lab-material-panel lab-panel-tall">
                <div className="lab-panel-title">REAGENT SHELF</div>
                <p className="lab-panel-note">Pick reagents one by one. The chamber will tell you what happens.</p>
                <div className="lab-material-grid">
                  {elements.map(item => {
                    const info = ELEMENTS.find(e => e.symbol === item.id) || { name: item.id, color: '#aaa' };
                    const disabled = availableCountFor(item.id) <= 0;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`lab-material ${disabled ? 'locked' : ''}`}
                        onClick={() => addSymbol(item.id)}
                        disabled={disabled}
                        title="Add reagent to chamber"
                        style={{ '--lab-accent': info.color }}
                      >
                        <div className="item-qty">x{item.quantity}</div>
                        <div className="item-symbol">{item.id}</div>
                        <div className="item-name">{info.name}</div>
                        <div className="item-action-icon">+</div>
                        <div className="item-glow" style={{ background: info.color }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lab-column lab-column-right">
              <div className="lab-panel lab-terminal-panel lab-panel-tall">
                <div className="lab-panel-title">ARCANE TERMINAL</div>
                <div className="lab-terminal-list custom-scrollbar">
                  {labLog.map((line, index) => (
                    <div key={`${line}-${index}`} className={`lab-terminal-line ${index === 0 ? 'latest' : ''}`}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>

              <button className="lab-exit-button" onClick={onClose}>
                EXIT LAB
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}