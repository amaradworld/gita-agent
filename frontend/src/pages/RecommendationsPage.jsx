import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getReadingStats, getMoodHistory, getStreak, getUserId, getBookmarks } from '../lib/storage';

const API = '';

const VERSE_RECOMMENDATIONS = [
  { verse: '2.47', topic: 'Action', tags: ['purpose', 'career', 'motivation', 'action'], icon: '🎯', reason: 'Based on your interest in purpose and action' },
  { verse: '2.14', topic: 'Resilience', tags: ['stress', 'anxiety', 'pain', 'suffering'], icon: '🌊', reason: 'Helps with stress and difficult emotions' },
  { verse: '3.19', topic: 'Selfless Action', tags: ['karma', 'work', 'duty', 'service'], icon: '⚖️', reason: 'The path of karma yoga for selfless action' },
  { verse: '4.38', topic: 'Wisdom', tags: ['knowledge', 'learn', 'understand', 'truth'], icon: '📚', reason: 'Knowledge is the greatest transformer' },
  { verse: '9.22', topic: 'Divine Care', tags: ['faith', 'trust', 'god', 'divine'], icon: '🛡️', reason: 'Krishna promises to care for his devotees' },
  { verse: '12.8', topic: 'Devotion', tags: ['love', 'devotion', 'bhakti', 'heart'], icon: '❤️', reason: 'The path of devotion and love' },
  { verse: '18.66', topic: 'Surrender', tags: ['surrender', 'trust', 'god', 'faith', 'peace'], icon: '🙏', reason: 'Complete surrender brings ultimate peace' },
  { verse: '6.35', topic: 'Mind Control', tags: ['meditation', 'focus', 'mind', 'concentration'], icon: '🧘', reason: 'Techniques for mastering the restless mind' },
  { verse: '2.62', topic: 'Caution', tags: ['desire', 'attachment', 'attachment'], icon: '⚠️', reason: 'Warning about the power of desire and attachment' },
  { verse: '13.8', topic: 'True Knowledge', tags: ['wisdom', 'knowledge', 'humility'], icon: '🌟', reason: 'What constitutes genuine spiritual knowledge' },
];

export default function RecommendationsPage({ onSendMessage }) {
  const { t, i18n } = useTranslation();
  const userId = getUserId();
  const isHi = i18n.language === 'hi';

  const recommendations = useMemo(() => {
    const stats = getReadingStats(userId);
    const moods = getMoodHistory(userId);
    const streak = getStreak(userId);
    const bookmarks = getBookmarks(userId);

    const readVerses = new Set(stats.versesRead);
    const recentMoods = moods.slice(0, 10).map(m => m.mood);

    // Score verses based on user behavior
    const scored = VERSE_RECOMMENDATIONS.map(rec => {
      let score = 0;

      // Don't recommend already-read verses (but lower score, not zero)
      if (readVerses.has(rec.verse)) score -= 2;

      // Boost for matching moods
      recentMoods.forEach(mood => {
        if (rec.tags.some(tag => mood?.includes(tag))) score += 3;
      });

      // Boost for matching goals (from localStorage)
      try {
        const goals = JSON.parse(localStorage.getItem(`gita_goals_${userId}`) || '[]');
        if (rec.tags.some(tag => goals.includes(tag))) score += 4;
      } catch {}

      // Boost for matching bookmarks
      bookmarks.forEach(b => {
        if (rec.tags.some(tag => b.tags?.includes(tag))) score += 2;
      });

      // Base relevance
      score += 1;

      return { ...rec, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, 6);
  }, [userId]);

  const recentTopics = useMemo(() => {
    const stats = getReadingStats(userId);
    const chapters = stats.chaptersExplored.map(Number).filter(n => n > 0);
    if (chapters.length === 0) return [];

    const topics = [];
    if (chapters.includes(2)) topics.push({ icon: '🎯', label: 'Karma Yoga', verse: '2.47' });
    if (chapters.includes(3)) topics.push({ icon: '⚖️', label: 'Selfless Action', verse: '3.19' });
    if (chapters.includes(6)) topics.push({ icon: '🧘', label: 'Meditation', verse: '6.35' });
    if (chapters.includes(12)) topics.push({ icon: '❤️', label: 'Devotion', verse: '12.8' });
    if (chapters.includes(18)) topics.push({ icon: '🙏', label: 'Surrender', verse: '18.66' });

    return topics.slice(0, 4);
  }, [userId]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/20"
        >
          ✨
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {isHi ? 'आपके लिए सुझाव' : 'Recommended For You'}
        </h2>
        <p className="text-gray-400 text-sm">
          {isHi ? 'आपकी यात्रा के आधार पर व्यक्तिगत ज्ञान' : 'Personalized wisdom based on your journey'}
        </p>
      </div>

      {/* Recent topics you've explored */}
      {recentTopics.length > 0 && (
        <div className="mb-8">
          <h3 className="text-white font-semibold text-sm mb-3">
            {isHi ? 'आपने जो खोजा' : 'Topics You\'ve Explored'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {recentTopics.map((topic, i) => (
              <button key={i} onClick={() => onSendMessage(`Tell me more about ${topic.label} in Chapter ${topic.verse.split('.')[0]}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-amber-500/5 hover:border-amber-500/10 transition-all">
                <span className="text-lg">{topic.icon}</span>
                <div className="text-left">
                  <p className="text-white text-xs font-medium">{topic.label}</p>
                  <p className="text-gray-500 text-[10px]">Verse {topic.verse}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Personalized verse recommendations */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">
          {isHi ? 'आपके लिए श्लोक' : 'Verses For You'}
        </h3>
        <div className="space-y-3">
          {recommendations.map((rec, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5 p-5 hover:border-amber-500/10 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-lg shrink-0">
                  {rec.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 text-xs font-bold">Ch. {rec.verse.split('.')[0]} · V. {rec.verse.split('.')[1]}</span>
                    <span className="text-white text-sm font-semibold">{rec.topic}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-3">{rec.reason}</p>
                  <button
                    onClick={() => onSendMessage(`Explain Chapter ${rec.verse.split('.')[0]} Verse ${rec.verse.split('.')[1]}`)}
                    className="text-amber-400 text-xs hover:text-amber-300 transition-colors font-medium"
                  >
                    → {isHi ? 'और जानें' : 'Explore this verse'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
