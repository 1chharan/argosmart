import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle2, Phone, CloudUpload, MapPin, Calendar, Volume2 } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import VoiceButton from './VoiceButton';

export default function MySightingsScreen({ sightings, offlineSightings, onBack, onSync, onSelectSighting }) {
  const { t, lang, speakText } = useLanguage();
  const [filter, setFilter] = useState('all');

  const allItems = [
    ...offlineSightings.map(item => ({ ...item, is_offline: true })),
    ...sightings.map(item => ({ ...item, is_offline: false }))
  ];

  const filtered = allItems.filter(item => {
    if (filter === 'all') return true;
    return (item.category || '').toLowerCase() === filter;
  });

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('home')}</span>
        </button>
        <div className="flex items-center gap-2">
          {offlineSightings.length > 0 && (
            <button
              onClick={onSync}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{t('syncNow')} ({offlineSightings.length})</span>
            </button>
          )}
          <VoiceButton text="మీ పొలంలో చూసిన పురుగుల జాబితా ఇక్కడ కనిపిస్తుంది." />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-stone-900">నా పొలం వివరాలు / Field Notebook</h2>
            <p className="text-xs text-stone-500">{filtered.length} Sightings Recorded</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['all', 'helpful', 'harmful', 'uncertain'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase whitespace-nowrap border-2 transition-all ${
                filter === cat
                  ? 'bg-emerald-700 text-white border-emerald-800'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              {t(`categories.${cat}`)}
            </button>
          ))}
        </div>

        {/* List of Sightings */}
        <div className="mt-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
              <span className="text-3xl">🦗</span>
              <p className="text-sm font-bold text-stone-600 mt-2">No sightings found</p>
            </div>
          ) : (
            filtered.map((item) => {
              const sp = item.species || item.ai_species;
              const spName = sp ? (sp[`common_name_${lang}`] || sp.common_name_en) : 'Indian Honeybee';
              const isHelpful = item.category === 'helpful';
              const isHarmful = item.category === 'harmful';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectSighting && onSelectSighting(item)}
                  className="p-4 rounded-2xl border-2 border-stone-200 hover:border-emerald-500 bg-stone-50/50 hover:bg-emerald-50/30 cursor-pointer transition-all flex items-start justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0 border border-stone-300">
                      <img
                        src={item.photo_url || (sp && sp.image_url) || 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=200&q=80'}
                        alt={spName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-stone-900 leading-tight">{spName}</h4>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          isHelpful ? 'bg-emerald-100 text-emerald-800' : isHarmful ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t(`categories.${item.category || 'helpful'}`)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                        <span className="font-bold text-stone-700">{item.crop_name || 'Cotton'}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {item.village || 'Warangal'}
                        </span>
                      </div>
                      {/* Offline vs Uploaded Badge */}
                      <div className="mt-2">
                        {item.is_offline ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            <Phone className="w-3 h-3" />
                            {t('savedOnPhone')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                            <CloudUpload className="w-3 h-3" />
                            {t('uploaded')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const tip = sp ? (sp[`eco_tip_${lang}`] || sp.eco_tip_en) : 'Helpful insect';
                      speakText(`${spName}. ${tip}`);
                    }}
                    className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-emerald-700"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
