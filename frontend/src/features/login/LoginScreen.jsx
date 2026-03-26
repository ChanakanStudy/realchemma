import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../core/AuthContext';
import './LoginScreen.css';

// Floating molecule particles config
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left:     `${Math.random() * 100}%`,
  size:     `${Math.random() * 6 + 3}px`,
  duration: `${Math.random() * 12 + 8}s`,
  delay:    `${Math.random() * 10}s`,
  color:    ['#d4af37', '#6366f1', '#10b981', '#60a5fa', '#c084fc'][i % 5],
  opacity:  Math.random() * 0.4 + 0.2,
}));

export default function LoginScreen() {
  const { login } = useAuth();
  const [name, setName]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleLogin = async () => {
    if (loading) return;
    const trimmed = name.trim();

    if (!trimmed) {
      setError('กรุณาตั้งชื่อนักเล่นแร่แปรธาตุก่อน');
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length < 2) {
      setError('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร');
      return;
    }

    setError('');
    setLoading(true);
    await login(trimmed);
    // AuthContext will update currentPlayer → App.jsx re-renders to MenuScreen
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div id="loginUI">

      {/* Floating Particles */}
      <div className="login-particles" aria-hidden="true">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left:              p.left,
              bottom:            '-20px',
              width:             p.size,
              height:            p.size,
              backgroundColor:   p.color,
              animationDuration: p.duration,
              animationDelay:    p.delay,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div className="login-logo-container">
        <h1 className="login-game-title">CHEMMA</h1>
        <div className="login-divider" />
        <p className="login-game-subtitle">The Alchemist Academy</p>
      </div>

      {/* Form Card */}
      <div className="login-form-card" role="main">
        <span className="login-label">Alchemist Name</span>

        <div className="login-input-wrapper">
          <span className="login-input-icon">⚗️</span>
          <input
            id="loginNameInput"
            ref={inputRef}
            type="text"
            placeholder="ตั้งชื่อตัวละครของคุณ..."
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            maxLength={24}
            disabled={loading}
            autoComplete="off"
          />
          <div className="login-input-glow" />
        </div>

        <p className="login-error" role="alert">
          {error}
        </p>

        <button
          id="loginBtn"
          onClick={handleLogin}
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          {loading ? 'กำลังเข้าสู่ Academy...' : 'Enter The Academy →'}
        </button>
      </div>

      {/* Flavor Text */}
      <p className="login-flavor-text">
        "May your formulas hold, and your crucible never crack."
      </p>

    </div>
  );
}
