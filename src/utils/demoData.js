export { CATEGORIES } from './constants.js';

/**
 * Clean production initial state with zero demo travelers and zero fake trips
 */
export function createInitialDemoState() {
  return {
    users: [],
    currentUserId: null,
    trips: [],
    activeTripId: null,
    tripMembers: [],
    expenses: [],
    settlements: [],
    activity: [],
  };
}
