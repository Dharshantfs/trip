import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { LogIn, UserPlus, AlertCircle, Key, Mail, User, ShieldCheck } from 'lucide-react';

export function AuthModal({ isOpen, onClose }) {
  const { login, signup, users } = useAuth();
  const { addToast } = useToast();

  const [mode, setMode] = useState(users.length === 0 ? 'signup' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setMode(users.length === 0 ? 'signup' : 'login');
    }
  }, [isOpen, users.length]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!password || password.length < 4) {
        setError('Password must be at least 4 characters.');
        return;
      }

      const res = signup({ name: name.trim(), email: email.trim(), password });
      if (!res.success) {
        setError(res.message);
        return;
      }

      addToast({ type: 'success', message: `Welcome to TripSplit, ${name.trim()}!` });
      onClose();
    } else {
      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }

      const res = login(email.trim(), password);
      if (!res.success) {
        setError(res.message);
        return;
      }

      addToast({ type: 'success', message: `Welcome back, ${res.user.name}!` });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign In to TripSplit' : 'Create an Account'}
      subtitle="Access your trips, shared balances, and settlements"
      maxWidth={440}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Mode Switcher Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-app)',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className="btn btn-sm"
            style={{
              flex: 1,
              background: mode === 'login' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <LogIn size={15} />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className="btn btn-sm"
            style={{
              flex: 1,
              background: mode === 'signup' ? 'var(--color-primary)' : 'transparent',
              color: mode === 'signup' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
            }}
          >
            <UserPlus size={15} />
            Create Account
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 14 }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 14 }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Key size={16} color="var(--text-dim)" style={{ position: 'absolute', left: 12, top: 14 }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 6, padding: '12px' }}>
            {mode === 'login' ? 'Sign In' : 'Create My Account'}
          </button>
        </form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontSize: '0.75rem',
          color: 'var(--text-dim)',
          textAlign: 'center',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 12,
        }}>
          <ShieldCheck size={14} color="var(--color-primary)" />
          <span>Real-time private data stored securely in your browser</span>
        </div>
      </div>
    </Modal>
  );
}
