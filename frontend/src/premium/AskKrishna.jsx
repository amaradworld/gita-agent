import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getJournalEntries, addJournalEntry, getMoodHistory, addMoodEntry } from '../lib/storage';
const API = '';

/* ═══════════════════════════════════════════════════════════
   ASK KRISHNA MODE — Structured Response
   ═══════════════════════════════════════════════════════════ */
export function AskKrishnaPage() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/mentor/ask-krishna`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, lang: i18n.language }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setResponse(data);
    } catch { toast.error('Failed to ask Krishna'); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/20">🙏</div>
        <h2 className="text-2xl font-bold text-white mb-1">{t('askKrishna.title', 'Ask Krishna')}</h2>
        <p className="text-gray-500 text-sm">{t('askKrishna.subtitle', 'Get structured wisdom for any question')}</p>
      </div>

      <div className="flex gap-2 mb-8">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder={t('askKrishna.placeholder', 'Ask anything...')}
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" />
        <button onClick={ask} disabled={!input.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm font-medium disabled:opacity-30 transition-all">
          {loading ? '...' : '🙏 Ask'}
        </button>
      </div>

      {response && (
        <div className="space-y-4 animate-slide-up">
          {/* Verse */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl border border-amber-500/20 p-5">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">🎯 Relevant Verse</p>
            <p className="text-white font-bold">Chapter {response.verse?.chapter}, Verse {response.verse?.verse}</p>
            {response.verse?.sanskrit && <p className="text-amber-200/50 text-xs italic mt-1 font-serif">{response.verse.sanskrit}</p>}
          </div>

          {/* Meaning */}
          <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-5">
            <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">📖 Meaning</p>
            <p className="text-gray-200 text-sm leading-relaxed">{response.verse?.translation}</p>
          </div>

          {/* Parse structured message for advice and action */}
          {response.message?.split('\n\n').map((section, i) => {
            if (section.includes('Practical Advice') || section.includes('व्यावहारिक सलाह')) {
              return (
                <div key={i} className="bg-white/[0.02] rounded-2xl border border-white/5 p-5">
                  <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">💡 Practical Advice</p>
                  <p className="text-gray-300 text-sm">{section.replace(/.*💡.*Advice.*:?\s*/i, '').replace(/.*सलाह.*:?\s*/i, '')}</p>
                </div>
              );
            }
            if (section.includes('Action for Today') || section.includes('आज के लिए')) {
              return (
                <div key={i} className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-2xl border border-green-500/20 p-5">
                  <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">📝 Action for Today</p>
                  <p className="text-gray-200 text-sm">{section.replace(/.*📝.*Today.*:?\s*/i, '').replace(/.*कार्य.*:?\s*/i, '')}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DAILY REFLECTION JOURNAL
   ═══════════════════════════════════════════════════════════ */
export function JournalPage() {
  const { t } = useTranslation();
  const userId = 'guest-' + (localStorage.getItem('gita-user-id') || 'default');
  const [happy, setHappy] = useState('');
  const [stressed, setStressed] = useState('');
  const [learned, setLearned] = useState('');
  const [entries, setEntries] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load from localStorage first (persistent)
    const local = getJournalEntries(userId);
    if (local.length > 0) setEntries(local);
    // Then try backend
    const ac = new AbortController();
    fetch(`${API}/api/mentor/journal/${userId}`, { signal: ac.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { const server = d.entries || []; if (server.length > local.length) setEntries(server); })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const save = async () => {
    if (!happy && !stressed && !learned) return;
    setSaving(true);
    const entry = {
      id: Date.now().toString(),
      userId, happy, stressed, learned,
      createdAt: new Date().toISOString(),
    };
    // Save to localStorage immediately
    const updated = addJournalEntry(userId, entry);
    setEntries(updated);
    setHappy(''); setStressed(''); setLearned('');
    toast.success(t('journal.saved', 'Journal entry saved!'));
    // Try backend in background
    try {
      await fetch(`${API}/api/mentor/journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, happy, stressed, learned }),
      });
    } catch { /* localStorage already saved */ }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('journal.title', 'Reflection Journal')}</h2>
        <p className="text-gray-500 text-sm">{t('journal.subtitle', 'Connect your day with Gita wisdom')}</p>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <label className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 block">😊 What made you happy today?</label>
          <textarea value={happy} onChange={e => setHappy(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" placeholder="Share your joy..." />
        </div>
        <div>
          <label className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 block">😰 What stressed you?</label>
          <textarea value={stressed} onChange={e => setStressed(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" placeholder="What was difficult?" />
        </div>
        <div>
          <label className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-1 block">💡 What did you learn?</label>
          <textarea value={learned} onChange={e => setLearned(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" placeholder="Any insights?" />
        </div>
        <button onClick={save} disabled={saving || (!happy && !stressed && !learned)}
          className="w-full py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm font-medium disabled:opacity-30 transition-all">
          {saving ? '...' : t('journal.save', 'Save Reflection')}
        </button>
      </div>

      <div className="space-y-3">
        <h3 className="text-white font-semibold text-sm">{t('journal.pastEntries', 'Past Reflections')}</h3>
        {entries.map((entry, i) => (
          <div key={entry.id || i} className="bg-white/[0.02] rounded-2xl border border-white/5 p-4">
            <p className="text-gray-500 text-[10px] mb-2">{new Date(entry.createdAt).toLocaleDateString()}</p>
            {entry.happy && <p className="text-gray-300 text-xs mb-1">😊 {entry.happy}</p>}
            {entry.stressed && <p className="text-gray-300 text-xs mb-1">😰 {entry.stressed}</p>}
            {entry.learned && <p className="text-gray-300 text-xs mb-1">💡 {entry.learned}</p>}
            {entry.gitaConnection && (
              <div className="mt-2 pt-2 border-t border-white/5">
                <p className="text-amber-400 text-[10px] font-bold">📖 Verse {entry.gitaConnection.chapter}.{entry.gitaConnection.verse}</p>
                <p className="text-gray-500 text-[10px]">{entry.gitaConnection.advice}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MOOD CHECK-IN
   ═══════════════════════════════════════════════════════════ */
export function MoodCheckinPage() {
  const { t } = useTranslation();
  const userId = 'guest-' + (localStorage.getItem('gita-user-id') || 'default');
  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load from localStorage first (persistent)
    const local = getMoodHistory(userId);
    if (local.length > 0) setHistory(local);
    // Then try backend
    const ac = new AbortController();
    fetch(`${API}/api/mentor/mood/history/${userId}`, { signal: ac.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { const server = d.history || []; if (server.length > local.length) setHistory(server); })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const moods = [
    { key: 'happy', icon: '😊', label: 'Happy', color: 'from-yellow-500/20 to-amber-500/10' },
    { key: 'sad', icon: '😔', label: 'Sad', color: 'from-blue-500/20 to-indigo-500/10' },
    { key: 'angry', icon: '😡', label: 'Angry', color: 'from-red-500/20 to-pink-500/10' },
    { key: 'anxious', icon: '😰', label: 'Anxious', color: 'from-purple-500/20 to-violet-500/10' },
    { key: 'confused', icon: '😕', label: 'Confused', color: 'from-gray-500/20 to-slate-500/10' },
    { key: 'peaceful', icon: '😌', label: 'Peaceful', color: 'from-green-500/20 to-emerald-500/10' },
  ];

  const selectMood = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/mentor/mood/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, mood: mood.key }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setRecommendations(data.recommendations);
      // Save to localStorage (persistent)
      const entry = data.entry || { mood: mood.key, timestamp: new Date().toISOString() };
      const updated = addMoodEntry(userId, entry);
      setHistory(updated);
    } catch {
      // Still save to localStorage even if backend fails
      const entry = { mood: mood.key, timestamp: new Date().toISOString(), id: Date.now().toString() };
      const updated = addMoodEntry(userId, entry);
      setHistory(updated);
      toast.error('Failed to record mood');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('mood.title', 'How Are You Feeling?')}</h2>
        <p className="text-gray-500 text-sm">{t('mood.subtitle', 'Check in and get personalized guidance')}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8" role="radiogroup" aria-label="Select your mood">
        {moods.map(mood => (
          <button key={mood.key} onClick={() => selectMood(mood)} role="radio" aria-checked={selectedMood?.key === mood.key} aria-label={mood.label}
            className={`bg-gradient-to-br ${mood.color} rounded-2xl border p-4 text-center transition-all hover:scale-105 ${
              selectedMood?.key === mood.key ? 'border-amber-500/40 shadow-lg shadow-amber-500/10' : 'border-white/5'
            }`}>
            <span className="text-3xl" aria-hidden="true">{mood.icon}</span>
            <p className="text-white text-xs mt-1 font-medium">{mood.label}</p>
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-8" role="status" aria-label="Loading mood recommendations"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" aria-hidden="true"/></div>}

      {recommendations && !loading && (
        <div className="space-y-3 animate-slide-up">
          <h3 className="text-white font-semibold">Here's what can help:</h3>
          {recommendations.verses && (
            <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10">
              <p className="text-amber-400 text-xs font-bold mb-1">📖 Recommended Verses</p>
              <p className="text-gray-300 text-sm">Chapter {recommendations.verses[0]?.split('.')[0]}, Verse {recommendations.verses[0]?.split('.')[1]}</p>
            </div>
          )}
          {recommendations.meditation && (
            <div className="bg-purple-500/5 rounded-2xl p-4 border border-purple-500/10">
              <p className="text-purple-400 text-xs font-bold mb-1">🧘 Meditation</p>
              <p className="text-gray-300 text-sm">{recommendations.meditation}</p>
            </div>
          )}
          {recommendations.breathing && (
            <div className="bg-green-500/5 rounded-2xl p-4 border border-green-500/10">
              <p className="text-green-400 text-xs font-bold mb-1">🫁 Breathing Exercise</p>
              <p className="text-gray-300 text-sm">{recommendations.breathing}</p>
            </div>
          )}
          {recommendations.activity && (
            <div className="bg-blue-500/5 rounded-2xl p-4 border border-blue-500/10">
              <p className="text-blue-400 text-xs font-bold mb-1">✨ Activity</p>
              <p className="text-gray-300 text-sm">{recommendations.activity}</p>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-white font-semibold text-sm mb-3">Mood History</h3>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {history.slice(0, 14).reverse().map((h, i) => {
              const moodEmoji = moods.find(m => m.key === h.mood)?.icon || '❓';
              return (
                <div key={i} className="flex flex-col items-center min-w-[32px]">
                  <span className="text-lg">{moodEmoji}</span>
                  <span className="text-[8px] text-gray-600">{new Date(h.timestamp).getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUIZ PAGE
   ═══════════════════════════════════════════════════════════ */
export function QuizPage() {
  const { t } = useTranslation();
  const userId = 'guest-' + (localStorage.getItem('gita-user-id') || 'default');
  const [quizState, setQuizState] = useState('idle'); // idle, playing, result
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const startQuiz = async () => {
    try {
      const res = await fetch(`${API}/api/mentor/quiz/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setQuestion(data);
      setQuizState('playing');
      setScore(0);
    } catch { toast.error('Failed to start quiz'); }
  };

  const answer = async (idx) => {
    try {
      const res = await fetch(`${API}/api/mentor/quiz/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, answer: idx }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setFeedback({ correct: data.correct, correctAnswer: data.correctAnswer });
      setScore(data.score);
      setTimeout(() => {
        setFeedback(null);
        if (data.next?.completed) {
          setQuizState('result');
          setScore(data.score);
        } else if (data.next) {
          setQuestion(data.next);
        }
      }, 1500);
    } catch { toast.error('Failed to answer'); }
  };

  if (quizState === 'idle') return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in text-center">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl mx-auto mb-4">🧠</div>
      <h2 className="text-2xl font-bold text-white mb-2">{t('quiz.title', 'Gita Quiz')}</h2>
      <p className="text-gray-500 text-sm mb-8">{t('quiz.subtitle', 'Test your knowledge of the Bhagavad Gita')}</p>
      <button onClick={startQuiz} className="px-8 py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-medium hover:scale-105 transition-all">
        {t('quiz.start', 'Start Quiz')} 🧠
      </button>
    </div>
  );

  if (quizState === 'result') {
    const pct = question?.totalQuestions ? (score / question.totalQuestions) : (score / 10);
    return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in text-center">
      <div className="text-6xl mb-4">{pct >= 0.8 ? '🏆' : pct >= 0.5 ? '⭐' : '📖'}</div>
      <h2 className="text-2xl font-bold text-white mb-2">{t('quiz.complete', 'Quiz Complete!')}</h2>
      <p className="text-amber-400 text-4xl font-bold mb-2">{score}/{question?.totalQuestions || 10}</p>
      <p className="text-gray-500 text-sm mb-8">
        {pct >= 0.8 ? 'Excellent! You are a Gita scholar!' : pct >= 0.5 ? 'Good job! Keep learning!' : 'Keep studying! The Gita rewards persistence.'}
      </p>
      <button onClick={startQuiz} className="px-8 py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-medium">
        {t('quiz.playAgain', 'Play Again')} 🔄
      </button>
    </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-500 text-sm">Question {question.questionNumber}/{question.totalQuestions}</span>
        <span className="text-amber-400 text-sm font-bold">Score: {score}</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2 mb-6">
        <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${(question.questionNumber / question.totalQuestions) * 100}%` }} />
      </div>

      <h3 className="text-white text-lg font-medium mb-6">{question.question}</h3>

      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <button key={i} onClick={() => !feedback && answer(i)}
            className={`w-full text-left rounded-2xl p-4 border transition-all ${
              feedback
                ? i === question.options.indexOf(feedback.correctAnswer)
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-white/[0.02] border-white/5 text-gray-500'
                : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-amber-500/20 text-gray-300'
            }`}>
            <span className="text-xs font-bold text-amber-400 mr-2">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </button>
        ))}
      </div>

      {feedback && (
        <div className={`mt-4 p-3 rounded-xl text-center text-sm font-medium ${feedback.correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {feedback.correct ? '✅ Correct!' : `❌ Wrong. Answer: ${feedback.correctAnswer}`}
        </div>
      )}
    </div>
  );
}
