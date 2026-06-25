// ============================================================
// GITA GYAN — USER PROFILES, GOALS, STREAKS
// In-memory storage (production: use PostgreSQL/Redis)
// ============================================================

const profiles = new Map(); // userId -> profile
const streaks = new Map(); // userId -> { lastRead, count }
const favorites = new Map(); // userId -> [verseKey]
const goalProgress = new Map(); // userId -> { goal: { progress, exercises } }

const SPIRITUAL_GOALS = {
  reduce_stress: {
    label: 'Reduce Stress',
    chapters: [2, 6],
    verses: ['2.47', '6.35', '2.14'],
    exercises: [
      'Practice 10 minutes of daily meditation',
      'Read Chapter 2 Verse 47 every morning',
      'Write down 3 things you\'re grateful for',
      'Take 5 deep breaths before reacting to stress',
    ],
  },
  improve_discipline: {
    label: 'Improve Discipline',
    chapters: [6, 3],
    verses: ['6.5', '3.19'],
    exercises: [
      'Wake up at the same time every day',
      'Practice Chapter 6 meditation techniques',
      'Set 3 daily goals and complete them',
      'Avoid one bad habit this week',
    ],
  },
  build_confidence: {
    label: 'Build Confidence',
    chapters: [2, 18],
    verses: ['2.48', '18.78', '6.5'],
    exercises: [
      'Read Chapter 2 Verses 47-48 daily',
      'Practice speaking up in one situation',
      'Write down your strengths',
      'Face one fear this week',
    ],
  },
  understand_spirituality: {
    label: 'Understand Spirituality',
    chapters: [2, 3, 5, 12, 18],
    verses: ['2.20', '3.19', '5.18', '12.13', '18.78'],
    exercises: [
      'Read one chapter per week',
      'Meditate for 15 minutes daily',
      'Journal your spiritual insights',
      'Practice seeing the divine in others',
    ],
  },
  improve_relationships: {
    label: 'Improve Relationships',
    chapters: [5, 12, 2],
    verses: ['5.18', '12.13', '2.62'],
    exercises: [
      'Practice seeing the divine in one person daily',
      'Forgive someone who hurt you',
      'Perform one act of kindness daily',
      'Practice active listening',
    ],
  },
};

function getOrCreateProfile(userId) {
  if (!profiles.has(userId)) {
    profiles.set(userId, {
      userId,
      goals: [],
      favoriteVerses: [],
      readingHistory: [],
      chapterProgress: {},
      totalVersesRead: 0,
      totalSessions: 0,
      createdAt: new Date().toISOString(),
    });
  }
  return profiles.get(userId);
}

function updateProfile(userId, updates) {
  const profile = getOrCreateProfile(userId);
  Object.assign(profile, updates);
  return profile;
}

function addGoal(userId, goalKey) {
  const profile = getOrCreateProfile(userId);
  if (!profile.goals.includes(goalKey)) {
    profile.goals.push(goalKey);
  }
  return profile;
}

function removeGoal(userId, goalKey) {
  const profile = getOrCreateProfile(userId);
  profile.goals = profile.goals.filter(g => g !== goalKey);
  return profile;
}

function toggleFavorite(userId, verseKey) {
  const profile = getOrCreateProfile(userId);
  const idx = profile.favoriteVerses.indexOf(verseKey);
  if (idx > -1) {
    profile.favoriteVerses.splice(idx, 1);
  } else {
    profile.favoriteVerses.push(verseKey);
  }
  return profile;
}

function recordRead(userId, chapter, verse) {
  const key = `${chapter}.${verse}`;
  const profile = getOrCreateProfile(userId);

  // Add to reading history if not already there
  if (!profile.readingHistory.includes(key)) {
    profile.readingHistory.push(key);
    profile.totalVersesRead++;
  }

  // Update chapter progress
  if (!profile.chapterProgress[chapter]) {
    profile.chapterProgress[chapter] = [];
  }
  if (!profile.chapterProgress[chapter].includes(verse)) {
    profile.chapterProgress[chapter].push(verse);
  }

  profile.totalSessions++;

  // Update streak
  const today = new Date().toDateString();
  const streak = streaks.get(userId) || { lastRead: '', count: 0 };

  if (streak.lastRead === today) {
    // Already read today
  } else {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (streak.lastRead === yesterday) {
      streak.count++;
    } else if (streak.lastRead === '') {
      streak.count = 1;
    } else {
      streak.count = 1; // Reset streak
    }
    streak.lastRead = today;
  }
  streaks.set(userId, streak);

  return { profile, streak };
}

function getStreak(userId) {
  const streak = streaks.get(userId) || { lastRead: '', count: 0 };
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Check if streak is still active
  if (streak.lastRead !== today && streak.lastRead !== yesterday) {
    streak.count = 0;
  }

  return streak;
}

function getProgress(userId) {
  const profile = getOrCreateProfile(userId);
  const streak = getStreak(userId);

  const totalChapters = 18;
  const totalVerses = 700; // Approximate total verses
  const chaptersRead = Object.keys(profile.chapterProgress).length;

  return {
    streak: streak.count,
    lastRead: streak.lastRead,
    totalVersesRead: profile.totalVersesRead,
    totalSessions: profile.totalSessions,
    chaptersRead,
    totalChapters,
    progressPercent: Math.round((chaptersRead / totalChapters) * 100),
    favoriteVerses: profile.favoriteVerses,
    goals: profile.goals,
    chapterProgress: profile.chapterProgress,
  };
}

function getGoalRecommendations(userId) {
  const profile = getOrCreateProfile(userId);
  const recommendations = [];

  for (const goalKey of profile.goals) {
    const goal = SPIRITUAL_GOALS[goalKey];
    if (goal) {
      recommendations.push({
        ...goal,
        key: goalKey,
        completed: false,
      });
    }
  }

  return recommendations;
}

export {
  SPIRITUAL_GOALS,
  getOrCreateProfile,
  updateProfile,
  addGoal,
  removeGoal,
  toggleFavorite,
  recordRead,
  getStreak,
  getProgress,
  getGoalRecommendations,
};
