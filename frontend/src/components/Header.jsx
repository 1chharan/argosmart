import React from 'react';
import { Languages, Wifi, WifiOff, RefreshCw, VolumeX, ShieldCheck, User } from 'lucide-react';
import { useLanguage } from '../services/i18n';

export default function Header({ onOpenLangModal, pendingSyncCount, onSync, currentRole, onSwitchRole }) {
  const { lang, t, isSpeaking, stopSpeaking } = useLanguage();
  const isOnline = navigator.onLine;

  const langLabels = {
    te: 'తెలుగు',
    hi: 'हिन्दी',
    en: 'English'
  };

  const roleLabels = {
    farmer: '👨‍🌾 రైతు / Farmer',
    expert: '🔬 నిపుణులు / Expert',
    volunteer: '🤝 స్వచ్ఛంద సేవకుడు'
  };

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md border-b-2 border-emerald-950">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Logo and App Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-2xl shadow-inner">
            🐝
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-black tracking-tight text-white leading-none">
                {t('appName')}
              </h1>
              <span className="text-[10px] font-bold bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full uppercase">
                Demo
              </span>
            </div>
            <p className="text-[11px] text-emerald-200 font-medium truncate max-w-[190px] sm:max-w-none">
              {t('appTagline')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Active Speaking Cancel Pill */}
          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 text-white text-xs font-bold rounded-xl animate-pulse"
              title="Stop Voice"
            >
              <VolumeX className="w-4 h-4" />
              <span className="hidden sm:inline">ఆపండి</span>
            </button>
          )}

          {/* Sync / Offline Status Pill */}
          {pendingSyncCount > 0 ? (
            <button
              onClick={onSync}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-400 text-amber-950 text-xs font-black rounded-xl hover:bg-amber-300 transition-all shadow-xs"
              title="Click to sync offline items"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{pendingSyncCount}</span>
            </button>
          ) : (
            <div className="hidden xs:flex items-center gap-1 px-2 py-1 bg-emerald-800/80 text-emerald-200 text-[11px] font-semibold rounded-lg">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Online</span>
            </div>
          )}

          {/* Role Switcher Pill */}
          <button
            onClick={onSwitchRole}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-xl text-xs font-bold border border-emerald-600 transition-all"
            title="Switch User Role"
          >
            <User className="w-3.5 h-3.5" />
            <span className="truncate max-w-[70px] sm:max-w-none">
              {currentRole === 'expert' ? 'Expert' : 'Farmer'}
            </span>
          </button>

          {/* Language Switcher Pill */}
          <button
            onClick={onOpenLangModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-emerald-950 rounded-xl text-xs font-black shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
            aria-label="Change Language"
          >
            <Languages className="w-4 h-4 text-emerald-700" />
            <span>{langLabels[lang] || 'తెలుగు'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
