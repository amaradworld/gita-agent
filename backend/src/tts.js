import { MsEdgeTTS } from 'msedge-tts';
import express from 'express';

const router = express.Router();

// Voice mappings — natural-sounding neural voices per language
const VOICE_MAP = {
  'en': 'en-IN-PrabhatNeural',       // Indian English male, warm
  'hi': 'hi-IN-MadhurNeural',        // Hindi male, natural
  'ta': 'ta-IN-ValluvarNeural',      // Tamil male
  'te': 'te-IN-MohanNeural',         // Telugu male
  'mr': 'mr-IN-ManoharNeural',       // Marathi male
  'bn': 'bn-IN-BashkarNeural',       // Bengali male
  'kn': 'kn-IN-GaganNeural',         // Kannada male
  'gu': 'gu-IN-DhwaniNeural',        // Gujarati male
  'ml': 'ml-IN-MidhunNeural',        // Malayalam male
};

// Cache for TTS instances to avoid re-creation
const ttsCache = new Map();

async function getTTS(lang) {
  if (ttsCache.has(lang)) return ttsCache.get(lang);
  const tts = new MsEdgeTTS();
  const voice = VOICE_MAP[lang] || VOICE_MAP['en'];
  await tts.setMetadata(voice, 'audio-24khz-96kbitrate-mono-mp3');
  ttsCache.set(lang, tts);
  return tts;
}

router.post('/', async (req, res) => {
  try {
    const { text, lang = 'en' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }
    // Limit text length for TTS
    const safeText = text.slice(0, 3000);

    const tts = await getTTS(lang);
    const readable = tts.toStream(safeText);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=3600',
    });

    readable.pipe(res);
  } catch (err) {
    console.error('TTS error:', err);
    // Fallback: return empty audio to prevent frontend hang
    res.status(500).json({ error: 'TTS failed' });
  }
});

// List available voices
router.get('/voices', async (req, res) => {
  const voices = Object.entries(VOICE_MAP).map(([lang, voice]) => ({ lang, voice }));
  res.json({ voices });
});

export default router;
