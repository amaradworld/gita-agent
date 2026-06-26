import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getStreak, getUserId, getReadingStats } from '../lib/storage';

const API = '';

const CHALLENGES = [
  { day: 1, chapter: 2, verse: 47, title: 'Act Without Attachment', titleHi: 'बिना आसक्ति के कर्म', desc: 'Read and reflect on the most famous verse of the Gita.', icon: '🎯', color: 'from-amber-500 to-orange-500' },
  { day: 2, chapter: 2, verse: 14, title: 'Face Life\'s Changes', titleHi: 'जीवन के बदलावों का सामना करें', desc: 'Understand how to handle pleasure and pain.', icon: '🌊', color: 'from-blue-500 to-indigo-500' },
  { day: 3, chapter: 3, verse: 19, title: 'The Power of Karma Yoga', titleHi: 'कर्म योग की शक्ति', desc: 'Learn how selfless action leads to liberation.', icon: '⚖️', color: 'from-emerald-500 to-teal-500' },
  { day: 4, chapter: 4, verse: 38, title: 'Knowledge is Supreme', titleHi: 'ज्ञान सर्वोच्च है', desc: 'Discover the transformative power of spiritual wisdom.', icon: '📚', color: 'from-violet-500 to-purple-500' },
  { day: 5, chapter: 9, verse: 22, title: 'Divine Protection', titleHi: 'दिव्य रक्षा', desc: 'Krishna personally cares for his devoted followers.', icon: '🛡️', color: 'from-rose-500 to-pink-500' },
  { day: 6, chapter: 12, verse: 8, title: 'The Path of Devotion', titleHi: 'भक्ति का मार्ग', desc: 'Fix your mind on Krishna for the highest yoga.', icon: '❤️', color: 'from-red-500 to-orange-500' },
  { day: 7, chapter: 18, verse: 66, title: 'Complete Surrender', titleHi: 'पूर्ण समर्पण', desc: 'The final promise: abandon all duties and take refuge in God.', icon: '🙏', color: 'from-amber-400 via-orange-500 to-red-500' },
];

export default function ChallengePage({ onSendMessage }) {
  const { t, i18n } = useTranslation();
  const [completedDays, setCompletedDays] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);
  const userId = getUserId();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(`gita_challenge_${userId}`) || '{}');
      setCompletedDays(stored.completed || []);
      setCurrentDay(stored.current || 1);
    } catch {}
  }, [userId]);

  const saveChallenge = (completed, current) => {
    localStorage.setItem(`gita_challenge_${userId}`, JSON.stringify({ completed, current }));
  };

  const markComplete = (day) => {
    const updated = [...new Set([...completedDays, day])];
    setCompletedDays(updated);
    const nextCurrent = Math.max(currentDay, day + 1);
    setCurrentDay(nextCurrent);
    saveChallenge(updated, nextCurrent);
  };

  const progress = Math.round((completedDays.length / 7) * 100);
  const isComplete = completedDays.length === 7;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/20"
        >
          {isComplete ? '🏆' : '⚡'}
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {isComplete ? (isHi ? 'चुनाव पूर्ण!' : 'Challenge Complete!') : (isHi ? '7-दिवसीय गीता चुनौती' : '7-Day Gita Challenge')}
        </h2>
        <p className="text-gray-400 text-sm">
          {isHi ? 'एक सप्ताह में गीता के सार को समझें' : 'Understand the essence of the Gita in one week'}
        </p>
      </div>

      {/* Progress ring */}
      <div className="flex justify-center mb-8">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="52" fill="none" stroke="url(#progress-gradient)" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={2 * Math.PI * 52}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - progress / 100) }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{completedDays.length}/7</span>
            <span className="text-gray-400 text-xs">{isHi ? 'दिन पूर्ण' : 'Days Done'}</span>
          </div>
        </div>
      </div>

      {/* Days */}
      <div className="space-y-3">
        {CHALLENGES.map((ch) => {
          const isCompleted = completedDays.includes(ch.day);
          const isCurrent = ch.day === currentDay;
          const isLocked = ch.day > currentDay;

          return (
            <motion.div
              key={ch.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ch.day * 0.05 }}
              className={`rounded-2xl border p-5 transition-all ${
                isCompleted
                  ? 'bg-amber-500/10 border-amber-500/20'
                  : isCurrent
                    ? 'bg-white/[0.03] border-amber-500/10 shadow-lg shadow-amber-500/5'
                    : 'bg-white/[0.02] border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 bg-gradient-to-br ${ch.color} ${isLocked ? 'grayscale opacity-50' : ''}`}>
                  {isCompleted ? '✓' : ch.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-amber-400' : 'text-gray-500'}`}>
                      {isHi ? `दिन ${ch.day}` : `Day ${ch.day}`}
                    </span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className="text-gray-500 text-xs">Ch. {ch.chapter} V. {ch.verse}</span>
                  </div>
                  <h3 className={`font-semibold text-sm ${isCompleted ? 'text-amber-200' : 'text-white'}`}>
                    {isHi ? ch.titleHi : ch.title}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">{ch.desc}</p>
                </div>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  {isCompleted ? (
                    <span className="text-amber-400 text-xs font-bold">✓</span>
                  ) : isLocked ? (
                    <span className="text-gray-600 text-lg">🔒</span>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          onSendMessage(`Explain Chapter ${ch.chapter} Verse ${ch.verse}`);
                          markComplete(ch.day);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-all"
                      >
                        {isHi ? 'पढ़ें' : 'Read'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Completion celebration */}
      {isComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 text-center p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20"
        >
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-white font-bold text-lg mb-2">
            {isHi ? 'बधाई हो!' : 'Congratulations!'}
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            {isHi ? 'आपने 7-दिवसीय गीता चुनौती पूरी कर ली है!' : 'You\'ve completed the 7-Day Gita Challenge!'}
          </p>
          <button
            onClick={() => onSendMessage('Give me a summary of everything I learned this week')}
            className="px-6 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-all"
          >
            {isHi ? 'अपनी यात्रा का सारांश देखें' : 'View Weekly Summary'}
          </button>
        </motion.div>
      )}
    </div>
  );
}
