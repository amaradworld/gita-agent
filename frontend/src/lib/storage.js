/* ─── Persistent Client-Side Storage ───
   Uses localStorage with JSON serialization.
   Provides fallback when backend in-memory storage is lost on restart.
*/

const PREFIX = 'gita_';

function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* quota exceeded — silently fail */ }
}

function remove(key) {
  try { localStorage.removeItem(PREFIX + key); } catch {}
}

/* ─── Bookmarks ─── */
export function getBookmarks(userId) {
  return get(`bookmarks_${userId}`, []);
}

export function addBookmark(userId, bookmark) {
  const all = getBookmarks(userId);
  const updated = [bookmark, ...all.filter(b => b.verseKey !== bookmark.verseKey)];
  set(`bookmarks_${userId}`, updated);
  return updated;
}

export function removeBookmark(userId, verseKey) {
  const all = getBookmarks(userId).filter(b => b.verseKey !== verseKey);
  set(`bookmarks_${userId}`, all);
  return all;
}

/* ─── Journal ─── */
export function getJournalEntries(userId) {
  return get(`journal_${userId}`, []);
}

export function addJournalEntry(userId, entry) {
  const all = getJournalEntries(userId);
  const updated = [entry, ...all];
  set(`journal_${userId}`, updated.slice(0, 100)); // keep last 100
  return updated;
}

/* ─── Mood History ─── */
export function getMoodHistory(userId) {
  return get(`mood_${userId}`, []);
}

export function addMoodEntry(userId, entry) {
  const all = getMoodHistory(userId);
  const updated = [entry, ...all];
  set(`mood_${userId}`, updated.slice(0, 60)); // keep last 60 days
  return updated;
}

/* ─── Streaks & Progress ─── */
export function getStreak(userId) {
  return get(`streak_${userId}`, { count: 0, lastDate: null });
}

export function updateStreak(userId) {
  const streak = getStreak(userId);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (streak.lastDate === today) return streak;
  if (streak.lastDate === yesterday) {
    const updated = { count: streak.count + 1, lastDate: today };
    set(`streak_${userId}`, updated);
    return updated;
  }
  const updated = { count: 1, lastDate: today };
  set(`streak_${userId}`, updated);
  return updated;
}

export function getReadingStats(userId) {
  return get(`stats_${userId}`, { versesRead: [], chaptersExplored: [], sessions: 0 });
}

export function recordActivity(userId, verseKey) {
  const stats = getReadingStats(userId);
  if (verseKey && !stats.versesRead.includes(verseKey)) {
    stats.versesRead.push(verseKey);
  }
  const chapter = verseKey?.split('.')[0];
  if (chapter && !stats.chaptersExplored.includes(chapter)) {
    stats.chaptersExplored.push(chapter);
  }
  stats.sessions += 1;
  set(`stats_${userId}`, stats);
  return stats;
}

/* ─── Goals ─── */
export function getUserGoals(userId) {
  return get(`goals_${userId}`, []);
}

export function setUserGoals(userId, goals) {
  set(`goals_${userId}`, goals);
  return goals;
}

/* ─── Quiz Scores ─── */
export function getQuizScores(userId) {
  return get(`quiz_${userId}`, []);
}

export function addQuizScore(userId, score) {
  const all = getQuizScores(userId);
  const updated = [score, ...all];
  set(`quiz_${userId}`, updated.slice(0, 50));
  return updated;
}

/* ─── First Visit Flag ─── */
export function isFirstVisit() {
  return !get('has_visited', false);
}

export function markVisited() {
  set('has_visited', true);
}

/* ─── User ID ─── */
export function getUserId() {
  let id = get('user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).slice(2, 10);
    set('user_id', id);
  }
  return id;
}
