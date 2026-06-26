import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { key: 'chat', label: 'Chat with Krishna', icon: '💬', section: 'Navigate' },
  { key: 'daily', label: 'Daily Verse', icon: '📖', section: 'Navigate' },
  { key: 'scenario', label: 'Life Guidance', icon: '🌟', section: 'Navigate' },
  { key: 'community', label: 'Community', icon: '👥', section: 'Navigate' },
  { key: 'ask-krishna', label: 'Ask Krishna', icon: '🙏', section: 'Premium' },
  { key: 'journal', label: 'Journal', icon: '📝', section: 'Premium' },
  { key: 'mood', label: 'Mood Check-in', icon: '😊', section: 'Premium' },
  { key: 'quiz', label: 'Gita Quiz', icon: '🧠', section: 'Premium' },
  { key: 'learning', label: 'Learning Paths', icon: '📚', section: 'Premium' },
  { key: 'meditation', label: 'Meditation', icon: '🧘', section: 'Premium' },
  { key: 'sleep', label: 'Sleep Stories', icon: '🌙', section: 'Wellness' },
  { key: 'calm', label: 'Emergency Calm', icon: '🫂', section: 'Wellness' },
  { key: 'stories', label: 'Stories', icon: '📖', section: 'Wellness' },
  { key: 'verse-cards', label: 'Verse Cards', icon: '🎴', section: 'Create' },
  { key: 'characters', label: 'Characters', icon: '🎭', section: 'Explore' },
  { key: 'debate', label: 'Debate Mode', icon: '⚖️', section: 'Explore' },
  { key: 'journey', label: 'Your Journey', icon: '🔥', section: 'Progress' },
  { key: 'goals', label: 'Goals', icon: '🎯', section: 'Progress' },
  { key: 'gamification', label: 'Achievements', icon: '🏆', section: 'Progress' },
  { key: 'challenge', label: '7-Day Challenge', icon: '⚡', section: 'Progress' },
  { key: 'weekly-report', label: 'Weekly Report', icon: '📊', section: 'Progress' },
  { key: 'recommendations', label: 'For You', icon: '✨', section: 'Discover' },
  { key: 'search', label: 'Search Verses', icon: '🔍', section: 'Discover' },
  { key: 'bookmarks', label: 'Bookmarks', icon: '🔖', section: 'Discover' },
  { key: 'referral', label: 'Invite Friends', icon: '💌', section: 'More' },
];

const VERSE_SHORTCUTS = [
  { verse: '2.47', label: 'Act without attachment', icon: '🎯' },
  { verse: '2.14', label: 'Face life changes', icon: '🌊' },
  { verse: '2.20', label: 'The eternal Self', icon: '✨' },
  { verse: '2.48', label: 'Yoga of equanimity', icon: '⚖️' },
  { verse: '2.62', label: 'Danger of desire', icon: '⚠️' },
  { verse: '3.19', label: 'Selfless action', icon: '🤝' },
  { verse: '4.7', label: 'Divine incarnation', icon: '🙏' },
  { verse: '4.38', label: 'Knowledge supreme', icon: '📚' },
  { verse: '6.35', label: 'Mind control', icon: '🧘' },
  { verse: '9.22', label: 'Divine care', icon: '🛡️' },
  { verse: '12.8', label: 'Path of devotion', icon: '❤️' },
  { verse: '18.66', label: 'Complete surrender', icon: '🕉' },
];

export default function CommandPalette({ onNavigate, onSendMessage, onClose }) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const [results, setResults] = useState([]);
  const inputRef = useRef(null);
  const isHi = i18n.language === 'hi';

  const allItems = [...NAV_ITEMS, ...VERSE_SHORTCUTS.map(v => ({
    key: `verse-${v.verse}`,
    label: `Verse ${v.verse} — ${v.label}`,
    icon: v.icon,
    section: 'Verses',
    verse: v.verse,
  }))];

  const filter = useCallback((q) => {
    if (!q.trim()) {
      setResults(allItems.slice(0, 10));
      return;
    }
    const lower = q.toLowerCase();
    const filtered = allItems.filter(item =>
      item.label.toLowerCase().includes(lower) ||
      item.section.toLowerCase().includes(lower) ||
      item.key.toLowerCase().includes(lower)
    );
    setResults(filtered.slice(0, 12));
    setSelected(0);
  }, []);

  useEffect(() => {
    filter(query);
  }, [query, filter]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelected(prev => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelected(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results[selected]) {
        e.preventDefault();
        executeItem(results[selected]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selected, results, onClose]);

  const executeItem = (item) => {
    if (item.verse) {
      onSendMessage(`Explain Chapter ${item.verse.split('.')[0]} Verse ${item.verse.split('.')[1]}`);
    } else {
      onNavigate(item.key);
    }
    onClose();
  };

  const sections = [...new Set(results.map(r => r.section))];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-xl flex items-start justify-center pt-[15vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="w-full max-w-lg bg-gray-900/98 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 shrink-0">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isHi ? 'श्लोक, विषय, या सुविधा खोजें...' : 'Search verses, topics, or features...'}
              className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
            />
            <kbd className="hidden sm:inline-flex px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-500 text-[10px] font-mono">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto py-2 scrollbar-thin">
            {results.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">
                {isHi ? 'कोई परिणाम नहीं मिला' : 'No results found'}
              </p>
            )}
            {sections.map(section => (
              <div key={section}>
                <p className="text-gray-600 text-[10px] uppercase tracking-wider font-bold px-5 py-1.5">{section}</p>
                {results.filter(r => r.section === section).map(item => {
                  const idx = results.indexOf(item);
                  return (
                    <button
                      key={item.key}
                      onClick={() => executeItem(item)}
                      onMouseEnter={() => setSelected(idx)}
                      className={`w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        idx === selected ? 'bg-amber-500/10 text-white' : 'text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg w-7 text-center">{item.icon}</span>
                      <span className="text-sm truncate">{item.label}</span>
                      {item.verse && (
                        <span className="ml-auto text-[10px] text-gray-500 font-mono">{item.verse}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer hints */}
          <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/5 text-gray-600 text-[10px]">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
