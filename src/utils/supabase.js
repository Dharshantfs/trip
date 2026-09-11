import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'tripsplit_supabase_config';

/**
 * Retrieve Supabase credentials from environment variables or local storage
 */
export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY;

  if (envUrl && envKey && envUrl.startsWith('http')) {
    return { url: envUrl.trim(), anonKey: envKey.trim(), source: 'env' };
  }

  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url.trim(), anonKey: parsed.anonKey.trim(), source: 'storage' };
      }
    }
  } catch {}

  return { url: '', anonKey: '', source: 'none' };
}

let supabaseInstance = null;
let currentCredsKey = '';

/**
 * Get or initialize the Supabase client instance
 */
export function getSupabase() {
  const creds = getSupabaseCredentials();
  const key = `${creds.url}_${creds.anonKey}`;

  if (!creds.url || !creds.anonKey) {
    return null;
  }

  if (!supabaseInstance || currentCredsKey !== key) {
    try {
      supabaseInstance = createClient(creds.url, creds.anonKey, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } },
      });
      currentCredsKey = key;
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function isSupabaseConfigured() {
  const creds = getSupabaseCredentials();
  return Boolean(creds.url && creds.anonKey);
}

export function saveSupabaseConfig(url, anonKey) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
    supabaseInstance = null; // force re-initialization
    return true;
  } catch {
    return false;
  }
}

export function clearSupabaseConfig() {
  try {
    localStorage.removeItem(CONFIG_KEY);
    supabaseInstance = null;
  } catch {}
}

/**
 * Test connectivity to Supabase
 */
export async function testSupabaseConnection(url, anonKey) {
  try {
    const testClient = createClient(url, anonKey);
    const { data, error } = await testClient.from('trips').select('id').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}

/* =========================================================================
   DATABASE API OPERATIONS (Direct Cloud PostgreSQL with RLS)
   ========================================================================= */

/**
 * USER OPERATIONS
 */
export async function dbFetchUser(email) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('users')
      .select('*')
      .ilike('email', email.trim())
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('dbFetchUser error:', err);
    return null;
  }
}

export async function dbFetchAllUsers() {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    const { data, error } = await sb.from('users').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('dbFetchAllUsers error:', err);
    return [];
  }
}

export async function dbUpsertUser(user) {
  const sb = getSupabase();
  if (!sb) return user;
  try {
    const { data, error } = await sb
      .from('users')
      .upsert(user, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data || user;
  } catch (err) {
    console.error('dbUpsertUser error:', err);
    return user;
  }
}

/**
 * TRIP OPERATIONS
 */
export async function dbFetchTripsForUser(userId) {
  const sb = getSupabase();
  if (!sb) return [];
  try {
    // 1. Fetch trip IDs the user belongs to
    const { data: memberRows, error: mErr } = await sb
      .from('trip_members')
      .select('trip_id')
      .eq('user_id', userId);

    if (mErr) throw mErr;
    const tripIds = (memberRows || []).map(r => r.trip_id);

    // 2. Fetch trips where user is a member OR creator
    let query = sb.from('trips').select('*');
    if (tripIds.length > 0) {
      query = query.or(`id.in.(${tripIds.map(id => `"${id}"`).join(',')}),created_by.eq.${userId}`);
    } else {
      query = query.eq('created_by', userId);
    }

    const { data: trips, error: tErr } = await query.order('created_at', { ascending: false });
    if (tErr) throw tErr;
    return trips || [];
  } catch (err) {
    console.error('dbFetchTripsForUser error:', err);
    return [];
  }
}

export async function dbFindTripByInviteCode(code) {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const cleanCode = code.trim().toUpperCase();
    const { data, error } = await sb
      .from('trips')
      .select('*')
      .ilike('invite_code', cleanCode)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('dbFindTripByInviteCode error:', err);
    return null;
  }
}

export async function dbCreateTrip({ trip, creatorUser }) {
  const sb = getSupabase();
  if (!sb) return trip;
  try {
    // Ensure creator user exists in users table first
    if (creatorUser) {
      await dbUpsertUser(creatorUser);
    }

    // Insert trip
    const { error: tripErr } = await sb.from('trips').insert(trip);
    if (tripErr) throw tripErr;

    // Insert admin membership
    const memberRow = {
      id: `tm_${trip.id}_${trip.created_by}`,
      trip_id: trip.id,
      user_id: trip.created_by,
      role: 'admin',
      joined_at: new Date().toISOString(),
    };
    const { error: memErr } = await sb.from('trip_members').insert(memberRow);
    if (memErr) throw memErr;

    // Insert activity
    const actRow = {
      id: `act_${Date.now()}`,
      trip_id: trip.id,
      user_id: trip.created_by,
      type: 'trip_created',
      metadata: { trip_name: trip.name },
      created_at: new Date().toISOString(),
    };
    await sb.from('activity').insert(actRow);

    return trip;
  } catch (err) {
    console.error('dbCreateTrip error:', err);
    throw err;
  }
}

export async function dbJoinTrip({ tripId, user, role = 'member' }) {
  const sb = getSupabase();
  if (!sb) return false;
  try {
    // Ensure user exists in users table
    await dbUpsertUser(user);

    // Check if already in trip_members
    const { data: existing } = await sb
      .from('trip_members')
      .select('*')
      .eq('trip_id', tripId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return true;
    }

    const memberRow = {
      id: `tm_${tripId}_${user.id}`,
      trip_id: tripId,
      user_id: user.id,
      role,
      joined_at: new Date().toISOString(),
    };
    const { error: memErr } = await sb.from('trip_members').insert(memberRow);
    if (memErr) throw memErr;

    // Record activity
    const actRow = {
      id: `act_${Date.now()}`,
      trip_id: tripId,
      user_id: user.id,
      type: 'member_joined',
      metadata: { member_name: user.name },
      created_at: new Date().toISOString(),
    };
    await sb.from('activity').insert(actRow);

    return true;
  } catch (err) {
    console.error('dbJoinTrip error:', err);
    throw err;
  }
}

/**
 * FETCH FULL TRIP DATA (Members, Expenses, Splits, Settlements, Activity)
 */
export async function dbFetchFullTripData(tripId) {
  const sb = getSupabase();
  if (!sb || !tripId) return null;
  try {
    const [membersRes, expRes, splitsRes, settleRes, actRes] = await Promise.all([
      sb.from('trip_members').select('*').eq('trip_id', tripId),
      sb.from('expenses').select('*').eq('trip_id', tripId).order('created_at', { ascending: false }),
      sb.from('expense_splits').select('*'),
      sb.from('settlements').select('*').eq('trip_id', tripId).order('created_at', { ascending: false }),
      sb.from('activity').select('*').eq('trip_id', tripId).order('created_at', { ascending: false }),
    ]);

    const tripMembers = membersRes.data || [];
    const rawExpenses = expRes.data || [];
    const allSplits = splitsRes.data || [];
    const settlements = settleRes.data || [];
    const activity = actRes.data || [];

    // Map splits into each expense object so front-end logic works seamlessly
    const splitsByExpenseId = {};
    for (const split of allSplits) {
      if (!splitsByExpenseId[split.expense_id]) {
        splitsByExpenseId[split.expense_id] = [];
      }
      splitsByExpenseId[split.expense_id].push({
        user_id: split.user_id,
        amount: Number(split.amount),
        percentage: split.percentage ? Number(split.percentage) : undefined,
      });
    }

    const expenses = rawExpenses.map(e => ({
      ...e,
      amount: Number(e.amount),
      splits: splitsByExpenseId[e.id] || [],
    }));

    // Fetch user profiles for members
    const memberUserIds = tripMembers.map(m => m.user_id);
    let users = [];
    if (memberUserIds.length > 0) {
      const { data: userData } = await sb
        .from('users')
        .select('*')
        .in('id', memberUserIds);
      users = userData || [];
    }

    return {
      tripMembers,
      expenses,
      settlements,
      activity,
      users,
    };
  } catch (err) {
    console.error('dbFetchFullTripData error:', err);
    return null;
  }
}

/**
 * EXPENSE OPERATIONS
 */
export async function dbCreateExpense({ expense, splits, creatorUserId }) {
  const sb = getSupabase();
  if (!sb) return expense;
  try {
    const expenseRow = {
      id: expense.id,
      trip_id: expense.trip_id,
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      paid_by: expense.paid_by,
      date: expense.date,
      created_by: creatorUserId,
      created_at: expense.created_at || new Date().toISOString(),
    };

    const { error: expErr } = await sb.from('expenses').insert(expenseRow);
    if (expErr) throw expErr;

    if (splits && splits.length > 0) {
      const splitRows = splits.map((s, idx) => ({
        id: `split_${expense.id}_${s.user_id}_${idx}`,
        expense_id: expense.id,
        user_id: s.user_id,
        amount: Number(s.amount),
        percentage: s.percentage ? Number(s.percentage) : null,
      }));
      const { error: splitErr } = await sb.from('expense_splits').insert(splitRows);
      if (splitErr) throw splitErr;
    }

    // Activity
    const actRow = {
      id: `act_${Date.now()}`,
      trip_id: expense.trip_id,
      user_id: creatorUserId,
      type: 'expense_created',
      metadata: { description: expense.description, amount: Number(expense.amount) },
      created_at: new Date().toISOString(),
    };
    await sb.from('activity').insert(actRow);

    return { ...expense, splits };
  } catch (err) {
    console.error('dbCreateExpense error:', err);
    throw err;
  }
}

export async function dbUpdateExpense({ expenseId, tripId, updatedData, splits, userId }) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const updatePayload = {
      description: updatedData.description,
      amount: Number(updatedData.amount),
      category: updatedData.category,
      paid_by: updatedData.paid_by,
      date: updatedData.date,
      updated_at: new Date().toISOString(),
    };

    const { error: expErr } = await sb.from('expenses').update(updatePayload).eq('id', expenseId);
    if (expErr) throw expErr;

    if (splits && splits.length > 0) {
      // Remove old splits and insert new splits
      await sb.from('expense_splits').delete().eq('expense_id', expenseId);
      const splitRows = splits.map((s, idx) => ({
        id: `split_${expenseId}_${s.user_id}_${idx}`,
        expense_id: expenseId,
        user_id: s.user_id,
        amount: Number(s.amount),
        percentage: s.percentage ? Number(s.percentage) : null,
      }));
      await sb.from('expense_splits').insert(splitRows);
    }

    // Activity
    const actRow = {
      id: `act_${Date.now()}`,
      trip_id: tripId,
      user_id: userId,
      type: 'expense_updated',
      metadata: { description: updatedData.description, amount: Number(updatedData.amount) },
      created_at: new Date().toISOString(),
    };
    await sb.from('activity').insert(actRow);
  } catch (err) {
    console.error('dbUpdateExpense error:', err);
    throw err;
  }
}

export async function dbDeleteExpense({ expenseId, tripId, description, amount, userId }) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { error } = await sb.from('expenses').delete().eq('id', expenseId);
    if (error) throw error;

    const actRow = {
      id: `act_${Date.now()}`,
      trip_id: tripId,
      user_id: userId,
      type: 'expense_deleted',
      metadata: { description, amount: Number(amount) },
      created_at: new Date().toISOString(),
    };
    await sb.from('activity').insert(actRow);
  } catch (err) {
    console.error('dbDeleteExpense error:', err);
    throw err;
  }
}

/**
 * SETTLEMENT OPERATIONS
 */
export async function dbSettleDebt(settlement) {
  const sb = getSupabase();
  if (!sb) return settlement;
  try {
    const settleRow = {
      id: settlement.id,
      trip_id: settlement.trip_id,
      payer_id: settlement.payer_id,
      receiver_id: settlement.receiver_id,
      amount: Number(settlement.amount),
      status: 'settled',
      paid_at: settlement.paid_at || new Date().toISOString(),
      created_at: settlement.created_at || new Date().toISOString(),
    };
    const { error } = await sb.from('settlements').insert(settleRow);
    if (error) throw error;

    const actRow = {
      id: `act_${Date.now()}`,
      trip_id: settlement.trip_id,
      user_id: settlement.payer_id,
      type: 'settled',
      metadata: { receiver_id: settlement.receiver_id, amount: Number(settlement.amount) },
      created_at: new Date().toISOString(),
    };
    await sb.from('activity').insert(actRow);

    return settlement;
  } catch (err) {
    console.error('dbSettleDebt error:', err);
    throw err;
  }
}

/**
 * MEMBER OPERATIONS
 */
export async function dbRemoveMember({ tripId, memberId, memberName, adminUserId }) {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { error } = await sb
      .from('trip_members')
      .delete()
      .eq('trip_id', tripId)
      .eq('user_id', memberId);

    if (error) throw error;

    const actRow = {
      id: `act_${Date.now()}`,
      trip_id: tripId,
      user_id: adminUserId,
      type: 'member_removed',
      metadata: { member_name: memberName },
      created_at: new Date().toISOString(),
    };
    await sb.from('activity').insert(actRow);
  } catch (err) {
    console.error('dbRemoveMember error:', err);
    throw err;
  }
}

/**
 * REALTIME SUBSCRIPTION
 */
export function subscribeToRealtime(onTableChange) {
  const sb = getSupabase();
  if (!sb) return () => {};

  try {
    const channel = sb
      .channel('tripsplit_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          if (onTableChange) {
            onTableChange(payload);
          }
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  } catch (err) {
    console.error('subscribeToRealtime error:', err);
    return () => {};
  }
}
