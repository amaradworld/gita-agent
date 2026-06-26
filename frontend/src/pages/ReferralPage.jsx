import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getUserId } from '../lib/storage';

export default function ReferralPage() {
  const { i18n } = useTranslation();
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    const userId = getUserId();
    const code = 'GITA' + userId.slice(-6).toUpperCase();
    setReferralCode(code);

    const count = parseInt(localStorage.getItem(`gita_referrals_${userId}`) || '0', 10);
    setReferralCount(count);
  }, []);

  const shareUrl = `https://gita-agent.vercel.app/?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode).then(() => {
      setCopied(true);
      toast.success(isHi ? 'कोड कॉपी किया!' : 'Code copied!');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = async () => {
    const text = isHi
      ? `मैं Gita Gyan का उपयोग कर रहा हूँ — AI आध्यात्मिक गुरु जो भगवद्गीता पर आधारित है। मेरा रेफरल कोड: ${referralCode}। अभी जुड़ें: ${shareUrl}`
      : `I'm using Gita Gyan — an AI spiritual mentor powered by the Bhagavad Gita. Use my referral code: ${referralCode}. Join here: ${shareUrl}`;

    if (navigator.share) {
      try { await navigator.share({ title: 'Gita Gyan', text, url: shareUrl }); }
      catch {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success(isHi ? 'लिंक कॉपी किया!' : 'Link copied to clipboard!');
    }
  };

  const milestones = [
    { count: 1, reward: isHi ? '1 सप्ताह मुफ़्त प्रीमियम' : '1 week free premium', icon: '⭐', unlocked: referralCount >= 1 },
    { count: 3, reward: isHi ? '1 महीना मुफ़्त प्रीमियम' : '1 month free premium', icon: '🌟', unlocked: referralCount >= 3 },
    { count: 5, reward: isHi ? '3 महीने मुफ़्त प्रीमियम' : '3 months free premium', icon: '💫', unlocked: referralCount >= 5 },
    { count: 10, reward: isHi ? '1 साल मुफ़्त प्रीमियम' : '1 year free premium', icon: '🏆', unlocked: referralCount >= 10 },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pink-400 via-rose-500 to-red-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-rose-500/20"
        >
          💌
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {isHi ? 'अपने मित्रों को आमंत्रित करें' : 'Invite Friends'}
        </h2>
        <p className="text-gray-400 text-sm">
          {isHi ? 'दोस्तों को आमंत्रित करें, दोनों को पुरस्कार मिलें' : 'Invite friends, both get rewarded'}
        </p>
      </div>

      {/* How it works */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5 mb-6">
        <h3 className="text-white font-semibold text-sm mb-4">
          {isHi ? 'यह कैसे काम करता है' : 'How It Works'}
        </h3>
        <div className="space-y-4">
          {[
            { step: '1', text: isHi ? 'अपना रेफरल कोड साझा करें' : 'Share your referral code', icon: '📤' },
            { step: '2', text: isHi ? 'आपका मित्र कोड दर्ज करता है' : 'Your friend enters the code', icon: '🔑' },
            { step: '3', text: isHi ? 'दोनों को पुरस्कार मिलता है!' : 'Both get rewards!', icon: '🎉' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <p className="text-gray-300 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Referral code */}
      <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/5 rounded-2xl border border-rose-500/20 p-5 mb-6 text-center">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-bold">
          {isHi ? 'आपका रेफरल कोड' : 'Your Referral Code'}
        </p>
        <p className="text-2xl font-mono font-bold text-white tracking-widest mb-4">{referralCode}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={handleCopy}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'}`}>
            {copied ? '✓' : isHi ? 'कोड कॉपी करें' : 'Copy Code'}
          </button>
          <button onClick={handleShare}
            className="px-5 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 border border-amber-500/20 transition-all">
            {isHi ? 'साझा करें' : 'Share'}
          </button>
        </div>
      </div>

      {/* Milestones */}
      <div className="mb-6">
        <h3 className="text-white font-semibold text-sm mb-3">
          {isHi ? 'पुरस्कार मील के पत्थर' : 'Reward Milestones'}
        </h3>
        <div className="space-y-2">
          {milestones.map((m, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              m.unlocked
                ? 'bg-amber-500/10 border-amber-500/20'
                : 'bg-white/[0.02] border-white/5'
            }`}>
              <span className={`text-xl ${m.unlocked ? '' : 'grayscale opacity-40'}`}>{m.icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${m.unlocked ? 'text-amber-200' : 'text-gray-400'}`}>
                  {m.count} {isHi ? 'रेफरल' : 'Referrals'}
                </p>
                <p className="text-gray-500 text-xs">{m.reward}</p>
              </div>
              {m.unlocked && <span className="text-amber-400 text-xs font-bold">✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-5 text-center">
        <p className="text-3xl font-bold text-white">{referralCount}</p>
        <p className="text-gray-400 text-xs mt-1">
          {isHi ? 'कुल रेफरल' : 'Total Referrals'}
        </p>
      </div>
    </div>
  );
}
