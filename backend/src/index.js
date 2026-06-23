import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import rateLimit from 'express-rate-limit';
import { randomUUID } from 'crypto';
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

// Security: TTS rate limit — 10 per minute (stricter, each spawns upstream calls)
const ttsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many TTS requests. Please wait.' },
});
app.use('/api/tts', ttsLimiter);

// Security: Stricter rate limit for session creation — 5 per minute
const sessionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many session requests.' },
});

// TTS endpoint
app.use('/api/tts', ttsRouter);

// Chat history storage — bounded to 500 sessions max (LRU-style)
const MAX_SESSIONS = 500;
const MAX_SESSIONS_PER_IP = 5; // Prevent one IP from exhausting all slots
const chatSessions = new Map();
const sessionIPs = new Map(); // sessionId -> ip

function cleanupSessions() {
  if (chatSessions.size > MAX_SESSIONS) {
    const toDelete = Math.floor(MAX_SESSIONS * 0.2);
    let count = 0;
    for (const key of chatSessions.keys()) {
      if (count >= toDelete) break;
      chatSessions.delete(key);
      sessionIPs.delete(key);
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
  const sessionId = randomUUID();
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  chatSessions.set(sessionId, []);
  sessionIPs.set(sessionId, ip);
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

    // Security: Validate sessionId (UUID format or 'default')
    const safeSessionId = (sessionId === 'default' || /^[0-9a-f-]{36}$/i.test(sessionId))
      ? sessionId : 'default';

    const ip = req.ip || req.connection?.remoteAddress || 'unknown';

    if (!chatSessions.has(safeSessionId)) {
      // Limit sessions per IP to prevent exhaustion attack
      const ipSessionCount = [...sessionIPs.values()].filter(v => v === ip).length;
      if (ipSessionCount >= MAX_SESSIONS_PER_IP && safeSessionId !== 'default') {
        return res.status(429).json({ error: 'Too many sessions. Please refresh.' });
      }
      cleanupSessions();
      chatSessions.set(safeSessionId, []);
      sessionIPs.set(safeSessionId, ip);
    }
    const history = chatSessions.get(safeSessionId);

    const response = await generateResponse(trimmed, history, lang);

    // Clone history to avoid race condition
    const updated = [...history, { role: 'user', content: trimmed }, { role: 'assistant', content: response.message }];
    chatSessions.set(safeSessionId, updated.slice(-20));

    logger.info({ emotions: response.emotions, verse: `${response.verse.chapter}.${response.verse.verse}`, lang }, 'Chat response generated');

    res.json(response);
  } catch (err) {
    logger.error({ err }, 'Chat error');
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ==================== GRACEFUL SHUTDOWN ====================

const server = app.listen(PORT, () => {
  logger.info(`Gita Agent running on port ${PORT} with ${gitaVerses.length} verses across 18 chapters`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000); // Force exit after 5s
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...');
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled promise rejection');
});
