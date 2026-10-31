import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ArrowLeft, RefreshCw, ShieldCheck, UserCheck, ChevronRight, Edit3 } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import VoiceButton from './VoiceButton';
import { api } from '../services/api';

export default function ExpertScreen({ onBack }) {
  const { t, lang } = useLanguage();

  const [queue, setQueue] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [speciesList, setSpeciesList] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(null);
  const [expertNote, setExpertNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [queueRes, metricsRes, spRes] = await Promise.all([
        api.getExpertQueue(selectedStatus),
        api.getExpertMetrics(),
        api.getSpecies()
      ]);
      setQueue(queueRes || []);
      setMetrics(metricsRes);
      setSpeciesList(spRes || []);
      if (queueRes?.length > 0 && !activeItem) {
        setActiveItem(queueRes[0]);
        setSelectedSpeciesId(queueRes[0].species_id || 1);
      }
    } catch (err) {
      console.error('Failed to load expert queue', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (isApproved = true) => {
    if (!activeItem) return;

    try {
      const confirmedId = selectedSpeciesId || activeItem.species_id || 1;
      const res = await api.verifySighting(activeItem.id, confirmedId, expertNote, isApproved);

      setActionSuccess(`Sighting #${activeItem.id} confirmed! Model training log updated.`);
      setTimeout(() => setActionSuccess(''), 3500);

      // Refresh queue and metrics
      loadData();
    } catch (err) {
      console.error('Verification failed', err);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('home')}</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-300">
            Dr. Sunita Kulkarni (Senior Entomologist)
          </span>
          <VoiceButton text="వ్యవసాయ నిపుణుల పరిశీలన డ్యాష్‌బోర్డు. రైతులు తీసిన పురుగుల ఫోటోలను పరిశీలించి ధృవీకరించండి." />
        </div>
      </div>

      {/* Metrics Banner */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-white rounded-2xl border-2 border-stone-200 text-center">
            <span className="text-xl font-black text-stone-900 block">{metrics.total_sightings}</span>
            <span className="text-[10px] font-bold text-stone-500 uppercase">Total Field Records</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 text-center">
            <span className="text-xl font-black text-amber-900 block">{metrics.pending_review}</span>
            <span className="text-[10px] font-bold text-amber-700 uppercase">Pending Review</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl border-2 border-emerald-300 text-center">
            <span className="text-xl font-black text-emerald-900 block">{metrics.expert_verified}</span>
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Expert Verified</span>
          </div>
          <div className="p-3 bg-teal-50 rounded-2xl border-2 border-teal-300 text-center">
            <span className="text-xl font-black text-teal-900 block">{metrics.ai_agreement_accuracy_rate}%</span>
            <span className="text-[10px] font-bold text-teal-700 uppercase">AI Model Accuracy</span>
          </div>
        </div>
      )}

      {/* Main Review Dashboard */}
      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-stone-900 leading-tight">
              {t('expertScreen.title')}
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Validate morphological features, confirm species & feed retrain dataset
            </p>
          </div>

          {/* Filter Status Selector */}
          <div className="flex gap-1.5 bg-stone-100 p-1 rounded-xl">
            {['pending', 'ai_suggested', 'expert_verified'].map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  selectedStatus === st
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {actionSuccess && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Two-column layout: Queue list on left, Inspection card on right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Queue List (5 cols) */}
          <div className="md:col-span-5 space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
            {queue.length === 0 ? (
              <div className="text-center py-10 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <span className="text-2xl">✅</span>
                <p className="text-xs font-bold text-stone-600 mt-2">No sightings in this queue</p>
              </div>
            ) : (
              queue.map(item => {
                const sp = item.species || item.ai_species;
                const isSelected = activeItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setActiveItem(item);
                      setSelectedSpeciesId(item.species_id || 1);
                    }}
                    className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 shadow-xs'
                        : 'border-stone-200 bg-stone-50/60 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-200 shrink-0 border">
                        <img
                          src={item.photo_url || (sp && sp.image_url)}
                          alt="thumb"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-stone-900 line-clamp-1">
                          #{item.id} {sp ? sp.common_name_en : 'Insect'}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
                          <span>{item.crop_name}</span>
                          <span>•</span>
                          <span className="font-bold text-emerald-700">{item.ai_confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                );
              })
            )}
          </div>

          {/* Active Review Panel (7 cols) */}
          {activeItem ? (
            <div className="md:col-span-7 bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
                    Inspection Specimen #{activeItem.id}
                  </span>
                  <h3 className="text-base font-black text-stone-900">
                    {activeItem.species?.common_name_en || 'Candidate'}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800">
                  AI: {activeItem.ai_confidence}%
                </span>
              </div>

              {/* Photo Display */}
              <div className="aspect-16/9 rounded-xl overflow-hidden border border-stone-300 bg-stone-900">
                <img
                  src={activeItem.photo_url || activeItem.species?.image_url}
                  alt="Insect specimen"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Farmer Location & Field metadata */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-400 block">Location / Coordinates</span>
                  <span className="font-extrabold text-stone-800">
                    {activeItem.village} ({activeItem.latitude}, {activeItem.longitude})
                  </span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold text-stone-400 block">Host Crop</span>
                  <span className="font-extrabold text-stone-800">{activeItem.crop_name || 'Cotton'}</span>
                </div>
              </div>

              {/* Reclassification / Species Dropdown */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-700 block">
                  Verify or Correct Species Classification:
                </label>
                <select
                  value={selectedSpeciesId || activeItem.species_id || 1}
                  onChange={(e) => setSelectedSpeciesId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border-2 border-stone-300 text-xs font-bold text-stone-800 bg-white focus:border-emerald-600"
                >
                  {speciesList.map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.common_name_en} ({sp.scientific_name}) — [{sp.category.toUpperCase()}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Expert Notes */}
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-stone-700 block">
                  Scientist Observations / Audit Note:
                </label>
                <input
                  type="text"
                  value={expertNote}
                  onChange={(e) => setExpertNote(e.target.value)}
                  placeholder="e.g. Verified by wing venation & antennal segmentation"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white"
                />
              </div>

              {/* Verification Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleVerify(true)}
                  className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Species</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVerify(false)}
                  className="px-4 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded-xl"
                >
                  Reject
                </button>
              </div>
            </div>
          ) : (
            <div className="md:col-span-7 flex items-center justify-center p-8 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 text-xs font-bold">
              Select a specimen from queue to inspect
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
