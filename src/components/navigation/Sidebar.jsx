import React from 'react';
import { useTrip } from '../../context/TripContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Handshake, 
  PieChart, 
  Users, 
  Activity, 
  PlusCircle, 
  UserPlus, 
  Compass,
  FolderOpen
} from 'lucide-react';

export function Sidebar({ currentTab, setCurrentTab, onOpenAddExpense, onOpenInvite, onViewTrips }) {
  const { activeTrip } = useTrip();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'settle', label: 'Settle Up', icon: Handshake },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'activity', label: 'Activity Feed', icon: Activity },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 90,
      padding: '24px 16px',
    }} className="desktop-sidebar">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 24px', cursor: 'pointer' }} onClick={onViewTrips}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 12px var(--color-primary-glow)',
        }}>
          <Compass size={24} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '1.35rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            Trip<span style={{ color: 'var(--color-primary)' }}>Split</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>
            Travel Expense Manager
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        onClick={onOpenAddExpense}
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '12px 16px',
          marginBottom: 20,
          borderRadius: 'var(--radius-lg)',
          fontSize: '0.95rem',
        }}
      >
        <PlusCircle size={18} />
        Add Expense
      </button>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', padding: '0 12px 8px' }}>
          Trip Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--color-primary-light)' : 'transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.925rem',
                transition: 'all var(--transition-fast)',
                textAlign: 'left',
              }}
            >
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Shortcuts */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={onViewTrips}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 12px',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            borderRadius: 'var(--radius-md)',
          }}
          className="btn-ghost"
        >
          <FolderOpen size={17} />
          <span>Switch / View Trips</span>
        </button>

        {activeTrip && (
          <button
            onClick={onOpenInvite}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              borderRadius: 'var(--radius-md)',
            }}
            className="btn-ghost"
          >
            <UserPlus size={17} />
            <span>Invite Members ({activeTrip.invite_code})</span>
          </button>
        )}
      </div>
    </aside>
  );
}
