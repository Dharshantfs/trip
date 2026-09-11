import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import { Avatar } from '../common/Avatar';
import { 
  User, 
  Mail, 
  RotateCcw, 
  Moon, 
  Sun, 
  UserPlus, 
  LogOut, 
  Check, 
  Shield 
} from 'lucide-react';

export function ProfileModal({ isOpen, onClose }) {
  const { currentUser, users, updateProfile, signup, logout } = useAuth();
  const { trips, resetDemo } = useTrip();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  if (!currentUser) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({ name: name.trim(), email: email.trim() });
    addToast({ type: 'success', message: 'Profile updated!' });
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    signup({ name: newName, email: newEmail });
    addToast({ type: 'success', message: `Welcome, ${newName}!` });
    setIsAddingUser(false);
    setNewName('');
    setNewEmail('');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset app state back to the original "Goa Trip 2026" demo with 6 friends?')) {
      resetDemo();
      addToast({ type: 'info', message: 'Demo data restored to initial Goa Trip 2026!' });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Account & Settings"
      subtitle="Manage your profile preferences and app data"
      maxWidth={480}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Profile Avatar & Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'var(--bg-app)',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}>
          <Avatar user={currentUser} size={56} />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{currentUser.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{currentUser.email}</div>
            <span className="badge badge-success" style={{ marginTop: 6, fontSize: '0.65rem' }}>
              Active Session
            </span>
          </div>
        </div>

        {/* Quick Edit Profile Form */}
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>

          <button type="submit" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
            <Check size={14} />
            Save Profile
          </button>
        </form>

        {/* Preferences */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            Preferences
          </div>

          {/* Theme Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {theme === 'dark' ? <Moon size={18} color="#6366f1" /> : <Sun size={18} color="#f59e0b" />}
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Theme Appearance</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Currently in {theme} mode</div>
              </div>
            </div>
            <button onClick={toggleTheme} className="btn btn-secondary btn-sm">
              Toggle Theme
            </button>
          </div>

          {/* Reset Demo Data Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RotateCcw size={18} color="var(--color-primary)" />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Reset Demo Data</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Reloads 6-member Goa Trip 2026 data</div>
              </div>
            </div>
            <button onClick={handleResetDemo} className="btn btn-secondary btn-sm">
              Reset Data
            </button>
          </div>
        </div>

        {/* Create New Account Option */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 16,
        }}>
          {!isAddingUser ? (
            <button
              onClick={() => setIsAddingUser(true)}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-primary)', fontWeight: 600 }}
            >
              <UserPlus size={16} />
              + Create another user account
            </button>
          ) : (
            <form onSubmit={handleCreateAccount} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Create New Member Account</div>
              <input
                type="text"
                placeholder="Full Name (e.g. Maya)"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="form-input"
              />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="form-input"
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">
                  Create & Switch
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout Session */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-danger)' }}>Log Out</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>End current active session</div>
          </div>
          <button
            onClick={() => {
              logout();
              addToast({ type: 'info', message: 'Logged out successfully' });
              onClose();
            }}
            className="btn btn-secondary btn-sm"
            style={{ color: 'var(--color-danger)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
          >
            <LogOut size={14} />
            Log Out
          </button>
        </div>
      </div>
    </Modal>
  );
}
