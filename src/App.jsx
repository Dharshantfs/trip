import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider, useTrip } from './context/TripContext';
import { ToastProvider } from './components/common/Toast';
import { Header } from './components/navigation/Header';
import { Sidebar } from './components/navigation/Sidebar';
import { BottomNav } from './components/navigation/BottomNav';
import { HeroBalance } from './components/dashboard/HeroBalance';
import { WhoOwesWhom } from './components/dashboard/WhoOwesWhom';
import { RecentList } from './components/dashboard/RecentList';
import { ExpenseList } from './components/expenses/ExpenseList';
import { ExpenseModal } from './components/expenses/ExpenseModal';
import { ExpenseDetailModal } from './components/expenses/ExpenseDetailModal';
import { SettleUpView } from './components/settlement/SettleUpView';
import { MembersList } from './components/members/MembersList';
import { InviteModal } from './components/members/InviteModal';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ActivityFeed } from './components/activity/ActivityFeed';
import { TripSelector } from './components/trips/TripSelector';
import { CreateTripModal } from './components/trips/CreateTripModal';
import { JoinTripModal } from './components/trips/JoinTripModal';
import { ProfileModal } from './components/profile/ProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { DatabaseModal } from './components/database/DatabaseModal';
import { Plus, Database, Sparkles } from 'lucide-react';

function TripSplitApp() {
  const { activeTrip, isCloudConfigured, reloadCloudData } = useTrip();
  const { currentUser, isAuthenticated } = useAuth();

  const [currentTab, setCurrentTab] = useState(activeTrip ? 'dashboard' : 'trips');
  const [isAuthOpen, setIsAuthOpen] = useState(!currentUser);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [detailExpense, setDetailExpense] = useState(null);
  const [isCreateTripOpen, setIsCreateTripOpen] = useState(false);
  const [isJoinTripOpen, setIsJoinTripOpen] = useState(false);
  const [initialJoinCode, setInitialJoinCode] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [dismissCloudBanner, setDismissCloudBanner] = useState(false);

  // If no trip is selected or trips are empty, automatically stay on 'trips' view
  useEffect(() => {
    if (!activeTrip && currentTab !== 'trips') {
      setCurrentTab('trips');
    }
  }, [activeTrip, currentTab]);

  // Check URL query parameters on load for direct invite link (e.g. ?join=GOA6X9 or ?invite=GOA6X9)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get('join') || params.get('invite');
      if (joinCode) {
        setInitialJoinCode(joinCode.toUpperCase());
        if (!currentUser) {
          setIsAuthOpen(true);
        } else {
          setIsJoinTripOpen(true);
        }
      }
    } catch {}
  }, [currentUser]);

  const handleOpenAddExpense = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setEditingExpense(null);
    setIsAddExpenseOpen(true);
  };

  const handleOpenCreateTrip = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setIsCreateTripOpen(true);
  };

  const handleOpenJoinTrip = (code = '') => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setInitialJoinCode(code);
    setIsJoinTripOpen(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  };

  const handleSelectExpense = (expense) => {
    setDetailExpense(expense);
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddExpense={handleOpenAddExpense}
        onOpenInvite={() => setIsInviteOpen(true)}
        onViewTrips={() => setCurrentTab('trips')}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        {/* Sticky Header */}
        <Header
          onOpenCreateTrip={handleOpenCreateTrip}
          onOpenJoinTrip={() => handleOpenJoinTrip('')}
          onOpenInvite={() => setIsInviteOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onViewTrips={() => setCurrentTab('trips')}
          onOpenDatabase={() => setIsDatabaseOpen(true)}
        />

        {/* Content Area */}
        <main className="content-area">
          {/* Cloud Database Notice Banner if not yet connected */}
          {!isCloudConfigured && !dismissCloudBanner && (
            <div style={{
              marginBottom: 20,
              padding: '12px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-warning-bg)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Database size={20} color="var(--color-warning)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  <strong>Multi-Phone Real DB Sync:</strong> Connect your free Supabase database so your friends on other devices can join trips via invite codes instantly!
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setIsDatabaseOpen(true)}
                  className="btn btn-secondary btn-sm"
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderColor: 'rgba(245, 158, 11, 0.6)',
                  }}
                >
                  Connect Supabase
                </button>
                <button
                  onClick={() => setDismissCloudBanner(true)}
                  className="btn-ghost btn-sm"
                  style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '6px' }}
                  title="Dismiss banner"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {currentTab === 'trips' && (
            <TripSelector
              onSelectTrip={() => setCurrentTab('dashboard')}
              onOpenCreateTrip={handleOpenCreateTrip}
              onOpenJoinTrip={() => handleOpenJoinTrip('')}
            />
          )}

          {currentTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <HeroBalance
                onOpenAddExpense={handleOpenAddExpense}
                onOpenSettle={() => setCurrentTab('settle')}
                onOpenInvite={() => setIsInviteOpen(true)}
              />

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 24,
              }}>
                <WhoOwesWhom onOpenSettle={() => setCurrentTab('settle')} />
                <RecentList
                  onOpenAddExpense={handleOpenAddExpense}
                  onViewAllExpenses={() => setCurrentTab('expenses')}
                  onSelectExpense={handleSelectExpense}
                />
              </div>
            </div>
          )}

          {currentTab === 'expenses' && (
            <ExpenseList
              onOpenAddExpense={handleOpenAddExpense}
              onSelectExpense={handleSelectExpense}
            />
          )}

          {currentTab === 'settle' && <SettleUpView />}

          {currentTab === 'members' && (
            <MembersList 
              onOpenInvite={() => setIsInviteOpen(true)} 
              onOpenSettle={() => setCurrentTab('settle')}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsView />}

          {currentTab === 'activity' && <ActivityFeed />}
        </main>

        {/* Mobile Floating Action Button for Add Expense */}
        {activeTrip && currentTab !== 'trips' && (
          <button
            onClick={handleOpenAddExpense}
            className="fab-add"
            aria-label="Add new expense"
          >
            <Plus size={26} strokeWidth={2.5} />
          </button>
        )}

        {/* Mobile Bottom Navigation */}
        <BottomNav currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>

      {/* Modals */}
      <ExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setEditingExpense(null);
        }}
        editingExpense={editingExpense}
      />

      <ExpenseDetailModal
        isOpen={!!detailExpense}
        onClose={() => setDetailExpense(null)}
        expense={detailExpense}
        onEdit={handleEditExpense}
      />

      <CreateTripModal
        isOpen={isCreateTripOpen}
        onClose={() => setIsCreateTripOpen(false)}
      />

      <JoinTripModal
        isOpen={isJoinTripOpen}
        onClose={() => setIsJoinTripOpen(false)}
        initialCode={initialJoinCode}
        onOpenDatabaseModal={() => setIsDatabaseOpen(true)}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <DatabaseModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
        onConnected={() => reloadCloudData()}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <TripProvider>
          <TripSplitApp />
        </TripProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
