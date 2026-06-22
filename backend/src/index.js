import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pino from 'pino';
import { generateResponse } from './llm.js';
import { gitaVerses } from './gita.js';

const app = express();
const PORT = process.env.PORT || 3001;
const logger = pino({ level: 'info' });

app.use(helmet());
app.use(cors());
app.use(express.json());

// Chat history storage (in-memory for demo)
const chatSessions = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Gita Agent' });
});

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

app.get('/api/verses/random', (req, res) => {
  const verse = gitaVerses[Math.floor(Math.random() * gitaVerses.length)];
  res.json(verse);
});

app.listen(PORT, () => {
  logger.info(`Gita Agent running on port ${PORT}`);
});
