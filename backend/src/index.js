import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import rateLimit from 'express-rate-limit';
import { generateResponse } from './llm.js';
import ttsRouter from './tts.js';
import {
  gitaVerses, chapterNames, findVerseByChapterVerse,
  findVersesByChapter, isVerseRequest, isChapterRequest,
} from './gita.js';

const app = express();
const PORT = process.env.PORT || 3001;
const logger = pino({ level: 'info' });

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://gita-agent.vercel.app';

// Security: Helmet
app.use(helmet());

// Security: CORS — restrict to known origins
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3001'],
  methods: ['GET', 'POST'],
}));

// Security: Body parser with size limit (100KB)
app.use(express.json({ limit: '100kb' }));

// Security: Rate limiting — 30 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
});
app.use('/api/chat', limiter);

// Security: Stricter rate limit for session creation — 5 per minute
const sessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many session requests.' },
});

// TTS endpoint (Microsoft Edge Neural TTS)
app.use('/api/tts', ttsRouter);

// Chat history storage — bounded to 500 sessions max (LRU-style)
const MAX_SESSIONS = 500;
const chatSessions = new Map();

function cleanupSessions() {
  if (chatSessions.size > MAX_SESSIONS) {
    // Delete oldest 20% of sessions
    const toDelete = Math.floor(MAX_SESSIONS * 0.2);
    let count = 0;
    for (const key of chatSessions.keys()) {
      if (count >= toDelete) break;
      chatSessions.delete(key);
      count++;
    }
    logger.info(`Cleaned up ${count} old sessions`);
  }
}

// Security: Max message length
const MAX_MESSAGE_LENGTH = 500;

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Gita Agent',
    verses: gitaVerses.length,
    chapters: Object.keys(chapterNames).length,
    sessions: chatSessions.size,
  });
});

// ==================== CHAPTERS ====================

app.get('/api/chapters', (req, res) => {
  const chapters = Object.entries(chapterNames).map(([num, info]) => {
    const chapterNum = parseInt(num);
    const verseCount = gitaVerses.filter(v => v.chapter === chapterNum).length;
    return { chapter: chapterNum, ...info, verseCount };
  });
  res.json({ chapters, totalVerses: gitaVerses.length });
});

app.get('/api/chapters/:num', (req, res) => {
  const num = parseInt(req.params.num);
  const chapterInfo = chapterNames[num];
  if (!chapterInfo) return res.status(404).json({ error: `Chapter ${num} not found. Gita has 18 chapters.` });
  const verses = findVersesByChapter(num);
  res.json({ chapter: num, ...chapterInfo, verses, verseCount: verses.length });
});

// ==================== VERSES ====================

app.get('/api/verses', (req, res) => {
  const { chapter, emotion } = req.query;
  let result = gitaVerses;
  if (chapter) result = result.filter(v => v.chapter === parseInt(chapter));
  if (emotion) result = result.filter(v => v.emotions.includes(emotion));
  res.json({ total: result.length, verses: result });
});

app.get('/api/verses/random', (req, res) => {
  const verse = gitaVerses[Math.floor(Math.random() * gitaVerses.length)];
  res.json(verse);
});

app.get('/api/verses/:chapter/:verse', (req, res) => {
  const { chapter, verse } = req.params;
  const found = findVerseByChapterVerse(chapter, verse);
  if (!found) return res.status(404).json({ error: `Verse ${chapter}.${verse} not found in collection.` });
  res.json(found);
});

app.get('/api/verses/:verseNum', (req, res) => {
  const verseNum = parseInt(req.params.verseNum);
  if (isNaN(verseNum)) return res.status(400).json({ error: 'Invalid verse number' });
  const matches = gitaVerses.filter(v => v.verse === verseNum);
  if (matches.length === 0) return res.status(404).json({ error: `No verse with number ${verseNum} found.` });
  res.json({ total: matches.length, verses: matches });
});

// ==================== SEARCH ====================

app.get('/api/search', (req, res) => {
  try {
    const q = String(req.query.q || '').toLowerCase().slice(0, 200);
    if (!q.trim()) return res.status(400).json({ error: 'Query parameter "q" is required' });
    const results = gitaVerses.filter(v =>
      v.translation.toLowerCase().includes(q) || v.explanation.toLowerCase().includes(q) ||
      v.advice.toLowerCase().includes(q) || v.emotions.some(e => e.toLowerCase().includes(q))
    );
    res.json({ query: q, total: results.length, verses: results });
  } catch (err) { logger.error({ err }, 'Search error'); res.status(500).json({ error: 'Search failed' }); }
});

// ==================== CHAT ====================

app.post('/api/session/new', sessionLimiter, (req, res) => {
  cleanupSessions();
  const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  chatSessions.set(sessionId, []);
  res.json({ sessionId });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default', lang = 'en' } = req.body;

    // Security: Validate input
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const trimmed = message.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (trimmed.length < 2) {
      return res.status(400).json({ error: 'Message too short' });
    }

    // Security: Validate sessionId
    const safeSessionId = typeof sessionId === 'string' && sessionId.length < 50 ? sessionId : 'default';

    if (!chatSessions.has(safeSessionId)) {
      cleanupSessions();
      chatSessions.set(safeSessionId, []);
    }
    const history = chatSessions.get(safeSessionId);

    const response = await generateResponse(trimmed, history, lang);

    history.push({ role: 'user', content: trimmed });
    history.push({ role: 'assistant', content: response.message });

    // Cap session history at 20 messages
    if (history.length > 20) {
      chatSessions.set(safeSessionId, history.slice(-20));
    }

    logger.info({ emotions: response.emotions, verse: `${response.verse.chapter}.${response.verse.verse}`, lang }, 'Chat response generated');

    res.json(response);
  } catch (err) {
    logger.error({ err }, 'Chat error');
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ==================== GRACEFUL SHUTDOWN ====================

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  process.exit(0);
});

// Unhandled rejection guard
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});

app.listen(PORT, () => {
  logger.info(`Gita Agent running on port ${PORT} with ${gitaVerses.length} verses across 18 chapters`);
});
