// ============================================================
// GITA GYAN — PREMIUM FEATURES
// Ask Krishna, Journal, Quiz, Meditation, Cards, Calm Mode, etc.
// ============================================================

import { gitaVerses, findVerseByChapterVerse, detectEmotions, findBestVerse } from './gita.js';
import { VERSE_SCENARIOS, MOOD_VERSES, DAILY_VERSES } from './verseData.js';
import { searchGitaBook } from './gita.js';
import { recordTodayActivity } from './gamification.js';

// ─── ASKRISHNA: STRUCTURED RESPONSE ──────────────────────
export function generateKrishnaResponse(message, lang = 'en') {
  const emotions = detectEmotions(message);
  const verse = findBestVerse(emotions);
  const key = `${verse.chapter}.${verse.verse}`;
  const scenario = VERSE_SCENARIOS[key] || {};

  const responseTemplates = {
    en: {
      verse: `🎯 **Relevant Verse: Chapter ${verse.chapter}, Verse ${verse.verse}**`,
      meaning: `📖 **Meaning:** ${verse.translation}`,
      advice: `💡 **Practical Advice:** ${scenario.practicalAdvice || verse.advice || 'Apply this wisdom to your daily life.'}`,
      action: `📝 **Action for Today:** ${scenario.modernApplication || 'Take 5 minutes to reflect on this verse and how it applies to your situation.'}`,
    },
    hi: {
      verse: `🎯 **प्रासंगिक श्लोक: अध्याय ${verse.chapter}, श्लोक ${verse.verse}**`,
      meaning: `📖 **अर्थ:** ${verse.translation}`,
      advice: `💡 **व्यावहारिक सलाह:** ${scenario.practicalAdvice || verse.advice || 'इस ज्ञान को अपने दैनिक जीवन में लागू करें।'}`,
      action: `📝 **आज के लिए कार्य:** ${scenario.modernApplication || 'इस श्लोक पर 5 मिनट ध्यान करें।'}`,
    },
  };

  const t = responseTemplates[lang] || responseTemplates.en;

  // Build enhanced message
  let enhancedMessage = `${t.verse}\n\n${t.meaning}\n\n${t.advice}\n\n${t.action}`;

  // Add RAG context from ISKCON book
  const ragResults = searchGitaBook(message, 1);
  if (ragResults && ragResults.length > 0) {
    enhancedMessage += `\n\n📚 **From Bhagavad Gita As It Is:**\n"${ragResults[0].text.substring(0, 300)}..."`;
  }

  return {
    message: enhancedMessage,
    verse: { chapter: verse.chapter, verse: verse.verse, sanskrit: verse.sanskrit, translation: verse.translation },
    emotions,
    structured: true,
  };
}

// ─── JOURNAL ENTRIES ──────────────────────────────────────
const journalEntries = new Map(); // userId -> [entries]

export function addJournalEntry(userId, entry) {
  if (!journalEntries.has(userId)) journalEntries.set(userId, []);
  const entries = journalEntries.get(userId);
  const newEntry = {
    id: `journal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    ...entry,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    gitaConnection: null,
  };

  // Connect with Gita teachings
  const combinedText = `${entry.happy || ''} ${entry.stressed || ''} ${entry.learned || ''}`;
  const emotions = detectEmotions(combinedText);
  const verse = findBestVerse(emotions);
  if (verse) {
    newEntry.gitaConnection = {
      chapter: verse.chapter,
      verse: verse.verse,
      translation: verse.translation,
      advice: verse.advice,
    };
  }

  entries.unshift(newEntry);
  if (entries.length > 365) entries.length = 365; // Keep 1 year
  return newEntry;
}

export function getJournalEntries(userId, limit = 30) {
  return (journalEntries.get(userId) || []).slice(0, limit);
}

// ─── MOOD CHECK-IN ────────────────────────────────────────
const moodHistory = new Map(); // userId -> [moods]

export function recordMood(userId, mood, note = '') {
  if (!moodHistory.has(userId)) moodHistory.set(userId, []);
  const entries = moodHistory.get(userId);
  const entry = {
    mood,
    note,
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
  };
  entries.unshift(entry);
  if (entries.length > 365) entries.length = 365;
  return entry;
}

export function getMoodHistory(userId, limit = 30) {
  return (moodHistory.get(userId) || []).slice(0, limit);
}

export function getMoodRecommendations(mood) {
  const moodMap = {
    happy: {
      verses: ['12.13', '18.45', '5.18'],
      meditation: 'Gratitude meditation — focus on what brought you joy',
      breathing: 'Deep breathing with smile — 5 rounds of 4-7-8',
      activity: 'Share your happiness with someone you love',
    },
    sad: {
      verses: ['2.14', '2.20', '2.48'],
      meditation: 'Loving-kindness meditation — send compassion to yourself',
      breathing: 'Box breathing — 4 count inhale, 4 hold, 4 exhale, 4 hold',
      activity: 'Take a walk in nature. This too shall pass.',
    },
    angry: {
      verses: ['2.62', '2.63', '2.48'],
      meditation: 'Cooling meditation — imagine blue light calming your mind',
      breathing: 'Extended exhale — 4 count inhale, 8 count exhale',
      activity: 'Write down what triggered you. Burn or tear the paper.',
    },
    anxious: {
      verses: ['2.47', '6.35', '18.78'],
      meditation: 'Body scan meditation — release tension from each body part',
      breathing: '4-7-8 breathing — inhale 4, hold 7, exhale 8',
      activity: 'Name 5 things you can see, 4 you can touch, 3 you hear.',
    },
    confused: {
      verses: ['6.5', '18.78', '2.47'],
      meditation: 'Clarity meditation — sit with the question without seeking answer',
      breathing: 'Alternate nostril breathing — balances left/right brain',
      activity: 'Write the question. Read verses 2.47 and 18.78.',
    },
    stressed: {
      verses: ['2.47', '6.35', '2.14'],
      meditation: 'Progressive muscle relaxation — tense and release each muscle',
      breathing: 'Physiological sigh — double inhale through nose, long exhale',
      activity: 'Do one small thing you can control right now.',
    },
    lonely: {
      verses: ['2.20', '18.78', '12.13'],
      meditation: 'Connection meditation — feel your connection to all beings',
      breathing: 'Heart-centered breathing — breathe into your heart space',
      activity: 'Reach out to one person. Even a simple hello helps.',
    },
    grateful: {
      verses: ['12.13', '5.18', '18.45'],
      meditation: 'Gratitude meditation — list 3 things you\'re grateful for',
      breathing: 'Joyful breathing — breathe in gratitude, breathe out love',
      activity: 'Write a thank you message to someone.',
    },
  };

  return moodMap[mood.toLowerCase()] || moodMap.neutral || {
    verses: ['2.47', '2.48'],
    meditation: 'Mindfulness meditation — observe your thoughts without judgment',
    breathing: 'Natural breathing — simply observe your breath',
    activity: 'Read Chapter 2, Verse 47 slowly three times.',
  };
}

// ─── QUIZ ─────────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  { q: 'Who spoke the Bhagavad Gita?', options: ['Arjuna', 'Krishna', 'Bhishma', 'Vidura'], answer: 1, chapter: 1 },
  { q: 'Which chapter is called "Sankhya Yoga"?', options: ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4'], answer: 1, chapter: 2 },
  { q: '"Karmanye vadhikaraste" comes from which verse?', options: ['2.47', '3.19', '4.7', '18.66'], answer: 0, chapter: 2 },
  { q: 'What does "Yoga" mean in the Gita?', options: ['Exercise', 'Union with divine', 'Meditation only', 'Food'], answer: 1, chapter: 2 },
  { q: 'Which Yoga does Chapter 12 focus on?', options: ['Karma Yoga', 'Jnana Yoga', 'Bhakti Yoga', 'Raja Yoga'], answer: 2, chapter: 12 },
  { q: 'Complete the shloka: "Yadā yadā hi dharmasya..."', options: ['...glānirbhavati bharata', '...tyajanti mamadevam', '...uddharet ātmanātmānam', '...karmaṇo hyapi boddhavyam'], answer: 0, chapter: 4 },
  { q: 'Who is called "Parthasarathi"?', options: ['Arjuna', 'Krishna', 'Bhima', 'Drona'], answer: 1, chapter: 1 },
  { q: 'Which verse talks about "Sthitaprajna" (steady wisdom)?', options: ['2.54', '2.47', '3.19', '18.78'], answer: 0, chapter: 2 },
  { q: 'The Gita has how many chapters?', options: ['16', '17', '18', '20'], answer: 2, chapter: 1 },
  { q: 'What is the main theme of Chapter 3?', options: ['Knowledge', 'Action', 'Devotion', 'Meditation'], answer: 1, chapter: 3 },
  { q: '"Nainam chindanti shastrāṇi" — what cannot be cut?', options: ['Body', 'Mind', 'Soul/Atman', 'Ego'], answer: 2, chapter: 2 },
  { q: 'Who is the father of Arjuna?', options: ['Dhritarashtra', 'Pandu', 'Kunti', 'Indra'], answer: 1, chapter: 1 },
  { q: 'What does Krishna say about desire (kama)?', options: ['It is good', 'It is the root of anger', 'It leads to moksha', 'It is unnecessary'], answer: 1, chapter: 2 },
  { q: 'Which character represents duty-boundness?', options: ['Arjuna', 'Krishna', 'Bhishma', 'Karna'], answer: 2, chapter: 1 },
  { q: 'Complete: "Tasmād asaktaḥ satataṃ..."', options: ['...kāryaṃ karma samācara', '...māṃ smara yudhamūrccha', '...kuru dharmam adharmaja', '...yudhyasva vigatajvara'], answer: 0, chapter: 3 },
  { q: 'What is "Prakriti" in Gita philosophy?', options: ['God', 'Nature/Matter', 'Soul', 'Time'], answer: 1, chapter: 13 },
  { q: 'Which verse is known as the "essence of Gita"?', options: ['2.47', '9.22', '18.66', '12.13'], answer: 2, chapter: 18 },
  { q: 'What does Chapter 6 mainly teach?', options: ['Knowledge', 'Action', 'Meditation', 'Devotion'], answer: 2, chapter: 6 },
  { q: 'Who asked Krishna to teach the Gita?', options: ['Bhishma', 'Arjuna', 'Duryodhana', 'Sanjaya'], answer: 1, chapter: 1 },
  { q: 'What is "Guna" in the Gita?', options: ['Weapon', 'Quality/Attribute', 'Place', 'Person'], answer: 1, chapter: 14 },
];

let currentQuiz = new Map(); // userId -> quiz state

export function startQuiz(userId) {
  // Pick 10 random questions
  const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
  const questions = shuffled.slice(0, 10);
  currentQuiz.set(userId, {
    questions,
    currentIndex: 0,
    score: 0,
    answers: [],
    startedAt: new Date().toISOString(),
  });
  return getNextQuestion(userId);
}

export function getNextQuestion(userId) {
  const quiz = currentQuiz.get(userId);
  if (!quiz) return null;
  if (quiz.currentIndex >= quiz.questions.length) return { completed: true, score: quiz.score, total: quiz.questions.length };
  const q = quiz.questions[quiz.currentIndex];
  return {
    question: q.q,
    options: q.options,
    questionNumber: quiz.currentIndex + 1,
    totalQuestions: quiz.questions.length,
    chapter: q.chapter,
  };
}

export function answerQuiz(userId, answerIndex) {
  const quiz = currentQuiz.get(userId);
  if (!quiz) return null;
  const q = quiz.questions[quiz.currentIndex];
  const correct = answerIndex === q.answer;
  if (correct) quiz.score++;
  quiz.answers.push({ question: q.q, correct, answer: q.options[answerIndex], correctAnswer: q.options[q.answer] });
  quiz.currentIndex++;
  return {
    correct,
    correctAnswer: q.options[q.answer],
    score: quiz.score,
    next: getNextQuestion(userId),
  };
}

// ─── LEARNING PATH ────────────────────────────────────────
export const LEARNING_PATHS = {
  stress_management: {
    title: 'Stress Management',
    description: '4-week course to find peace through Gita wisdom',
    weeks: [
      { week: 1, topic: 'Understanding Stress', verses: ['2.14', '2.47', '6.35'], exercise: 'Practice 5-minute breathing daily' },
      { week: 2, topic: 'Letting Go of Results', verses: ['2.47', '2.48', '3.19'], exercise: 'Do one task daily without expecting results' },
      { week: 3, topic: 'Mind Control', verses: ['6.5', '6.35', '2.62'], exercise: 'Meditate for 10 minutes daily' },
      { week: 4, topic: 'Finding Inner Peace', verses: ['5.18', '12.13', '18.78'], exercise: 'Practice gratitude journaling' },
    ],
  },
  karma_yoga: {
    title: 'Karma Yoga Path',
    description: 'Master the art of selfless action',
    weeks: [
      { week: 1, topic: 'What is Karma?', verses: ['3.19', '2.47', '4.20'], exercise: 'Observe your motivations for actions' },
      { week: 2, topic: 'Selfless Action', verses: ['3.19', '4.20', '5.10'], exercise: 'Do 3 selfless acts this week' },
      { week: 3, topic: 'Action without Attachment', verses: ['2.47', '2.48', '3.19'], exercise: 'Complete tasks without seeking praise' },
      { week: 4, topic: 'Living Karma Yoga', verses: ['18.45', '18.46', '18.78'], exercise: 'Dedicate all actions to the divine' },
    ],
  },
  leadership: {
    title: 'Gita for Leaders',
    description: 'Lead with wisdom and compassion',
    weeks: [
      { week: 1, topic: 'Vision & Purpose', verses: ['2.33', '18.78', '2.47'], exercise: 'Define your leadership purpose' },
      { week: 2, topic: 'Decision Making', verses: ['18.78', '2.47', '6.5'], exercise: 'Make one tough decision with Gita wisdom' },
      { week: 3, topic: 'Managing People', verses: ['5.18', '12.13', '2.62'], exercise: 'Practice seeing the divine in a difficult colleague' },
      { week: 4, topic: 'Servant Leadership', verses: ['12.13', '5.18', '18.45'], exercise: 'Serve someone without recognition' },
    ],
  },
  detachment: {
    title: 'Art of Detachment',
    description: 'Learn to let go while staying engaged',
    weeks: [
      { week: 1, topic: 'Understanding Attachment', verses: ['2.62', '2.63', '2.47'], exercise: 'Identify 3 attachments in your life' },
      { week: 2, topic: 'Non-Attachment in Action', verses: ['2.47', '2.48', '3.19'], exercise: 'Do your best, release the outcome' },
      { week: 3, topic: 'Dealing with Loss', verses: ['2.14', '2.20', '2.48'], exercise: 'Practice non-attachment to one small thing' },
      { week: 4, topic: 'Freedom Through Detachment', verses: ['5.18', '12.13', '18.78'], exercise: 'Live one day completely in the present' },
    ],
  },
};

// ─── GUIDED MEDITATION ────────────────────────────────────
export const MEDITATIONS = {
  peace: {
    title: 'Peace Meditation',
    duration: 5,
    steps: [
      { time: 0, text: 'Close your eyes and take a deep breath.', verse: '2.47' },
      { time: 30, text: 'Let go of all worries about the future.', verse: '2.47' },
      { time: 60, text: 'Focus only on this present moment.', verse: '2.48' },
      { time: 120, text: 'Breathe in peace, breathe out tension.', verse: '6.35' },
      { time: 180, text: 'You are not your thoughts. You are the witness.', verse: '2.20' },
      { time: 240, text: 'Rest in the stillness within.', verse: '5.18' },
      { time: 280, text: 'Slowly open your eyes. Carry this peace with you.', verse: '18.78' },
    ],
  },
  focus: {
    title: 'Focus Meditation',
    duration: 10,
    steps: [
      { time: 0, text: 'Sit comfortably. Close your eyes.', verse: '6.5' },
      { time: 30, text: 'Bring your attention to your breath.', verse: '6.35' },
      { time: 60, text: 'When thoughts arise, gently return to breath.', verse: '6.35' },
      { time: 120, text: 'The mind is like a river. Observe without jumping in.', verse: '6.5' },
      { time: 180, text: 'Focus on one point — the tip of your nose.', verse: '6.35' },
      { time: 240, text: 'Let distractions pass like clouds in the sky.', verse: '6.5' },
      { time: 300, text: 'Your focus deepens with each breath.', verse: '6.35' },
      { time: 420, text: 'You are the master of your mind.', verse: '6.5' },
      { time: 540, text: 'Rest in concentrated awareness.', verse: '6.35' },
      { time: 580, text: 'Slowly return. Take this focus into your day.', verse: '2.47' },
    ],
  },
  anxiety: {
    title: 'Anxiety Relief',
    duration: 5,
    steps: [
      { time: 0, text: 'Place your hand on your heart.', verse: '2.47' },
      { time: 20, text: 'Breathe slowly. In for 4, hold for 4, out for 6.', verse: '6.35' },
      { time: 60, text: 'Name your anxiety. What are you worried about?', verse: '2.47' },
      { time: 100, text: 'Ask yourself: Can I control this?', verse: '2.47' },
      { time: 140, text: 'If yes — focus on what you can do now.', verse: '2.47' },
      { time: 180, text: 'If no — practice releasing it with each exhale.', verse: '2.14' },
      { time: 220, text: 'You are safe in this moment.', verse: '18.78' },
      { time: 260, text: 'Open your eyes. You are stronger than your anxiety.', verse: '2.48' },
    ],
  },
  sleep: {
    title: 'Sleep Meditation',
    duration: 10,
    steps: [
      { time: 0, text: 'Lie down comfortably. Close your eyes.', verse: '2.20' },
      { time: 30, text: 'Let your body relax completely.', verse: '2.20' },
      { time: 60, text: 'Breathe slowly and deeply.', verse: '6.35' },
      { time: 120, text: 'Release the day. Whatever happened is done.', verse: '2.14' },
      { time: 180, text: 'You are not your actions today. You are the eternal soul.', verse: '2.20' },
      { time: 240, text: 'Let thoughts drift away like leaves on a river.', verse: '6.35' },
      { time: 300, text: 'You are safe. You are at peace.', verse: '18.78' },
      { time: 420, text: 'Sleep now. The divine watches over you.', verse: '18.78' },
      { time: 540, text: '...', verse: '2.20' },
      { time: 580, text: '...', verse: '2.20' },
    ],
  },
};

// ─── CHARACTER ASSESSMENT ──────────────────────────────────
export const CHARACTERS = {
  arjuna: {
    name: 'Arjuna',
    title: 'The Warrior',
    description: 'You are facing a dilemma. Like Arjuna, you are confused about your duty but seeking wisdom. You have the courage to ask for help.',
    traits: ['Seeker', 'Brave', 'Conflicted', 'Loyal'],
    advice: 'Trust in Krishna\'s guidance. Your confusion is the first step to clarity.',
  },
  krishna: {
    name: 'Krishna',
    title: 'The Guide',
    description: 'You are the wise one in your circle. People look to you for guidance. You see the bigger picture and help others find their path.',
    traits: ['Wise', 'Compassionate', 'Balanced', 'Patient'],
    advice: 'Continue guiding others. Your wisdom is a gift to those around you.',
  },
  bhishma: {
    name: 'Bhishma',
    title: 'The Duty-Bound',
    description: 'You prioritize duty above personal desire. Like Bhishma, you honor your commitments even when it\'s difficult.',
    traits: ['Dutiful', 'Honorable', 'Selfless', 'Steadfast'],
    advice: 'Your sense of duty is admirable. Remember to also care for your own needs.',
  },
  draupadi: {
    name: 'Draupadi',
    title: 'The Fearless',
    description: 'You stand up for what is right, even against powerful opposition. Like Draupadi, you question injustice fearlessly.',
    traits: ['Fearless', 'Righteous', 'Strong', 'Vocal'],
    advice: 'Your courage inspires others. Keep standing up for truth.',
  },
  karna: {
    name: 'Karna',
    title: 'The Generous',
    description: 'You are incredibly generous, sometimes to your own detriment. Like Karna, you give without expecting anything in return.',
    traits: ['Generous', 'Loyal', 'Misunderstood', 'Noble'],
    advice: 'Your generosity is beautiful. Learn to also receive and value yourself.',
  },
  vidura: {
    name: 'Vidura',
    title: 'The Counselor',
    description: 'You are the wise advisor in your family or workplace. Like Vidura, you offer practical wisdom rooted in dharma.',
    traits: ['Wise', 'Practical', 'Diplomatic', 'Grounded'],
    advice: 'Your counsel is valuable. Trust your wisdom and share it freely.',
  },
};

export function assessCharacter(userId, answers) {
  // Simple scoring based on answers
  const scores = { arjuna: 0, krishna: 0, bhishma: 0, draupadi: 0, karna: 0, vidura: 0 };

  // Map answers to character traits
  const traitMap = {
    0: ['arjuna', 'draupadi'], // confused/seeking
    1: ['krishna', 'vidura'], // wise/guiding
    2: ['bhishma', 'karna'], // duty-bound/generous
    3: ['draupadi', 'arjuna'], // brave/questioning
  };

  for (const answer of answers) {
    const chars = traitMap[answer] || [];
    for (const c of chars) scores[c] += 1;
  }

  const maxScore = Math.max(...Object.values(scores));
  const character = Object.entries(scores).find(([, v]) => v === maxScore)?.[0] || 'arjuna';
  return { character: CHARACTERS[character], scores };
}

// ─── BOOKMARKS & NOTES ────────────────────────────────────
const bookmarks = new Map(); // userId -> [{ verseKey, note, createdAt }]

export function addBookmark(userId, verseKey, note = '') {
  if (!bookmarks.has(userId)) bookmarks.set(userId, []);
  const bms = bookmarks.get(userId);
  const existing = bms.find(b => b.verseKey === verseKey);
  if (existing) {
    existing.note = note || existing.note;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }
  const bookmark = { verseKey, note, createdAt: new Date().toISOString() };
  bms.unshift(bookmark);
  return bookmark;
}

export function removeBookmark(userId, verseKey) {
  if (!bookmarks.has(userId)) return false;
  const bms = bookmarks.get(userId);
  const idx = bms.findIndex(b => b.verseKey === verseKey);
  if (idx > -1) { bms.splice(idx, 1); return true; }
  return false;
}

export function getBookmarks(userId) {
  return bookmarks.get(userId) || [];
}

// ─── CONTINUE YESTERDAY ───────────────────────────────────
const conversationHistory = new Map(); // userId -> [messages]

export function saveConversation(userId, messages) {
  conversationHistory.set(userId, {
    messages,
    lastActive: new Date().toISOString(),
  });
}

export function getYesterdayContext(userId) {
  const data = conversationHistory.get(userId);
  if (!data) return null;

  const lastActive = new Date(data.lastActive);
  const now = new Date();
  const hoursSince = (now - lastActive) / (1000 * 60 * 60);

  if (hoursSince > 48) return null; // Too old

  // Extract key topics from last conversation
  const messages = data.messages || [];
  const userMessages = messages.filter(m => m.role === 'user').slice(-5);
  const topics = userMessages.map(m => m.content).join(' ');

  const emotions = detectEmotions(topics);
  const verse = findBestVerse(emotions);

  return {
    lastActive: data.lastActive,
    topics,
    emotions,
    suggestedVerse: verse ? { chapter: verse.chapter, verse: verse.verse } : null,
    greeting: generateContinueGreeting(emotions, topics),
  };
}

function generateContinueGreeting(emotions, topics) {
  if (emotions.includes('anxiety') || emotions.includes('fear')) {
    return 'I noticed you were feeling anxious last time. How are you doing today? Remember, the future is not in your hands — only your actions are.';
  }
  if (emotions.includes('sadness') || emotions.includes('grief')) {
    return 'Last time you were going through a difficult moment. I hope you\'re feeling better today. Would you like to continue where we left off?';
  }
  if (emotions.includes('anger')) {
    return 'I remember our conversation about anger. Has the situation improved? Let me share another verse that might help.';
  }
  return 'Welcome back! I remember we were talking last time. Would you like to continue or explore something new today?';
}

// ─── EMERGENCY CALM MODE ──────────────────────────────────
export function getEmergencyCalmResponse() {
  const verse = findVerseByChapterVerse('2', '47');
  return {
    verse: { chapter: 2, verse: 47, sanskrit: verse?.sanskrit, translation: verse?.translation },
    breathing: {
      title: '4-7-8 Breathing',
      steps: [
        'Breathe IN through your nose for 4 seconds',
        'HOLD your breath for 7 seconds',
        'Breathe OUT slowly through your mouth for 8 seconds',
        'Repeat 4 times',
      ],
    },
    grounding: {
      title: '5-4-3-2-1 Grounding',
      steps: [
        'Name 5 things you can SEE',
        'Name 4 things you can TOUCH',
        'Name 3 things you can HEAR',
        'Name 2 things you can SMELL',
        'Name 1 thing you can TASTE',
      ],
    },
    message: 'You are safe. This moment will pass. Focus on your breath. You are stronger than you know.',
  };
}

// ─── STORY MODE ───────────────────────────────────────────
export const STORIES = {
  karma_office: {
    title: 'Karma Yoga in the Office',
    story: `Raj worked at a software company. He was brilliant but always stressed about promotions. One day, his colleague Amit got promoted instead.

Raj felt angry and unfair. That night, he opened the Gita and read Chapter 2, Verse 47: "You have the right to work, but never to the fruit of work."

The next morning, Raj decided to focus purely on his work — not on who gets promoted. He started enjoying his code again. He helped others without expecting credit.

Three months later, his work spoke for itself. But more importantly, he was happy regardless of the outcome.

The Gita teaches: Do your duty. The results are not in your hands. But your effort? That's entirely yours.`,
    verse: '2.47',
  },
  meditation_beginner: {
    title: 'A Beginner\'s First Meditation',
    story: `Priya had never meditated. Her mind raced all day — about work, family, bills. Her friend suggested 5 minutes of silence.

She sat down, closed her eyes, and immediately her mind went wild. "This is stupid," she thought. "I can't do this."

Then she remembered Chapter 6, Verse 35: "Undoubtedly, the mind is restless and difficult to control. But through practice and detachment, it can be managed."

She didn't force her mind to be silent. She just watched her thoughts like clouds passing in the sky.

Day 1: 5 minutes of chaos.
Day 7: Still chaotic, but she noticed gaps between thoughts.
Day 30: She found 10 seconds of true stillness. It was the most peaceful moment of her life.

The lesson: You don't control the mind by force. You train it with patience.`,
    verse: '6.35',
  },
  anger_management: {
    title: 'When Anger Takes Over',
    story: `Suresh had a temper. One day, his son broke his expensive watch. Suresh yelled loudly. His son cried.

That night, Suresh read the Gita: "From anger comes delusion; from delusion, loss of memory; from loss of memory, destruction of intelligence." (2.63)

He realized: Anger didn't just hurt his son — it destroyed his own wisdom.

The next time his son made a mistake, Suresh felt the anger rise. He paused. Took 3 deep breaths. Then he said, "It's okay. Watches can be replaced. You cannot."

His son hugged him. Suresh realized: The pause between anger and action is where wisdom lives.`,
    verse: '2.63',
  },
};

export function getStory(topic) {
  return STORIES[topic] || STORIES.karma_office;
}

// ─── DEBATE MODE ──────────────────────────────────────────
export function getDebateResponse(topic) {
  const debates = {
    'is attachment always bad': {
      title: 'Is Attachment Always Bad?',
      perspectives: [
        { source: 'Adi Shankaracharya', view: 'Attachment to material objects binds the soul. Detachment leads to liberation.' },
        { source: 'Swami Vivekananda', view: 'Attachment to God (divine attachment) is not bad. It is the highest form of love.' },
        { source: 'Modern View', view: 'Healthy attachment (secure bonding) is essential for emotional well-being. It\'s toxic attachment that causes suffering.' },
        { source: 'Gita Synthesis', view: 'The Gita teaches non-attachment to results, not non-attachment to people. Love deeply, but don\'t cling to outcomes.' },
      ],
      conclusion: 'Attachment to impermanent things causes suffering. Attachment to the divine and to dharma elevates the soul.',
    },
    'is karma yoga better than meditation': {
      title: 'Karma Yoga vs Meditation: Which is Better?',
      perspectives: [
        { source: 'Chapter 3 (Karma Yoga)', view: 'Action is unavoidable. Better to perform your duty than to renounce action.' },
        { source: 'Chapter 6 (Dhyana Yoga)', view: 'Meditation is the direct path to self-realization. The mind must be controlled.' },
        { source: 'Swami Chinmayananda', view: 'Both are essential. Karma yoga prepares the mind for meditation. Meditation deepens the quality of action.' },
        { source: 'Practical View', view: 'Different people need different paths. Active people benefit from karma yoga. Introspective people benefit from meditation.' },
      ],
      conclusion: 'They are not competing paths — they are complementary. The Gita recommends both.',
    },
  };

  return debates[topic.toLowerCase()] || {
    title: topic,
    perspectives: [
      { source: 'Gita Perspective', view: 'The Gita offers nuanced wisdom on this topic. Multiple viewpoints exist within the text.' },
      { source: 'Practical Wisdom', view: 'Consider both sides. The truth often lies in the balance between extremes.' },
    ],
    conclusion: 'Explore this topic through verses and meditation. The answer will reveal itself.',
  };
}
