import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadState, saveState, subscribeToSync } from '../utils/storage';
import { 
  isSupabaseConfigured, 
  dbFetchUser, 
  dbUpsertUser 
} from '../utils/supabase';

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

  // Switch between users
  const switchUser = (userId) => {
    const updated = {
      ...state,
      currentUserId: userId,
    };
    setState(updated);
    saveState(updated);
  };

  // Sign up a new real user account
  const signup = async ({ name, email, password }) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check Cloud Database first if configured
    if (isSupabaseConfigured()) {
      try {
        const existingCloud = await dbFetchUser(trimmedEmail);
        if (existingCloud) {
          return { success: false, message: 'An account with this email already exists. Please sign in.' };
        }
      } catch (err) {
        console.error('Supabase user check error:', err);
      }
    }

    const existing = users.find(u => u.email?.toLowerCase() === trimmedEmail);
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newId = `usr_${Date.now()}`;
    const newUser = {
      id: newId,
      name: name.trim(),
      email: trimmedEmail,
      password: password || '123456',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      color: '#10b981',
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        await dbUpsertUser(newUser);
      } catch (err) {
        console.error('Failed to sync user to Supabase:', err);
      }
    }

    const updated = {
      ...state,
      users: [...users.filter(u => u.id !== newId), newUser],
      currentUserId: newId,
    };
    setState(updated);
    saveState(updated);
    return { success: true, user: newUser };
  };

  // Login as real user with email and password
  const login = async (email, password) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check Cloud Database first if configured
    if (isSupabaseConfigured()) {
      try {
        const cloudUser = await dbFetchUser(trimmedEmail);
        if (cloudUser) {
          if (cloudUser.password && password && cloudUser.password !== password) {
            return { success: false, message: 'Incorrect password. Please try again.' };
          }
          const updatedUsers = [...users.filter(u => u.id !== cloudUser.id), cloudUser];
          const updated = {
            ...state,
            users: updatedUsers,
            currentUserId: cloudUser.id,
          };
          setState(updated);
          saveState(updated);
          return { success: true, user: cloudUser };
        }
      } catch (err) {
        console.error('Supabase login check error:', err);
      }
    }

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
  const updateProfile = async (data) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data };
    
    if (isSupabaseConfigured()) {
      try {
        await dbUpsertUser(updatedUser);
      } catch (err) {
        console.error('Failed to update profile on Supabase:', err);
      }
    }

    const updatedUsers = users.map(u => (u.id === currentUser.id ? updatedUser : u));
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
