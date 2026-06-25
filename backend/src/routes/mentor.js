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

export default router;
