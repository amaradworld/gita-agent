import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const STORIES = [
  {
    id: 'krishna-childhood',
    title: 'Krishna\'s Childhood Leelas',
    titleHi: 'कृष्ण की बाल लीलाएँ',
    duration: '8 min',
    icon: '👶',
    color: 'from-blue-400 to-indigo-500',
    content: [
      'Close your eyes and take a deep breath.',
      'Imagine yourself in the ancient village of Gokul, on the banks of the sacred Yamuna river.',
      'The sun is setting, painting the sky in shades of orange and gold.',
      'You hear the sound of a small flute — the divine melody of little Krishna.',
      'Krishna, with his blue skin and mischievous smile, is playing with his friends by the riverbank.',
      'He picks up a butter ball from his mother Yashoda\'s pot, his eyes twinkling with joy.',
      'Feel the warmth of his presence. His laughter fills the air with pure bliss.',
      'As the stars appear, Krishna plays his flute under a kadamba tree.',
      'The melody carries away all your worries. You feel completely at peace.',
      'Rest in this moment of divine playfulness. Hari Om.',
    ],
  },
  {
    id: 'arjuna-battle',
    title: 'The Battlefield of Dharma',
    titleHi: 'धर्म का मैदान',
    duration: '10 min',
    icon: '⚔️',
    color: 'from-red-400 to-orange-500',
    content: [
      'Settle into a comfortable position. Close your eyes.',
      'You stand on the great field of Kurukshetra. The dawn breaks golden over the plain.',
      'Before you, two great armies face each other. The air is still.',
      'But you are not a warrior today. You are a witness to the greatest spiritual conversation ever spoken.',
      'Lord Krishna, the charioteer, turns to you with his infinite compassionate eyes.',
      '"You are above these battles. You are the eternal Atman."',
      'Feel the weight of worldly worries lift from your shoulders.',
      'The conch shells sound. But within you, there is perfect stillness.',
      'You are not the body. You are not the mind. You are pure consciousness.',
      'Let this truth settle into every cell of your being.',
      'When you are ready, open your eyes. Carry this peace with you. Namaste.',
    ],
  },
  {
    id: 'yamuna-night',
    title: 'Moonlit Night on the Yamuna',
    titleHi: 'यमुना की चाँदनी रात',
    duration: '7 min',
    icon: '🌙',
    color: 'from-indigo-400 to-purple-500',
    content: [
      'Take three slow, deep breaths. Let your body relax completely.',
      'You are sitting on the banks of the Yamuna river on a full moon night.',
      'The silver moonlight dances on the gentle waves of the river.',
      'A cool breeze carries the fragrance of jasmine and lotus flowers.',
      'In the distance, you hear the gentle sound of Krishna\'s flute echoing across the water.',
      'Each note dissolves a layer of tension from your mind.',
      'The moon is full and bright, reflecting Krishna\'s infinite compassion.',
      'You dip your fingers in the cool water. All stress flows away with the current.',
      'The stars above seem to pulse with divine energy.',
      'You are safe. You are loved. You are infinite.',
      'Rest here as long as you need. The divine flute will guide you home. Shanti.',
    ],
  },
  {
    id: 'forest-meditation',
    title: 'Sacred Forest Retreat',
    titleHi: 'पवित्र वन ध्यान',
    duration: '9 min',
    icon: '🌿',
    color: 'from-emerald-400 to-teal-500',
    content: [
      'Close your eyes and breathe deeply three times.',
      'You enter a ancient forest. Tall trees form a canopy above, filtering golden sunlight.',
      'The air is fresh with the scent of sandalwood and earth after rain.',
      'Birds sing their morning raga. A gentle stream murmurs nearby.',
      'You find a mossy stone beneath a great banyan tree and sit down.',
      'With each breath, you become more grounded, more present.',
      'The forest absorbs your worries. The trees stand as silent teachers.',
      'Feel the ancient wisdom of the earth beneath you.',
      'Krishna speaks through the rustling leaves: "Be still, and know that I am with you."',
      'You merge with the forest\'s peace. There is nowhere to go. Nothing to do.',
      'Simply be. Simply breathe. Simply exist in this sacred moment.',
      'When you return, bring the forest\'s peace with you. Om.',
    ],
  },
  {
    id: 'gita-wisdom',
    title: 'Gita Wisdom for Sleep',
    titleHi: 'नींद के लिए गीता ज्ञान',
    duration: '6 min',
    icon: '📖',
    color: 'from-amber-400 to-orange-500',
    content: [
      'Lie down comfortably. Let your eyes close gently.',
      'We begin with a sacred verse from the Bhagavad Gita.',
      '"He who is beyond attachment, who does not exult when obtaining good nor grieve when obtaining evil — his wisdom is firmly set." (2.57)',
      'Let these words wash over you like warm rain.',
      'You are beyond the dualities of pleasure and pain, gain and loss.',
      'The Self within you is eternal, untouched by the trials of the world.',
      '"As a man discards worn-out clothes and puts on new ones, so the embodied Self discards worn-out bodies and enters new ones." (2.22)',
      'Release the day. It is finished. Tomorrow is a new cloth.',
      'Your true Self rests in peace, beyond all change.',
      'Sleep now, secure in the knowledge of who you truly are.',
      'May the divine bless your rest. Om Shanti Shanti Shanti.',
    ],
  },
];

const SOUNDS = [
  { name: 'Rain on Leaves', icon: '🌧', type: 'rain', freq: 200 },
  { name: 'Ocean Waves', icon: '🌊', type: 'ocean', freq: 150 },
  { name: 'Forest Night', icon: '🌲', type: 'forest', freq: 3000 },
  { name: 'Singing Bowl', icon: '🔔', type: 'bowl', freq: 261 },
  { name: 'Om Chanting', icon: '🕉', type: 'om', freq: 136 },
  { name: 'Silent Night', icon: '🌙', type: 'silence', freq: 0 },
];

export default function SleepPage() {
  const { i18n } = useTranslation();
  const [activeStory, setActiveStory] = useState(null);
  const [storyStep, setStoryStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState(null);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathCount, setBreathCount] = useState(0);
  const intervalRef = useRef(null);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const isHi = i18n.language === 'hi';

  const stopSound = () => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    nodesRef.current = [];
    if (ctxRef.current) { try { ctxRef.current.close(); } catch {} ctxRef.current = null; }
    setActiveSound(null);
  };

  const playSound = (sound) => {
    stopSound();
    if (sound.type === 'silence') return;

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const gain = ctx.createGain();
    gain.gain.value = 0.08;
    gain.connect(ctx.destination);

    if (sound.type === 'rain' || sound.type === 'ocean') {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = sound.freq;
      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      nodesRef.current = [noise];
    } else {
      [sound.freq, sound.freq * 1.5, sound.freq * 2].forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        const g = ctx.createGain();
        g.gain.value = 0.3;
        osc.connect(g);
        g.connect(gain);
        osc.start();
        nodesRef.current.push(osc);
      });
    }
    setActiveSound(sound);
  };

  const startStory = (story) => {
    setActiveStory(story);
    setStoryStep(0);
    setIsPlaying(true);
  };

  const advanceStory = () => {
    if (!activeStory) return;
    if (storyStep < activeStory.content.length - 1) {
      setStoryStep(prev => prev + 1);
    } else {
      setIsPlaying(false);
      setActiveStory(null);
      setStoryStep(0);
    }
  };

  useEffect(() => {
    return () => { stopSound(); clearInterval(intervalRef.current); };
  }, []);

  // Breathing exercise
  const startBreathing = () => {
    setBreathCount(0);
    setBreathPhase('inhale');
    let count = 0;
    intervalRef.current = setInterval(() => {
      count++;
      setBreathCount(Math.floor(count / 4));
      const phases = ['inhale', 'hold', 'exhale', 'rest'];
      setBreathPhase(phases[count % 4]);
    }, 4000);
  };

  const stopBreathing = () => {
    clearInterval(intervalRef.current);
    setBreathPhase('inhale');
    setBreathCount(0);
  };

  if (activeStory) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in min-h-screen flex flex-col">
        {/* Story viewer */}
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            key={storyStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-md"
          >
            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${activeStory.color} flex items-center justify-center text-4xl mx-auto mb-8 shadow-lg animate-pulse`}>
              {activeStory.icon}
            </div>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {activeStory.content[storyStep]}
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-gray-500 text-xs">{storyStep + 1} / {activeStory.content.length}</span>
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  initial={false}
                  animate={{ width: `${((storyStep + 1) / activeStory.content.length) * 100}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>
        <div className="pb-8 flex justify-center gap-4">
          <button onClick={() => { setIsPlaying(false); setActiveStory(null); }}
            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-400 text-sm hover:bg-white/10 transition-all">
            {isHi ? 'बंद करें' : 'Exit'}
          </button>
          <button onClick={advanceStory}
            className="px-8 py-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-medium text-sm shadow-lg shadow-amber-500/20">
            {storyStep < activeStory.content.length - 1 ? (isHi ? 'अगला →' : 'Next →') : (isHi ? 'समाप्त' : 'Done')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-500 to-fuchsia-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-purple-500/20"
        >
          🌙
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {isHi ? 'नींद और विश्राम' : 'Sleep & Relaxation'}
        </h2>
        <p className="text-gray-400 text-sm">
          {isHi ? 'शांति से सोने के लिए गाइडेड स्टोरीज़ और ध्वनियाँ' : 'Guided stories and sounds for peaceful sleep'}
        </p>
      </div>

      {/* Breathing exercise */}
      <div className="mb-8">
        <h3 className="text-white font-semibold text-sm mb-3">
          {isHi ? 'श्वास व्यायाम' : 'Breathing Exercise'}
        </h3>
        <div className="bg-white/[0.03] rounded-2xl border border-white/5 p-6 text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <motion.div
              animate={{
                scale: breathPhase === 'inhale' ? 1.4 : breathPhase === 'hold' ? 1.4 : 1,
              }}
              transition={{ duration: 3.5, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-500/10 border border-amber-500/20 flex items-center justify-center"
            >
              <span className="text-amber-400 text-xs font-bold uppercase">
                {breathPhase === 'inhale' ? (isHi ? 'साँस लें' : 'Breathe In') :
                 breathPhase === 'hold' ? (isHi ? 'रोकें' : 'Hold') :
                 breathPhase === 'exhale' ? (isHi ? 'छोड़ें' : 'Breathe Out') :
                 (isHi ? 'विश्राम' : 'Rest')}
              </span>
            </motion.div>
          </div>
          {breathCount > 0 && (
            <p className="text-gray-400 text-xs mb-3">{breathCount} / 4 {isHi ? 'चक्र' : 'cycles'}</p>
          )}
          <button
            onClick={breathCount > 0 ? stopBreathing : startBreathing}
            className="px-6 py-2.5 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-all"
          >
            {breathCount > 0 ? (isHi ? 'बंद करें' : 'Stop') : (isHi ? 'शुरू करें' : 'Start Breathing')}
          </button>
        </div>
      </div>

      {/* Ambient sounds */}
      <div className="mb-8">
        <h3 className="text-white font-semibold text-sm mb-3">
          {isHi ? 'पृष्ठभूमि ध्वनियाँ' : 'Ambient Sounds'}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {SOUNDS.map(sound => (
            <button key={sound.name} onClick={() => playSound(sound)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                activeSound?.name === sound.name
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  : 'bg-white/[0.02] border-white/5 text-gray-400 hover:bg-white/5'
              }`}>
              <span className="text-xl">{sound.icon}</span>
              <span className="text-[9px] text-center leading-tight">{sound.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sleep stories */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">
          {isHi ? 'सोने की कहानियाँ' : 'Sleep Stories'}
        </h3>
        <div className="space-y-3">
          {STORIES.map(story => (
            <motion.div key={story.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/5 p-5 hover:border-purple-500/10 transition-all cursor-pointer"
              onClick={() => startStory(story)}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${story.color} flex items-center justify-center text-xl shadow-lg shrink-0`}>
                  {story.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm">{isHi ? story.titleHi : story.title}</h4>
                  <p className="text-gray-400 text-xs mt-0.5">{story.duration}</p>
                </div>
                <div className="text-gray-500 text-sm">▶</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
