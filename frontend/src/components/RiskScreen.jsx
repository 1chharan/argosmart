import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, ArrowLeft, Send, CheckCircle2, CloudSun, Wind, Droplets, Volume2, Bell } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import VoiceButton from './VoiceButton';
import { api } from '../services/api';

export default function RiskScreen({ onBack }) {
  const { t, lang, speakText } = useLanguage();

  const [riskData, setRiskData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('9876543210');

  useEffect(() => {
    loadRiskStatus();
  }, []);

  const loadRiskStatus = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRiskStatus(18.0673, 79.5484, 'Hasanparthy, Warangal');
      setRiskData(data);
    } catch (err) {
      console.error('Failed to load risk status', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async () => {
    try {
      const msg = `🚨 AgroSmart AI Field Alert for ${riskData?.village || 'Warangal'}: ${riskData?.pest_pressure_alert}. ${riskData?.pollinator_safe_window}`;
      await api.broadcastAlert(phoneNumber, msg, 'whatsapp');
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 4000);
      speakText('గ్రామ రైతులకు వాట్సాప్ హెచ్చరిక విజయవంతంగా పంపబడింది.');
    } catch (err) {
      console.error('Broadcast failed', err);
    }
  };

  const riskLevel = riskData?.risk_level || 'MEDIUM';
  const riskColor = riskLevel === 'HIGH' ? 'text-red-700 bg-red-100 border-red-300' :
                    riskLevel === 'MEDIUM' ? 'text-amber-800 bg-amber-100 border-amber-300' :
                    'text-emerald-800 bg-emerald-100 border-emerald-300';

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
        <VoiceButton
          text={`పొలం రిస్క్ స్థాయి: ${riskLevel}. ${riskData?.pest_pressure_alert || ''}. ${riskData?.pollinator_safe_window || ''}`}
        />
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-stone-200">
        <div className="mb-4">
          <h2 className="text-xl font-black text-stone-900 leading-tight">
            {t('riskScreen.title')}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            {t('riskScreen.subtitle')}
          </p>
        </div>

        {/* Risk Score Gauge & Level */}
        <div className="p-5 rounded-2xl bg-stone-50 border-2 border-stone-200 mb-4 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-stone-500 block mb-1">
              {riskData?.village || 'Hasanparthy, Warangal'}
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${riskColor}`}>
                {riskLevel} RISK
              </span>
              <span className="text-xs font-bold text-stone-600">
                Score: {riskData?.risk_score || 45}/100
              </span>
            </div>
            <p className="text-xs font-bold text-stone-800 mt-2 leading-snug">
              {riskData?.pest_pressure_alert}
            </p>
          </div>

          <div className="w-20 h-20 rounded-full border-4 border-amber-500 bg-white shadow-inner flex flex-col items-center justify-center shrink-0">
            <span className="text-2xl font-black text-stone-900 leading-none">
              {riskData?.risk_score || 45}
            </span>
            <span className="text-[9px] font-bold text-stone-500 uppercase">Index</span>
          </div>
        </div>

        {/* Pollinator vs Pest Balance Count */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">🐝</span>
              <span className="text-xl font-black text-emerald-800">
                {riskData?.beneficial_count_nearby || 18}
              </span>
            </div>
            <p className="text-xs font-extrabold text-emerald-950 leading-tight">
              {t('riskScreen.beneficialCount')}
            </p>
            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
              Active Natural Predators
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">🐛</span>
              <span className="text-xl font-black text-red-800">
                {riskData?.harmful_pest_count_nearby || 8}
              </span>
            </div>
            <p className="text-xs font-extrabold text-red-950 leading-tight">
              {t('riskScreen.pestCount')}
            </p>
            <span className="text-[10px] text-red-700 font-bold block mt-0.5">
              Nearby Harmful Sightings
            </span>
          </div>
        </div>

        {/* Safe Spraying Recommendation Banner */}
        <div className="p-4 rounded-2xl bg-teal-900 text-white shadow-md border-2 border-teal-950 mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>{t('riskScreen.safeSprayWindow')}</span>
            </h4>
            <VoiceButton
              text={riskData?.pollinator_safe_window}
              className="py-1 px-2 text-xs bg-teal-800 text-teal-100 border-teal-700"
            />
          </div>
          <p className="text-sm font-bold text-teal-50 leading-snug">
            {riskData?.pollinator_safe_window}
          </p>
        </div>

        {/* Weather Context */}
        {riskData?.weather_context && (
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 mb-5">
            <span className="text-[10px] font-black uppercase text-stone-500 block mb-2">
              Hyper-local Agro-Weather & Pollinator Activity
            </span>
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-stone-700">
              <div className="flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-amber-500" />
                <span>{riskData.weather_context.temperature_c}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>{riskData.weather_context.humidity_pct}% Humidity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wind className="w-4 h-4 text-teal-500" />
                <span>{riskData.weather_context.wind_speed_kmh} km/h</span>
              </div>
            </div>
            <p className="text-xs text-stone-600 mt-2 font-medium italic">
              "{riskData.weather_context.condition}"
            </p>
          </div>
        )}

        {/* Broadcast Alert Simulator Hook */}
        <div className="p-4 rounded-2xl bg-stone-100 border-2 border-stone-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-stone-700 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Simulate Farmer Group Alert</span>
            </span>
            <span className="text-[10px] font-bold text-stone-500">SMS / WhatsApp</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 bg-white"
              placeholder="Farmer phone number"
            />
            <button
              onClick={handleBroadcast}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>

          {broadcastSent && (
            <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{t('riskScreen.broadcastSent')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
