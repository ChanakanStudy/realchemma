import React, { useState } from 'react';
import { PERIODIC_TABLE_DATA, ELEMENT_CATEGORIES } from '../../services/elementData';

export default function PeriodicTable({ discoveredElements = [], onClose, embedded = false }) {
  const [selected, setSelected] = useState(null);

  // Helper to check if an element is discovered
  const isDiscovered = (symbol) => discoveredElements.includes(symbol);

  const content = (
    <div className={`codex-content ${embedded ? 'embedded' : ''}`}>
      <div className="codex-main">
        <div className="periodic-grid">
          {PERIODIC_TABLE_DATA.map((el) => {
            const discovered = isDiscovered(el.symbol);
            const category = ELEMENT_CATEGORIES[el.category] || ELEMENT_CATEGORIES['unknown'];
            
            return (
              <div
                key={el.num}
                className={`element-cell ${discovered ? 'discovered' : 'locked'}`}
                style={{
                  gridColumn: el.x,
                  gridRow: el.y,
                  '--cat-color': category.color,
                }}
                onClick={() => discovered && setSelected(el)}
              >
                {discovered && <span className="el-num">{el.num}</span>}
                <span className="el-symbol">{discovered ? el.symbol : '?'}</span>
                {discovered && <div className="el-glow" style={{ background: category.color }}></div>}
              </div>
            );
          })}
        </div>

        {/* --- LEGEND --- */}
        <div className="codex-legend">
          {Object.entries(ELEMENT_CATEGORIES).map(([id, cat]) => (
            id !== 'unknown' && (
              <div key={id} className="legend-item">
                <span className="legend-color" style={{ background: cat.color }}></span>
                <span className="legend-label">{cat.name}</span>
              </div>
            )
          ))}
        </div>

        {/* --- DISCOVERY STATS --- */}
        <div className="codex-stats">
          <div className="stats-header">
            <span className="stats-title">DISCOVERY PROGRESS</span>
            <span className="stats-count">{discoveredElements.length} / {PERIODIC_TABLE_DATA.length}</span>
          </div>
          <div className="stats-progress-bg">
            <div 
              className="stats-progress-fill" 
              style={{ width: `${(discoveredElements.length / PERIODIC_TABLE_DATA.length) * 100}%` }}
            ></div>
          </div>
          <div className="stats-rank">
            RANK: {discoveredElements.length < 5 ? 'NOVICE ALCHEMIST' : discoveredElements.length < 20 ? 'CERTIFIED CHEMIST' : 'GRAND ALCHEMA'}
          </div>
        </div>
      </div>

      <div className="element-detail">
        {selected ? (
          <div className="detail-card animate-slide-in">
            <div className="detail-header" style={{ borderLeft: `8px solid ${ELEMENT_CATEGORIES[selected.category].color}` }}>
              <div className="detail-symbol-large">{selected.symbol}</div>
              <div style={{ flexGrow: 1 }}>
                <h2 className="detail-name">{selected.name}</h2>
                <p className="detail-category">{ELEMENT_CATEGORIES[selected.category].name} | #{selected.num}</p>
              </div>
            </div>
            <div className="detail-body">
              <div className="detail-stat">
                <span>Atomic Weight:</span>
                <strong>{selected.weight} u</strong>
              </div>
              <p className="detail-desc">{selected.desc}</p>
              <div className="detail-fact">
                <span className="fact-icon">💡</span>
                <span>{getChemistryFact(selected.symbol)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="detail-placeholder">
            <p>เลือกธาตุที่ค้นพบแล้วเพื่อดูข้อมูลรายละเอียด...</p>
            <div className="pulse-icon">🧪</div>
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) return content;

  return (
    <div className="rpg-overlay codex-overlay">
      <div className="overlay-header">
        <div className="overlay-title">PERIODIC TABLE CODEX (สมุดภาพตารางธาตุ)</div>
        <button className="close-chat" onClick={onClose}>×</button>
      </div>
      <div className="overlay-content">
        {content}
      </div>
    </div>
  );
}

function getChemistryFact(symbol) {
  const facts = {
    'H': 'ธาตุไฮโดรเจนเป็นธาตุที่พบมากที่สุดในจักรวาล (ประมาณ 75%)',
    'He': 'ฮีเลียมเป็นธาตุชนิดเดียวที่ไม่มีวันแข็งตัวภายใต้ความกดอากาศปกติ',
    'Li': 'ลิเธียมมีความหนาแน่นต่ำมากจนสามารถลอยบนน้ำได้ (และทำปฏิกิริยาด้วย!)',
    'C': 'เพชรและกราไฟต์ทำมาจากคาร์บอนเหมือนกัน แต่มีการจัดเรียงตัวของอะตอมต่างกัน',
    'O': 'ออกซิเจนเหลวจะมีสีฟ้าอ่อนๆ และมีคุณสมบัติเป็นพาราแมกเนติก (ถูกแม่เหล็กดูดได้)',
    'Na': 'โซเดียมเป็นโลหะที่นิ่มมากจนสามารถใช้มีดหั่นได้เหมือนเนย',
    'Fe': 'เหล็กเป็นธาตุที่พบได้มากที่สุดหากวัดตามมวลของโลกทั้งใบ (รวมถึงแกนกลางโลก)',
    'Cu': 'ทองแดงเป็นโลหะชนิดแรกๆ ที่มนุษย์นำมาหลอมใช้งาน ตั้งแต่เมื่อประมาณ 8,000 ปีก่อนคริสตกาล',
    'Ag': 'เงินเป็นโลหะที่มีค่าการนำไฟฟ้าสูงที่สุดในบรรดาธาตุทั้งหมด',
    'Au': 'ทองคำ 1 ออนซ์สามารถรีดเป็นแผ่นบางๆ จนคลุมพื้นที่ได้ถึง 100 ตารางฟุต',
    'Hg': 'ปรอทเป็นโลหะชนิดเดียวที่เป็นของเหลวได้ที่อุณหภูมิห้องปกติ',
    'Pb': 'ตะกั่วมีความหนาแน่นสูงมาก มักใช้ในการกำบังรังสีเอ็กซ์เรย์และกัมมันตภาพรังสี',
    'Ti': 'ไทเทเนียมมีความแข็งแกร่งเท่าเหล็กแต่เบากว่ามาก และทนต่อการกัดกร่อนจากน้ำทะเลได้ดีเยี่ยม',
    'U': 'ยูเรเนียม 1 กิโลกรัมสามารถผลิตพลังงานได้มหาศาล เท่ากับการเผาถ่านหินถึง 1,500 ตัน',
  };
  return facts[symbol] || 'ธาตุนี้แฝงไปด้วยพลังแห่งธรรมชาติที่รอการค้นพบเพิ่มเติม...';
}
