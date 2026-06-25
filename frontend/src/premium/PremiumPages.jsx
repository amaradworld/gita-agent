import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
const API = '';

/* ═══════════════════════════════════════════════════════════
   LEARNING PATH PAGE
   ═══════════════════════════════════════════════════════════ */
export function LearningPathPage() {
  const { t } = useTranslation();
  const [paths, setPaths] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/api/mentor/learning-paths`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => { setPaths(d.paths || []); setLoading(false); }).catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => ac.abort();
  }, []);

  if (loading) return <div className="text-center py-12"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto"/></div>;

  if (selected) return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => setSelected(null)} className="text-amber-400 text-xs mb-4 hover:text-amber-300">← Back to paths</button>
      <h2 className="text-2xl font-bold text-white mb-1">{selected.title}</h2>
      <p className="text-gray-500 text-sm mb-6">{selected.description}</p>
      <div className="space-y-4">
        {selected.weeks.map((week, i) => (
          <div key={i} className="bg-white/[0.02] rounded-2xl border border-white/5 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold text-sm">{week.week}</div>
              <h3 className="text-white font-semibold">{week.topic}</h3>
            </div>
            <div className="ml-11">
              <p className="text-gray-400 text-xs mb-1">📖 Verses: {week.verses.join(', ')}</p>
              <p className="text-green-400 text-xs">✨ Exercise: {week.exercise}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('learning.title', 'Learning Paths')}</h2>
        <p className="text-gray-500 text-sm">{t('learning.subtitle', 'Structured courses to master Gita wisdom')}</p>
      </div>
      <div className="space-y-3">
        {paths.map((path, i) => (
          <button key={i} onClick={() => setSelected(path)}
            className="w-full text-left bg-white/[0.02] rounded-2xl border border-white/5 p-5 hover:border-amber-500/20 transition-all">
            <h3 className="text-white font-bold text-lg mb-1">{path.title}</h3>
            <p className="text-gray-400 text-sm mb-2">{path.description}</p>
            <p className="text-amber-400 text-xs">{path.weeks.length} weeks · {path.weeks.reduce((s, w) => s + w.verses.length, 0)} verses</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MEDITATION PAGE
   ═══════════════════════════════════════════════════════════ */
export function MeditationPage() {
  const { t } = useTranslation();
  const [meditations, setMeditations] = useState([]);
  const [active, setActive] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const currentStepRef = useRef(0);
  const [currentStepDisplay, setCurrentStepDisplay] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/api/mentor/meditations`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => setMeditations(d.meditations || [])).catch(() => {});
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (playing && active) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          const steps = active.steps || [];
          for (let i = steps.length - 1; i >= 0; i--) {
            if (next >= steps[i].time && currentStepRef.current < i) {
              currentStepRef.current = i;
              setCurrentStepDisplay(i);
              break;
            }
          }
          if (next >= (active.duration || 5) * 60) {
            setPlaying(false);
            return 0;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, active]);

  const startMeditation = async (key) => {
    try {
      const res = await fetch(`${API}/api/mentor/meditations/${key}`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setActive(data);
      setElapsed(0);
      currentStepRef.current = 0;
      setCurrentStepDisplay(0);
      setPlaying(true);
    } catch { toast.error('Failed to load meditation'); }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (active) return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in text-center">
      <button onClick={() => { setPlaying(false); setActive(null); currentStepRef.current = 0; setCurrentStepDisplay(0); }} className="text-amber-400 text-xs mb-8 hover:text-amber-300">← Back</button>

      {/* Breathing Circle */}
      <div className="relative w-48 h-48 mx-auto mb-8">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 transition-all duration-[4000ms] ${
          playing ? 'scale-125 opacity-50' : 'scale-100 opacity-80'
        }`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div>
            <p className="text-3xl font-bold text-white">{formatTime(elapsed)}</p>
            <p className="text-gray-500 text-xs">of {active.duration}:00</p>
          </div>
        </div>
      </div>

      {/* Current Step */}
      {active.steps?.[currentStepDisplay] && (
        <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6 mb-6">
          <p className="text-white text-lg leading-relaxed">{active.steps[currentStepDisplay].text}</p>
          {active.steps[currentStepDisplay].verse && (
            <p className="text-amber-400 text-xs mt-2">📖 Verse {active.steps[currentStepDisplay].verse}</p>
          )}
        </div>
      )}

      {/* Controls */}
      <button onClick={() => setPlaying(!playing)}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-amber-500/20 hover:scale-105 transition-all mx-auto">
        {playing ? '⏸' : '▶️'}
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('meditation.title', 'Guided Meditation')}</h2>
        <p className="text-gray-500 text-sm">{t('meditation.subtitle', 'Find peace with Gita-guided sessions')}</p>
      </div>
      <div className="space-y-3">
        {meditations.map((med, i) => (
          <button key={i} onClick={() => startMeditation(med.key)}
            className="w-full text-left bg-white/[0.02] rounded-2xl border border-white/5 p-5 hover:border-amber-500/20 transition-all flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-xl">🧘</div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">{med.title}</h3>
              <p className="text-gray-500 text-xs">{med.duration} min · {med.stepCount} steps</p>
            </div>
            <span className="text-amber-400 text-sm">Start →</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VERSE CARD GENERATOR
   ═══════════════════════════════════════════════════════════ */
export function VerseCardPage() {
  const { t } = useTranslation();
  const [verseNum, setVerseNum] = useState('2.47');
  const [verseData, setVerseData] = useState(null);
  const [bg, setBg] = useState(0);
  const backgrounds = [
    'from-amber-600 via-orange-500 to-red-500',
    'from-indigo-600 via-purple-500 to-pink-500',
    'from-teal-500 via-cyan-500 to-blue-500',
    'from-gray-800 via-gray-900 to-black',
    'from-rose-600 via-pink-500 to-fuchsia-500',
  ];

  const fetchVerse = async () => {
    const [ch, v] = verseNum.split('.');
    try {
      const res = await fetch(`${API}/api/verses/${ch}/${v}`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setVerseData(data);
    } catch { toast.error('Verse not found'); }
  };

  const share = async () => {
    const text = `📖 ${verseData.sanskrit}\n\n"${verseData.translation}"\n\n— Bhagavad Gita ${verseData.chapter}.${verseData.verse}\n\n#BhagavadGita #GitaGyan`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch {}
    } else {
      navigator.clipboard?.writeText(text);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('verseCards.title', 'Verse Cards')}</h2>
        <p className="text-gray-500 text-sm">{t('verseCards.subtitle', 'Create beautiful shareable cards')}</p>
      </div>

      <div className="flex gap-2 mb-6">
        <input value={verseNum} onChange={e => setVerseNum(e.target.value)}
          placeholder="Chapter.Verse (e.g. 2.47)"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
        <button onClick={fetchVerse} className="px-5 py-3 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-all">Load</button>
      </div>

      {/* Color picker */}
      <div className="flex gap-2 mb-6 justify-center">
        {backgrounds.map((b, i) => (
          <button key={i} onClick={() => setBg(i)}
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${b} ${bg === i ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-950' : ''}`} />
        ))}
      </div>

      {verseData && (
        <div className={`bg-gradient-to-br ${backgrounds[bg]} rounded-3xl p-8 text-white text-center shadow-2xl mb-6`}>
          <p className="text-6xl mb-4">🕉</p>
          <p className="text-white/80 text-sm mb-1">Chapter {verseData.chapter}, Verse {verseData.verse}</p>
          <p className="text-white/60 text-xs italic font-serif mb-4">{verseData.sanskrit}</p>
          <p className="text-white text-lg font-medium leading-relaxed mb-4">"{verseData.translation}"</p>
          <p className="text-white/40 text-[10px] tracking-widest uppercase">Bhagavad Gita · Gita Gyan</p>
        </div>
      )}

      {verseData && (
        <button onClick={share}
          className="w-full py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-medium">
          {t('verseCards.share', 'Share Card')} 📤
        </button>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CHARACTER ASSESSMENT
   ═══════════════════════════════════════════════════════════ */
export function CharacterPage() {
  const { t } = useTranslation();
  const userId = 'guest-' + (localStorage.getItem('gita-user-id') || 'default');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const questions = [
    { q: 'When facing a tough decision, you...', options: ['Seek guidance from a mentor', 'Trust your own wisdom', 'Do your duty regardless', 'Stand up against injustice'] },
    { q: 'Your greatest strength is...', options: ['Courage in battle', 'Wisdom and patience', 'Sense of duty', 'Generosity to others'] },
    { q: 'When others are suffering, you...', options: ['Feel deeply affected', 'Offer wise counsel', 'Do what must be done', 'Give generously'] },
    { q: 'Your biggest challenge is...', options: ['Confusion about right action', 'Attachment to outcomes', 'Balancing duty and desire', 'Being misunderstood'] },
    { q: 'In a group, you are usually...', options: ['The one asking questions', 'The one giving answers', 'The one taking responsibility', 'The one helping quietly'] },
  ];

  const answer = (idx) => {
    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Submit
      fetch(`${API}/api/mentor/characters/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, answers: newAnswers }),
      }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => setResult(d)).catch(() => toast.error('Assessment failed'));
    }
  };

  if (result) return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in text-center">
      <div className="text-6xl mb-4">🕉</div>
      <h2 className="text-3xl font-bold text-white mb-2">You are {result.character?.name}!</h2>
      <p className="text-amber-400 text-lg mb-4">{result.character?.title}</p>
      <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto">{result.character?.description}</p>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {result.character?.traits?.map(t => (
          <span key={t} className="bg-amber-500/10 text-amber-400 text-xs px-3 py-1 rounded-full border border-amber-500/20">{t}</span>
        ))}
      </div>
      <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-5 max-w-md mx-auto">
        <p className="text-amber-400 text-xs font-bold mb-1">💡 Advice</p>
        <p className="text-gray-300 text-sm">{result.character?.advice}</p>
      </div>
      <button onClick={() => { setStep(0); setAnswers([]); setResult(null); }}
        className="mt-8 px-6 py-2 rounded-xl bg-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/30 transition-all">
        Take Again 🔄
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('characters.title', 'Which Gita Character Are You?')}</h2>
        <p className="text-gray-500 text-sm">{t('characters.subtitle', 'Discover your spiritual archetype')}</p>
      </div>

      <div className="w-full bg-white/5 rounded-full h-2 mb-6">
        <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
      </div>
      <p className="text-gray-500 text-xs text-center mb-4">Question {step + 1} of {questions.length}</p>

      <h3 className="text-white text-lg font-medium mb-6 text-center">{questions[step].q}</h3>
      <div className="space-y-3">
        {questions[step].options.map((opt, i) => (
          <button key={i} onClick={() => answer(i)}
            className="w-full text-left bg-white/[0.02] rounded-2xl border border-white/5 p-4 text-gray-300 hover:bg-white/5 hover:border-amber-500/20 transition-all">
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EMERGENCY CALM MODE
   ═══════════════════════════════════════════════════════════ */
export function CalmModePage() {
  const { t } = useTranslation();
  const [calm, setCalm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [breathPhase, setBreathPhase] = useState('');
  const [breathActive, setBreathActive] = useState(false);
  const breathTimer = useRef(null);

  const activate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/mentor/emergency-calm`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setCalm(data);
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const startBreathing = () => {
    setBreathActive(true);
    let phase = 0;
    const phases = [
      { label: 'Breathe IN...', duration: 4000, scale: 1.5 },
      { label: 'HOLD...', duration: 7000, scale: 1.5 },
      { label: 'Breathe OUT...', duration: 8000, scale: 1 },
    ];
    const cycle = () => {
      const p = phases[phase % 3];
      setBreathPhase(p.label);
      breathTimer.current = setTimeout(() => { phase++; cycle(); }, p.duration);
    };
    cycle();
  };

  const stopBreathing = () => {
    setBreathActive(false);
    setBreathPhase('');
    clearTimeout(breathTimer.current);
  };

  useEffect(() => () => clearTimeout(breathTimer.current), []);

  if (!calm) return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in text-center">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-3xl mx-auto mb-4">🫂</div>
      <h2 className="text-2xl font-bold text-white mb-2">{t('calm.title', 'Emergency Calm')}</h2>
      <p className="text-gray-500 text-sm mb-8">{t('calm.subtitle', 'One tap to find peace')}</p>
      <button onClick={activate} disabled={loading}
        className="px-8 py-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20">
        {loading ? '...' : '🫂 I\'m Feeling Stressed'}
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in text-center">
      <button onClick={() => { setCalm(null); stopBreathing(); }} className="text-amber-400 text-xs mb-6">← Back</button>

      {/* Breathing Animation */}
      <div className="relative w-48 h-48 mx-auto mb-8">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/20 border border-blue-500/30 transition-all duration-[4000ms] ${breathActive ? 'scale-150 opacity-30' : 'scale-100 opacity-80'}`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-sm font-medium">{breathPhase || '🕊'}</p>
        </div>
      </div>

      {!breathActive && (
        <button onClick={startBreathing}
          className="px-6 py-3 rounded-2xl bg-blue-500/20 text-blue-400 font-medium hover:bg-blue-500/30 transition-all mb-6">
          Start Breathing Exercise 🫁
        </button>
      )}

      {/* Verse */}
      {calm.verse && (
        <div className="bg-amber-500/5 rounded-2xl p-5 border border-amber-500/10 mb-4 text-left">
          <p className="text-amber-400 text-xs font-bold mb-1">📖 Verse {calm.verse.chapter}.{calm.verse.verse}</p>
          <p className="text-white font-medium text-sm">"{calm.verse.translation}"</p>
        </div>
      )}

      {/* Message */}
      <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5 mb-4 text-left">
        <p className="text-gray-300 text-sm leading-relaxed">{calm.message}</p>
      </div>

      {/* Grounding */}
      {calm.grounding && (
        <div className="bg-green-500/5 rounded-2xl p-5 border border-green-500/10 text-left">
          <p className="text-green-400 text-xs font-bold mb-2">{calm.grounding.title}</p>
          {calm.grounding.steps.map((step, i) => (
            <p key={i} className="text-gray-300 text-xs mb-1">{i + 1}. {step}</p>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STORY MODE
   ═══════════════════════════════════════════════════════════ */
export function StoryModePage() {
  const { t } = useTranslation();
  const [stories, setStories] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/api/mentor/stories`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => { setStories(d.stories || []); setLoading(false); }).catch(e => { if (e.name !== 'AbortError') setLoading(false); });
    return () => ac.abort();
  }, []);

  const loadStory = async (key) => {
    try {
      const res = await fetch(`${API}/api/mentor/stories/${key}`);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setActive(data);
    } catch { toast.error('Failed to load story'); }
  };

  if (loading) return <div className="text-center py-12"><div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto"/></div>;

  if (active) return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => setActive(null)} className="text-amber-400 text-xs mb-4 hover:text-amber-300">← Back to stories</button>
      <h2 className="text-2xl font-bold text-white mb-2">{active.title}</h2>
      <p className="text-amber-400 text-xs mb-6">📖 Verse {active.verse}</p>
      <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6">
        {active.story.split('\n\n').map((para, i) => (
          <p key={i} className="text-gray-300 text-sm leading-relaxed mb-4 last:mb-0">{para}</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('stories.title', 'Gita Stories')}</h2>
        <p className="text-gray-500 text-sm">{t('stories.subtitle', 'Learn wisdom through stories')}</p>
      </div>
      <div className="space-y-3">
        {stories.map((s, i) => (
          <button key={i} onClick={() => loadStory(s.key)}
            className="w-full text-left bg-white/[0.02] rounded-2xl border border-white/5 p-5 hover:border-amber-500/20 transition-all">
            <h3 className="text-white font-semibold mb-1">{s.title}</h3>
            <p className="text-amber-400 text-xs">📖 Verse {s.verse}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DEBATE MODE
   ═══════════════════════════════════════════════════════════ */
export function DebateModePage() {
  const { t } = useTranslation();
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const deb = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/mentor/debate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setResult(data);
    } catch { toast.error('Failed'); }
    setLoading(false);
  };

  const suggestions = ['Is attachment always bad?', 'Is karma yoga better than meditation?', 'Can anger be positive?', 'Is fate real or do we have free will?'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('debate.title', 'AI Debate Mode')}</h2>
        <p className="text-gray-500 text-sm">{t('debate.subtitle', 'Explore multiple perspectives')}</p>
      </div>

      <div className="flex gap-2 mb-4">
        <input value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && deb()}
          placeholder={t('debate.placeholder', 'Enter a debate topic...')}
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all" />
        <button onClick={deb} disabled={!topic.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-amber-500/20 text-amber-400 text-sm font-medium disabled:opacity-30 transition-all">
          {loading ? '...' : '⚖️'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => { setTopic(s); }}
            className="bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5 text-xs text-gray-500 hover:text-amber-300 hover:border-amber-500/20 transition-all">
            {s}
          </button>
        ))}
      </div>

      {result && (
        <div className="space-y-4 animate-slide-up">
          <h3 className="text-white font-bold text-lg text-center">{result.title}</h3>
          {result.perspectives?.map((p, i) => (
            <div key={i} className="bg-white/[0.02] rounded-2xl border border-white/5 p-5">
              <p className="text-amber-400 text-xs font-bold mb-1">{p.source}</p>
              <p className="text-gray-300 text-sm">{p.view}</p>
            </div>
          ))}
          {result.conclusion && (
            <div className="bg-amber-500/5 rounded-2xl border border-amber-500/10 p-5">
              <p className="text-amber-400 text-xs font-bold mb-1">⚖️ Conclusion</p>
              <p className="text-white text-sm">{result.conclusion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOOKMARKS & NOTES
   ═══════════════════════════════════════════════════════════ */
export function BookmarksPage() {
  const { t } = useTranslation();
  const userId = 'guest-' + (localStorage.getItem('gita-user-id') || 'default');
  const [bookmarks, setBookmarks] = useState([]);
  const [verseKey, setVerseKey] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const ac = new AbortController();
    fetch(`${API}/api/mentor/bookmarks/${userId}`, { signal: ac.signal }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(d => setBookmarks(d.bookmarks || [])).catch(() => {});
    return () => ac.abort();
  }, []);

  const add = async () => {
    if (!verseKey.trim()) return;
    try {
      const res = await fetch(`${API}/api/mentor/bookmarks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verseKey: verseKey.trim(), note }),
      });
      if (!res.ok) throw new Error(res.status);
      const bm = await res.json();
      setBookmarks(prev => [bm, ...prev]);
      setVerseKey(''); setNote('');
      toast.success('Bookmark added!');
    } catch { toast.error('Failed'); }
  };

  const remove = async (vk) => {
    try {
      const res = await fetch(`${API}/api/mentor/bookmarks`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, verseKey: vk }),
      });
      if (!res.ok) throw new Error(res.status);
      setBookmarks(prev => prev.filter(b => b.verseKey !== vk));
    } catch { /* silent */ }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{t('bookmarks.title', 'Bookmarks & Notes')}</h2>
        <p className="text-gray-500 text-sm">{t('bookmarks.subtitle', 'Save your favorite verses')}</p>
      </div>

      <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-4 mb-6">
        <input value={verseKey} onChange={e => setVerseKey(e.target.value)} placeholder="Verse (e.g. 2.47)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 mb-2 transition-all" />
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 mb-2 transition-all" />
        <button onClick={add} className="w-full py-2.5 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-all">+ Add Bookmark</button>
      </div>

      <div className="space-y-2">
        {bookmarks.map((bm, i) => (
          <div key={i} className="bg-white/[0.02] rounded-xl border border-white/5 p-4 flex items-center gap-3">
            <span className="text-amber-400 text-lg">🔖</span>
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Verse {bm.verseKey}</p>
              {bm.note && <p className="text-gray-500 text-xs">{bm.note}</p>}
            </div>
            <button onClick={() => remove(bm.verseKey)} className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
          </div>
        ))}
        {bookmarks.length === 0 && <p className="text-center text-gray-500 text-sm py-8">No bookmarks yet</p>}
      </div>
    </div>
  );
}
