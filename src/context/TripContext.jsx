import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { loadState, saveState, resetToDemoState, subscribeToSync } from '../utils/storage';
import { calculateNetBalances, simplifyDebts, getUserFinancialSummary } from '../utils/debtMinimizer';
import { useAuth } from './AuthContext';

const TripContext = createContext(null);

export function TripProvider({ children }) {
  const [dbState, setDbState] = useState(() => loadState());
  const { currentUser, currentUserId, users } = useAuth();

  // Listen to cross-tab or local storage changes
  useEffect(() => {
    const unsubscribe = subscribeToSync((newState) => {
      setDbState(newState);
    });
    return unsubscribe;
  }, []);

  const updateDb = (updater) => {
    setDbState(prev => {
      const nextState = typeof updater === 'function' ? updater(prev) : updater;
      saveState(nextState, true);
      return nextState;
    });
  };

  // Active Trip
  const trips = dbState.trips || [];
  const activeTripId = dbState.activeTripId || (trips[0]?.id ?? null);
  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0] || null;

  // Active Trip Members
  const tripMembers = useMemo(() => {
    if (!activeTrip) return [];
    const membersMap = (dbState.tripMembers || []).filter(tm => tm.trip_id === activeTrip.id);
    return membersMap.map(tm => {
      const u = users.find(user => user.id === tm.user_id) || {
        id: tm.user_id,
        name: 'Member',
        email: '',
        avatar: '',
      };
      return {
        ...u,
        role: tm.role || 'member',
        joined_at: tm.joined_at,
        trip_member_id: tm.id,
      };
    });
  }, [activeTrip, dbState.tripMembers, users]);

  // Active Trip Expenses
  const expenses = useMemo(() => {
    if (!activeTrip) return [];
    return (dbState.expenses || [])
      .filter(e => e.trip_id === activeTrip.id)
      .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));
  }, [activeTrip, dbState.expenses]);

  // Active Trip Settlements
  const settlements = useMemo(() => {
    if (!activeTrip) return [];
    return (dbState.settlements || [])
      .filter(s => s.trip_id === activeTrip.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activeTrip, dbState.settlements]);

  // Active Trip Activities
  const activities = useMemo(() => {
    if (!activeTrip) return [];
    return (dbState.activity || [])
      .filter(a => a.trip_id === activeTrip.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [activeTrip, dbState.activity]);

  // Financial Calculations
  const totalTripExpense = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses]);

  const netBalances = useMemo(() => {
    if (!activeTrip || tripMembers.length === 0) return {};
    return calculateNetBalances(tripMembers, expenses, settlements);
  }, [activeTrip, tripMembers, expenses, settlements]);

  const simplifiedDebts = useMemo(() => {
    return simplifyDebts(netBalances);
  }, [netBalances]);

  const userSummary = useMemo(() => {
    if (!currentUserId) return { netBalance: 0, youOwe: 0, youAreOwed: 0, isSettled: true };
    return getUserFinancialSummary(currentUserId, netBalances, simplifiedDebts);
  }, [currentUserId, netBalances, simplifiedDebts]);

  // Actions
  const setActiveTripId = (tripId) => {
    updateDb(prev => ({
      ...prev,
      activeTripId: tripId,
    }));
  };

  const createTrip = ({ name, destination, start_date, end_date, currency = 'INR' }) => {
    const tripId = `trip_${Date.now()}`;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newTrip = {
      id: tripId,
      name: name.trim(),
      destination: destination.trim(),
      start_date,
      end_date,
      currency,
      invite_code: code,
      created_by: currentUserId,
      created_at: new Date().toISOString(),
    };

    const newTripMember = {
      id: `tm_${tripId}_${currentUserId}`,
      trip_id: tripId,
      user_id: currentUserId,
      role: 'admin',
      joined_at: new Date().toISOString(),
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      trip_id: tripId,
      user_id: currentUserId,
      type: 'trip_created',
      metadata: { trip_name: newTrip.name },
      created_at: new Date().toISOString(),
    };

    updateDb(prev => ({
      ...prev,
      trips: [newTrip, ...(prev.trips || [])],
      tripMembers: [...(prev.tripMembers || []), newTripMember],
      activity: [newActivity, ...(prev.activity || [])],
      activeTripId: tripId,
    }));

    return newTrip;
  };

  const joinTrip = (inviteCode) => {
    const code = inviteCode.trim().toUpperCase();
    const targetTrip = trips.find(t => t.invite_code === code);
    if (!targetTrip) {
      return { success: false, message: 'Invalid invite code. Please check and try again.' };
    }

    // Check if already a member
    const existing = (dbState.tripMembers || []).find(
      tm => tm.trip_id === targetTrip.id && tm.user_id === currentUserId
    );
    if (existing) {
      setActiveTripId(targetTrip.id);
      return { success: true, message: 'You are already a member of this trip!', trip: targetTrip };
    }

    const newMember = {
      id: `tm_${targetTrip.id}_${currentUserId}`,
      trip_id: targetTrip.id,
      user_id: currentUserId,
      role: 'member',
      joined_at: new Date().toISOString(),
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      trip_id: targetTrip.id,
      user_id: currentUserId,
      type: 'member_joined',
      metadata: { trip_name: targetTrip.name },
      created_at: new Date().toISOString(),
    };

    updateDb(prev => ({
      ...prev,
      tripMembers: [...(prev.tripMembers || []), newMember],
      activity: [newActivity, ...(prev.activity || [])],
      activeTripId: targetTrip.id,
    }));

    return { success: true, message: `Joined ${targetTrip.name}!`, trip: targetTrip };
  };

  const addExpense = (expenseData) => {
    if (!activeTrip) return;
    const expenseId = `exp_${Date.now()}`;
    const newExpense = {
      id: expenseId,
      trip_id: activeTrip.id,
      description: expenseData.description,
      amount: Number(expenseData.amount),
      category: expenseData.category,
      paid_by: expenseData.paid_by,
      date: expenseData.date || new Date().toISOString().split('T')[0],
      created_by: currentUserId,
      created_at: new Date().toISOString(),
      splits: expenseData.splits,
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      trip_id: activeTrip.id,
      user_id: currentUserId,
      type: 'expense_created',
      metadata: { description: newExpense.description, amount: newExpense.amount },
      created_at: new Date().toISOString(),
    };

    updateDb(prev => ({
      ...prev,
      expenses: [newExpense, ...(prev.expenses || [])],
      activity: [newActivity, ...(prev.activity || [])],
    }));

    return newExpense;
  };

  const updateExpense = (expenseId, updatedData) => {
    if (!activeTrip) return;
    const target = expenses.find(e => e.id === expenseId);
    if (!target) return;

    const modifiedExpense = {
      ...target,
      ...updatedData,
      amount: Number(updatedData.amount || target.amount),
      updated_at: new Date().toISOString(),
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      trip_id: activeTrip.id,
      user_id: currentUserId,
      type: 'expense_updated',
      metadata: { description: modifiedExpense.description, amount: modifiedExpense.amount },
      created_at: new Date().toISOString(),
    };

    updateDb(prev => ({
      ...prev,
      expenses: (prev.expenses || []).map(e => (e.id === expenseId ? modifiedExpense : e)),
      activity: [newActivity, ...(prev.activity || [])],
    }));
  };

  const deleteExpense = (expenseId) => {
    if (!activeTrip) return;
    const target = expenses.find(e => e.id === expenseId);
    if (!target) return;

    const newActivity = {
      id: `act_${Date.now()}`,
      trip_id: activeTrip.id,
      user_id: currentUserId,
      type: 'expense_deleted',
      metadata: { description: target.description, amount: target.amount },
      created_at: new Date().toISOString(),
    };

    updateDb(prev => ({
      ...prev,
      expenses: (prev.expenses || []).filter(e => e.id !== expenseId),
      activity: [newActivity, ...(prev.activity || [])],
    }));
  };

  const settleDebt = ({ payer_id, receiver_id, amount }) => {
    if (!activeTrip) return;
    const settlementId = `settle_${Date.now()}`;
    const newSettlement = {
      id: settlementId,
      trip_id: activeTrip.id,
      payer_id,
      receiver_id,
      amount: Number(amount),
      status: 'settled',
      paid_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const newActivity = {
      id: `act_${Date.now()}`,
      trip_id: activeTrip.id,
      user_id: payer_id,
      type: 'settled',
      metadata: { receiver_id, amount: Number(amount) },
      created_at: new Date().toISOString(),
    };

    updateDb(prev => ({
      ...prev,
      settlements: [newSettlement, ...(prev.settlements || [])],
      activity: [newActivity, ...(prev.activity || [])],
    }));

    return newSettlement;
  };

  const removeMember = (memberId) => {
    if (!activeTrip) return { success: false, message: 'No active trip' };

    // 1. Verify admin rights
    const isAdmin = activeTrip.created_by === currentUserId || 
      tripMembers.find(m => m.id === currentUserId)?.role === 'admin';

    if (!isAdmin) {
      return { success: false, message: 'Only the trip admin can remove members.' };
    }

    if (memberId === activeTrip.created_by) {
      return { success: false, message: 'The trip creator cannot be removed.' };
    }

    const targetMember = tripMembers.find(m => m.id === memberId);
    if (!targetMember) {
      return { success: false, message: 'Member not found in this trip.' };
    }

    // 2. Outstanding balance check (must be 0 / settled)
    const currentBalance = netBalances[memberId] || 0;
    if (Math.abs(currentBalance) > 0.01) {
      const formattedAmt = Math.abs(currentBalance).toFixed(2);
      const isOwed = currentBalance > 0;
      return {
        success: false,
        message: `Cannot remove ${targetMember.name}: they have an outstanding ${isOwed ? 'credit' : 'debt'} of ₹${formattedAmt}. Please settle all expenses first so the trip tallies perfectly!`,
        outstandingBalance: currentBalance,
      };
    }

    // 3. Remove member from active trip
    const newActivity = {
      id: `act_${Date.now()}`,
      trip_id: activeTrip.id,
      user_id: currentUserId,
      type: 'member_removed',
      metadata: { member_name: targetMember.name },
      created_at: new Date().toISOString(),
    };

    updateDb(prev => ({
      ...prev,
      tripMembers: (prev.tripMembers || []).filter(
        tm => !(tm.trip_id === activeTrip.id && tm.user_id === memberId)
      ),
      activity: [newActivity, ...(prev.activity || [])],
    }));

    return {
      success: true,
      message: `${targetMember.name} was removed from ${activeTrip.name}. Balances remain fully tallied.`,
    };
  };

  const inviteMemberDirect = ({ name, email, sendEmail = true }) => {
    if (!activeTrip) return { success: false, message: 'No active trip' };

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    let existingUser = (dbState.users || []).find(u => u.email?.toLowerCase() === trimmedEmail);
    let newUsers = [...(dbState.users || [])];

    if (!existingUser) {
      existingUser = {
        id: `usr_${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
        color: '#10b981',
        created_at: new Date().toISOString(),
      };
      newUsers.push(existingUser);
    }

    // Check if already in trip
    const alreadyMember = (dbState.tripMembers || []).some(
      tm => tm.trip_id === activeTrip.id && tm.user_id === existingUser.id
    );

    if (alreadyMember) {
      return { success: false, message: `${existingUser.name} is already a member of this trip!` };
    }

    const newTripMember = {
      id: `tm_${activeTrip.id}_${existingUser.id}`,
      trip_id: activeTrip.id,
      user_id: existingUser.id,
      role: 'member',
      joined_at: new Date().toISOString(),
    };

    const newActivities = [
      {
        id: `act_${Date.now()}`,
        trip_id: activeTrip.id,
        user_id: currentUserId || existingUser.id,
        type: 'member_joined',
        metadata: { member_name: existingUser.name },
        created_at: new Date().toISOString(),
      }
    ];

    if (sendEmail) {
      newActivities.push({
        id: `act_email_${Date.now()}`,
        trip_id: activeTrip.id,
        user_id: currentUserId || existingUser.id,
        type: 'email_invite_sent',
        metadata: { recipient_name: existingUser.name, email: existingUser.email, code: activeTrip.invite_code },
        created_at: new Date().toISOString(),
      });
    }

    updateDb(prev => ({
      ...prev,
      users: newUsers,
      tripMembers: [...(prev.tripMembers || []), newTripMember],
      activity: [...newActivities, ...(prev.activity || [])],
    }));

    return {
      success: true,
      message: sendEmail 
        ? `Invitation email sent to ${existingUser.email} & added to trip!` 
        : `${existingUser.name} added to the trip!`,
      user: existingUser,
      emailSent: sendEmail,
    };
  };

  const resetDemo = () => {
    const fresh = resetToDemoState();
    setDbState(fresh);
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        activeTripId,
        setActiveTripId,
        tripMembers,
        expenses,
        settlements,
        activities,
        totalTripExpense,
        netBalances,
        simplifiedDebts,
        userSummary,
        createTrip,
        joinTrip,
        addExpense,
        updateExpense,
        deleteExpense,
        settleDebt,
        removeMember,
        inviteMemberDirect,
        resetDemo,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
