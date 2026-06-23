import { useTranslation } from 'react-i18next';
import VoiceVisualizer from './VoiceVisualizer';

export default function SpeakingButton({ isSpeaking, onToggle, size = 'md' }) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        className={`
          relative rounded-full flex items-center justify-center
          transition-all duration-300 ease-out
          ${sizeClasses[size]}
          ${isSpeaking
            ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 scale-110'
            : 'bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600 hover:from-amber-200 hover:to-orange-200 hover:scale-105'
          }
        `}
        title={isSpeaking ? t('chat.stop') : t('chat.listen')}
      >
        {isSpeaking && (
          <>
            <span className="absolute inset-0 rounded-full animate-ping bg-orange-400 opacity-20" />
            <span className="absolute inset-0 rounded-full animate-pulse bg-orange-500 opacity-10" />
          </>
        )}
        <span className="relative z-10">
          {isSpeaking ? '⏹' : '🔊'}
        </span>
      </button>
      {isSpeaking && <VoiceVisualizer isPlaying={isSpeaking} />}
    </div>
  );
}
