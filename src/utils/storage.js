import { createInitialDemoState } from './demoData.js';

const STORAGE_KEY = 'tripsplit_db_v1';

let broadcastChannel = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('tripsplit_sync_channel');
  }
} catch {
  // BroadcastChannel unavailable
}

/**
 * Load entire database state from localStorage or seed initial demo state
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialDemoState();
      saveState(initial, false);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure all critical root keys exist
    if (!parsed.trips || !parsed.users) {
      const initial = createInitialDemoState();
      saveState(initial, false);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return createInitialDemoState();
  }
}

/**
 * Save entire database state to localStorage & broadcast event
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
 * Reset database to fresh demo state
 */
export function resetToDemoState() {
  const fresh = createInitialDemoState();
  saveState(fresh, true);
  return fresh;
}

/**
 * Subscribe to cross-tab updates
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
