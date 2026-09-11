import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadState, saveState, subscribeToSync } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => loadState());

  useEffect(() => {
    const unsubscribe = subscribeToSync((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const users = state.users || [];
  const currentUserId = state.currentUserId || null;
  const currentUser = users.find(u => u.id === currentUserId) || null;
  const isAuthenticated = !!currentUser;

  // Switch between demo users or any member
  const switchUser = (userId) => {
    const updated = {
      ...state,
      currentUserId: userId,
    };
    setState(updated);
    saveState(updated);
  };

  // Sign up a new real user account
  const signup = ({ name, email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email?.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newId = `usr_${Date.now()}`;
    const newUser = {
      id: newId,
      name: name.trim(),
      email: trimmedEmail,
      password: password || '123456', // Stored in client state
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      color: '#10b981',
      created_at: new Date().toISOString(),
    };

    const updated = {
      ...state,
      users: [...users, newUser],
      currentUserId: newId,
    };
    setState(updated);
    saveState(updated);
    return { success: true, user: newUser };
  };

  // Login as real user with email and password
  const login = (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email?.toLowerCase() === trimmedEmail);
    if (!existing) {
      return { success: false, message: 'No account found with this email. Please sign up.' };
    }

    if (existing.password && password && existing.password !== password) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }

    switchUser(existing.id);
    return { success: true, user: existing };
  };

  // Log out current user
  const logout = () => {
    const updated = {
      ...state,
      currentUserId: null,
    };
    setState(updated);
    saveState(updated);
  };

  // Update profile
  const updateProfile = (data) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => (u.id === currentUser.id ? { ...u, ...data } : u));
    const updated = {
      ...state,
      users: updatedUsers,
    };
    setState(updated);
    saveState(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        currentUserId,
        isAuthenticated,
        switchUser,
        signup,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
