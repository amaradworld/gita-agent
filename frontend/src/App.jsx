import React, { useState, useRef, useEffect, useCallback, useMemo, Component } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import SpeakingButton from './components/SpeakingButton';
import { AskKrishnaPage, JournalPage, MoodCheckinPage, QuizPage } from './premium/AskKrishna';
import { LearningPathPage, MeditationPage, VerseCardPage, CharacterPage, CalmModePage, StoryModePage, DebateModePage, BookmarksPage } from './premium/PremiumPages';

const API = '';

/* ─── Spinner (accessible) ─── */
function Spinner({ label = 'Loading' }) {
  return (
    <div className="text-center py-12" role="status" aria-label={label}>
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" aria-hidden="true"/>
      <p className="text-gray-500 text-xs mt-2 sr-only">{label}</p>
    </div>
  );
}

/* ─── Skeleton (content placeholder) ─── */
function Skeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-white/5 rounded-lg animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}

/* ─── useDebounce hook ─── */
function useDebounce(callback, delay) {
  const timerRef = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}

/* ─── Error Boundary ─── */
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <p className="text-4xl mb-4">🕉</p>
            <h2 className="text-white font-bold text-lg mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-4">An unexpected error occurred.</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/30 transition-all">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

/* ─── VerseCard (memoized) ─── */
const VerseCard = React.memo(function VerseCardInner({ verse, onSpeak, speakingId }) {
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
});

/* ─── DailyVersePage ─── */
function DailyVersePage({ onSpeak, speakingId }) {
  const { t, i18n } = useTranslation();
  const [dailyVerse, setDailyVerse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/api/mentor/daily-verse?lang=${i18n.language}`, { signal: ac.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { setDailyVerse(d); setLoading(false); })
      .catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => ac.abort();
  }, [i18n.language]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/20 animate-float">🕉</div>
        <h2 className="text-2xl font-bold text-white mb-1">{t('dailyVerse.title', 'Daily Verse')}</h2>
        <p className="text-gray-500 text-sm">{t('dailyVerse.subtitle', 'Start your day with divine wisdom')}</p>
      </div>

      {loading ? (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl border border-white/5 p-6 shadow-2xl" aria-hidden="true">
          <Skeleton lines={4} />
        </div>
      ) : dailyVerse ? (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-3xl border border-white/5 p-6 shadow-2xl">
          <div className="text-center mb-4">
            <span className="text-amber-400 text-xs font-bold tracking-wider uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {dailyVerse.scenario}
            </span>
          </div>
          <p className="text-amber-100 text-lg text-center font-medium mb-4">{dailyVerse.message}</p>
          {dailyVerse.practicalAdvice && (
            <div className="bg-amber-500/5 rounded-2xl p-4 mb-4 border border-amber-500/10">
              <p className="text-amber-200/80 text-sm leading-relaxed">
                <span className="text-amber-400 font-bold">💡 </span>{dailyVerse.practicalAdvice}
              </p>
            </div>
          )}
          {dailyVerse.modernApplication && (
            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-gray-300 text-sm leading-relaxed">
                <span className="text-gray-400 font-bold">🌍 </span>{dailyVerse.modernApplication}
              </p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500">Could not load daily verse</p>
      )}
    </div>
  );
}

/* ─── JourneyPage (Progress & Streaks) ─── */
function JourneyPage() {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = 'guest-' + (localStorage.getItem('gita-user-id') || 'default');

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/api/mentor/progress/${userId}`, { signal: ac.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { setProgress(d); setLoading(false); })
      .catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => ac.abort();
  }, []);

  if (loading) return <Spinner label="Loading progress" />;

  if (!progress) return <p className="text-center text-gray-500 py-12">Could not load progress</p>;

  const stats = [
    { label: t('journey.streak', 'Day Streak'), value: progress.streak, icon: '🔥', color: 'from-orange-500 to-red-500' },
    { label: t('journey.versesRead', 'Verses Read'), value: progress.totalVersesRead, icon: '📖', color: 'from-amber-500 to-orange-500' },
    { label: t('journey.chaptersExplored', 'Chapters'), value: `${progress.totalChapters}/${18}`, icon: '📚', color: 'from-yellow-500 to-amber-500' },
    { label: t('journey.sessions', 'Sessions'), value: progress.totalSessions, icon: '🕉', color: 'from-amber-500 to-yellow-500' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('journey.title', 'Your Spiritual Journey')}</h2>
        <p className="text-gray-500 text-sm">{t('journey.subtitle', 'Track your progress and build consistency')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5 p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white font-semibold text-sm">{t('journey.overallProgress', 'Overall Progress')}</span>
          <span className="text-amber-400 font-bold text-sm">{progress.progressPercent}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-1000"
            style={{ width: `${progress.progressPercent}%` }}
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">{progress.totalChapters} of 18 chapters explored</p>
      </div>

      {/* Favorites */}
      {progress.favoriteVerses && progress.favoriteVerses.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
          <h3 className="text-white font-semibold text-sm mb-3">{t('journey.favorites', 'Favorite Verses')}</h3>
          <div className="space-y-2">
            {progress.favoriteVerses.map(key => (
              <div key={key} className="bg-white/5 rounded-xl px-4 py-2 text-amber-200 text-sm">
                📖 Verse {key}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── GoalsPage ─── */
function GoalsPage() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState([]);
  const [userGoals, setUserGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 'guest-' + (localStorage.getItem('gita-user-id') || 'default');

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      fetch(`${API}/api/mentor/goals`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      fetch(`${API}/api/mentor/progress/${userId}`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
    ]).then(([goalsData, progressData]) => {
      setGoals(goalsData.goals || []);
      setUserGoals(progressData.goals || []);
      setLoading(false);
    }).catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => ac.abort();
  }, []);

  const toggleGoal = async (goalKey) => {
    const prev = userGoals;
    const newGoals = userGoals.includes(goalKey)
      ? userGoals.filter(g => g !== goalKey)
      : [...userGoals, goalKey];
    setUserGoals(newGoals);
    try {
      const res = await fetch(`${API}/api/mentor/goals/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, goals: newGoals }),
      });
      if (!res.ok) throw new Error('save failed');
      toast.success(t('goals.saved', 'Goals saved!'));
    } catch {
      setUserGoals(prev);
      toast.error('Failed to save goals');
    }
  };

  if (loading) return <Spinner label="Loading goals" />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('goals.title', 'Spiritual Goals')}</h2>
        <p className="text-gray-500 text-sm">{t('goals.subtitle', 'Set goals to guide your practice')}</p>
      </div>

      <div className="space-y-3">
        {goals.map(goal => {
          const isActive = userGoals.includes(goal.key);
          return (
            <button
              key={goal.key}
              onClick={() => toggleGoal(goal.key)}
              className={`w-full text-left rounded-2xl p-5 border transition-all duration-300 ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/10'
                  : 'bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  isActive ? 'bg-amber-500 text-white' : 'bg-white/10 text-gray-500'
                }`}>
                  {isActive ? '✓' : ''}
                </div>
                <h3 className="text-white font-semibold">{goal.label}</h3>
              </div>
              {isActive && (
                <div className="mt-3 pt-3 border-t border-amber-500/10">
                  <p className="text-amber-200/60 text-xs font-bold mb-2 uppercase tracking-wider">Exercises:</p>
                  <ul className="space-y-1.5">
                    {goal.exercises.map((ex, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                        <span className="text-amber-400 mt-0.5">•</span>{ex}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── ScenarioPage ─── */
function ScenarioPage({ onSendMessage }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commentaryVerse, setCommentaryVerse] = useState(null);

  const quickTopics = [
    { key: 'stress', icon: '😰', label: 'Stress & Anxiety' },
    { key: 'anger', icon: '😤', label: 'Anger Management' },
    { key: 'fear', icon: '😨', label: 'Fear & Courage' },
    { key: 'relationships', icon: '💝', label: 'Relationships' },
    { key: 'success', icon: '🏆', label: 'Success & Career' },
    { key: 'failure', icon: '💔', label: 'Failure & Resilience' },
    { key: 'discipline', icon: '⏰', label: 'Discipline' },
    { key: 'decision', icon: '🤔', label: 'Decision Making' },
    { key: 'death', icon: '🕊', label: 'Mortality & Grief' },
    { key: 'purpose', icon: '🌟', label: 'Life Purpose' },
  ];

  const searchScenario = async (term) => {
    setLoading(true);
    setQuery(term);
    try {
      const res = await fetch(`${API}/api/mentor/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: term }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setResults(data);
    } catch {
      toast.error('Failed to search');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('scenario.title', 'Life Guidance')}</h2>
        <p className="text-gray-500 text-sm">{t('scenario.subtitle', 'Find wisdom for your life situation')}</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && query.trim()) searchScenario(query); }}
            placeholder={t('scenario.placeholder', 'Describe your situation...')}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
            aria-label={t('scenario.placeholder', 'Describe your situation...')}
          />
          <button
            onClick={() => query.trim() && searchScenario(query)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 flex items-center justify-center text-amber-400 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
        {quickTopics.map(topic => (
          <button
            key={topic.key}
            onClick={() => searchScenario(topic.key)}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-left hover:bg-white/5 hover:border-amber-500/20 transition-all group"
          >
            <span className="text-xl">{topic.icon}</span>
            <p className="text-gray-300 text-xs mt-1 group-hover:text-amber-200 transition-colors">{topic.label}</p>
          </button>
        ))}
      </div>

      {loading && <Spinner label="Searching scenarios" />}

      {results && !loading && (
        <div className="space-y-3">
          <p className="text-gray-400 text-sm mb-4">{results.message}</p>
          {results.matched?.map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5 p-5 hover:border-amber-500/10 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                  Ch. {item.chapter} · V. {item.verse}
                </span>
                <span className="text-gray-500 text-xs">{item.lifeArea}</span>
              </div>
              <p className="text-amber-100 text-sm font-medium mb-2">{item.practicalAdvice}</p>
              {item.modernApplication && (
                <p className="text-gray-400 text-xs">{item.modernApplication}</p>
              )}
              {item.commentary && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-gray-500 text-xs italic">"{item.commentary}"</p>
                </div>
              )}
              <div className="flex gap-3 mt-3">
              <button
                onClick={() => onSendMessage(`Tell me about Chapter ${item.chapter}, Verse ${item.verse}`)}
                className="text-amber-400 text-xs hover:text-amber-300 transition-colors"
              >
                → Ask AI Mentor
              </button>
              <button
                onClick={() => setCommentaryVerse({ chapter: item.chapter, verse: item.verse })}
                className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
              >
                📚 View Commentaries
              </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {commentaryVerse && (
        <MultiCommentaryModal
          chapter={commentaryVerse.chapter}
          verse={commentaryVerse.verse}
          onClose={() => setCommentaryVerse(null)}
        />
      )}
    </div>
  );
}

/* ─── SearchPage ─── */
function SearchPage({ onSendMessage }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const setTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const handleSearch = async (q) => {
    if (!q || q.trim().length < 2) return;
    setLoading(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`${API}/api/mentor/search/enhanced?q=${encodeURIComponent(q)}&limit=10`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setResults(data);
    } catch {
      toast.error('Search failed');
    }
    setLoading(false);
  };

  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`${API}/api/mentor/search/suggestions?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setShowSuggestions(data.suggestions?.length > 0);
      setSelectedSuggestion(-1);
    } catch {}
  }, []);

  const debouncedSuggestions = useDebounce(fetchSuggestions, 250);

  const quickSearches = [
    { label: 'Stress relief', query: 'stress anxiety worry' },
    { label: 'Anger management', query: 'anger rage frustration' },
    { label: 'Finding purpose', query: 'purpose meaning life dharma' },
    { label: 'Dealing with loss', query: 'death grief loss sadness' },
    { label: 'Building confidence', query: 'confidence courage fear' },
    { label: 'Meditation', query: 'meditation mind focus peace' },
    { label: 'Karma yoga', query: 'karma action work duty' },
    { label: 'Relationships', query: 'love relationships respect' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('search.title', 'Search the Gita')}</h2>
        <p className="text-gray-500 text-sm">{t('search.subtitle', 'Find wisdom across verses, topics, and life situations')}</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); debouncedSuggestions(e.target.value); }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
                setQuery(suggestions[selectedSuggestion]);
                handleSearch(suggestions[selectedSuggestion]);
                setShowSuggestions(false);
              } else {
                handleSearch(query);
              }
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setSelectedSuggestion(prev => Math.max(prev - 1, -1));
            } else if (e.key === 'Escape') {
              setShowSuggestions(false);
              setSelectedSuggestion(-1);
            }
          }}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => { setTimeoutRef.current = setTimeout(() => setShowSuggestions(false), 200); }}
          placeholder={t('search.placeholder', 'Search verses, topics, emotions...')}
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-label={t('search.placeholder', 'Search verses, topics, emotions...')}
        />
        <button
          onClick={() => handleSearch(query)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 flex items-center justify-center text-amber-400 transition-all"
          aria-label="Search"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>
        {showSuggestions && (
          <div role="listbox" className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 py-2 z-50">
            {suggestions.map((s, i) => (
              <button key={i} role="option" aria-selected={selectedSuggestion === i}
                onMouseDown={e => { e.preventDefault(); clearTimeout(setTimeoutRef.current); setQuery(s); handleSearch(s); setShowSuggestions(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                  selectedSuggestion === i ? 'text-white bg-amber-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}>
                🔍 {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Searches */}
      {!results && (
        <div className="mb-8">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 font-bold">{t('search.quickSearches', 'Quick Searches')}</p>
          <div className="flex flex-wrap gap-2">
            {quickSearches.map((qs, i) => (
              <button key={i} onClick={() => { setQuery(qs.query); handleSearch(qs.query); }}
                className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-400 hover:text-amber-300 hover:bg-amber-500/5 hover:border-amber-500/20 transition-all">
                {qs.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading && <Spinner label="Searching" />}

      {results && !loading && (
        <div>
          <p className="text-gray-400 text-sm mb-4">
            {t('search.found', 'Found')} {results.total} {t('search.results', 'results')} for "{results.query}"
          </p>
          <div className="space-y-3">
            {results.results?.map((item, i) => (
              <div key={i} className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5 p-5 hover:border-amber-500/10 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Ch. {item.chapter} · V. {item.verse}
                  </span>
                  <span className="text-gray-600 text-[10px]">Score: {item.score}</span>
                  {item.scenarioData?.lifeArea && (
                    <span className="text-gray-500 text-[10px] bg-white/5 px-2 py-0.5 rounded-full">{item.scenarioData.lifeArea}</span>
                  )}
                </div>
                {item.verseData?.translation && (
                  <p className="text-amber-100 text-sm font-medium mb-1">"{item.verseData.translation}"</p>
                )}
                {item.scenarioData?.practicalAdvice && (
                  <p className="text-gray-400 text-xs mt-1">{item.scenarioData.practicalAdvice}</p>
                )}
                {item.matchedTokens?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.matchedTokens.map((token, j) => (
                      <span key={j} className="text-[9px] text-amber-500/60 bg-amber-500/5 px-1.5 py-0.5 rounded">{token}</span>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => onSendMessage(`Tell me about Chapter ${item.chapter}, Verse ${item.verse}`)}
                  className="mt-3 text-amber-400 text-xs hover:text-amber-300 transition-colors"
                >
                  → Ask AI Mentor
                </button>
              </div>
            ))}
            {results.results?.length === 0 && (
              <p className="text-center text-gray-500 py-8">{t('search.noResults', 'No results found. Try different keywords.')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CommunityPage ─── */
function CommunityPage() {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState(null);
  const [reflections, setReflections] = useState([]);
  const [stats, setStats] = useState(null);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const userId = 'guest-' + (localStorage.getItem('gita-user-id') || 'default');

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      fetch(`${API}/api/mentor/community/prompt`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      fetch(`${API}/api/mentor/community/reflections?limit=20`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      fetch(`${API}/api/mentor/community/stats`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
    ]).then(([promptData, reflectionsData, statsData]) => {
      setPrompt(promptData);
      setReflections(reflectionsData.reflections || []);
      setStats(statsData);
      setLoading(false);
    }).catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => ac.abort();
  }, []);

  const postReflection = async () => {
    if (!newText.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`${API}/api/mentor/community/reflections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, text: newText.trim(), isAnonymous: true }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setReflections(prev => [data, ...prev]);
      setNewText('');
      toast.success(t('community.posted', 'Reflection shared!'));
    } catch {
      toast.error('Failed to post');
    }
    setPosting(false);
  };

  const likeReflection = async (id) => {
    try {
      const res = await fetch(`${API}/api/mentor/community/reflections/${id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setReflections(prev => prev.map(r => r.id === id ? { ...r, likes: data.likes } : r));
    } catch { /* silent */ }
  };

  if (loading) return <Spinner label="Loading reflections" />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('community.title', 'Community')}</h2>
        <p className="text-gray-500 text-sm">{t('community.subtitle', 'Share your spiritual journey anonymously')}</p>
      </div>

      {/* Daily Prompt */}
      {prompt && (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-2xl border border-amber-500/20 p-5 mb-6">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">Today's Reflection Prompt</p>
          <p className="text-white text-lg font-medium">{prompt.emoji} {prompt.text}</p>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.totalReflections}</p>
            <p className="text-gray-500 text-[10px] uppercase">Reflections</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.todayReflections}</p>
            <p className="text-gray-500 text-[10px] uppercase">Today</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-3 text-center">
            <p className="text-white font-bold text-lg">{stats.totalLikes}</p>
            <p className="text-gray-500 text-[10px] uppercase">Likes</p>
          </div>
        </div>
      )}

      {/* New Reflection */}
      <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-4 mb-6">
        <textarea
          value={newText}
          onChange={e => setNewText(e.target.value)}
          placeholder={t('community.placeholder', 'Share your reflection...')}
          rows={3}
          maxLength={500}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-600 text-xs">{newText.length}/500</span>
          <button
            onClick={postReflection}
            disabled={!newText.trim() || posting}
            className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-medium transition-all disabled:opacity-30"
          >
            {posting ? '...' : t('community.share', 'Share Anonymously')}
          </button>
        </div>
      </div>

      {/* Reflections Feed */}
      <div className="space-y-3">
        {reflections.map(ref => (
          <div key={ref.id} className="bg-white/[0.02] rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center text-xs">
                🕉
              </div>
              <span className="text-gray-500 text-xs">{ref.userId}</span>
              {ref.mood && <span className="text-[9px] text-amber-500/60 bg-amber-500/5 px-1.5 py-0.5 rounded">{ref.mood}</span>}
              <span className="text-gray-600 text-[10px] ml-auto">{new Date(ref.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">{ref.text}</p>
            {ref.verseKey && (
              <p className="text-amber-500/60 text-[10px] mt-1">📖 Verse {ref.verseKey}</p>
            )}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
              <button onClick={() => likeReflection(ref.id)}
                className="flex items-center gap-1 text-gray-500 hover:text-amber-400 text-xs transition-colors">
                ❤️ {ref.likes || 0}
              </button>
            </div>
            {ref.replies?.length > 0 && (
              <div className="mt-3 space-y-2">
                {ref.replies.map(reply => (
                  <div key={reply.id} className="bg-white/5 rounded-xl p-2.5">
                    <p className="text-gray-500 text-[10px]">{reply.userId}</p>
                    <p className="text-gray-300 text-xs">{reply.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {reflections.length === 0 && (
          <p className="text-center text-gray-500 py-8">{t('community.noReflections', 'Be the first to share a reflection!')}</p>
        )}
      </div>
    </div>
  );
}

/* ─── GamificationPage ─── */
function GamificationPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = 'guest-' + (localStorage.getItem('gita-user-id') || 'default');

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/api/mentor/gamification/${userId}`, { signal: ac.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => ac.abort();
  }, []);

  if (loading) return <Spinner label="Loading achievements" />;

  if (!data) return <p className="text-center text-gray-500 py-12">Could not load gamification data</p>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('gamification.title', 'Achievements & Challenges')}</h2>
        <p className="text-gray-500 text-sm">{t('gamification.subtitle', 'Track your spiritual milestones')}</p>
      </div>

      {/* Today's Challenges */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{t('gamification.dailyChallenges', "Today's Challenges")}</h3>
          <span className="text-amber-400 text-sm font-bold">{data.completedChallenges}/{data.totalChallenges}</span>
        </div>
        <div className="space-y-2">
          {data.dailyChallenges?.map((challenge, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              challenge.completed
                ? 'bg-amber-500/10 border-amber-500/20'
                : 'bg-white/[0.02] border-white/5'
            }`}>
              <span className="text-xl">{challenge.icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${challenge.completed ? 'text-amber-200' : 'text-gray-300'}`}>{challenge.title}</p>
                <p className="text-gray-500 text-xs">{challenge.description}</p>
              </div>
              <div className="text-right">
                {challenge.completed ? (
                  <span className="text-amber-400 text-xs font-bold">✓ +{challenge.reward}</span>
                ) : (
                  <span className="text-gray-600 text-xs">{challenge.reward}pts</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {data.todayReward > 0 && (
          <div className="mt-3 text-center text-amber-400 text-sm font-bold">
            🎉 +{data.todayReward} points earned today!
          </div>
        )}
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">{t('gamification.achievements', 'Achievements')}</h3>
          <span className="text-amber-400 text-sm font-bold">{data.unlockedCount}/{data.totalAchievements}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.achievements?.map((ach, i) => (
            <div key={i} className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl border border-amber-500/20 p-3 text-center">
              <span className="text-2xl">{ach.icon}</span>
              <p className="text-amber-200 text-xs font-bold mt-1">{ach.title}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{ach.description}</p>
            </div>
          ))}
          {data.unlockedCount === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 text-sm">
              {t('gamification.noAchievements', 'Start reading verses to unlock achievements!')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── MultiCommentaryModal ─── */
function MultiCommentaryModal({ chapter, verse, onClose }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCommentator, setSelectedCommentator] = useState(null);
  const modalRef = useRef(null);

  const COMMENTATOR_LABELS = {
    adiShankaracharya: 'Adi Shankaracharya',
    swamiVivekananda: 'Swami Vivekananda',
    iskcon: 'ISKCON (Prabhupada)',
    chinmayananda: 'Swami Chinmayananda',
    sivananda: 'Swami Sivananda',
  };

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/api/mentor/commentary/${chapter}/${verse}`, { signal: ac.signal })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => ac.abort();
  }, [chapter, verse]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="Commentaries">
      <div ref={modalRef} tabIndex={-1} className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 border border-white/5 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50 outline-none">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">{t('commentary.title', 'Commentaries')}</h2>
            <p className="text-gray-500 text-xs mt-0.5">Chapter {chapter}, Verse {verse}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
          {loading ? (
            <Spinner label="Loading commentaries" />
          ) : data?.commentaries ? (
            <>
              {data.practicalAdvice && (
                <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10 mb-4">
                  <p className="text-amber-200/80 text-sm"><span className="text-amber-400 font-bold">💡 </span>{data.practicalAdvice}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(data.commentaries).map(([key, text]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCommentator(selectedCommentator === key ? null : key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedCommentator === key || !selectedCommentator
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {COMMENTATOR_LABELS[key] || key}
                  </button>
                ))}
              </div>
              {Object.entries(data.commentaries).map(([key, text]) => {
                if (selectedCommentator && selectedCommentator !== key) return null;
                return (
                  <div key={key} className="bg-white/[0.02] rounded-2xl border border-white/5 p-4">
                    <p className="text-amber-400 text-xs font-bold mb-2 uppercase tracking-wider">{COMMENTATOR_LABELS[key] || key}</p>
                    <p className="text-gray-300 text-sm leading-relaxed italic">"{text}"</p>
                  </div>
                );
              })}
              {data.modernApplication && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5 mt-4">
                  <p className="text-gray-300 text-sm"><span className="text-gray-400 font-bold">🌍 </span>{data.modernApplication}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">No commentary available for this verse</p>
          )}
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
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/api/chapters`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => { setChapters(d.chapters || []); setLoading(false); }).catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => ac.abort();
  }, []);

  const loadChapter = (num) => {
    setSelectedChapter(num); setLoading(true);
    fetch(`${API}/api/chapters/${num}`).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => { setChapterVerses(d.verses || []); setLoading(false); }).catch(() => { setLoading(false); setChapterVerses([]); });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-label="Chapter Browser">
      <div ref={modalRef} tabIndex={-1} className="bg-gradient-to-b from-gray-900/95 to-gray-950/95 border border-white/5 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50 outline-none">
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
              {loading ? <Spinner label="Loading verses" /> : (
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

/* ─── MicButton ─── */
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

/* ─── VoiceWave ─── */
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
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([{ role: 'assistant', content: t('chat.welcome'), verse: null }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [showChapterBrowser, setShowChapterBrowser] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  const chatEnd = useRef(null);
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant' && !prev[0].verse) {
        return [{ ...prev[0], content: t('chat.welcome') }];
      }
      return prev;
    });
  }, [i18n.language, t]);

  // Set lang attribute on <html> for accessibility
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

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

  const audioRef = useRef(null);

  const speak = async (text, id, emotion = 'default') => {
    if (speakingId === id) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setSpeakingId(null);
      return;
    }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setSpeakingId(null);
    await new Promise(r => setTimeout(r, 100));
    try {
      const res = await fetch(`${API}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: i18n.language, emotion }),
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      if (blob.size < 500) throw new Error('Audio too small');
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      setSpeakingId(id);
      audio.onended = () => {
        setSpeakingId(null);
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
      };
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        setSpeakingId(null);
        URL.revokeObjectURL(url);
        if (audioRef.current === audio) audioRef.current = null;
      };
      await audio.play();
    } catch (err) {
      console.error('TTS error:', err);
      setSpeakingId(null);
      if (audioRef.current) { audioRef.current = null; }
    }
  };

  const MAX_MESSAGES = 100;
  const sendMessage = async (overrideMsg) => {
    const msg = overrideMsg || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => {
      const updated = [...prev, { role: 'user', content: msg }];
      return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
    });
    setLoading(true);
    setActiveTab('chat');
    try {
      const res = await fetch(`${API}/api/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg, lang: i18n.language }) });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setMessages(prev => {
        const updated = [...prev, { role: 'assistant', content: data.message, verse: data.verse, emotions: data.emotions }];
        return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
      });
      if (autoRead && data.verse?.translation) setTimeout(() => speak(`${data.verse.translation}. ${data.message}`, 'auto-' + Date.now()), 500);
    } catch { toast.error(t('chat.connectionError')); setMessages(prev => {
      const updated = [...prev, { role: 'assistant', content: t('chat.genericError'), verse: null }];
      return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated;
    }); }
    finally { setLoading(false); }
  };

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Offline detection
  useEffect(() => {
    const handleOnline = () => { setIsOffline(false); toast.success('Back online!'); };
    const handleOffline = () => { setIsOffline(true); toast.error('You are offline. Some features may not work.'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const mainTabs = [
    { key: 'chat', label: t('nav.chat', 'Chat'), icon: '💬' },
    { key: 'daily', label: t('nav.daily', 'Daily'), icon: '📖' },
    { key: 'scenario', label: t('nav.guidance', 'Guide'), icon: '🌟' },
    { key: 'community', label: t('nav.community', 'Community'), icon: '👥' },
    { key: 'more', label: t('nav.more', 'More'), icon: '☰' },
  ];

  const moreItems = [
    { key: 'ask-krishna', label: t('nav.askKrishna', 'Ask Krishna'), icon: '🙏' },
    { key: 'journey', label: t('nav.journey', 'Journey'), icon: '🔥' },
    { key: 'goals', label: t('nav.goals', 'Goals'), icon: '🎯' },
    { key: 'search', label: t('nav.search', 'Search'), icon: '🔍' },
    { key: 'quiz', label: t('nav.quiz', 'Quiz'), icon: '🧠' },
    { key: 'mood', label: t('nav.moodCheckin', 'Mood'), icon: '😊' },
    { key: 'journal', label: t('nav.journal', 'Journal'), icon: '📝' },
    { key: 'learning', label: t('nav.learning', 'Learn'), icon: '📚' },
    { key: 'meditation', label: t('nav.meditation', 'Meditate'), icon: '🧘' },
    { key: 'verse-cards', label: t('nav.verseCards', 'Cards'), icon: '🎴' },
    { key: 'characters', label: t('nav.characters', 'Characters'), icon: '🎭' },
    { key: 'calm', label: t('nav.calmMode', 'Calm'), icon: '🫂' },
    { key: 'stories', label: t('nav.stories', 'Stories'), icon: '📖' },
    { key: 'debate', label: t('nav.debateMode', 'Debate'), icon: '⚖️' },
    { key: 'bookmarks', label: t('nav.bookmarks', 'Bookmarks'), icon: '🔖' },
    { key: 'gamification', label: t('nav.achievements', 'Rewards'), icon: '🏆' },
  ];

  return (
    <ErrorBoundary>
    <div className="min-h-screen flex flex-col bg-gray-950 relative overflow-hidden">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"/>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-saffron-500/3 rounded-full blur-3xl"/>
      </div>

      {/* Offline Banner */}
      {isOffline && (
        <div className="relative z-10 bg-red-500/10 border-b border-red-500/20 px-4 py-2 text-center">
          <p className="text-red-400 text-xs font-medium">📡 You are offline. Some features may not work.</p>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-gray-950/80 backdrop-blur-2xl">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-lg shadow-lg shadow-amber-500/20 animate-float">🕉</div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight">Gita Gyan</h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">AI Spiritual Mentor</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageSelector />
            {activeTab === 'chat' && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation - Bottom Bar Style */}
        <div className="max-w-2xl mx-auto px-5 pb-2 flex gap-1">
          {mainTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { if (tab.key === 'more') setShowMoreMenu(!showMoreMenu); else { setActiveTab(tab.key); setShowMoreMenu(false); } }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.key && tab.key !== 'more'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : showMoreMenu && tab.key === 'more'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* More Menu Dropdown */}
        {showMoreMenu && (
          <div className="absolute top-full left-0 right-0 z-40 bg-gray-900/98 backdrop-blur-2xl border-t border-white/5 shadow-2xl shadow-black/50 animate-slide-down">
            <div className="max-w-2xl mx-auto px-4 py-4">
              <div className="grid grid-cols-4 gap-2">
                {moreItems.map(item => (
                  <button key={item.key} onClick={() => { setActiveTab(item.key); setShowMoreMenu(false); }}
                    className="flex flex-col items-center gap-1 p-3 rounded-2xl hover:bg-white/5 transition-all">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-[10px] text-gray-400 text-center leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Content */}
      {activeTab === 'chat' && (
        <>
          <main id="main-content" className="flex-1 overflow-y-auto relative z-10 px-4 py-6 scrollbar-thin">
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
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shrink-0 disabled:opacity-20 disabled:cursor-not-allowed bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-105 active:scale-95">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
              <p className="text-center text-[9px] text-gray-700 mt-2 tracking-widest uppercase">{t('chat.poweredBy')}</p>
            </div>
          </footer>
        </>
      )}

      {activeTab === 'daily' && <DailyVersePage onSpeak={speak} speakingId={speakingId} />}
      {activeTab === 'journey' && <JourneyPage />}
      {activeTab === 'goals' && <GoalsPage />}
      {activeTab === 'search' && <SearchPage onSendMessage={sendMessage} />}
      {activeTab === 'scenario' && <ScenarioPage onSendMessage={sendMessage} />}
      {activeTab === 'community' && <CommunityPage />}
      {activeTab === 'gamification' && <GamificationPage />}
      {activeTab === 'ask-krishna' && <AskKrishnaPage />}
      {activeTab === 'quiz' && <QuizPage />}
      {activeTab === 'mood' && <MoodCheckinPage />}
      {activeTab === 'journal' && <JournalPage />}
      {activeTab === 'learning' && <LearningPathPage />}
      {activeTab === 'meditation' && <MeditationPage />}
      {activeTab === 'verse-cards' && <VerseCardPage />}
      {activeTab === 'characters' && <CharacterPage />}
      {activeTab === 'calm' && <CalmModePage />}
      {activeTab === 'stories' && <StoryModePage />}
      {activeTab === 'debate' && <DebateModePage />}
      {activeTab === 'bookmarks' && <BookmarksPage />}

      {showChapterBrowser && <ChapterBrowser onSelectVerse={msg => { setInput(msg); setTimeout(() => sendMessage(msg), 100); }} onClose={() => setShowChapterBrowser(false)} />}
    </div>
    </ErrorBoundary>
  );
}
