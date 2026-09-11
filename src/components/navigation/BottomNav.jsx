import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Handshake, 
  PieChart, 
  Users 
} from 'lucide-react';

export function BottomNav({ currentTab, setCurrentTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'settle', label: 'Settle', icon: Handshake },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'members', label: 'Members', icon: Users },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'var(--bottom-nav-height)',
      background: 'var(--bg-glass-nav)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 8px',
      zIndex: 90,
    }} className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              color: isActive ? 'var(--color-primary)' : 'var(--text-dim)',
              transition: 'color var(--transition-fast)',
              flex: 1,
              maxWidth: 72,
            }}
          >
            <div style={{
              position: 'relative',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              background: isActive ? 'var(--color-primary-light)' : 'transparent',
              transition: 'background-color var(--transition-fast)',
            }}>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span style={{
              fontSize: '0.688rem',
              fontWeight: isActive ? 600 : 500,
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
