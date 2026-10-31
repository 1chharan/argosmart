import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../services/i18n';

export default function VoiceButton({ text, label, className = '' }) {
  const { speakText, stopSpeaking, isSpeaking, t } = useLanguage();

  const handleClick = (e) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakText(text);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Listen aloud"
      className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black shadow-sm transition-all active:scale-95 border-2 ${
        isSpeaking
          ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
          : 'bg-emerald-50 text-emerald-950 border-emerald-400 hover:bg-emerald-100'
      } ${className}`}
    >
      {isSpeaking ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-emerald-700" />}
      <span>{label || t('listen')}</span>
    </button>
  );
}
