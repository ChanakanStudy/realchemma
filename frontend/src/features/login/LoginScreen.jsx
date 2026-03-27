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
  const { login, register } = useAuth();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const inputRef = useRef(null);

  // Auto-focus input on mount or mode change
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
    setError('');
  }, [isRegisterMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    const trimUser = username.trim();
    const trimEmail = email.trim();
    const trimPass = password.trim();

    setError('');

    if (isRegisterMode) {
      if (!trimUser || !trimEmail || !trimPass) {
        setError('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
      if (trimPass.length < 6) {
        setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
        return;
      }
      setLoading(true);
      try {
        await register(trimUser, trimEmail, trimPass);
      } catch (err) {
        setError(err.message || 'การสมัครสมาชิกผิดพลาด');
      } finally {
        setLoading(false);
      }
    } else {
      if (!trimUser || !trimPass) {
        setError('กรุณากรอกชื่อผู้ใช้/อีเมล และรหัสผ่าน');
        return;
      }
      setLoading(true);
      try {
        await login(trimUser, trimPass);
      } catch (err) {
        setError(err.message || 'ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง');
      } finally {
        setLoading(false);
      }
    }
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
      <form className="login-form-card" onSubmit={handleSubmit} role="main">
        <p className="login-card-title">
          {isRegisterMode ? 'Enlist in the Academy' : 'Enter the Academy'}
        </p>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <div className="login-input-wrapper">
          <label className="login-label">{isRegisterMode ? 'Username' : 'Username / Email'}</label>
          <input
            type="text"
            className="login-input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={isRegisterMode ? 'Alchemist Name' : 'Name or Email'}
            ref={inputRef}
            disabled={loading}
          />
          <div className="login-input-glow" />
        </div>

        {isRegisterMode && (
          <div className="login-input-wrapper">
            <label className="login-label">Email</label>
            <input
              type="email"
              className="login-input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="scrolls@academy.edu"
              disabled={loading}
            />
            <div className="login-input-glow" />
          </div>
        )}

        <div className="login-input-wrapper">
          <label className="login-label">Password</label>
          <input
            type="password"
            className="login-input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={loading}
          />
          <div className="login-input-glow" />
        </div>

        <button 
          type="submit" 
          id="loginBtn" 
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          {loading ? 'Transmuting...' : (isRegisterMode ? 'Register' : 'Login')}
        </button>

        <div className="login-toggle-mode">
          <span 
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
              setPassword('');
            }}
          >
            {isRegisterMode 
              ? 'Already enlisted? Return to Login' 
              : 'New here? Enlist in the Academy'}
          </span>
        </div>
      </form>

      {/* Flavor Text */}
      <p className="login-flavor-text">
        "May your formulas hold, and your crucible never crack."
      </p>
    </div>
  );
}
