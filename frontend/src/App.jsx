import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import SpeakingButton from './components/SpeakingButton';

const API = '';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' },
];

const CHAPTER_NAMES = {
  1: { english: 'Arjuna Vishada Yoga', subtitle: 'Yoga of Arjuna\'s Dejection' },
  2: { english: 'Sankhya Yoga', subtitle: 'Yoga of Knowledge' },
  3: { english: 'Karma Yoga', subtitle: 'Yoga of Action' },
  4: { english: 'Jnana Yoga', subtitle: 'Yoga of Knowledge' },
  5: { english: 'Karma Sannyasa Yoga', subtitle: 'Yoga of Renunciation' },
  6: { english: 'Dhyana Yoga', subtitle: 'Yoga of Meditation' },
  7: { english: 'Jnana Vijnana Yoga', subtitle: 'Yoga of Wisdom & Realization' },
  8: { english: 'Akshara Brahma Yoga', subtitle: 'Yoga of the Imperishable' },
  9: { english: 'Raja Vidya Rahasya Yoga', subtitle: 'Yoga of the King of Knowledge' },
  10: { english: 'Vibhuti Yoga', subtitle: 'Yoga of Divine Glories' },
  11: { english: 'Vishvarupa Darshana Yoga', subtitle: 'Yoga of the Universal Form' },
  12: { english: 'Bhakti Yoga', subtitle: 'Yoga of Devotion' },
  13: { english: 'Prakriti Purusha Viveka Yoga', subtitle: 'Yoga of Nature & Spirit' },
  14: { english: 'Guna Traya Vibhaga Yoga', subtitle: 'Yoga of the Three Qualities' },
  15: { english: 'Purushottama Yoga', subtitle: 'Yoga of the Supreme Being' },
  16: { english: 'Daiva Asura Sampad Vibhaga Yoga', subtitle: 'Yoga of Divine & Demoniac Natures' },
  17: { english: 'Shraddhatraya Vibhaga Yoga', subtitle: 'Yoga of the Threefold Faith' },
  18: { english: 'Moksha Sannyasa Yoga', subtitle: 'Yoga of Liberation' },
};

/* ─── VerseCard ─── */
function VerseCard({ verse, onSpeak, speakingId }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  if (!verse) return null;
  const verseText = verse.translation ? `Chapter ${verse.chapter}, Verse ${verse.verse}. ${verse.sanskrit}. ${verse.translation}. ${verse.explanation || ''}` : '';
  const verseId = `verse-${verse.chapter}-${verse.verse}`;

  return (
    <div className="mt-3 rounded-xl overflow-hidden cursor-pointer transition-all duration-500" onClick={() => setExpanded(!expanded)}>
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 p-[1px] rounded-xl">
        <div className="bg-gray-950/80 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400 text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Ch. {verse.chapter} · V. {verse.verse}
            </span>
            {verseText && (
              <div onClick={e => e.stopPropagation()}>
                <SpeakingButton isSpeaking={speakingId === verseId} onToggle={() => onSpeak(verseText, verseId, 'wisdom')} size="sm" />
              </div>
            )}
          </div>
          <p className="text-amber-200/60 text-xs italic mb-1 font-serif">{verse.sanskrit}</p>
          <p className="text-amber-100 text-sm font-medium leading-relaxed">"{verse.translation}"</p>
          {expanded && (
            <div className="mt-3 pt-3 border-t border-amber-500/10">
              <p className="text-gray-400 text-xs leading-relaxed">{verse.explanation}</p>
            </div>
          )}
          <p className="text-amber-500/50 text-[10px] mt-2 tracking-wide">{expanded ? '▲ COLLAPSE' : '▼ READ MORE'}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── ChapterBrowser ─── */
function ChapterBrowser({ onSelectVerse, onClose }) {
  const { t } = useTranslation();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterVerses, setChapterVerses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/chapters`).then(r => r.json()).then(d => { setChapters(d.chapters || []); setLoading(false); }).catch(() => { setLoading(false); });
  }, []);

  const loadChapter = (num) => {
    setSelectedChapter(num); setLoading(true);
    fetch(`${API}/api/chapters/${num}`).then(r => r.json()).then(d => { setChapterVerses(d.verses || []); setLoading(false); }).catch(() => setLoading(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 border border-white/5 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">{t('chapterBrowser.title')}</h2>
            <p className="text-gray-500 text-xs mt-0.5">18 Chapters · 700 Verses</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-2 scrollbar-thin">
          {!selectedChapter ? (
            chapters.map((ch, i) => (
              <button key={ch.chapter} onClick={() => loadChapter(ch.chapter)}
                className="w-full text-left group rounded-2xl p-4 transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-amber-500/20"
                style={{ animationDelay: `${i * 30}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">{ch.chapter}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-semibold truncate">{ch.english}</h3>
                    <p className="text-gray-500 text-xs truncate">{ch.subtitle}</p>
                  </div>
                  <span className="text-gray-600 text-xs shrink-0">{ch.verseCount}v →</span>
                </div>
              </button>
            ))
          ) : (
            <div>
              <button onClick={() => setSelectedChapter(null)} className="text-amber-400 text-xs hover:text-amber-300 mb-4 flex items-center gap-1 transition-colors">← Back to Chapters</button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center text-amber-300 font-bold">{selectedChapter}</div>
                <div>
                  <h3 className="text-white font-bold">{CHAPTER_NAMES[selectedChapter]?.english}</h3>
                  <p className="text-gray-500 text-xs">{CHAPTER_NAMES[selectedChapter]?.subtitle}</p>
                </div>
              </div>
              {loading ? <div className="text-center text-gray-500 py-12"><div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto"/></div> : (
                <div className="space-y-2">
                  {chapterVerses.map(v => (
                    <button key={`${v.chapter}-${v.verse}`} onClick={() => { onSelectVerse(`Tell me about Chapter ${v.chapter}, Verse ${v.verse}`); onClose(); }}
                      className="w-full text-left rounded-xl p-3 transition-all hover:bg-white/5 border border-transparent hover:border-amber-500/10">
                      <span className="text-amber-400 text-[10px] font-bold">V. {v.chapter}.{v.verse}</span>
                      <p className="text-amber-200/50 text-xs italic mt-0.5">{v.sanskrit}</p>
                      <p className="text-gray-300 text-xs mt-0.5">"{v.translation}"</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── VoiceVisualizer (inline) ─── */
function VoiceWave({ active }) {
  const bars = 5;
  return (
    <div className="flex items-center gap-[2px] h-4">
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className={`w-[3px] rounded-full transition-all duration-150 ${active ? 'bg-red-400' : 'bg-gray-600'}`}
          style={{ height: active ? `${8 + Math.random() * 12}px` : '3px', animationDelay: `${i * 80}ms` }} />
      ))}
    </div>
  );
}

/* ─── MicButton (Premium) ─── */
function MicButton({ isListening, onToggle }) {
  const { t } = useTranslation();
  return (
    <button onClick={onToggle}
      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 ${
        isListening
          ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/30 scale-110'
          : 'bg-gradient-to-br from-white/10 to-white/5 hover:from-white/15 hover:to-white/10 border border-white/10 hover:border-amber-500/30'
      }`}
      title={isListening ? t('chat.stop') : t('chat.listen')}>
      {isListening && <><span className="absolute inset-0 rounded-2xl animate-ping bg-red-400 opacity-20"/><span className="absolute -inset-1 rounded-2xl animate-pulse bg-red-500 opacity-10"/></>}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="22"/>
      </svg>
    </button>
  );
}

/* ─── TypingIndicator ─── */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-1.5 h-1.5 bg-amber-400/60 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }}/>
      ))}
    </div>
  );
}

/* ─── LanguageSelector ─── */
function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/20 transition-all text-xs text-gray-300 hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span className="font-medium">{current.native}</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 py-2 z-50 w-48 animate-slide-down">
          {LANGUAGES.map(lang => (
            <button key={lang.code} onClick={() => { i18n.changeLanguage(lang.code); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2 ${
                i18n.language === lang.code ? 'text-amber-400 bg-amber-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}>
              <span className="text-base">{lang.flag}</span>
              <span className="font-medium">{lang.native}</span>
              <span className="text-gray-600 text-xs ml-auto">{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([{ role: 'assistant', content: t('chat.welcome'), verse: null }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [showChapterBrowser, setShowChapterBrowser] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const chatEnd = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false); // <-- FIX: use ref for stale closure

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant' && !prev[0].verse) {
        return [{ ...prev[0], content: t('chat.welcome') }];
      }
      return prev;
    });
  }, [i18n.language, t]);

  // ─── Speech Recognition (FIXED: uses ref to avoid stale closure) ───
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript;
        else interim += transcript;
      }
      if (final) {
        setInput(prev => prev ? prev + ' ' + final : final);
        setIsListening(false);
        isListeningRef.current = false;
      } else if (interim) {
        setInput(interim);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        if (isListeningRef.current) {
          setTimeout(() => {
            try { recognition.start(); } catch {}
          }, 300);
        }
        return;
      }
      setIsListening(false);
      isListeningRef.current = false;
      if (event.error === 'not-allowed') toast.error(t('chat.micDenied'));
      else if (event.error !== 'aborted') toast.error(t('chat.voiceFailed'));
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        setTimeout(() => {
          try { recognition.start(); } catch {}
        }, 200);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleVoice = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') toast.error(t('chat.voiceHttpsRequired'));
      else toast.error(t('chat.voiceNotSupported'));
      return;
    }
    if (isListeningRef.current) {
      isListeningRef.current = false;
      setIsListening(false);
      try { rec.stop(); } catch {}
    } else {
      const langMap = { en:'en-IN', hi:'hi-IN', ta:'ta-IN', te:'te-IN', mr:'mr-IN', bn:'bn-IN', kn:'kn-IN', gu:'gu-IN', ml:'ml-IN' };
      rec.lang = langMap[i18n.language] || 'en-IN';
      try {
        rec.start();
        isListeningRef.current = true;
        setIsListening(true);
        toast(t('chat.listening'), { icon: '🎙️', duration: 2000 });
      } catch (err) {
        console.error('Start error:', err);
        toast.error('Could not start voice.');
      }
    }
  }, [i18n.language, t]);

  const speak = async (text, id, emotion = 'default') => {
    if (speakingId === id) { if (window._gitaAudio) { window._gitaAudio.pause(); window._gitaAudio = null; } setSpeakingId(null); return; }
    if (window._gitaAudio) { window._gitaAudio.pause(); window._gitaAudio = null; }
    setSpeakingId(id);
    try {
      const res = await fetch(`${API}/api/tts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, lang: i18n.language, emotion }) });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      window._gitaAudio = audio;
      audio.onended = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
      await audio.play();
    } catch (err) { console.error('TTS error:', err); setSpeakingId(null); }
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput(''); setMessages(prev => [...prev, { role: 'user', content: msg }]); setLoading(true);
    try {
      const res = await fetch(`${API}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, lang: i18n.language }) });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message, verse: data.verse, emotions: data.emotions }]);
      if (autoRead && data.verse?.translation) setTimeout(() => speak(`${data.verse.translation}. ${data.message}`, 'auto-' + Date.now()), 500);
    } catch { toast.error(t('chat.connectionError')); setMessages(prev => [...prev, { role: 'assistant', content: t('chat.genericError'), verse: null }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-saffron-500/3 rounded-full blur-3xl"/>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-gray-950/80 backdrop-blur-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20 animate-float">🕉</div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">Gita Gyan</h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">AI Spiritual Guide</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageSelector />
            <button onClick={() => setAutoRead(!autoRead)}
              className={`p-2 rounded-xl transition-all duration-300 ${autoRead ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 border border-transparent'}`}
              title={autoRead ? 'Auto-read ON' : 'Auto-read OFF'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {autoRead ? <><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></> :
                  <><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/></>}
              </svg>
            </button>
            <button onClick={() => setShowChapterBrowser(true)}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 border border-transparent transition-all" title="Browse chapters">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M8 7h6"/><path d="M8 11h8"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Chat */}
      <main className="flex-1 overflow-y-auto relative z-10 px-4 py-6 scrollbar-thin">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-br-md shadow-lg shadow-amber-500/10'
                  : 'bg-white/5 backdrop-blur-xl text-gray-200 rounded-bl-md border border-white/5'
              }`}>
                {msg.role === 'assistant' && msg.emotions?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {msg.emotions.slice(0, 3).map(e => (
                      <span key={e} className="text-[9px] font-medium uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/10">{e}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                {msg.verse && <VerseCard verse={msg.verse} onSpeak={speak} speakingId={speakingId} />}
                {msg.role === 'assistant' && msg.content && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <SpeakingButton isSpeaking={speakingId === i} onToggle={() => speak(msg.content, i, msg.emotions?.[0] || 'default')} size="sm" />
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-slide-up">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl rounded-bl-md border border-white/5"><TypingIndicator /></div>
            </div>
          )}
          <div ref={chatEnd} />
        </div>
      </main>

      {/* Input */}
      <footer className="relative z-10 border-t border-white/5 bg-gray-950/80 backdrop-blur-2xl px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-end gap-2">
            <MicButton isListening={isListening} onToggle={toggleVoice} />
            {isListening && <VoiceWave active={isListening} />}
            <div className="flex-1 relative">
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={t('chat.placeholder')} rows={1}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={e => { e.target.style.height = '44px'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }} />
            </div>
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 disabled:opacity-20 disabled:cursor-not-allowed bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-105 active:scale-95">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p className="text-center text-[9px] text-gray-700 mt-2 tracking-widest uppercase">{t('chat.poweredBy')}</p>
        </div>
      </footer>

      {showChapterBrowser && <ChapterBrowser onSelectVerse={msg => { setInput(msg); setTimeout(sendMessage, 100); }} onClose={() => setShowChapterBrowser(false)} />}
    </div>
  );
}
