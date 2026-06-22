import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { generateResponse } from './llm.js';
import {
  gitaVerses,
  chapterNames,
  findVerseByChapterVerse,
  findVersesByChapter,
  isVerseRequest,
  isChapterRequest,
} from './gita.js';

const app = express();
const PORT = process.env.PORT || 3001;
const logger = pino({ level: 'info' });

app.use(helmet());
app.use(cors());
app.use(express.json());

// Chat history storage (in-memory for demo)
const chatSessions = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Gita Agent', verses: gitaVerses.length, chapters: Object.keys(chapterNames).length });
});

// ==================== CHAPTERS ====================

// GET /api/chapters — list all chapters with verse counts
app.get('/api/chapters', (req, res) => {
  const chapters = Object.entries(chapterNames).map(([num, info]) => {
    const chapterNum = parseInt(num);
    const verseCount = gitaVerses.filter(v => v.chapter === chapterNum).length;
    return {
      chapter: chapterNum,
      ...info,
      verseCount,
    };
  });
  res.json({ chapters, totalVerses: gitaVerses.length });
});

// GET /api/chapters/:num — get all verses in a chapter
app.get('/api/chapters/:num', (req, res) => {
  const num = parseInt(req.params.num);
  const chapterInfo = chapterNames[num];
  if (!chapterInfo) {
    return res.status(404).json({ error: `Chapter ${num} not found. Gita has 18 chapters.` });
  }
  const verses = findVersesByChapter(num);
  res.json({
    chapter: num,
    ...chapterInfo,
    verses,
    verseCount: verses.length,
  });
});

// ==================== VERSES ====================

// GET /api/verses — all verses
app.get('/api/verses', (req, res) => {
  const { chapter, emotion } = req.query;
  let result = gitaVerses;
  if (chapter) {
    result = result.filter(v => v.chapter === parseInt(chapter));
  }
  if (emotion) {
    result = result.filter(v => v.emotions.includes(emotion));
  }
  res.json({ total: result.length, verses: result });
});

// GET /api/verses/random — random verse
app.get('/api/verses/random', (req, res) => {
  const verse = gitaVerses[Math.floor(Math.random() * gitaVerses.length)];
  res.json(verse);
});

// GET /api/verses/:chapter/:verse — specific verse (e.g., /api/verses/2/47)
app.get('/api/verses/:chapter/:verse', (req, res) => {
  const { chapter, verse } = req.params;
  const found = findVerseByChapterVerse(chapter, verse);
  if (!found) {
    return res.status(404).json({ error: `Verse ${chapter}.${verse} not found in collection.` });
  }
  res.json(found);
});

// GET /api/verses/:verseNum — find a verse number across all chapters (e.g., /api/verses/47 finds verse 47 in each chapter)
app.get('/api/verses/:verseNum', (req, res) => {
  const verseNum = parseInt(req.params.verseNum);
  if (isNaN(verseNum)) {
    return res.status(400).json({ error: 'Invalid verse number' });
  }
  const matches = gitaVerses.filter(v => v.verse === verseNum);
  if (matches.length === 0) {
    return res.status(404).json({ error: `No verse with number ${verseNum} found.` });
  }
  res.json({ total: matches.length, verses: matches });
});

// ==================== SEARCH ====================

// GET /api/search?q=keyword — search verses by text
app.get('/api/search', (req, res) => {
  try {
    const q = String(req.query.q || '').toLowerCase();
    if (!q.trim()) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const results = gitaVerses.filter(v =>
      v.translation.toLowerCase().includes(q) ||
      v.explanation.toLowerCase().includes(q) ||
      v.advice.toLowerCase().includes(q) ||
      v.emotions.some(e => e.toLowerCase().includes(q))
    );
    res.json({ query: q, total: results.length, verses: results });
  } catch (err) {
    logger.error({ err }, 'Search error');
    res.status(500).json({ error: 'Search failed' });
  }
});

// ==================== CHAT ====================

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, []);
    }
    const history = chatSessions.get(sessionId);

    const response = await generateResponse(message, history);

    history.push({ role: 'user', content: message });
    history.push({ role: 'assistant', content: response.message });

    if (history.length > 20) {
      chatSessions.set(sessionId, history.slice(-20));
    }

    logger.info({ emotions: response.emotions, verse: `${response.verse.chapter}.${response.verse.verse}` }, 'Chat response generated');

    res.json(response);
  } catch (err) {
    logger.error({ err }, 'Chat error');
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/session/new', (req, res) => {
  const sessionId = Math.random().toString(36).slice(2);
  chatSessions.set(sessionId, []);
  res.json({ sessionId });
});

app.listen(PORT, () => {
  logger.info(`Gita Agent running on port ${PORT} with ${gitaVerses.length} verses across 18 chapters`);
});
