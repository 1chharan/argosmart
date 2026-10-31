import React from 'react';
import { Languages, Check, Volume2 } from 'lucide-react';
import { useLanguage } from '../services/i18n';

export default function LanguageModal({ isOpen, onClose }) {
  const { lang, changeLanguage, speakText, t } = useLanguage();

  if (!isOpen) return null;

  const languages = [
    {
      code: 'te',
      name: 'తెలుగు',
      sub: 'Telugu',
      sample: 'నమస్కారం! అగ్రోస్మార్ట్ ఏఐకు స్వాగతం.'
    },
    {
      code: 'hi',
      name: 'हिन्दी',
      sub: 'Hindi',
      sample: 'नमस्ते! एग्रोस्मार्ट एआई में आपका स्वागत है।'
    },
    {
      code: 'en',
      name: 'English',
      sub: 'English',
      sample: 'Welcome to AgroSmart AI Agricultural Network.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-emerald-600">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-800">
            <Languages className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 leading-tight">
            భాషను ఎంచుకోండి<br />
            <span className="text-xl font-bold text-stone-700">अपनी भाषा चुनें / Select Language</span>
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            Tap your language to start
          </p>
        </div>

        <div className="space-y-3.5">
          {languages.map((l) => {
            const isSelected = lang === l.code;
            return (
              <div
                key={l.code}
                onClick={() => {
                  changeLanguage(l.code);
                  speakText(l.sample, l.code);
                  if (onClose) onClose();
                }}
                className={`flex items-center justify-between p-4 rounded-2xl border-3 cursor-pointer transition-all active:scale-98 ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-stone-50 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-emerald-600 text-white' : 'border-2 border-stone-300'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-stone-900 leading-snug">{l.name}</h3>
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{l.sub}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(l.sample, l.code);
                  }}
                  className="p-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 hover:text-emerald-700 hover:bg-emerald-100 shadow-xs"
                  title="Preview Voice"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-full mt-6 py-3.5 text-center font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl"
          >
            Close / మూసివేయండి
          </button>
        )}
      </div>
    </div>
  );
}
