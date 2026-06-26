import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

const FEATURES = [
  {
    icon: '💬',
    title: 'AI Mentor',
    desc: 'Chat with Krishna — ask anything about life, work, relationships, or spiritual growth.',
  },
  {
    icon: '📖',
    title: '700+ Verses',
    desc: 'Full Bhagavad Gita with 5 scholarly commentaries — Shankaracharya, Vivekananda, ISKCON, Chinmayananda, Sivananda.',
  },
  {
    icon: '🌍',
    title: '9 Indian Languages',
    desc: 'English, Hindi, Tamil, Telugu, Marathi, Bengali, Kannada, Gujarati, Malayalam — speak your language.',
  },
  {
    icon: '🧘',
    title: 'Meditation & Breathing',
    desc: 'Guided meditation, breathing exercises, and calming techniques for daily wellness.',
  },
  {
    icon: '📊',
    title: 'Track Your Journey',
    desc: 'Streaks, achievements, quizzes, and progress tracking to build a consistent practice.',
  },
  {
    icon: '🫂',
    title: 'Emergency Calm',
    desc: 'Feeling overwhelmed? Get instant Gita wisdom and breathing exercises for stressful moments.',
  },
];

const TESTIMONIALS = [
  {
    text: '"This app has completely changed how I start my morning. The daily verse feature is beautiful and the AI responses are surprisingly deep."',
    name: 'Priya S.',
    location: 'Mumbai',
    rating: 5,
  },
  {
    text: '"I love that I can ask Krishna questions in my own language. The voice feature makes it feel like a real conversation."',
    name: 'Rahul M.',
    location: 'Delhi',
    rating: 5,
  },
  {
    text: '"The Emergency Calm feature helped me through a panic attack at 2 AM. I can\'t recommend this enough."',
    name: 'Anjali K.',
    location: 'Bangalore',
    rating: 5,
  },
];

const STATS = [
  { value: '700+', label: 'Verses' },
  { value: '9', label: 'Languages' },
  { value: '5', label: 'Commentaries' },
  { value: '∞', label: 'Wisdom' },
];

export default function LandingPage({ onEnterApp, onLanguageChange }) {
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');

  const handleLangSelect = (code) => {
    setSelectedLang(code);
    i18n.changeLanguage(code);
    if (onLanguageChange) onLanguageChange(code);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20">
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="text-amber-400 text-sm">🕉</span>
            <span className="text-gray-400 text-xs font-medium tracking-wider uppercase">AI Spiritual Mentor</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight">
            <span className="text-white">Find </span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Peace</span>
            <span className="text-white"> through</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Ancient Wisdom</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Your personal AI guide to the Bhagavad Gita. Ask questions, get personalized spiritual guidance, and build a daily practice — in 9 Indian languages.
          </p>

          {/* Language Picker */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLangSelect(lang.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                  selectedLang === lang.code
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-lg shadow-amber-500/10'
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white hover:border-white/10'
                }`}
              >
                {lang.native}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onEnterApp(selectedLang)}
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold text-lg hover:scale-105 transition-all shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Journey
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-300 font-medium hover:bg-white/10 hover:text-white transition-all"
            >
              Learn More ↓
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need for your spiritual journey
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Combining 5,000 years of wisdom with modern AI technology
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-amber-500/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">Three simple steps to begin</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '💬', title: 'Ask a Question', desc: 'Type or speak your question in any language. Ask about stress, career, relationships, or anything on your mind.' },
              { step: '02', icon: '🕉', title: 'Receive Gita Wisdom', desc: 'AI matches your question to the most relevant verses and provides personalized guidance from 5 scholarly commentaries.' },
              { step: '03', icon: '🌱', title: 'Build a Practice', desc: 'Track your streak, complete daily challenges, take quizzes, and grow your spiritual journey over time.' },
            ].map((item, i) => (
              <div key={i} className="relative text-center p-8 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="text-5xl font-bold text-white/5 absolute top-4 right-6">{item.step}</div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-white font-semibold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">What people are saying</h2>
            <p className="text-gray-400 text-lg">Trusted by seekers across India</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/10 transition-all">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">{t.text}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center text-xs">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-gray-500 text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center text-4xl mx-auto mb-8 shadow-lg shadow-amber-500/20 animate-float">
            🕉
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Begin your journey today
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands who are finding peace and purpose through the timeless wisdom of the Bhagavad Gita.
          </p>
          <button
            onClick={() => onEnterApp(selectedLang)}
            className="group relative px-10 py-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold text-lg hover:scale-105 transition-all shadow-xl shadow-amber-500/20"
          >
            <span className="flex items-center gap-2">
              Start Free — No Sign-up Required
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </button>
          <p className="text-gray-500 text-xs mt-4">Free forever · No ads · 9 languages · Voice support</p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-sm">🕉</span>
            <span className="text-white font-semibold text-sm">Gita Gyan</span>
            <span className="text-gray-500 text-xs">· AI Spiritual Mentor</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/privacy" className="text-gray-400 text-xs hover:text-white transition-colors">Privacy</a>
            <a href="/terms" className="text-gray-400 text-xs hover:text-white transition-colors">Terms</a>
            <span className="text-gray-500 text-xs">© 2026 Gita Gyan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
