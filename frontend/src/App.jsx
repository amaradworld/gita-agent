import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import SpeakingButton from './components/SpeakingButton';

const API = '';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
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

function VerseCard({ verse, onSpeak, speakingId }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  if (!verse) return null;

  const verseText = verse.translation
    ? `Chapter ${verse.chapter}, Verse ${verse.verse}. ${verse.sanskrit}. ${verse.translation}. ${verse.explanation || ''}`
    : '';
  const verseId = `verse-${verse.chapter}-${verse.verse}`;

  return (
    <div className="mt-3 bg-gradient-to-br from-saffron-600/10 to-orange-600/5 border border-saffron-600/20 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-saffron-600/40" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-saffron-400 text-xs font-semibold bg-saffron-600/20 px-2 py-0.5 rounded-full">
          Chapter {verse.chapter}, Verse {verse.verse}
        </span>
        {verseText && (
          <div onClick={(e) => e.stopPropagation()}>
            <SpeakingButton
              isSpeaking={speakingId === verseId}
              onToggle={() => onSpeak(verseText, verseId, 'wisdom')}
              size="sm"
            />
          </div>
        )}
      </div>
      <p className="text-saffron-200 text-sm italic mb-1">{verse.sanskrit}</p>
      <p className="text-saffron-100 text-sm font-medium">"{verse.translation}"</p>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-saffron-600/20">
          <p className="text-gray-300 text-sm leading-relaxed">{verse.explanation}</p>
        </div>
      )}
      <p className="text-saffron-400 text-xs mt-2">{expanded ? t('chapterBrowser.collapse') : t('chapterBrowser.readMore')}</p>
    </div>
  );
}

function ChapterBrowser({ onSelectVerse, onClose }) {
  const { t } = useTranslation();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterVerses, setChapterVerses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/chapters`)
      .then(r => r.json())
      .then(data => { setChapters(data.chapters || []); setLoading(false); })
      .catch(() => { setLoading(false); toast.error('Failed to load chapters'); });
  }, []);

  const loadChapter = (num) => {
    setSelectedChapter(num);
    setLoading(true);
    fetch(`${API}/api/chapters/${num}`)
      .then(r => r.json())
      .then(data => { setChapterVerses(data.verses || []); setLoading(false); })
      .catch(() => { setLoading(false); toast.error('Failed to load verses'); });
  };

  const handleVerseClick = (verse) => {
    onSelectVerse(`Tell me about Chapter ${verse.chapter}, Verse ${verse.verse}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-saffron-100 font-bold text-lg">{t('chapterBrowser.title')}</h2>
            <p className="text-gray-400 text-xs">{t('chapterBrowser.chapters')} · {t('chapterBrowser.verses')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!selectedChapter ? (
            <div className="space-y-2">
              {chapters.map(ch => (
                <button
                  key={ch.chapter}
                  onClick={() => loadChapter(ch.chapter)}
                  className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/5 hover:border-saffron-600/30 rounded-xl px-4 py-3 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-saffron-400 text-xs font-bold">Chapter {ch.chapter}</span>
                      <h3 className="text-saffron-100 text-sm font-medium mt-0.5">{ch.english}</h3>
                      <p className="text-gray-500 text-xs">{ch.subtitle}</p>
                    </div>
                    <span className="text-gray-600 text-xs">{t('chapterBrowser.verseCount', { count: ch.verseCount })} →</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button
                onClick={() => setSelectedChapter(null)}
                className="text-saffron-400 text-xs hover:text-saffron-300 mb-3 flex items-center gap-1"
              >
                {t('chapterBrowser.backToChapters')}
              </button>
              <h3 className="text-saffron-100 font-bold mb-1">
                Chapter {selectedChapter} — {CHAPTER_NAMES[selectedChapter]?.english}
              </h3>
              <p className="text-gray-500 text-xs mb-4">{CHAPTER_NAMES[selectedChapter]?.subtitle}</p>

              {loading ? (
                <div className="text-center text-gray-500 py-8">{t('chapterBrowser.loadingVerses')}</div>
              ) : chapterVerses.length === 0 ? (
                <div className="text-center text-gray-500 py-8">{t('chapterBrowser.noVerses')}</div>
              ) : (
                <div className="space-y-3">
                  {chapterVerses.map(v => (
                    <button
                      key={`${v.chapter}-${v.verse}`}
                      onClick={() => handleVerseClick(v)}
                      className="w-full text-left bg-white/5 hover:bg-saffron-600/10 border border-white/5 hover:border-saffron-600/30 rounded-xl p-4 transition-all"
                    >
                      <span className="text-saffron-400 text-xs font-bold">Verse {v.chapter}.{v.verse}</span>
                      <p className="text-saffron-200 text-sm italic mt-1">{v.sanskrit}</p>
                      <p className="text-gray-300 text-sm mt-1">"{v.translation}"</p>
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

function VoiceButton({ isListening, onToggle }) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
        isListening
          ? 'bg-red-500 hover:bg-red-600 voice-pulse'
          : 'bg-saffron-600 hover:bg-saffron-700'
      }`}
      title={isListening ? t('chat.stop') : t('chat.listen')}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-saffron-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

function LanguageSelector() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-saffron-400 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors text-xs flex items-center gap-1"
        title="Change language"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        {currentLang.native}
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 bg-gray-900 border border-white/10 rounded-xl shadow-xl py-1 z-50 w-40">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => changeLang(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                i18n.language === lang.code ? 'text-saffron-400 bg-saffron-600/10' : 'text-gray-300'
              }`}
            >
              <span className="font-medium">{lang.native}</span>
              <span className="text-gray-500 text-xs ml-1">({lang.label})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('chat.welcome'),
      verse: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [showChapterBrowser, setShowChapterBrowser] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const chatEnd = useRef(null);
  const recognitionRef = useRef(null);

  // Preload voices (browsers load lazily)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update welcome message when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant' && !prev[0].verse) {
        return [{ ...prev[0], content: t('chat.welcome') }];
      }
      return prev;
    });
  }, [i18n.language, t]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = 'en-IN';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setInput(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
        setIsListening(false);
      } else if (interimTranscript) {
        setInput(interimTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      // Auto-recover from transient errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Restart silently
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try { recognitionRef.current.start(); } catch {}
          }
        }, 500);
        return;
      }
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error(t('chat.micDenied'));
      } else {
        toast.error(t('chat.voiceFailed'));
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListening) {
        setTimeout(() => {
          if (recognitionRef.current) {
            try { recognitionRef.current.start(); } catch {}
          }
        }, 300);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        toast.error(t('chat.voiceHttpsRequired'));
      } else {
        toast.error(t('chat.voiceNotSupported'));
      }
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const langMap = {
          en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN',
          mr: 'mr-IN', bn: 'bn-IN', kn: 'kn-IN', gu: 'gu-IN', ml: 'ml-IN',
        };
        recognitionRef.current.lang = langMap[i18n.language] || 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
        toast.success(t('chat.listening'), { duration: 2000 });
      } catch (err) {
        console.error('Failed to start recognition:', err);
        toast.error('Could not start voice. Please try again.');
      }
    }
  };

  const speak = async (text, id, emotion = 'default') => {
    if (speakingId === id) {
      // Stop speaking
      if (window._gitaAudio) { window._gitaAudio.pause(); window._gitaAudio = null; }
      setSpeakingId(null);
      return;
    }

    // Stop any previous audio
    if (window._gitaAudio) { window._gitaAudio.pause(); window._gitaAudio = null; }

    setSpeakingId(id);
    try {
      const res = await fetch(`${API}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: i18n.language, emotion }),
      });
      if (!res.ok) throw new Error('TTS request failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      window._gitaAudio = audio;
      audio.onended = () => { setSpeakingId(null); URL.revokeObjectURL(url); };
      audio.onerror = () => { setSpeakingId(null); URL.revokeObjectURL(url); toast.error(t('chat.ttsFailed')); };
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setSpeakingId(null);
      toast.error(t('chat.ttsFailed'));
    }
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    setInput('');
    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, lang: i18n.language }),
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message, verse: data.verse, emotions: data.emotions },
      ]);

      // Auto-read verse if enabled
      if (autoRead && data.verse && data.verse.translation) {
        setTimeout(() => {
          const readText = `${data.verse.translation}. ${data.message}`;
          speak(readText, 'auto-' + Date.now());
        }, 500);
      }
    } catch (err) {
      toast.error(t('chat.connectionError'));
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: t('chat.genericError'), verse: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-saffron-400 to-sacred-500 flex items-center justify-center text-lg animate-float">
              🕉
            </div>
            <div>
              <h1 className="font-bold text-lg text-saffron-100">Gita Gyan</h1>
              <p className="text-xs text-gray-400">AI Spiritual Guide</p>
            </div>
          </div>
          <div className="text-xs text-gray-500 hidden sm:block">Bhagavad Gita Wisdom</div>
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <button
              onClick={() => setAutoRead(!autoRead)}
              className={`p-2 rounded-lg transition-all duration-300 ${autoRead ? 'text-saffron-400 bg-saffron-600/20 shadow-sm shadow-saffron-500/20' : 'text-gray-400 hover:text-saffron-400 hover:bg-white/5'}`}
              title={autoRead ? 'Auto-read: ON' : 'Auto-read: OFF'}
            >
              {autoRead ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="2" x2="22" y1="2" y2="22"/>
                  <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
                  <path d="M5 10v2a7 7 0 0 0 12 5"/>
                  <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowChapterBrowser(true)}
              className="text-gray-400 hover:text-saffron-400 p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Browse all chapters"
            >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
              <path d="M8 7h6"/>
              <path d="M8 11h8"/>
            </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto chat-scroll px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-saffron-600 text-white rounded-br-md'
                  : 'bg-white/10 backdrop-blur-sm text-gray-100 rounded-bl-md border border-white/10'
              }`}>
                {msg.role === 'assistant' && msg.emotions?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {msg.emotions.map(e => (
                      <span key={e} className="text-[10px] bg-sacred-600/30 text-sacred-200 px-1.5 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {msg.verse && <VerseCard verse={msg.verse} onSpeak={speak} speakingId={speakingId} />}

                {msg.role === 'assistant' && msg.content && (
                  <div className="mt-2">
                    <SpeakingButton
                      isSpeaking={speakingId === i}
                      onToggle={() => speak(msg.content, i, msg.emotions?.[0] || 'default')}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl rounded-bl-md border border-white/10">
                <TypingIndicator />
              </div>
            </div>
          )}

          <div ref={chatEnd} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-black/20 backdrop-blur-md border-t border-white/10 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-end gap-2">
          <VoiceButton isListening={isListening} onToggle={toggleVoice} />
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat.placeholder')}
              rows={1}
              className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-saffron-500/50 focus:border-saffron-500/50"
              style={{ minHeight: '44px', maxHeight: '120px' }}
              onInput={(e) => {
                e.target.style.height = '44px';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-12 h-12 bg-saffron-600 hover:bg-saffron-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-2">{t('chat.poweredBy')}</p>
      </footer>

      {showChapterBrowser && (
        <ChapterBrowser
          onSelectVerse={(msg) => {
            setInput(msg);
            setTimeout(() => sendMessage(), 100);
          }}
          onClose={() => setShowChapterBrowser(false)}
        />
      )}
    </div>
  );
}
