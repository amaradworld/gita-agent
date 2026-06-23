import https from 'https';
import express from 'express';

const router = express.Router();

const LANG_MAP = {
  'en': 'en', 'hi': 'hi', 'ta': 'ta', 'te': 'te',
  'mr': 'mr', 'bn': 'bn', 'kn': 'kn', 'gu': 'gu', 'ml': 'ml',
};

// Validate redirect stays on google domains
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
      timeout: 15000,
    }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const redirectUrl = res.headers.location;
        if (!isGoogleRedirect(redirectUrl)) {
          return reject(new Error('Invalid redirect target'));
        }
        https.get(redirectUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res2) => {
          const chunks = [];
          res2.on('data', (c) => chunks.push(c));
          res2.on('end', () => {
            const buf = Buffer.concat(chunks);
            // Validate actual audio content, not just byte count
            if (res2.headers['content-type']?.includes('audio') || (buf.length > 500 && buf[0] === 0xff)) {
              resolve(buf);
            } else {
              reject(new Error('Response is not audio'));
            }
          });
          res2.on('error', reject);
        }).on('error', reject);
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.headers['content-type']?.includes('audio') || (buf.length > 500 && buf[0] === 0xff)) {
          resolve(buf);
        } else {
          reject(new Error('Response is not audio'));
        }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

// Split text into sentences — supports Indian language punctuation (।)
function splitSentences(text) {
  // Split on period, !, ?, and Devanagari danda (।)
  const parts = text.match(/[^.!?।]+[.!?।]+|[^.!?।]+$/g) || [text];
  return parts.filter(s => s.trim().length > 0);
}

router.post('/', async (req, res) => {
  try {
    const { text, lang = 'en', emotion = 'default' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    const safeText = text.replace(/[*_`#]/g, '').slice(0, 2000);
    const sentences = splitSentences(safeText);
    const audioChunks = [];

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.length > 0) {
        try {
          const audio = await fetchGoogleTTS(trimmed, lang);
          audioChunks.push(audio);
        } catch (e) {
          console.error('TTS chunk failed:', e.message);
        }
      }
    }

    if (audioChunks.length === 0) {
      return res.status(500).json({ error: 'TTS generation failed' });
    }

    const combined = Buffer.concat(audioChunks);
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': combined.length.toString(),
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
