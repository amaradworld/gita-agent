import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PRESETS = [
  { name: 'Singing Bowl', icon: '🔔', type: 'sine', freqs: [261.63, 329.63, 392.00], gain: 0.08 },
  { name: 'Om Drone', icon: '🕉', type: 'sine', freqs: [136.1, 272.2, 408.3], gain: 0.06 },
  { name: 'Rain', icon: '🌧', type: 'noise', gain: 0.04 },
  { name: 'Night Crickets', icon: '🦗', type: 'sine', freqs: [4000, 4500, 5000], gain: 0.015 },
  { name: 'Wind', icon: '🌬', type: 'noise', gain: 0.03 },
  { name: 'Silence', icon: '🔇', type: 'off', gain: 0 },
];

export default function AmbientMusic({ enabled, onToggle }) {
  const [activePreset, setActivePreset] = useState(null);
  const [volume, setVolume] = useState(30);
  const [showPicker, setShowPicker] = useState(false);
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);
  const gainRef = useRef(null);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
    nodesRef.current = [];
    if (ctxRef.current) {
      try { ctxRef.current.close(); } catch {}
      ctxRef.current = null;
    }
  }, []);

  const playPreset = useCallback((preset) => {
    stopAll();
    if (preset.type === 'off') { setActivePreset(null); return; }

    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = (volume / 100) * preset.gain;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    if (preset.type === 'noise') {
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = preset.freqs?.[0] || 800;

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start();
      nodesRef.current = [noise];
    } else {
      preset.freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        osc.type = preset.type;
        osc.frequency.value = freq;

        const oscGain = ctx.createGain();
        oscGain.gain.value = 1 / preset.freqs.length;
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        osc.start();
        nodesRef.current.push(osc);
      });
    }

    setActivePreset(preset);
  }, [volume, stopAll]);

  useEffect(() => {
    if (gainRef.current) {
      gainRef.current.gain.value = (volume / 100) * (PRESETS.find(p => p.name === activePreset?.name)?.gain || 0);
    }
  }, [volume, activePreset]);

  useEffect(() => () => stopAll(), [stopAll]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`p-2 rounded-xl transition-all ${activePreset ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-gray-500 hover:text-gray-300 bg-white/5 hover:bg-white/10 border border-transparent'}`}
        title="Ambient sounds"
      >
        <span className="text-lg">{activePreset?.icon || '🎵'}</span>
      </button>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full right-0 mb-2 w-64 bg-gray-900/98 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 p-4 z-50"
          >
            <p className="text-white text-xs font-bold mb-3 uppercase tracking-wider">Ambient Sounds</p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => { playPreset(preset); if (preset.type === 'off') onToggle(false); else onToggle(true); }}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all ${
                    activePreset?.name === preset.name
                      ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                      : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-[9px] text-center leading-tight">{preset.name}</span>
                </button>
              ))}
            </div>

            {activePreset && activePreset.type !== 'off' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-[10px]">Volume</span>
                  <span className="text-gray-400 text-[10px]">{volume}%</span>
                </div>
                <input
                  type="range" min="0" max="100" value={volume}
                  onChange={e => setVolume(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
