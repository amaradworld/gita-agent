// ============================================================
// GITA GYAN — SANSKRIT PRONUNCIATION
// Generates audio for Sanskrit verse pronunciation
// ============================================================

import express from 'express';
import https from 'https';
import crypto from 'crypto';
const router = express.Router();

// Cache for TTS audio (max 200 entries)
const ttsCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function fetchGoogleTTS(text, lang = 'sa') {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        https.get(res.headers.location, (res2) => {
          const chunks = [];
          res2.on('data', c => chunks.push(c));
          res2.on('end', () => resolve(Buffer.concat(chunks)));
          res2.on('error', reject);
        }).on('error', reject);
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ─── GET SANSKRIT AUDIO ─────────────────────────────────
router.get('/:chapter/:verse', async (req, res) => {
  try {
    const { chapter, verse } = req.params;
    const cacheKey = md5(`sa_${chapter}_${verse}`);

    // Check cache
    if (ttsCache.has(cacheKey)) {
      const cached = ttsCache.get(cacheKey);
      if (Date.now() - cached.time < CACHE_TTL) {
        res.set('Content-Type', 'audio/mpeg');
        return res.send(cached.buffer);
      }
      ttsCache.delete(cacheKey);
    }

    // Fetch from Google TTS
    const text = `${chapter}.${verse}`;
    const buffer = await fetchGoogleTTS(text, 'sa');

    if (!buffer || buffer.length < 500) {
      return res.status(502).json({ error: 'TTS generation failed' });
    }

    // Cache it
    if (ttsCache.size > 200) {
      const oldest = ttsCache.keys().next().value;
      ttsCache.delete(oldest);
    }
    ttsCache.set(cacheKey, { buffer, time: Date.now() });

    res.set('Content-Type', 'audio/mpeg');
    res.send(buffer);
  } catch (err) {
    console.error('Sanskrit TTS error:', err);
    res.status(500).json({ error: 'Sanskrit pronunciation unavailable' });
  }
});

export default router;
