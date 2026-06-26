import React from 'react';
import { motion } from 'framer-motion';

const FOLLOW_UP_TEMPLATES = {
  stress: [
    'How can I practice detachment from outcomes?',
    'What verse helps with anxiety at night?',
    'Guide me through a calming meditation',
  ],
  anger: [
    'How does Krishna say to control anger?',
    'What is the root cause of anger in the Gita?',
    'Help me with a breathing exercise for anger',
  ],
  fear: [
    'What does the Gita say about death?',
    'How can I develop courage according to Krishna?',
    'What verse helps overcome fear of failure?',
  ],
  purpose: [
    'How do I find my dharma?',
    'What is the meaning of karma yoga?',
    'How does the Gita define success?',
  ],
  meditation: [
    'Guide me through a 5-minute meditation',
    'What does the Gita say about the wandering mind?',
    'How do I practice dhyana yoga?',
  ],
  love: [
    'What does the Gita teach about relationships?',
    'How can I love without attachment?',
    'What verse helps with heartbreak?',
  ],
  knowledge: [
    'Explain jnana yoga to me',
    'What is the difference between knowledge and wisdom?',
    'Which chapter teaches about the self (Atman)?',
  ],
  default: [
    'Tell me a verse about inner peace',
    'What is Krishna\'s most important teaching?',
    'How do I start a daily spiritual practice?',
  ],
};

export function getFollowUpQuestions(lastMessage) {
  if (!lastMessage) return FOLLOW_UP_TEMPLATES.default;

  const lower = lastMessage.toLowerCase();
  for (const [key, questions] of Object.entries(FOLLOW_UP_TEMPLATES)) {
    if (key === 'default') continue;
    const keywords = {
      stress: ['stress', 'anxious', 'worried', 'tension', 'pressure', 'overwhelm'],
      anger: ['anger', 'angry', 'rage', 'frustrat', 'furious'],
      fear: ['fear', 'afraid', 'scared', 'anxiety', 'worry', 'dread'],
      purpose: ['purpose', 'meaning', 'dharma', 'destiny', 'goal', 'life'],
      meditation: ['meditat', 'focus', 'concentrat', 'mind', 'calm', 'peace'],
      love: ['love', 'relation', 'heart', 'breakup', 'marriage', 'attachment'],
      knowledge: ['knowledge', 'wisdom', 'learn', 'understand', 'philosophy', 'truth'],
    };
    if (keywords[key]?.some(kw => lower.includes(kw))) return questions;
  }
  return FOLLOW_UP_TEMPLATES.default;
}

export default function FollowUpQuestions({ questions, onSelect }) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {questions.map((q, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onSelect(q)}
          className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-gray-400 text-xs hover:bg-amber-500/5 hover:text-amber-300 hover:border-amber-500/10 transition-all"
        >
          {q}
        </motion.button>
      ))}
    </div>
  );
}
