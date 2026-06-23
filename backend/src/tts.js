import https from 'https';
import express from 'express';
import { createHash } from 'crypto';

const router = express.Router();

const LANG_MAP = {
  'en': 'en', 'hi': 'hi', 'ta': 'ta', 'te': 'te',
  'mr': 'mr', 'bn': 'bn', 'kn': 'kn', 'gu': 'gu', 'ml': 'ml',
};

// TTS Audio Cache — avoids re-fetching same text from Google
const ttsCache = new Map();
const CACHE_MAX = 200;
const CACHE_TTL = 3600000; // 1 hour

function cacheKey(text, lang) {
  return createHash('md5').update(`${lang}:${text}`).digest('hex');
}

function getCached(key) {
  const entry = ttsCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL) { ttsCache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  if (ttsCache.size >= CACHE_MAX) {
    // Delete oldest entry
    const firstKey = ttsCache.keys().next().value;
    ttsCache.delete(firstKey);
  }
  ttsCache.set(key, { data, time: Date.now() });
}

function isGoogleRedirect(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('google.com') || parsed.hostname.endsWith('googleapis.com');
  } catch { return false; }
}

function fetchGoogleTTS(text, lang) {
  return new Promise((resolve, reject) => {
    const tl = LANG_MAP[lang] || 'en';
    const encoded = encodeURIComponent(text.replace(/[*_`#]/g, ''));
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${tl}&client=tw-ob`;

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://translate.google.com/',
      },
      timeout: 10000,
    }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const redirectUrl = res.headers.location;
        if (!isGoogleRedirect(redirectUrl)) return reject(new Error('Invalid redirect'));
        https.get(redirectUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 }, (res2) => {
          const chunks = [];
          res2.on('data', (c) => chunks.push(c));
          res2.on('end', () => {
            const buf = Buffer.concat(chunks);
            if (buf.length > 500 && buf[0] === 0xff) resolve(buf);
            else reject(new Error('Not audio'));
          });
          res2.on('error', reject);
        }).on('error', reject);
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length > 500 && buf[0] === 0xff) resolve(buf);
        else reject(new Error('Not audio'));
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

function splitSentences(text) {
  return (text.match(/[^.!?।]+[.!?।]+|[^.!?।]+$/g) || [text]).filter(s => s.trim().length > 0);
}

router.post('/', async (req, res) => {
  try {
    const { text, lang = 'en', emotion = 'default' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    const safeText = text.replace(/[*_`#]/g, '').slice(0, 2000);

    // Check cache first
    const key = cacheKey(safeText, lang);
    const cached = getCached(key);
    if (cached) {
      res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': cached.length.toString(), 'X-Cache': 'HIT' });
      return res.send(cached);
    }

    const sentences = splitSentences(safeText);
    const audioChunks = [];

    // Fetch all sentences in parallel for speed
    const results = await Promise.allSettled(
      sentences.map(s => fetchGoogleTTS(s.trim(), lang))
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.length > 500) {
        audioChunks.push(result.value);
      }
    }

    if (audioChunks.length === 0) {
      return res.status(500).json({ error: 'TTS generation failed' });
    }

    const combined = Buffer.concat(audioChunks);
    setCache(key, combined);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': combined.length.toString(),
      'X-Cache': 'MISS',
    });
    res.send(combined);
  } catch (err) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'TTS failed' });
  }
});

router.get('/voices', (req, res) => {
  res.json({ voices: Object.entries(LANG_MAP).map(([lang, code]) => ({ lang, code })) });
});

export default router;
