// ============================================================
// GITA GYAN — COMMUNITY FEATURES
// Shared reflections, anonymous sharing, daily prompts
// ============================================================

// In-memory storage (production: use PostgreSQL/Redis)
const reflections = new Map(); // id -> reflection
const dailyPrompts = new Map(); // date -> prompt
const reflectionsByDate = new Map(); // date -> [ids]

const DAILY_PROMPTS = [
  { text: 'What lesson from the Gita helped you today?', emoji: '📖' },
  { text: 'Share a moment of peace you experienced today.', emoji: '☮️' },
  { text: 'How did you practice detachment today?', emoji: '🍃' },
  { text: 'What emotion did the Gita help you manage?', emoji: '🧘' },
  { text: 'Share one act of kindness you performed today.', emoji: '❤️' },
  { text: 'How did you apply karma yoga in your work?', emoji: '💼' },
  { text: 'What verse resonated with you most today?', emoji: '✨' },
  { text: 'How did you stay present and mindful today?', emoji: '🌅' },
  { text: 'Share something you are grateful for.', emoji: '🙏' },
  { text: 'How did you handle a difficult situation today?', emoji: '💪' },
  { text: 'What wisdom did you share with someone today?', emoji: '💡' },
  { text: 'How did you practice non-attachment today?', emoji: '🕊' },
  { text: 'Share a moment when you chose dharma over desire.', emoji: '⚖️' },
  { text: 'What inner strength did you discover today?', emoji: '🔥' },
  { text: 'How did you find peace in chaos today?', emoji: '🌊' },
];

function getDailyPrompt() {
  const today = new Date().toISOString().split('T')[0];
  if (!dailyPrompts.has(today)) {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const promptIdx = dayOfYear % DAILY_PROMPTS.length;
    dailyPrompts.set(today, {
      date: today,
      ...DAILY_PROMPTS[promptIdx],
    });
  }
  return dailyPrompts.get(today);
}

function createReflection({ userId, verseKey, text, isAnonymous = true, mood }) {
  const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const today = new Date().toISOString().split('T')[0];

  const reflection = {
    id,
    userId: isAnonymous ? `anon_${userId.slice(-4)}` : userId,
    verseKey: verseKey || null,
    text,
    isAnonymous,
    mood: mood || null,
    date: today,
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: [],
  };

  reflections.set(id, reflection);

  // Index by date
  if (!reflectionsByDate.has(today)) {
    reflectionsByDate.set(today, []);
  }
  reflectionsByDate.get(today).push(id);

  return reflection;
}

function getRecentReflections(limit = 20, offset = 0) {
  const allReflections = Array.from(reflections.values());
  allReflections.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return allReflections.slice(offset, offset + limit);
}

function getReflectionsByDate(date) {
  const ids = reflectionsByDate.get(date) || [];
  return ids.map(id => reflections.get(id)).filter(Boolean);
}

function likeReflection(id) {
  const reflection = reflections.get(id);
  if (reflection) {
    reflection.likes++;
    return reflection;
  }
  return null;
}

function replyToReflection(id, { userId, text, isAnonymous = true }) {
  const reflection = reflections.get(id);
  if (reflection) {
    const reply = {
      id: `reply_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: isAnonymous ? `anon_${userId.slice(-4)}` : userId,
      text,
      isAnonymous,
      createdAt: new Date().toISOString(),
    };
    reflection.replies.push(reply);
    return reply;
  }
  return null;
}

function getCommunityStats() {
  const today = new Date().toISOString().split('T')[0];
  const todayReflections = getReflectionsByDate(today);

  // Mood distribution
  const moodCounts = {};
  for (const ref of reflections.values()) {
    if (ref.mood) {
      moodCounts[ref.mood] = (moodCounts[ref.mood] || 0) + 1;
    }
  }

  // Top moods
  const topMoods = Object.entries(moodCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([mood, count]) => ({ mood, count }));

  return {
    totalReflections: reflections.size,
    todayReflections: todayReflections.length,
    totalLikes: Array.from(reflections.values()).reduce((sum, r) => sum + r.likes, 0),
    topMoods,
    dailyPrompt: getDailyPrompt(),
  };
}

// Seed some example reflections for demo
function seedDemoReflections() {
  const demoReflections = [
    {
      userId: 'demo-user-1',
      verseKey: '2.47',
      text: 'Today I focused on my work without worrying about the outcome. It brought so much peace.',
      mood: 'peaceful',
      isAnonymous: true,
    },
    {
      userId: 'demo-user-2',
      verseKey: '6.35',
      text: 'Meditated for 10 minutes this morning. The mind was restless but I kept bringing it back.',
      mood: 'meditative',
      isAnonymous: true,
    },
    {
      userId: 'demo-user-3',
      verseKey: '2.14',
      text: 'A difficult day at work, but I remembered that pleasure and pain are temporary. This too shall pass.',
      mood: 'resilient',
      isAnonymous: true,
    },
  ];

  for (const ref of demoReflections) {
    createReflection(ref);
  }
}

// Seed on module load
seedDemoReflections();

export {
  getDailyPrompt,
  createReflection,
  getRecentReflections,
  getReflectionsByDate,
  likeReflection,
  replyToReflection,
  getCommunityStats,
};
