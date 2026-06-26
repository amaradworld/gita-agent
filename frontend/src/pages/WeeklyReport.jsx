import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getStreak, getReadingStats, getMoodHistory, getJournalEntries, getUserId } from '../lib/storage';

export default function WeeklyReport() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    const streak = getStreak(userId);
    const stats = getReadingStats(userId);
    const moods = getMoodHistory(userId);
    const journal = getJournalEntries(userId);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);

    const weekVerses = stats.versesRead.length;
    const weekChapters = stats.chaptersExplored.length;
    const weekSessions = Math.min(stats.sessions, 20);

    const recentMoods = moods.filter(m => {
      const d = new Date(m.timestamp || m.date);
      return d >= weekAgo;
    });

    const moodCounts = {};
    recentMoods.forEach(m => {
      moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
    });
    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

    const moodEmojis = {
      peaceful: '☮️', calm: '😌', happy: '😊', energetic: '⚡',
      anxious: '😰', sad: '😢', stressed: '😤', neutral: '😐',
    };

    const recommendations = [];
    if (weekVerses < 3) recommendations.push({ icon: '📖', text: isHi ? 'इस सप्ताह कम से कम 5 श्लोक पढ़ें' : 'Read at least 5 verses this week' });
    if (recentMoods.length < 3) recommendations.push({ icon: '😊', text: isHi ? 'रोज़ मूड चेक-इन करें' : 'Check in with your mood daily' });
    if (weekChapters < 2) recommendations.push({ icon: '📚', text: isHi ? 'एक नया अध्याय खोजें' : 'Explore a new chapter' });
    if (streak.count < 3) recommendations.push({ icon: '🔥', text: isHi ? '3-दिन की स्ट्रीक बनाएं' : 'Build a 3-day streak' });

    if (recommendations.length === 0) {
      recommendations.push({ icon: '🌟', text: isHi ? 'शानदार! ऐसे ही जारी रखें' : 'Amazing! Keep up the great work' });
    }

    setData({
      streak: streak.count,
      totalVerses: weekVerses,
      totalChapters: weekChapters,
      totalSessions: weekSessions,
      dominantMood,
      moodEmoji: moodEmojis[dominantMood] || '😐',
      recentMoods: recentMoods.slice(0, 7),
      journalCount: journal.length,
      recommendations,
      weekRange: `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    });
    setLoading(false);
  }, [userId]);

  if (loading || !data) return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-xs mt-3">{isHi ? 'रिपोर्ट लोड हो रही है...' : 'Generating your report...'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-purple-500/20"
        >
          📊
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {isHi ? 'साप्ताहिक आध्यात्मिक रिपोर्ट' : 'Weekly Spiritual Report'}
        </h2>
        <p className="text-gray-400 text-sm">{data.weekRange}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { label: isHi ? 'दिन की स्ट्रीक' : 'Day Streak', value: data.streak, icon: '🔥', color: 'from-orange-500 to-red-500' },
          { label: isHi ? 'श्लोक पढ़े' : 'Verses Read', value: data.totalVerses, icon: '📖', color: 'from-amber-500 to-orange-500' },
          { label: isHi ? 'अध्याय' : 'Chapters', value: data.totalChapters, icon: '📚', color: 'from-yellow-500 to-amber-500' },
          { label: isHi ? 'सत्र' : 'Sessions', value: data.totalSessions, icon: '🕉', color: 'from-amber-500 to-yellow-500' },
        ].map((stat, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5 p-4 text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-400 text-xs mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Dominant mood */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.03] rounded-2xl border border-white/5 p-5 mb-6 text-center"
      >
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-bold">
          {isHi ? 'इस सप्ताह का प्रमुख मूड' : 'Dominant Mood This Week'}
        </p>
        <div className="text-4xl mb-2">{data.moodEmoji}</div>
        <p className="text-white font-semibold capitalize">{data.dominantMood}</p>
        {data.recentMoods.length > 0 && (
          <div className="flex justify-center gap-1 mt-3">
            {data.recentMoods.slice(0, 7).map((m, i) => (
              <span key={i} className="text-lg" title={m.mood}>
                {moodEmojis[m.mood] || '😐'}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Journal count */}
      {data.journalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.03] rounded-2xl border border-white/5 p-5 mb-6"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="text-white font-semibold text-sm">
                {data.journalCount} {isHi ? 'जर्नल प्रविष्टियाँ' : 'Journal Entries'}
              </p>
              <p className="text-gray-400 text-xs">
                {isHi ? 'अपनी आध्यात्मिक यात्रा को दस्तावेज़ कर रहे हैं' : 'Documenting your spiritual journey'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/[0.03] rounded-2xl border border-white/5 p-5"
      >
        <h3 className="text-white font-semibold text-sm mb-3">
          {isHi ? 'अगले सप्ताह के लिए सुझाव' : 'Recommendations for Next Week'}
        </h3>
        <div className="space-y-3">
          {data.recommendations.map((rec, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{rec.icon}</span>
              <p className="text-gray-300 text-sm">{rec.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
