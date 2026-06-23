import https from 'https';
import http from 'http';
import express from 'express';

const router = express.Router();

// Google Translate TTS — free, no API key, natural voices
const LANG_MAP = {
  'en': 'en', 'hi': 'hi', 'ta': 'ta', 'te': 'te',
  'mr': 'mr', 'bn': 'bn', 'kn': 'kn', 'gu': 'gu', 'ml': 'ml',
};

function fetchTTS(text, lang) {
  return new Promise((resolve, reject) => {
    const tl = LANG_MAP[lang] || 'en';
    const encoded = encodeURIComponent(text);
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${tl}&client=tw-ob`;

    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://translate.google.com/',
      },
      timeout: 15000,
    }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        const redirectUrl = res.headers.location;
        const proto = redirectUrl.startsWith('https') ? https : http;
        proto.get(redirectUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 15000,
        }, (res2) => {
          const chunks = [];
          res2.on('data', (c) => chunks.push(c));
          res2.on('end', () => resolve(Buffer.concat(chunks)));
          res2.on('error', reject);
        }).on('error', reject);
        return;
      }

      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('TTS timeout')); });
  });
}

router.post('/', async (req, res) => {
  try {
    const { text, lang = 'en' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    // Google TTS has a ~200 char limit per request; chunk if needed
    const safeText = text.replace(/[*_`#]/g, '').slice(0, 1000);
    const chunks = [];

    // Split into sentences to stay within limits
    const sentences = safeText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [safeText];
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 0) {
        try {
          const audio = await fetchTTS(trimmed, lang);
          if (audio.length > 500) chunks.push(audio);
        } catch (e) {
          console.error('TTS chunk failed:', e.message);
        }
      }
    }

    if (chunks.length === 0) {
      return res.status(500).json({ error: 'TTS generation failed' });
    }

    const combined = Buffer.concat(chunks);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
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
