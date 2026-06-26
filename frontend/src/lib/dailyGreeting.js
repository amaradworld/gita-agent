import { getStreak, getMoodHistory, getUserId } from './storage';

const GREETINGS = {
  en: {
    earlyMorning: ['Rise and shine', 'A new dawn awaits', 'Begin with the divine'],
    morning: ['Good morning', 'Blessed morning', 'Peaceful morning'],
    afternoon: ['Good afternoon', 'Stay centered', 'Midday wisdom'],
    evening: ['Good evening', 'Reflect and restore', 'Evening peace'],
    night: ['Rest well', 'Peaceful night', 'Sleep in divine grace'],
  },
  hi: {
    earlyMorning: ['उठो और चमको', 'एक नया सवेरा है', 'दिव्य से शुरू करो'],
    morning: ['सुप्रभात', 'धन्य सुबह', 'शांतिपूर्ण सुबह'],
    afternoon: ['नमस्ते', 'केंद्रित रहो', 'दोपहर का ज्ञान'],
    evening: ['शुभ संध्या', 'चिंतन और विश्राम', 'संध्या की शांति'],
    night: ['शुभ रात्रि', 'शांति से सोओ', 'दिव्य कृपा में विश्राम'],
  },
};

const STREAK_MESSAGES = {
  en: [
    (days) => `${days}-day streak! Keep going 🔥`,
    (days) => `${days} days strong! The Gita walks with you ⚡`,
    (days) => `Day ${days} — your dedication inspires 🙏`,
  ],
  hi: [
    (days) => `${days}-दिन की स्ट्रीक! जारी रखो 🔥`,
    (days) => `${days} दिन मजबूत! गीता आपके साथ है ⚡`,
    (days) => `दिन ${days} — आपका समर्पण प्रेरित करता है 🙏`,
  ],
};

const MOOD_GREETINGS = {
  en: {
    peaceful: 'Feeling peaceful today? Let that flow into your practice.',
    calm: 'A calm mind receives wisdom best.',
    happy: 'Joy is the gateway to devotion.',
    energetic: 'Channel that energy into your spiritual practice.',
    anxious: 'Breathe. Krishna says — I am with you.',
    sad: 'Even in sadness, the Self remains untouched.',
    stressed: 'Let the Gita be your anchor in this storm.',
    neutral: 'Every moment is an opportunity for growth.',
  },
  hi: {
    peaceful: 'आज शांत महसूस कर रहे हैं? इसे अभ्यास में बदलें।',
    calm: 'शांत मन ज्ञान सबसे अच्छे से प्राप्त करता है।',
    happy: 'आनंद भक्ति का द्वार है।',
    energetic: 'इस ऊर्जा को अपने आध्यात्मिक अभ्यास में लगाएं।',
    anxious: 'साँस लें। कृष्ण कहते हैं — मैं आपके साथ हूँ।',
    sad: 'दुख में भी, आत्मा अप्रभावित रहती है।',
    stressed: 'गीता को अपना सहारा बनने दें।',
    neutral: 'हर क्षण विकास का अवसर है।',
  },
};

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 7) return 'earlyMorning';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getDailyGreeting(lang = 'en') {
  const userId = getUserId();
  const streak = getStreak(userId);
  const moods = getMoodHistory(userId);
  const recentMood = moods[0]?.mood || 'neutral';
  const timeOfDay = getTimeOfDay();

  const greetings = GREETINGS[lang] || GREETINGS.en;
  const timeGreetings = greetings[timeOfDay] || greetings.morning;
  const greeting = timeGreetings[Math.floor(Math.random() * timeGreetings.length)];

  let streakMsg = '';
  if (streak.count > 0) {
    const msgs = STREAK_MESSAGES[lang] || STREAK_MESSAGES.en;
    streakMsg = msgs[Math.floor(Math.random() * msgs.length)](streak.count);
  }

  const moodMessages = MOOD_GREETINGS[lang] || MOOD_GREETINGS.en;
  const moodMsg = moodMessages[recentMood] || moodMessages.neutral;

  return {
    greeting,
    streakMessage: streakMsg,
    moodMessage: moodMsg,
    timeOfDay,
  };
}
