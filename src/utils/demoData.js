import { calculateEqualSplits } from './currency.js';

export const DEMO_USERS = [
  {
    id: 'usr_dharshan',
    name: 'Dharshan',
    email: 'dharshan@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    color: '#10b981',
  },
  {
    id: 'usr_arun',
    name: 'Arun',
    email: 'arun@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    color: '#6366f1',
  },
  {
    id: 'usr_karthik',
    name: 'Karthik',
    email: 'karthik@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    color: '#f59e0b',
  },
  {
    id: 'usr_vijay',
    name: 'Vijay',
    email: 'vijay@example.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    color: '#ec4899',
  },
  {
    id: 'usr_sanjay',
    name: 'Sanjay',
    email: 'sanjay@example.com',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    color: '#06b6d4',
  },
  {
    id: 'usr_rahul',
    name: 'Rahul',
    email: 'rahul@example.com',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    color: '#8b5cf6',
  },
];

export const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', icon: 'Utensils', color: '#f97316', emoji: '🍴' },
  { id: 'hotel', name: 'Hotel & Stay', icon: 'Hotel', color: '#3b82f6', emoji: '🏨' },
  { id: 'transport', name: 'Transport & Cab', icon: 'Car', color: '#10b981', emoji: '🚕' },
  { id: 'tickets', name: 'Tickets & Entry', icon: 'Ticket', color: '#8b5cf6', emoji: '🎟️' },
  { id: 'fuel', name: 'Fuel', icon: 'Fuel', color: '#eab308', emoji: '⛽' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', emoji: '🛍️' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Sparkles', color: '#06b6d4', emoji: '🍹' },
  { id: 'other', name: 'Other', icon: 'Package', color: '#64748b', emoji: '📦' },
];

const allUserIds = DEMO_USERS.map(u => u.id);

function buildExpenseSplits(amount, memberIds = allUserIds) {
  const map = calculateEqualSplits(amount, memberIds);
  return Object.values(map).map(item => ({
    user_id: item.userId,
    amount: item.amount,
    percentage: item.percentage,
  }));
}

export function createInitialDemoState() {
  const tripId = 'trip_goa_2026';
  
  const trip = {
    id: tripId,
    name: 'Goa Trip 2026',
    destination: 'Goa, India',
    start_date: '2026-11-12',
    end_date: '2026-11-16',
    currency: 'INR',
    invite_code: 'GOA6X9',
    created_by: 'usr_dharshan',
    created_at: new Date('2026-11-10T10:00:00Z').toISOString(),
  };

  const tripMembers = DEMO_USERS.map((user, index) => ({
    id: `tm_${tripId}_${user.id}`,
    trip_id: tripId,
    user_id: user.id,
    role: index === 0 ? 'admin' : 'member',
    joined_at: new Date('2026-11-10T10:30:00Z').toISOString(),
  }));

  const expenses = [
    {
      id: 'exp_1',
      trip_id: tripId,
      description: 'Grand Hyatt Villa Booking',
      amount: 12000,
      category: 'hotel',
      paid_by: 'usr_arun',
      date: '2026-11-12',
      created_by: 'usr_arun',
      created_at: new Date('2026-11-12T14:30:00Z').toISOString(),
      splits: buildExpenseSplits(12000),
    },
    {
      id: 'exp_2',
      trip_id: tripId,
      description: 'Fisherman’s Wharf Dinner',
      amount: 3600,
      category: 'food',
      paid_by: 'usr_dharshan',
      date: '2026-11-12',
      created_by: 'usr_dharshan',
      created_at: new Date('2026-11-12T21:15:00Z').toISOString(),
      splits: buildExpenseSplits(3600),
    },
    {
      id: 'exp_3',
      trip_id: tripId,
      description: 'Airport Cab Transfer',
      amount: 850,
      category: 'transport',
      paid_by: 'usr_karthik',
      date: '2026-11-12',
      created_by: 'usr_karthik',
      created_at: new Date('2026-11-12T11:00:00Z').toISOString(),
      splits: buildExpenseSplits(850),
    },
    {
      id: 'exp_4',
      trip_id: tripId,
      description: 'Infantaria Cafe Breakfast',
      amount: 1200,
      category: 'food',
      paid_by: 'usr_vijay',
      date: '2026-11-13',
      created_by: 'usr_vijay',
      created_at: new Date('2026-11-13T09:45:00Z').toISOString(),
      splits: buildExpenseSplits(1200),
    },
    {
      id: 'exp_5',
      trip_id: tripId,
      description: 'Baga Beach Watersports',
      amount: 2400,
      category: 'entertainment',
      paid_by: 'usr_sanjay',
      date: '2026-11-13',
      created_by: 'usr_sanjay',
      created_at: new Date('2026-11-13T16:20:00Z').toISOString(),
      splits: buildExpenseSplits(2400),
    },
    {
      id: 'exp_6',
      trip_id: tripId,
      description: 'Self-drive SUV Fuel Refill',
      amount: 3000,
      category: 'fuel',
      paid_by: 'usr_rahul',
      date: '2026-11-14',
      created_by: 'usr_rahul',
      created_at: new Date('2026-11-14T12:10:00Z').toISOString(),
      splits: buildExpenseSplits(3000),
    },
  ];

  const settlements = [
    // Preload an example settled transaction to demonstrate history
    {
      id: 'settle_1',
      trip_id: tripId,
      payer_id: 'usr_karthik',
      receiver_id: 'usr_arun',
      amount: 500,
      status: 'settled',
      paid_at: new Date('2026-11-13T19:00:00Z').toISOString(),
      created_at: new Date('2026-11-13T19:00:00Z').toISOString(),
    }
  ];

  const activity = [
    {
      id: 'act_1',
      trip_id: tripId,
      user_id: 'usr_rahul',
      type: 'expense_created',
      metadata: { description: 'Self-drive SUV Fuel Refill', amount: 3000 },
      created_at: new Date('2026-11-14T12:10:00Z').toISOString(),
    },
    {
      id: 'act_2',
      trip_id: tripId,
      user_id: 'usr_sanjay',
      type: 'expense_created',
      metadata: { description: 'Baga Beach Watersports', amount: 2400 },
      created_at: new Date('2026-11-13T16:20:00Z').toISOString(),
    },
    {
      id: 'act_3',
      trip_id: tripId,
      user_id: 'usr_karthik',
      type: 'settled',
      metadata: { receiver_id: 'usr_arun', amount: 500 },
      created_at: new Date('2026-11-13T19:00:00Z').toISOString(),
    },
    {
      id: 'act_4',
      trip_id: tripId,
      user_id: 'usr_vijay',
      type: 'expense_created',
      metadata: { description: 'Infantaria Cafe Breakfast', amount: 1200 },
      created_at: new Date('2026-11-13T09:45:00Z').toISOString(),
    },
    {
      id: 'act_5',
      trip_id: tripId,
      user_id: 'usr_dharshan',
      type: 'expense_created',
      metadata: { description: 'Fisherman’s Wharf Dinner', amount: 3600 },
      created_at: new Date('2026-11-12T21:15:00Z').toISOString(),
    },
    {
      id: 'act_6',
      trip_id: tripId,
      user_id: 'usr_arun',
      type: 'expense_created',
      metadata: { description: 'Grand Hyatt Villa Booking', amount: 12000 },
      created_at: new Date('2026-11-12T14:30:00Z').toISOString(),
    },
    {
      id: 'act_7',
      trip_id: tripId,
      user_id: 'usr_dharshan',
      type: 'trip_created',
      metadata: { trip_name: 'Goa Trip 2026' },
      created_at: new Date('2026-11-10T10:00:00Z').toISOString(),
    },
  ];

  return {
    users: DEMO_USERS,
    currentUserId: 'usr_dharshan',
    trips: [trip],
    activeTripId: tripId,
    tripMembers,
    expenses,
    settlements,
    activity,
  };
}
