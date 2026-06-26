import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getStreak, getReadingStats, getUserId } from '../lib/storage';

const STEPS = [
  {
    key: 'welcome',
    icon: '🕉',
    titleEn: 'Welcome to Gita Gyan',
    titleHi: 'गीता ज्ञान में आपका स्वागत है',
    descEn: 'Your personal AI mentor rooted in the timeless wisdom of the Bhagavad Gita.',
    descHi: 'भगवद्गीता के शाश्वत ज्ञान पर आधारित आपका व्यक्तिगत AI गुरु।',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
  },
  {
    key: 'language',
    icon: '🌍',
    titleEn: 'Choose Your Language',
    titleHi: 'अपनी भाषा चुनें',
    descEn: 'Read and listen in 9 Indian languages.',
    descHi: '9 भारतीय भाषाओं में पढ़ें और सुनें।',
    gradient: 'from-blue-400 via-indigo-500 to-purple-500',
  },
  {
    key: 'purpose',
    icon: '🎯',
    titleEn: 'What Brings You Here?',
    titleHi: 'आप यहाँ क्यों आए हैं?',
    descEn: 'Help us personalize your spiritual journey.',
    descHi: 'हमें आपकी आध्यात्मिक यात्रा को व्यक्तिगत बनाने में मदद करें।',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
  },
  {
    key: 'daily',
    icon: '📖',
    titleEn: 'Daily Wisdom',
    titleHi: 'दैनिक ज्ञान',
    descEn: 'Start each day with a personalized verse.',
    descHi: 'हर दिन एक व्यक्तिगत श्लोक से शुरू करें।',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-500',
  },
  {
    key: 'ready',
    icon: '✨',
    titleEn: 'You Are Ready',
    titleHi: 'आप तैयार हैं',
    descEn: 'Your journey with Krishna begins now.',
    descHi: 'कृष्ण के साथ आपकी यात्रा अब शुरू होती है।',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
  },
];

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
];

const PURPOSES = [
  { key: 'stress', icon: '😌', label: 'Stress Relief' },
  { key: 'learning', icon: '📚', label: 'Deep Learning' },
  { key: 'daily', icon: '☀️', label: 'Daily Inspiration' },
  { key: 'meditation', icon: '🧘', label: 'Meditation' },
  { key: 'purpose', icon: '🌟', label: 'Life Purpose' },
  { key: 'relationships', icon: '💝', label: 'Relationships' },
  { key: 'career', icon: '💼', label: 'Career Guidance' },
  { key: 'spiritual', icon: '🕉', label: 'Spiritual Growth' },
];

export default function OnboardingPage({ onComplete, onLanguageChange }) {
  const { i18n } = useTranslation();
  const [step, setStep] = useState(0);
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');
  const [selectedPurposes, setSelectedPurposes] = useState([]);
  const [direction, setDirection] = useState(1);

  const isHi = i18n.language === 'hi';
  const current = STEPS[step];

  const goNext = () => {
    setDirection(1);
    if (step < STEPS.length - 1) setStep(step + 1);
    else {
      localStorage.setItem('gita-onboarding-done', '1');
      localStorage.setItem('gita-entered', '1');
      onComplete(selectedLang, selectedPurposes);
    }
  };

  const goBack = () => {
    if (step > 0) { setDirection(-1); setStep(step - 1); }
  };

  const togglePurpose = (key) => {
    setSelectedPurposes(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const handleLangSelect = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    if (onLanguageChange) onLanguageChange(code);
  };

  const variants = {
    enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Progress bar */}
      <div className="relative z-10 px-6 pt-6">
        <div className="flex items-center justify-between mb-2">
          {step > 0 ? (
            <button onClick={goBack} className="text-gray-400 hover:text-white text-sm transition-colors">
              ← {isHi ? 'वापस' : 'Back'}
            </button>
          ) : <div />}
          <span className="text-gray-500 text-xs">{step + 1} / {STEPS.length}</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            initial={false}
            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-md text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
              className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${current.gradient} flex items-center justify-center text-4xl mx-auto mb-8 shadow-lg`}
            >
              {current.icon}
            </motion.div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-white mb-3">
              {isHi ? current.titleHi : current.titleEn}
            </h1>
            <p className="text-gray-400 text-base mb-8 leading-relaxed">
              {isHi ? current.descHi : current.descEn}
            </p>

            {/* Step-specific content */}
            {current.key === 'language' && (
              <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => handleLangSelect(lang.code)}
                    className={`p-3 rounded-xl border transition-all text-sm ${
                      selectedLang === lang.code
                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-300 shadow-lg shadow-amber-500/10'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                    }`}>
                    <div className="font-medium">{lang.native}</div>
                  </button>
                ))}
              </div>
            )}

            {current.key === 'purpose' && (
              <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                {PURPOSES.map(p => (
                  <button key={p.key} onClick={() => togglePurpose(p.key)}
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                      selectedPurposes.includes(p.key)
                        ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
                        : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                    }`}>
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-xs font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            )}

            {current.key === 'daily' && (
              <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5 max-w-sm mx-auto">
                <p className="text-amber-200/80 text-sm italic mb-2">"कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"</p>
                <p className="text-gray-400 text-xs">Your right is to action alone, never to its fruits.</p>
                <p className="text-gray-500 text-[10px] mt-2">— Bhagavad Gita 2.47</p>
              </div>
            )}

            {current.key === 'ready' && (
              <div className="space-y-3 max-w-sm mx-auto text-left">
                {[
                  { icon: '💬', text: 'Ask Krishna anything in 9 languages' },
                  { icon: '📖', text: 'Receive daily verse wisdom' },
                  { icon: '🧘', text: 'Guided meditation & breathing' },
                  { icon: '📊', text: 'Track your spiritual journey' },
                ].map((item, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="relative z-10 px-6 pb-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold text-base shadow-xl shadow-amber-500/20"
        >
          {step === STEPS.length - 1
            ? (isHi ? 'शुरू करें 🙏' : 'Start Exploring 🙏')
            : (isHi ? 'आगे बढ़ें →' : 'Continue →')
          }
        </motion.button>
        {step > 0 && (
          <button onClick={() => {
            localStorage.setItem('gita-onboarding-done', '1');
            localStorage.setItem('gita-entered', '1');
            onComplete(selectedLang, selectedPurposes);
          }}
            className="w-full mt-3 text-gray-500 text-xs hover:text-gray-300 transition-colors py-2">
            {isHi ? 'अभी छोड़ें' : 'Skip for now'}
          </button>
        )}
      </div>
    </div>
  );
}
