// ============================================================
// GITA GYAN — ENHANCED MENTOR ROUTE
// Daily verse, scenario guidance, mood, streaks, goals
// ============================================================

import express from 'express';
const router = express.Router();

import {
  VERSE_SCENARIOS,
  TOPIC_VERSES,
  DAILY_VERSES,
  MOOD_VERSES,
} from '../verseData.js';

import {
  getOrCreateProfile,
  addGoal,
  removeGoal,
  toggleFavorite,
  recordRead,
  getStreak,
  getProgress,
  getGoalRecommendations,
  SPIRITUAL_GOALS,
} from '../profiles.js';

import { searchGitaBook } from '../gita.js';
import { generateResponse } from '../llm.js';
import {
  getTodayStats,
  recordTodayActivity,
  getGamificationSummary,
} from '../gamification.js';
import { enhancedSearch, getSearchSuggestions } from '../search.js';
import {
  getDailyPrompt,
  createReflection,
  getRecentReflections,
  getReflectionsByDate,
  likeReflection,
  replyToReflection,
  getCommunityStats,
} from '../community.js';
import {
  generateKrishnaResponse,
  addJournalEntry,
  getJournalEntries,
  recordMood,
  getMoodHistory,
  getMoodRecommendations,
  startQuiz,
  getNextQuestion,
  answerQuiz,
  LEARNING_PATHS,
  MEDITATIONS,
  CHARACTERS,
  assessCharacter,
  addBookmark,
  removeBookmark,
  getBookmarks,
  getYesterdayContext,
  getEmergencyCalmResponse,
  getStory,
  getDebateResponse,
  STORIES,
} from '../premium.js';

// ─── DAILY VERSE ──────────────────────────────────────────
router.get('/daily-verse', (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const verseIdx = dayOfYear % DAILY_VERSES.length;
    const { chapter, verse } = DAILY_VERSES[verseIdx];

    const key = `${chapter}.${verse}`;
    const scenario = VERSE_SCENARIOS[key] || {};

    res.json({
      verse: { chapter, verse },
      scenario: scenario.lifeArea || 'Daily Wisdom',
      practicalAdvice: scenario.practicalAdvice || '',
      modernApplication: scenario.modernApplication || '',
      message: {
        en: `📖 Your Daily Verse — Chapter ${chapter}, Verse ${verse}`,
        hi: `📖 आपका दैनिक श्लोक — अध्याय ${chapter}, श्लोक ${verse}`,
        ta: `📖 உங்கள் தினசரி வசனம் — அத்தியாயம் ${chapter}, வசனம் ${verse}`,
        te: `📖 మీ రోజువారీ శ్లోకం — అధ్యాయం ${chapter}, శ్లోకం ${verse}`,
        mr: `📖 तुमचा दैनंदिन श्लोक — अध्याय ${chapter}, श्लोक ${verse}`,
        bn: `📖 আপনার দৈনিক শ্লোক — অধ্যায় ${chapter}, শ্লোক ${verse}`,
        kn: `📖 ನಿಮ್ಮ ದೈನಂದಿನ ಶ್ಲೋಕ — ಅಧ್ಯಾಯ ${chapter}, ಶ್ಲೋಕ ${verse}`,
        gu: `📖 તમારો દૈનિક શ્લોક — અધ્યાય ${chapter}, શ્લોક ${verse}`,
        ml: `📖 നിങ്ങളുടെ ദൈനംദിന ശ്ലോകം — അധ്യായം ${chapter}, ശ്ലോകം ${verse}`,
      }[lang] || `📖 Daily Verse — Chapter ${chapter}, Verse ${verse}`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get daily verse' });
  }
});

// ─── SCENARIO-BASED GUIDANCE ──────────────────────────────
router.post('/scenario', (req, res) => {
  try {
    const { scenario, lang = 'en' } = req.body;
    if (!scenario) {
      return res.status(400).json({ error: 'scenario required' });
    }

    const searchTerms = scenario.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const matchedVerses = new Map();

    for (const term of searchTerms) {
      for (const [key, data] of Object.entries(VERSE_SCENARIOS)) {
        if (data.scenarios.includes(term)) {
          if (!matchedVerses.has(key)) {
            matchedVerses.set(key, data);
          }
        }
      }
    }

    for (const term of searchTerms) {
      for (const [topic, verses] of Object.entries(TOPIC_VERSES)) {
        if (topic.includes(term) || term.includes(topic)) {
          for (const verseKey of verses) {
            const data = VERSE_SCENARIOS[verseKey];
            if (data && !matchedVerses.has(verseKey)) {
              matchedVerses.set(verseKey, data);
            }
          }
        }
      }
    }

    for (const term of searchTerms) {
      if (MOOD_VERSES[term]) {
        for (const verseKey of MOOD_VERSES[term]) {
          const data = VERSE_SCENARIOS[verseKey];
          if (data && !matchedVerses.has(verseKey)) {
            matchedVerses.set(verseKey, data);
          }
        }
      }
    }

    if (matchedVerses.size === 0) {
      return res.json({
        message: `No specific verses found for "${scenario}". Try asking about stress, anger, fear, relationships, discipline, or life purpose.`,
        matched: [],
      });
    }

    const results = Array.from(matchedVerses.entries()).map(([key, data]) => ({
      verseKey: key,
      chapter: parseInt(key.split('.')[0]),
      verse: parseInt(key.split('.')[1]),
      lifeArea: data.lifeArea,
      practicalAdvice: data.practicalAdvice,
      modernApplication: data.modernApplication,
      commentary: data.commentary[lang] || data.commentary.en || '',
    }));

    res.json({
      message: `Here are Gita verses relevant to "${scenario}":`,
      matched: results,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to find scenario verses' });
  }
});

// ─── MOOD-BASED VERSES ────────────────────────────────────
router.post('/mood', (req, res) => {
  try {
    const { mood, lang = 'en' } = req.body;
    if (!mood) {
      return res.status(400).json({ error: 'mood required' });
    }

    const verseKeys = MOOD_VERSES[mood.toLowerCase()] || [];
    const results = verseKeys.map(key => {
      const data = VERSE_SCENARIOS[key] || {};
      return {
        verseKey: key,
        chapter: parseInt(key.split('.')[0]),
        verse: parseInt(key.split('.')[1]),
        lifeArea: data.lifeArea || '',
        practicalAdvice: data.practicalAdvice || '',
      };
    });

    res.json({
      mood,
      verses: results,
      message: `Here are verses for when you feel ${mood}:`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get mood verses' });
  }
});

// ─── PROGRESS & STREAKS ───────────────────────────────────
router.get('/progress/:userId', (req, res) => {
  try {
    const progress = getProgress(req.params.userId);
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

router.post('/progress/record', (req, res) => {
  try {
    const { userId, chapter, verse } = req.body;
    if (!userId || !chapter || !verse) {
      return res.status(400).json({ error: 'userId, chapter, verse required' });
    }
    const result = recordRead(userId, parseInt(chapter), parseInt(verse));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record progress' });
  }
});

// ─── FAVORITES ────────────────────────────────────────────
router.post('/favorites/toggle', (req, res) => {
  try {
    const { userId, verseKey } = req.body;
    if (!userId || !verseKey) {
      return res.status(400).json({ error: 'userId and verseKey required' });
    }
    const profile = toggleFavorite(userId, verseKey);
    res.json({ favoriteVerses: profile.favoriteVerses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

// ─── GOALS ────────────────────────────────────────────────
router.get('/goals', (req, res) => {
  try {
    const goals = Object.entries(SPIRITUAL_GOALS).map(([key, data]) => ({
      key,
      label: data.label,
      chapters: data.chapters,
      exercises: data.exercises,
    }));
    res.json({ goals });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get goals' });
  }
});

router.post('/goals/set', (req, res) => {
  try {
    const { userId, goals } = req.body;
    if (!userId || !goals || !Array.isArray(goals)) {
      return res.status(400).json({ error: 'userId and goals array required' });
    }
    const profile = getOrCreateProfile(userId);
    profile.goals = goals;
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set goals' });
  }
});

router.get('/goals/recommendations/:userId', (req, res) => {
  try {
    const recs = getGoalRecommendations(req.params.userId);
    res.json({ recommendations: recs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// ─── ENHANCED CHAT WITH MENTOR CONTEXT ────────────────────
router.post('/mentor', async (req, res) => {
  try {
    const { message, userId, lang = 'en', mood, goals } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'message required' });
    }

    let context = '';
    if (userId) {
      const progress = getProgress(userId);
      context = `User has read ${progress.totalVersesRead} verses across ${progress.totalChapters} chapters. Streak: ${progress.streak} days.`;
    }
    if (goals && goals.length > 0) {
      context += ` Their spiritual goals: ${goals.join(', ')}.`;
    }

    const searchTerms = message.toLowerCase().split(/[\s,]+/).filter(Boolean);
    const relevantVerses = [];
    for (const term of searchTerms) {
      for (const [key, data] of Object.entries(VERSE_SCENARIOS)) {
        if (data.scenarios.includes(term) && !relevantVerses.includes(key)) {
          relevantVerses.push(key);
        }
      }
    }

    const ragResults = searchGitaBook(message, 3);
    let ragContext = '';
    if (ragResults && ragResults.length > 0) {
      ragContext = '\n\nFrom ISKCON Bhagavad Gita As It Is:\n' +
        ragResults.map(r => `[Chapter ${r.chapter}, Verse ${r.verse || 'N/A'}] ${r.text.substring(0, 200)}`).join('\n');
    }

    let scenarioContext = '';
    if (relevantVerses.length > 0) {
      scenarioContext = '\n\nRelevant verses for this topic:\n' +
        relevantVerses.slice(0, 3).map(key => {
          const data = VERSE_SCENARIOS[key];
          return `Verse ${key}: ${data.practicalAdvice}`;
        }).join('\n');
    }

    if (userId && relevantVerses.length > 0) {
      const firstVerse = relevantVerses[0].split('.');
      recordRead(userId, parseInt(firstVerse[0]), parseInt(firstVerse[1]));
    }

    const history = [];
    const response = await generateResponse(message, history, lang);

    let enhancedText = response.message;
    if (scenarioContext) {
      enhancedText += scenarioContext;
    }
    if (ragContext) {
      enhancedText += ragContext;
    }

    res.json({
      message: enhancedText,
      verse: response.verse,
      emotions: response.emotions,
      relevantVerses,
      mentorContext: context || undefined,
    });
  } catch (err) {
    res.status(500).json({ error: 'Mentor session failed' });
  }
});

// ─── GAMIFICATION ──────────────────────────────────────────
router.get('/gamification/:userId', (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = getOrCreateProfile(userId);
    const streakData = getStreak(userId);
    const summary = getGamificationSummary(userId, profile, streakData.count);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get gamification data' });
  }
});

router.post('/gamification/record', (req, res) => {
  try {
    const { userId, activity } = req.body;
    if (!userId || !activity || !activity.type) {
      return res.status(400).json({ error: 'userId and activity.type required' });
    }
    recordTodayActivity(userId, activity);
    const profile = getOrCreateProfile(userId);
    const streakData = getStreak(userId);
    const summary = getGamificationSummary(userId, profile, streakData.count);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record activity' });
  }
});

// ─── MULTI-COMMENTARY ──────────────────────────────────────
router.get('/commentary/:chapter/:verse', (req, res) => {
  try {
    const key = `${req.params.chapter}.${req.params.verse}`;
    const lang = req.query.lang || 'en';
    const data = VERSE_SCENARIOS[key];
    if (!data || !data.commentary) {
      return res.status(404).json({ error: 'No commentary found for this verse' });
    }

    let commentaries = data.commentary;
    // Apply regional translations if available
    if (lang !== 'en' && COMMENTARY_TRANSLATIONS[key]?.[lang]) {
      const translations = COMMENTARY_TRANSLATIONS[key][lang];
      commentaries = {};
      for (const [cKey, text] of Object.entries(data.commentary)) {
        commentaries[cKey] = translations[cKey] || text;
      }
    }

    res.json({
      verseKey: key,
      commentaries,
      lifeArea: data.lifeArea,
      practicalAdvice: data.practicalAdvice,
      modernApplication: data.modernApplication,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get commentary' });
  }
});

// ─── SEARCH VERSES ────────────────────────────────────────
router.get('/search', (req, res) => {
  try {
    const { q, lang = 'en' } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'q (query) required' });
    }

    const results = searchGitaBook(q, 10);

    const scenarioMatches = [];
    const searchTerms = q.toLowerCase().split(/[\s,]+/).filter(Boolean);
    for (const term of searchTerms) {
      for (const [key, data] of Object.entries(VERSE_SCENARIOS)) {
        if (data.scenarios.includes(term)) {
          scenarioMatches.push({
            verseKey: key,
            chapter: parseInt(key.split('.')[0]),
            verse: parseInt(key.split('.')[1]),
            lifeArea: data.lifeArea,
            practicalAdvice: data.practicalAdvice,
          });
        }
      }
    }

    const topicMatches = [];
    for (const term of searchTerms) {
      if (TOPIC_VERSES[term]) {
        for (const verseKey of TOPIC_VERSES[term]) {
          const data = VERSE_SCENARIOS[verseKey];
          if (data) {
            topicMatches.push({
              verseKey,
              chapter: parseInt(verseKey.split('.')[0]),
              verse: parseInt(verseKey.split('.')[1]),
              lifeArea: data.lifeArea,
              practicalAdvice: data.practicalAdvice,
            });
          }
        }
      }
    }

    const seen = new Set();
    const allMatches = [...scenarioMatches, ...topicMatches].filter(m => {
      if (seen.has(m.verseKey)) return false;
      seen.add(m.verseKey);
      return true;
    });

    res.json({
      query: q,
      ragResults: results || [],
      verseMatches: allMatches,
    });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ─── ENHANCED SEARCH ──────────────────────────────────────
router.get('/search/enhanced', (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }
    const results = enhancedSearch(q, { limit: parseInt(limit) });
    res.json({
      query: q,
      total: results.length,
      results,
    });
  } catch (err) {
    res.status(500).json({ error: 'Enhanced search failed' });
  }
});

router.get('/search/suggestions', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ suggestions: [] });
    }
    const suggestions = getSearchSuggestions(q);
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get suggestions' });
  }
});

// ─── COMMUNITY ────────────────────────────────────────────
router.get('/community/prompt', (req, res) => {
  try {
    const prompt = getDailyPrompt();
    res.json(prompt);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get daily prompt' });
  }
});

router.get('/community/reflections', (req, res) => {
  try {
    const { limit = 20, offset = 0, date } = req.query;
    let reflections;
    if (date) {
      reflections = getReflectionsByDate(date);
    } else {
      reflections = getRecentReflections(parseInt(limit), parseInt(offset));
    }
    res.json({ reflections, total: reflections.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get reflections' });
  }
});

router.post('/community/reflections', (req, res) => {
  try {
    const { userId, verseKey, text, isAnonymous, mood } = req.body;
    if (!userId || !text || text.trim().length === 0) {
      return res.status(400).json({ error: 'userId and text are required' });
    }
    if (text.length > 500) {
      return res.status(400).json({ error: 'Text must be 500 characters or less' });
    }
    const reflection = createReflection({
      userId,
      verseKey: verseKey || null,
      text: text.trim(),
      isAnonymous: isAnonymous !== false,
      mood: mood || null,
    });
    res.json(reflection);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create reflection' });
  }
});

router.post('/community/reflections/:id/like', (req, res) => {
  try {
    const reflection = likeReflection(req.params.id);
    if (!reflection) {
      return res.status(404).json({ error: 'Reflection not found' });
    }
    res.json(reflection);
  } catch (err) {
    res.status(500).json({ error: 'Failed to like reflection' });
  }
});

router.post('/community/reflections/:id/reply', (req, res) => {
  try {
    const { userId, text, isAnonymous } = req.body;
    if (!userId || !text || text.trim().length === 0) {
      return res.status(400).json({ error: 'userId and text are required' });
    }
    if (text.length > 300) {
      return res.status(400).json({ error: 'Reply must be 300 characters or less' });
    }
    const reply = replyToReflection(req.params.id, {
      userId,
      text: text.trim(),
      isAnonymous: isAnonymous !== false,
    });
    if (!reply) {
      return res.status(404).json({ error: 'Reflection not found' });
    }
    res.json(reply);
  } catch (err) {
    res.status(500).json({ error: 'Failed to reply' });
  }
});

router.get('/community/stats', (req, res) => {
  try {
    const stats = getCommunityStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ══════════════════════════════════════════════════════════════
// PREMIUM FEATURES
// ══════════════════════════════════════════════════════════════

// ─── ASK KRISHNA MODE ────────────────────────────────────
router.post('/ask-krishna', (req, res) => {
  try {
    const { message, lang = 'en' } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });
    const response = generateKrishnaResponse(message, lang);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Ask Krishna failed' });
  }
});

// ─── JOURNAL ──────────────────────────────────────────────
router.post('/journal', (req, res) => {
  try {
    const { userId, happy, stressed, learned } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const entry = addJournalEntry(userId, { happy, stressed, learned });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save journal' });
  }
});

router.get('/journal/:userId', (req, res) => {
  try {
    const entries = getJournalEntries(req.params.userId, parseInt(req.query.limit) || 30);
    res.json({ entries, total: entries.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get journal' });
  }
});

// ─── MOOD CHECK-IN ────────────────────────────────────────
router.post('/mood/checkin', (req, res) => {
  try {
    const { userId, mood, note } = req.body;
    if (!userId || !mood) return res.status(400).json({ error: 'userId and mood required' });
    const entry = recordMood(userId, mood, note);
    const recommendations = getMoodRecommendations(mood);
    res.json({ entry, recommendations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record mood' });
  }
});

router.get('/mood/history/:userId', (req, res) => {
  try {
    const history = getMoodHistory(req.params.userId, parseInt(req.query.limit) || 30);
    res.json({ history, total: history.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get mood history' });
  }
});

// ─── QUIZ ─────────────────────────────────────────────────
router.post('/quiz/start', (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const question = startQuiz(userId);
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

router.post('/quiz/answer', (req, res) => {
  try {
    const { userId, answer } = req.body;
    if (!userId || answer === undefined) return res.status(400).json({ error: 'userId and answer required' });
    const result = answerQuiz(userId, parseInt(answer));
    if (!result) return res.status(404).json({ error: 'No active quiz' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to answer quiz' });
  }
});

router.get('/quiz/question/:userId', (req, res) => {
  try {
    const question = getNextQuestion(req.params.userId);
    if (!question) return res.status(404).json({ error: 'No active quiz' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get question' });
  }
});

// ─── LEARNING PATH ────────────────────────────────────────
router.get('/learning-paths', (req, res) => {
  try {
    const paths = Object.entries(LEARNING_PATHS).map(([key, path]) => ({ key, ...path }));
    res.json({ paths });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get learning paths' });
  }
});

router.get('/learning-paths/:key', (req, res) => {
  try {
    const path = LEARNING_PATHS[req.params.key];
    if (!path) return res.status(404).json({ error: 'Learning path not found' });
    res.json(path);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get learning path' });
  }
});

// ─── GUIDED MEDITATION ────────────────────────────────────
router.get('/meditations', (req, res) => {
  try {
    const meditations = Object.entries(MEDITATIONS).map(([key, med]) => ({
      key,
      title: med.title,
      duration: med.duration,
      stepCount: med.steps.length,
    }));
    res.json({ meditations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get meditations' });
  }
});

router.get('/meditations/:key', (req, res) => {
  try {
    const meditation = MEDITATIONS[req.params.key];
    if (!meditation) return res.status(404).json({ error: 'Meditation not found' });
    res.json(meditation);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get meditation' });
  }
});

// ─── CHARACTER ASSESSMENT ──────────────────────────────────
router.get('/characters', (req, res) => {
  try {
    const characters = Object.entries(CHARACTERS).map(([key, char]) => ({ key, ...char }));
    res.json({ characters });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get characters' });
  }
});

router.post('/characters/assess', (req, res) => {
  try {
    const { userId, answers } = req.body;
    if (!userId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'userId and answers array required' });
    }
    const result = assessCharacter(userId, answers);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to assess character' });
  }
});

// ─── BOOKMARKS & NOTES ────────────────────────────────────
router.post('/bookmarks', (req, res) => {
  try {
    const { userId, verseKey, note } = req.body;
    if (!userId || !verseKey) return res.status(400).json({ error: 'userId and verseKey required' });
    const bookmark = addBookmark(userId, verseKey, note || '');
    res.json(bookmark);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

router.delete('/bookmarks', (req, res) => {
  try {
    const { userId, verseKey } = req.body;
    if (!userId || !verseKey) return res.status(400).json({ error: 'userId and verseKey required' });
    const removed = removeBookmark(userId, verseKey);
    res.json({ removed });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
});

router.get('/bookmarks/:userId', (req, res) => {
  try {
    const bms = getBookmarks(req.params.userId);
    res.json({ bookmarks: bms, total: bms.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get bookmarks' });
  }
});

// ─── CONTINUE YESTERDAY ───────────────────────────────────
router.get('/continue/:userId', (req, res) => {
  try {
    const context = getYesterdayContext(req.params.userId);
    if (!context) return res.json({ hasContext: false });
    res.json({ hasContext: true, ...context });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get yesterday context' });
  }
});

// ─── EMERGENCY CALM MODE ──────────────────────────────────
router.get('/emergency-calm', (req, res) => {
  try {
    const response = getEmergencyCalmResponse();
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get calm response' });
  }
});

// ─── STORY MODE ───────────────────────────────────────────
router.get('/stories', (req, res) => {
  try {
    const stories = Object.entries(STORIES || {}).map(([key, s]) => ({
      key,
      title: s.title,
      verse: s.verse,
    }));
    res.json({ stories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get stories' });
  }
});

router.get('/stories/:topic', (req, res) => {
  try {
    const story = getStory(req.params.topic);
    res.json(story);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get story' });
  }
});

// ─── DEBATE MODE ──────────────────────────────────────────
router.post('/debate', (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) return res.status(400).json({ error: 'topic required' });
    const response = getDebateResponse(topic);
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get debate response' });
  }
});

// ─── CORPORATE WELLNESS API ──────────────────────────────────
// B2B endpoint for corporate wellness programs
router.get('/wellness/dashboard', (req, res) => {
  try {
    const { orgId, period = '7d' } = req.query;
    if (!orgId) return res.status(400).json({ error: 'orgId required' });

    // Aggregate stats for organization
    const days = period === '30d' ? 30 : period === '90d' ? 90 : 7;

    res.json({
      orgId,
      period,
      stats: {
        totalUsers: 0, // Would query DB in production
        activeUsers: 0,
        totalSessions: 0,
        avgSessionDuration: '4.2 min',
        topTopics: ['stress', 'purpose', 'meditation', 'relationships'],
        engagementRate: '0%',
        streakDistribution: { '1-3 days': 0, '4-7 days': 0, '8-14 days': 0, '15+ days': 0 },
      },
      insights: [
        'Most employees seek guidance on work-life balance and stress management.',
        'Morning sessions (7-9 AM) are most popular.',
        'Meditation feature has highest engagement among regular users.',
      ],
      suggestedActions: [
        'Enable daily verse notifications for the team.',
        'Create custom learning paths for leadership development.',
        'Schedule weekly group meditation sessions.',
      ],
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get wellness dashboard' });
  }
});

router.get('/wellness/leaderboard', (req, res) => {
  try {
    const { orgId } = req.query;
    if (!orgId) return res.status(400).json({ error: 'orgId required' });

    res.json({
      orgId,
      leaderboard: [], // Would query DB in production
      message: 'Leaderboard data requires authentication and database access.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

export default router;
