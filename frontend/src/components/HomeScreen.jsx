import React from 'react';
import { Camera, Sprout, Map, AlertTriangle, Mic, CheckCircle2, ChevronRight, Volume2 } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import VoiceButton from './VoiceButton';

export default function HomeScreen({ onNavigate, stats, pendingSyncCount, onSync, onOpenVoiceChatbot }) {
  const { t, speakText, lang } = useLanguage();

  const voiceSampleQuestions = lang === 'te' ? [
    'ఈ రోజు మందు చల్లవచ్చా?',
    'మిశ్రమ పురుగులను ఎలా గుర్తించాలి?',
    'తేనెటీగలను ఎలా కాపాడుకోవాలి?'
  ] : lang === 'hi' ? [
    'क्या आज दवा छिड़कें?',
    'मिश्रित कीटों की पहचान कैसे करें?',
    'मधुमक्खियों की रक्षा कैसे करें?'
  ] : [
    'Can I spray today?',
    'How to spot mixed insects?',
    'How to protect pollinators?'
  ];

  const tiles = [
    {
      id: 'upload',
      title: t('homeTiles.uploadTitle'),
      sub: t('homeTiles.uploadSub'),
      icon: Camera,
      color: 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700',
      iconBg: 'bg-emerald-700 text-white',
      badge: '1 Tap',
      voiceText: `${t('homeTiles.uploadTitle')}. ${t('homeTiles.uploadSub')}`
    },
    {
      id: 'doctor',
      title: t('homeTiles.doctorTitle'),
      sub: t('homeTiles.doctorSub'),
      icon: Sprout,
      color: 'bg-lime-700 text-white hover:bg-lime-800 border-lime-800',
      iconBg: 'bg-lime-800 text-white',
      badge: 'Eco Care',
      voiceText: `${t('homeTiles.doctorTitle')}. ${t('homeTiles.doctorSub')}`
    },
    {
      id: 'map',
      title: t('homeTiles.mapTitle'),
      sub: t('homeTiles.mapSub'),
      icon: Map,
      color: 'bg-teal-700 text-white hover:bg-teal-800 border-teal-800',
      iconBg: 'bg-teal-800 text-white',
      badge: '30+ Sights',
      voiceText: `${t('homeTiles.mapTitle')}. ${t('homeTiles.mapSub')}`
    },
    {
      id: 'risk',
      title: t('homeTiles.riskTitle'),
      sub: t('homeTiles.riskSub'),
      icon: AlertTriangle,
      color: 'bg-amber-600 text-white hover:bg-amber-700 border-amber-700',
      iconBg: 'bg-amber-700 text-white',
      badge: 'Real-time',
      voiceText: `${t('homeTiles.riskTitle')}. ${t('homeTiles.riskSub')}`
    },
    {
      id: 'assistant',
      title: t('homeTiles.assistantTitle'),
      sub: t('homeTiles.assistantSub'),
      icon: Mic,
      color: 'bg-sky-700 text-white hover:bg-sky-800 border-sky-800',
      iconBg: 'bg-sky-800 text-white',
      badge: 'Voice AI',
      voiceText: `${t('homeTiles.assistantTitle')}. ${t('homeTiles.assistantSub')}`
    },
    {
      id: 'expert',
      title: t('homeTiles.expertTitle'),
      sub: t('homeTiles.expertSub'),
      icon: CheckCircle2,
      color: 'bg-stone-800 text-white hover:bg-stone-900 border-stone-900',
      iconBg: 'bg-stone-900 text-white',
      badge: 'KVK Desk',
      voiceText: `${t('homeTiles.expertTitle')}. ${t('homeTiles.expertSub')}`
    }
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* Field Status & Pollinator Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-5 shadow-lg border-2 border-emerald-700">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🐝</span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Pollinator Friendly Window
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white leading-tight">
              తేనెటీగలు చురుగ్గా ఉన్నాయి / Bees are Active
            </h2>
            <p className="text-xs text-emerald-200 mt-1 max-w-sm">
              Avoid chemical pesticide spray between 8 AM - 4 PM. Protect pollinators for higher crop yield.
            </p>
          </div>
          <VoiceButton
            text="తేనెటీగలు మీ పొలంలో చురుగ్గా ఉన్నాయి. ఉదయం 8 నుండి సాయంత్రం 4 వరకు విష రసాయన మందులు పిచికారీ చేయవద్దు. మిత్ర పురుగులను కాపాడండి."
            className="shrink-0 bg-white/10 hover:bg-white/20 text-white border-white/20"
          />
        </div>

        {/* Offline Sync Banner if pending */}
        {pendingSyncCount > 0 && (
          <div className="mt-4 pt-3 border-t border-emerald-700/60 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <span>📱</span> {pendingSyncCount} {t('itemsPendingSync')}
            </span>
            <button
              onClick={onSync}
              className="px-3 py-1 bg-amber-400 text-amber-950 rounded-lg text-xs font-extrabold hover:bg-amber-300 transition-all"
            >
              {t('syncNow')}
            </button>
          </div>
        )}
      </div>

      {/* Prominent 1st-Screen Voice AI Chatbot Assistant */}
      <div className="bg-gradient-to-r from-sky-800 to-indigo-900 text-white rounded-3xl p-5 shadow-lg border-2 border-sky-600">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/30 border-2 border-sky-400 flex items-center justify-center text-2xl shadow-inner animate-pulse">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white leading-tight">
                  {t('voiceChatbotTitle')}
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-400 text-sky-950">
                  Voice AI
                </span>
              </div>
              <p className="text-xs text-sky-200">
                {t('voiceChatbotSub')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenVoiceChatbot}
            className="px-3.5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 active:scale-95 transition-all"
          >
            <span>బోల్కర్ పూఛేం / మాట్లాడండి</span>
          </button>
        </div>

        {/* Quick Voice Prompt Chips on 1st Screen */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-sky-700/60">
          <span className="text-[10px] font-extrabold text-sky-300 uppercase self-center mr-1">
            Try Asking:
          </span>
          {voiceSampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={onOpenVoiceChatbot}
              className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-sky-400/30 active:scale-95 transition-all"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Farmer Action Tiles (Mobile-First 56px+ Tap Targets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.id}
              onClick={() => onNavigate(tile.id)}
              className={`p-4 rounded-3xl border-2 shadow-md cursor-pointer transition-all active:scale-98 flex items-center justify-between gap-3 min-h-[96px] ${tile.color}`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${tile.iconBg}`}>
                  <Icon className="w-8 h-8 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black leading-tight text-white">{tile.title}</h3>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                      {tile.badge}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 font-medium line-clamp-1 mt-0.5">{tile.sub}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(tile.voiceText);
                  }}
                  className="p-2.5 rounded-xl bg-black/20 hover:bg-black/30 text-white transition-all"
                  title="Voice guide"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 text-white/80" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-stone-200 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌾</span>
          <div>
            <h4 className="text-sm font-black text-stone-900">నా పొలం వివరాలు / My Sightings</h4>
            <p className="text-xs text-stone-500">View saved insect notebook & status</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('sightings')}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl"
        >
          View All
        </button>
      </div>
    </div>
  );
}
