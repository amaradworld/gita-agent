// ============================================================
// GITA GYAN — GAMIFICATION: Achievements, Daily Challenges
// ============================================================

const ACHIEVEMENTS = {
  first_chat: {
    id: 'first_chat',
    title: 'First Steps',
    description: 'Had your first conversation with the AI mentor',
    icon: '🌟',
    condition: (profile) => profile.totalSessions >= 1,
  },
  streak_3: {
    id: 'streak_3',
    title: 'Three Day Flame',
    description: 'Maintained a 3-day reading streak',
    icon: '🔥',
    condition: (profile, streak) => streak >= 3,
  },
  streak_7: {
    id: 'streak_7',
    title: 'Week of Wisdom',
    description: 'Maintained a 7-day reading streak',
    icon: '🔥',
    condition: (profile, streak) => streak >= 7,
  },
  streak_30: {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Maintained a 30-day reading streak',
    icon: '🏆',
    condition: (profile, streak) => streak >= 30,
  },
  streak_100: {
    id: 'streak_100',
    title: 'Century Seeker',
    description: 'Maintained a 100-day reading streak',
    icon: '👑',
    condition: (profile, streak) => streak >= 100,
  },
  verse_10: {
    id: 'verse_10',
    title: 'Verse Explorer',
    description: 'Read 10 unique verses',
    icon: '📖',
    condition: (profile) => profile.totalVersesRead >= 10,
  },
  verse_50: {
    id: 'verse_50',
    title: 'Knowledge Seeker',
    description: 'Read 50 unique verses',
    icon: '📚',
    condition: (profile) => profile.totalVersesRead >= 50,
  },
  verse_100: {
    id: 'verse_100',
    title: 'Gita Scholar',
    description: 'Read 100 unique verses',
    icon: '🎓',
    condition: (profile) => profile.totalVersesRead >= 100,
  },
  verse_700: {
    id: 'verse_700',
    title: 'Complete Master',
    description: 'Read all 700+ verses',
    icon: '🕉',
    condition: (profile) => profile.totalVersesRead >= 700,
  },
  chapter_5: {
    id: 'chapter_5',
    title: 'Chapter Hopper',
    description: 'Explored 5 different chapters',
    icon: '🌟',
    condition: (profile) => Object.keys(profile.chapterProgress || {}).length >= 5,
  },
  chapter_10: {
    id: 'chapter_10',
    title: 'Deep Diver',
    description: 'Explored 10 different chapters',
    icon: '📖',
    condition: (profile) => Object.keys(profile.chapterProgress || {}).length >= 10,
  },
  chapter_18: {
    id: 'chapter_18',
    title: 'Gita Master',
    description: 'Explored all 18 chapters',
    icon: '🏆',
    condition: (profile) => Object.keys(profile.chapterProgress || {}).length >= 18,
  },
  favorite_5: {
    id: 'favorite_5',
    title: 'Collector',
    description: 'Favorited 5 verses',
    icon: '❤️',
    condition: (profile) => (profile.favoriteVerses || []).length >= 5,
  },
  goal_setter: {
    id: 'goal_setter',
    title: 'Goal Setter',
    description: 'Set your first spiritual goal',
    icon: '🎯',
    condition: (profile) => (profile.goals || []).length >= 1,
  },
  goal_complete: {
    id: 'goal_complete',
    title: 'Goal Achiever',
    description: 'Completed all exercises for a goal',
    icon: '✨',
    condition: (profile) => (profile.completedGoals || []).length >= 1,
  },
  daily_reader: {
    id: 'daily_reader',
    title: 'Daily Devotee',
    description: 'Read the daily verse for 7 days',
    icon: '☀️',
    condition: (profile) => (profile.dailyVerseStreak || 0) >= 7,
  },
  scenario_explorer: {
    id: 'scenario_explorer',
    title: 'Life Navigator',
    description: 'Used the life guidance feature 5 times',
    icon: '🧭',
    condition: (profile) => (profile.scenarioSearches || 0) >= 5,
  },
  multilingual: {
    id: 'multilingual',
    title: 'Universal Soul',
    description: 'Used the app in 3 different languages',
    icon: '🌍',
    condition: (profile) => (profile.languagesUsed || []).length >= 3,
  },
};

const DAILY_CHALLENGES = [
  {
    id: 'read_verse',
    title: 'Read a Verse',
    description: 'Read any verse from the Bhagavad Gita',
    icon: '📖',
    reward: 10,
    check: (profile, todayStats) => todayStats.versesRead >= 1,
  },
  {
    id: 'meditate',
    title: 'Meditate',
    description: 'Use the voice feature to meditate with a verse',
    icon: '🧘',
    reward: 15,
    check: (profile, todayStats) => todayStats.ttsPlays >= 1,
  },
  {
    id: 'explore_chapter',
    title: 'Chapter Explorer',
    description: 'Read verses from 2 different chapters',
    icon: '📚',
    reward: 20,
    check: (profile, todayStats) => todayStats.chaptersExplored >= 2,
  },
  {
    id: 'daily_verse',
    title: 'Daily Wisdom',
    description: 'Read today\'s daily verse',
    icon: '☀️',
    reward: 10,
    check: (profile, todayStats) => todayStats.readDailyVerse,
  },
  {
    id: 'search_wisdom',
    title: 'Search for Wisdom',
    description: 'Use the life guidance search',
    icon: '🔍',
    reward: 10,
    check: (profile, todayStats) => todayStats.scenarioSearches >= 1,
  },
  {
    id: 'favorite_verse',
    title: 'Favorite Verse',
    description: 'Add a verse to your favorites',
    icon: '❤️',
    reward: 5,
    check: (profile, todayStats) => todayStats.favoritesToggled >= 1,
  },
  {
    id: 'goal_work',
    title: 'Goal Work',
    description: 'Work towards a spiritual goal',
    icon: '🎯',
    reward: 15,
    check: (profile, todayStats) => (profile.goals || []).length > 0 && todayStats.versesRead >= 1,
  },
  {
    id: 'bilingual',
    title: 'Polyglot Soul',
    description: 'Use the app in 2 different languages today',
    icon: '🌍',
    reward: 10,
    check: (profile, todayStats) => todayStats.languagesUsed.length >= 2,
  },
  {
    id: 'chat_mentor',
    title: 'Deep Conversation',
    description: 'Have 3 messages with the AI mentor',
    icon: '💬',
    reward: 15,
    check: (profile, todayStats) => todayStats.chatMessages >= 3,
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Read a verse before 8 AM',
    icon: '🌅',
    reward: 20,
    check: () => new Date().getHours() < 8,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Read a verse after 10 PM',
    icon: '🌙',
    reward: 20,
    check: () => new Date().getHours() >= 22,
  },
  {
    id: 'five_verses',
    title: 'Power Session',
    description: 'Read 5 verses in one day',
    icon: '⚡',
    reward: 25,
    check: (profile, todayStats) => todayStats.versesRead >= 5,
  },
];

// In-memory today stats (production: use Redis or DB)
const todayStatsMap = new Map(); // userId -> stats

function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function getTodayStats(userId) {
  const today = getTodayKey();
  const key = `${userId}:${today}`;
  if (!todayStatsMap.has(key)) {
    todayStatsMap.set(key, {
      versesRead: 0,
      chaptersExplored: new Set(),
      ttsPlays: 0,
      readDailyVerse: false,
      scenarioSearches: 0,
      favoritesToggled: 0,
      chatMessages: 0,
      languagesUsed: new Set(),
    });
  }
  return todayStatsMap.get(key);
}

function recordTodayActivity(userId, activity) {
  const stats = getTodayStats(userId);
  switch (activity.type) {
    case 'verse_read':
      stats.versesRead++;
      if (activity.chapter) stats.chaptersExplored.add(activity.chapter);
      break;
    case 'tts_play':
      stats.ttsPlays++;
      break;
    case 'daily_verse_read':
      stats.readDailyVerse = true;
      break;
    case 'scenario_search':
      stats.scenarioSearches++;
      break;
    case 'favorite_toggle':
      stats.favoritesToggled++;
      break;
    case 'chat_message':
      stats.chatMessages++;
      break;
    case 'language_used':
      if (activity.lang) stats.languagesUsed.add(activity.lang);
      break;
  }
}

function checkAchievements(profile, streak) {
  const unlocked = [];
  for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
    try {
      if (achievement.condition(profile, streak)) {
        unlocked.push({
          id,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
        });
      }
    } catch {}
  }
  return unlocked;
}

function getDailyChallenges(userId) {
  const profile = getTodayStats(userId);
  const today = getTodayKey();

  // Pick 3-5 challenges based on day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const startIdx = dayOfYear % DAILY_CHALLENGES.length;
  const count = 3 + (dayOfYear % 3); // 3, 4, or 5 challenges
  const challenges = [];
  for (let i = 0; i < count; i++) {
    const idx = (startIdx + i) % DAILY_CHALLENGES.length;
    const challenge = DAILY_CHALLENGES[idx];
    challenges.push({
      ...challenge,
      completed: challenge.check({}, profile),
    });
  }
  return challenges;
}

function getGamificationSummary(userId, profile, streak) {
  const achievements = checkAchievements(profile, streak);
  const challenges = getDailyChallenges(userId);
  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalReward = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.reward, 0);

  return {
    achievements,
    totalAchievements: Object.keys(ACHIEVEMENTS).length,
    unlockedCount: achievements.length,
    dailyChallenges: challenges,
    completedChallenges,
    totalChallenges: challenges.length,
    todayReward: totalReward,
    streak,
  };
}

export {
  ACHIEVEMENTS,
  DAILY_CHALLENGES,
  getTodayStats,
  recordTodayActivity,
  checkAchievements,
  getDailyChallenges,
  getGamificationSummary,
};
