// ============================================================
// GITA GYAN — SUPABASE DATABASE CLIENT
// Wraps Supabase with helper functions for all data operations
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

let supabase = null;

export function getDb() {
  if (!supabase && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

// Returns true if database is connected
export function isDbConnected() {
  return !!supabaseUrl && !!supabaseKey;
}

// ─── USER OPERATIONS ─────────────────────────────────────

export async function findUserByEmail(email) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('users').select('*').eq('email', email).single();
  return data;
}

export async function findUserById(id) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('users').select('*').eq('id', id).single();
  return data;
}

export async function createUser({ email, phone, passwordHash, displayName, language }) {
  const db = getDb();
  if (!db) return null;
  const { data, error } = await db.from('users').insert({
    email: email || null,
    phone: phone || null,
    password_hash: passwordHash || null,
    display_name: displayName || 'Seeker',
    language: language || 'en',
  }).select().single();
  if (error) throw error;
  // Also create profile
  await db.from('profiles').insert({ user_id: data.id });
  await db.from('streaks').insert({ user_id: data.id });
  return data;
}

export async function updateUser(id, updates) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('users').update(updates).eq('id', id).select().single();
  return data;
}

// ─── OTP OPERATIONS ──────────────────────────────────────

export async function createOtp(userId, token, purpose = 'login') {
  const db = getDb();
  if (!db) return null;
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min
  const { data } = await db.from('otp_tokens').insert({
    user_id: userId,
    token,
    purpose,
    expires_at: expiresAt,
  }).select().single();
  return data;
}

export async function verifyOtp(userId, token, purpose = 'login') {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('otp_tokens')
    .select('*')
    .eq('user_id', userId)
    .eq('token', token)
    .eq('purpose', purpose)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (data) {
    await db.from('otp_tokens').update({ used: true }).eq('id', data.id);
  }
  return data;
}

// ─── PROFILE OPERATIONS ──────────────────────────────────

export async function getProfile(userId) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('profiles').select('*').eq('user_id', userId).single();
  return data;
}

export async function upsertProfile(userId, updates) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('profiles').upsert({ user_id: userId, ...updates }).select().single();
  return data;
}

// ─── STREAK OPERATIONS ───────────────────────────────────

export async function getStreak(userId) {
  const db = getDb();
  if (!db) return { current_streak: 0, longest_streak: 0, last_read_date: null };
  const { data } = await db.from('streaks').select('*').eq('user_id', userId).single();
  return data || { current_streak: 0, longest_streak: 0, last_read_date: null };
}

export async function updateStreak(userId) {
  const db = getDb();
  if (!db) return null;
  const streak = await getStreak(userId);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak = streak.current_streak || 0;
  if (streak.last_read_date === today) {
    // Already read today
    return streak;
  } else if (streak.last_read_date === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  const longest = Math.max(newStreak, streak.longest_streak || 0);
  const { data } = await db.from('streaks').upsert({
    user_id: userId,
    last_read_date: today,
    current_streak: newStreak,
    longest_streak: longest,
  }).select().single();
  return data;
}

// ─── JOURNAL OPERATIONS ──────────────────────────────────

export async function addJournalEntry(userId, entry) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('journal_entries').insert({
    user_id: userId,
    happy: entry.happy || null,
    stressed: entry.stressed || null,
    learned: entry.learned || null,
    gita_connection: entry.gitaConnection || null,
  }).select().single();
  return data;
}

export async function getJournalEntries(userId, limit = 30) {
  const db = getDb();
  if (!db) return [];
  const { data } = await db.from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);
  return data || [];
}

// ─── MOOD OPERATIONS ─────────────────────────────────────

export async function recordMood(userId, mood, note) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('mood_entries').insert({
    user_id: userId,
    mood,
    note: note || null,
  }).select().single();
  return data;
}

export async function getMoodHistory(userId, limit = 30) {
  const db = getDb();
  if (!db) return [];
  const { data } = await db.from('mood_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

// ─── BOOKMARK OPERATIONS ─────────────────────────────────

export async function addBookmark(userId, verseKey, note = '') {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('bookmarks').upsert({
    user_id: userId,
    verse_key: verseKey,
    note,
  }, { onConflict: 'user_id,verse_key' }).select().single();
  return data;
}

export async function removeBookmark(userId, verseKey) {
  const db = getDb();
  if (!db) return false;
  const { error } = await db.from('bookmarks').delete()
    .eq('user_id', userId).eq('verse_key', verseKey);
  return !error;
}

export async function getBookmarks(userId) {
  const db = getDb();
  if (!db) return [];
  const { data } = await db.from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

// ─── COMMUNITY OPERATIONS ────────────────────────────────

export async function createReflection({ userId, verseKey, text, isAnonymous, mood }) {
  const db = getDb();
  if (!db) return null;
  const displayId = isAnonymous !== false ? `anon_${userId.slice(-4)}` : userId;
  const { data } = await db.from('reflections').insert({
    user_id: userId,
    verse_key: verseKey || null,
    text,
    is_anonymous: isAnonymous !== false,
    mood: mood || null,
  }).select().single();
  return { ...data, userId: displayId };
}

export async function getRecentReflections(limit = 20, offset = 0) {
  const db = getDb();
  if (!db) return [];
  const { data } = await db.from('reflections')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  return (data || []).map(r => ({
    ...r,
    userId: r.is_anonymous ? `anon_${r.user_id.slice(-4)}` : r.user_id,
    replies: [],
  }));
}

export async function likeReflection(id) {
  const db = getDb();
  if (!db) return null;
  const { data: current } = await db.from('reflections').select('likes').eq('id', id).single();
  if (!current) return null;
  const { data } = await db.from('reflections')
    .update({ likes: (current.likes || 0) + 1 })
    .eq('id', id)
    .select()
    .single();
  return data;
}

export async function replyToReflection(reflectionId, { userId, text, isAnonymous }) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('reflection_replies').insert({
    reflection_id: reflectionId,
    user_id: userId,
    text,
    is_anonymous: isAnonymous !== false,
  }).select().single();
  return data;
}

export async function getCommunityStats() {
  const db = getDb();
  if (!db) return { totalReflections: 0, todayReflections: 0, totalLikes: 0 };
  const today = new Date().toISOString().split('T')[0];
  const [total, todayCount, likes] = await Promise.all([
    db.from('reflections').select('id', { count: 'exact', head: true }),
    db.from('reflections').select('id', { count: 'exact', head: true }).eq('date', today),
    db.from('reflections').select('likes'),
  ]);
  const totalLikes = (likes.data || []).reduce((sum, r) => sum + (r.likes || 0), 0);
  return {
    totalReflections: total.count || 0,
    todayReflections: todayCount.count || 0,
    totalLikes,
  };
}

// ─── GAMIFICATION OPERATIONS ─────────────────────────────

export async function getTodayStats(userId) {
  const db = getDb();
  if (!db) return { activities: [], total_reward: 0 };
  const today = new Date().toISOString().split('T')[0];
  const { data } = await db.from('today_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();
  return data || { activities: [], total_reward: 0 };
}

export async function recordTodayActivity(userId, activity) {
  const db = getDb();
  if (!db) return null;
  const today = new Date().toISOString().split('T')[0];
  const stats = await getTodayStats(userId);
  const activities = [...(stats.activities || []), activity];
  const totalReward = activities.reduce((sum, a) => sum + (a.reward || 0), 0);
  const { data } = await db.from('today_stats').upsert({
    user_id: userId,
    date: today,
    activities,
    total_reward: totalReward,
  }, { onConflict: 'user_id,date' }).select().single();
  return data;
}

export async function getUserAchievements(userId) {
  const db = getDb();
  if (!db) return [];
  const { data } = await db.from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);
  return (data || []).map(d => d.achievement_id);
}

export async function unlockAchievement(userId, achievementId) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('user_achievements').upsert({
    user_id: userId,
    achievement_id: achievementId,
  }, { onConflict: 'user_id,achievement_id' }).select().single();
  return data;
}

// ─── CHAT SESSION OPERATIONS ─────────────────────────────

export async function getChatHistory(sessionId) {
  const db = getDb();
  if (!db) return [];
  const { data } = await db.from('chat_sessions')
    .select('history')
    .eq('id', sessionId)
    .single();
  return data?.history || [];
}

export async function saveChatHistory(sessionId, history, userId, ip) {
  const db = getDb();
  if (!db) return;
  await db.from('chat_sessions').upsert({
    id: sessionId,
    user_id: userId || null,
    ip_address: ip || null,
    history,
  }, { onConflict: 'id' });
}

export async function cleanupOldSessions() {
  const db = getDb();
  if (!db) return;
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await db.from('chat_sessions').delete().lt('updated_at', cutoff);
}

// ─── PAYMENT OPERATIONS ──────────────────────────────────

export async function createPayment(userId, { razorpayOrderId, amount, plan }) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('payments').insert({
    user_id: userId,
    razorpay_order_id: razorpayOrderId,
    amount,
    plan: plan || 'premium_monthly',
  }).select().single();
  return data;
}

export async function capturePayment(razorpayOrderId, { razorpayPaymentId, status }) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('payments')
    .update({ razorpay_payment_id: razorpayPaymentId, status: status || 'captured' })
    .eq('razorpay_order_id', razorpayOrderId)
    .select()
    .single();
  if (data && status === 'captured') {
    // Upgrade user to premium
    const premiumExpiry = new Date();
    premiumExpiry.setMonth(premiumExpiry.getMonth() + 1);
    await db.from('users').update({
      is_premium: true,
      premium_expires_at: premiumExpiry.toISOString(),
    }).eq('id', data.user_id);
  }
  return data;
}

export async function getUserPayments(userId) {
  const db = getDb();
  if (!db) return [];
  const { data } = await db.from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}

// ─── PUSH SUBSCRIPTION OPERATIONS ────────────────────────

export async function savePushSubscription(userId, { endpoint, p256dh, auth }) {
  const db = getDb();
  if (!db) return null;
  const { data } = await db.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint,
    p256dh,
    auth,
  }, { onConflict: 'user_id,endpoint' }).select().single();
  return data;
}

export async function getAllPushSubscriptions() {
  const db = getDb();
  if (!db) return [];
  const { data } = await db.from('push_subscriptions').select('*');
  return data || [];
}

// ─── USAGE TRACKING ──────────────────────────────────────

export async function logUsage(userId, ip, endpoint) {
  const db = getDb();
  if (!db) return;
  await db.from('usage_logs').insert({
    user_id: userId || null,
    ip_address: ip,
    endpoint,
  });
}

export async function getUserUsageCount(userId, endpoint, windowMs = 60000) {
  const db = getDb();
  if (!db) return 0;
  const since = new Date(Date.now() - windowMs).toISOString();
  const { count } = await db.from('usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .gt('created_at', since);
  return count || 0;
}

export async function getIpUsageCount(ip, endpoint, windowMs = 60000) {
  const db = getDb();
  if (!db) return 0;
  const since = new Date(Date.now() - windowMs).toISOString();
  const { count } = await db.from('usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .eq('endpoint', endpoint)
    .gt('created_at', since);
  return count || 0;
}
