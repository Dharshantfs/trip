import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrip } from '../../context/TripContext';
import { useTheme } from '../../hooks/useTheme';
import { Avatar } from '../common/Avatar';
import { 
  Compass, 
  ChevronDown, 
  Sun, 
  Moon, 
  UserCheck, 
  MapPin, 
  Plus, 
  Share2,
  Calendar
} from 'lucide-react';

export function Header({ onOpenCreateTrip, onOpenJoinTrip, onOpenInvite, onOpenProfile, onViewTrips, onOpenAuth }) {
  const { users, currentUser, switchUser } = useAuth();
  const { trips, activeTrip, setActiveTripId } = useTrip();
  const { theme, toggleTheme } = useTheme();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tripMenuOpen, setTripMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const tripMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (tripMenuRef.current && !tripMenuRef.current.contains(e.target)) {
        setTripMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      height: 'var(--header-height)',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-glass-nav)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
    }}>
      {/* Left: Brand & Active Trip Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Brand logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onViewTrips}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px var(--color-primary-glow)',
          }}>
            <Compass size={22} strokeWidth={2.4} />
          </div>
          <div className="brand-text" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}>
              Trip<span style={{ color: 'var(--color-primary)' }}>Split</span>
            </span>
            <span style={{ fontSize: '0.688rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              Smart Travel Splitter
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'var(--border-subtle)', margin: '0 4px' }} />

        {/* Active Trip Switcher */}
        {activeTrip ? (
          <div style={{ position: 'relative' }} ref={tripMenuRef}>
            <button
              onClick={() => setTripMenuOpen(!tripMenuOpen)}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: '0.875rem',
              }}
              title="Switch trip"
            >
              <MapPin size={15} color="var(--color-primary)" />
              <span style={{ fontWeight: 600, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeTrip.name}
              </span>
              <ChevronDown size={14} style={{ transform: tripMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {tripMenuOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: 260,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-lg)',
                padding: 8,
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
              }}>
                <div style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Your Trips
                </div>
                {trips.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveTripId(t.id);
                      setTripMenuOpen(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: t.id === activeTrip.id ? 'var(--color-primary-light)' : 'transparent',
                      color: t.id === activeTrip.id ? 'var(--color-primary)' : 'var(--text-main)',
                      fontWeight: t.id === activeTrip.id ? 600 : 400,
                      fontSize: '0.875rem',
                    }}
                  >
                    <div>
                      <div>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.destination}</div>
                    </div>
                    {t.id === activeTrip.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />}
                  </div>
                ))}

                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />

                <button
                  onClick={() => {
                    setTripMenuOpen(false);
                    onOpenCreateTrip();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: '0.85rem',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <Plus size={16} />
                  + Create New Trip
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Right: Quick User Switcher + Theme Toggle + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* User Switcher Dropdown (Crucial for multi-member testing) */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="btn-secondary"
            style={{
              padding: '4px 10px 4px 6px',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            title="Switch demo user"
          >
            <Avatar user={currentUser} size={28} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
              <span style={{ fontSize: '0.813rem', fontWeight: 600, lineHeight: 1.2 }}>
                {currentUser?.name || 'You'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600, lineHeight: 1 }}>
                Switch User
              </span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {userMenuOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 250,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: 8,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
            }}>
              <div style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Simulate As Member:
              </div>
              {users.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setUserMenuOpen(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: u.id === currentUser?.id ? 'var(--color-primary-light)' : 'transparent',
                    color: u.id === currentUser?.id ? 'var(--color-primary)' : 'var(--text-main)',
                    fontWeight: u.id === currentUser?.id ? 600 : 400,
                    fontSize: '0.875rem',
                  }}
                >
                  <Avatar user={u} size={28} />
                  <div style={{ flex: 1 }}>
                    <div>{u.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  {u.id === currentUser?.id && <UserCheck size={16} color="var(--color-primary)" />}
                </div>
              ))}

              <div style={{ height: 1, background: 'var(--border-subtle)', margin: '6px 0' }} />

              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  onOpenAuth();
                }}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.85rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <UserCheck size={15} />
                Sign In / Real Account
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="btn-ghost btn-icon"
          style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* Profile Button */}
        <button
          onClick={onOpenProfile}
          className="btn-ghost btn-icon"
          style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
          title="Account & Settings"
        >
          <Avatar user={currentUser} size={36} />
        </button>
      </div>
    </header>
  );
}
