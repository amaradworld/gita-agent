import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const API = '';

function VerseCard({ verse }) {
  const [expanded, setExpanded] = useState(false);
  if (!verse) return null;

  return (
    <div className="mt-3 bg-saffron-600/10 border border-saffron-600/20 rounded-xl p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-saffron-400 text-xs font-semibold bg-saffron-600/20 px-2 py-0.5 rounded-full">
          Chapter {verse.chapter}, Verse {verse.verse}
        </span>
      </div>
      <p className="text-saffron-200 text-sm italic mb-1">{verse.sanskrit}</p>
      <p className="text-saffron-100 text-sm font-medium">"{verse.translation}"</p>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-saffron-600/20">
          <p className="text-gray-300 text-sm leading-relaxed">{verse.explanation}</p>
        </div>
      )}
      <p className="text-saffron-400 text-xs mt-2">{expanded ? 'Click to collapse' : 'Click to read more'}</p>
    </div>
  );
}

function VoiceButton({ isListening, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
        isListening
          ? 'bg-red-500 hover:bg-red-600 voice-pulse'
          : 'bg-saffron-600 hover:bg-saffron-700'
      }`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
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

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Namaste! I am your Gita Gyan guide. Share what is on your heart, and I will offer wisdom from the Bhagavad Gita to help you find peace and clarity.\n\nYou can type or use the microphone to speak.',
      verse: null,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const chatEnd = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition failed. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in this browser');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text, id) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingId === id) {
        setSpeakingId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
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
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.message, verse: data.verse, emotions: data.emotions },
      ]);
    } catch (err) {
      toast.error('Failed to connect. Please try again.');
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'I apologize, something went wrong. Please try again. The divine light is always with you.', verse: null },
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

                {msg.verse && <VerseCard verse={msg.verse} />}

                {msg.role === 'assistant' && msg.content && (
                  <button
                    onClick={() => speak(msg.content, i)}
                    className="mt-2 text-xs text-gray-400 hover:text-saffron-400 flex items-center gap-1 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {speakingId === i ? (
                        <>
                          <rect x="6" y="4" width="4" height="16" rx="1" />
                          <rect x="14" y="4" width="4" height="16" rx="1" />
                        </>
                      ) : (
                        <>
                          <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                        </>
                      )}
                    </svg>
                    {speakingId === i ? 'Stop' : 'Listen'}
                  </button>
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
              placeholder="Share what's on your heart..."
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
        <p className="text-center text-[10px] text-gray-600 mt-2">Powered by Bhagavad Gita wisdom</p>
      </footer>
    </div>
  );
}
