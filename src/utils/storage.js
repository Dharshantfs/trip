import { createInitialDemoState } from './demoData.js';

const STORAGE_KEY = 'tripsplit_real_v3';

// Clear out legacy demo storage keys so browsers on Vercel immediately start fresh
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (localStorage.getItem('tripsplit_db_v1')) {
      localStorage.removeItem('tripsplit_db_v1');
    }
  }
} catch {}

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('tripsplit_sync_channel');
  }
} catch {
  // BroadcastChannel unavailable
}

/**
 * Clean production initial state
 */
export function createRealInitialState() {
  return createInitialDemoState();
}

/**
 * Load database state from localStorage or start fresh
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createRealInitialState();
      saveState(initial, false);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.trips || !parsed.users) {
      const initial = createRealInitialState();
      saveState(initial, false);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return createRealInitialState();
  }
}

/**
 * Save state to localStorage & broadcast
 */
export function saveState(state, broadcast = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (broadcast && broadcastChannel) {
      broadcastChannel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
    }
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

/**
 * Clear all data and reset to fresh empty state
 */
export function resetToDemoState() {
  const fresh = createRealInitialState();
  saveState(fresh, true);
  return fresh;
}

/**
 * Cross-tab synchronization
 */
export function subscribeToSync(callback) {
  const onBroadcast = (e) => {
    if (e.data && e.data.type === 'STATE_UPDATED') {
      callback(loadState());
    }
  };

  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(loadState());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', onBroadcast);
  }
  window.addEventListener('storage', onStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', onBroadcast);
    }
    window.removeEventListener('storage', onStorage);
  };
}
