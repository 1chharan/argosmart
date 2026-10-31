import React, { useState, useRef } from 'react';
import { Sprout, Camera, AlertTriangle, ShieldAlert, ArrowLeft, RefreshCw, CheckCircle2, Volume2, Sparkles } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import VoiceButton from './VoiceButton';
import { api } from '../services/api';

export default function PlantDoctorScreen({ onBack }) {
  const { t, lang, speakText } = useLanguage();

  const [selectedCrop, setSelectedCrop] = useState('Paddy');
  const [symptoms, setSymptoms] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState(null);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSimulatedPreset = (presetKey = 'blast') => {
    const presets = {
      blast: {
        crop: 'Paddy',
        photo: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
        name: 'blast_paddy_leaf.jpg'
      },
      curl: {
        crop: 'Chilli',
        photo: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80',
        name: 'chilli_leaf_curl.jpg'
      },
      tikka: {
        crop: 'Groundnut',
        photo: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
        name: 'groundnut_tikka.jpg'
      }
    };
    const p = presets[presetKey] || presets.blast;
    setSelectedCrop(p.crop);
    setPreviewUrl(p.photo);
    setSelectedFile(new File([new Blob(['sample'])], p.name, { type: 'image/jpeg' }));
  };

  const handleDiagnose = async () => {
    if (!selectedFile && !previewUrl) {
      alert('Please upload or take a leaf photo first / దయచేసి ఆకు ఫోటో తీయండి');
      return;
    }

    setIsDiagnosing(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('crop_name', selectedCrop);
      formData.append('symptoms', symptoms);

      const res = await api.diagnosePlant(formData);
      setDiagnosisResult(res);

      // Speak diagnosis and warning
      const diagName = res[`diagnosis_name_${lang}`] || res.diagnosis_name_en;
      const warning = res[`pollinator_warning_${lang}`] || res.pollinator_warning_en;
      speakText(`${diagName}. ${warning}`);
    } catch (err) {
      console.error('Diagnosis failed', err);
    } finally {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('home')}</span>
        </button>
        <VoiceButton
          text="మొక్కల వైద్యుడు స్క్రీన్‌కు స్వాగతం. రోగం లేదా మచ్చలు ఉన్న ఆకు ఫోటోను ఇక్కడ అప్‌లోడ్ చేసి సహజ పరిష్కారం పొందండి."
        />
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-stone-200">
        <div className="mb-4">
          <h2 className="text-xl font-black text-stone-900 leading-tight">
            {t('doctorScreen.title')}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            {t('doctorScreen.subtitle')}
          </p>
        </div>

        {/* Leaf Photo Upload Box */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="relative rounded-2xl overflow-hidden border-3 border-lime-600 bg-stone-900 aspect-16/9 flex items-center justify-center mb-3">
            <img src={previewUrl} alt="Leaf Preview" className="w-full h-full object-cover" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/75 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" /> Change Photo
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-3 border-dashed border-lime-400 bg-lime-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all active:scale-99 mb-3"
          >
            <div className="w-16 h-16 mx-auto mb-3 bg-lime-700 text-white rounded-2xl flex items-center justify-center shadow-md">
              <Sprout className="w-9 h-9" />
            </div>
            <p className="text-base font-extrabold text-stone-900">
              {t('doctorScreen.cropProblemPhoto')}
            </p>
            <p className="text-xs text-lime-900 font-semibold mt-1">
              Tap to take or choose diseased leaf photo
            </p>
          </div>
        )}

        {/* Demo leaf presets */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-bold text-stone-500 uppercase">Sample Leaves:</span>
          <button
            type="button"
            onClick={() => handleSimulatedPreset('blast')}
            className="px-2.5 py-1 bg-lime-100 hover:bg-lime-200 text-lime-900 text-xs font-bold rounded-lg border border-lime-300"
          >
            🌾 Rice Blast
          </button>
          <button
            type="button"
            onClick={() => handleSimulatedPreset('curl')}
            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg border border-amber-300"
          >
            🌶️ Chilli Leaf Curl
          </button>
          <button
            type="button"
            onClick={() => handleSimulatedPreset('tikka')}
            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-900 text-xs font-bold rounded-lg border border-stone-300"
          >
            🥜 Groundnut Tikka
          </button>
        </div>

        {/* Crop Pills */}
        <div className="space-y-1.5 mb-4">
          <label className="text-xs font-black uppercase tracking-wider text-stone-600 block">
            {t('uploadScreen.cropLabel')}: <span className="text-lime-800">{selectedCrop}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {['Paddy', 'Chilli', 'Cotton', 'Maize', 'Groundnut', 'Tomato'].map(crop => (
              <button
                key={crop}
                type="button"
                onClick={() => setSelectedCrop(crop)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 transition-all ${
                  selectedCrop === crop
                    ? 'bg-lime-800 text-white border-lime-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleDiagnose}
          disabled={isDiagnosing}
          className="w-full btn-farmer bg-lime-700 hover:bg-lime-800 text-white text-lg font-black shadow-lg border-2 border-lime-900 disabled:opacity-50"
        >
          {isDiagnosing ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              {t('doctorScreen.diagnosing')}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              {t('doctorScreen.diagnoseBtn')}
            </span>
          )}
        </button>

        {/* Diagnosis Results Card */}
        {diagnosisResult && (
          <div className="mt-6 space-y-4 animate-in fade-in">
            {/* Pollinator Safety Warning Banner (CRITICAL REQUIREMENT) */}
            <div className="p-4 rounded-2xl bg-amber-500 text-amber-950 border-3 border-amber-600 shadow-md">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-7 h-7 text-amber-950 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black uppercase tracking-wider">
                    {t('doctorScreen.pollinatorWarningTitle')}
                  </h4>
                  <p className="text-xs font-black mt-1 leading-relaxed">
                    {diagnosisResult[`pollinator_warning_${lang}`] || diagnosisResult.pollinator_warning_en}
                  </p>
                </div>
              </div>
            </div>

            {/* Disease Name & Confidence */}
            <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                    Severity: {diagnosisResult.severity}
                  </span>
                  <h3 className="text-lg font-black text-stone-900 mt-1">
                    {diagnosisResult[`diagnosis_name_${lang}`] || diagnosisResult.diagnosis_name_en}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-stone-900">
                    {diagnosisResult.confidence}%
                  </span>
                  <p className="text-[10px] font-bold text-stone-500 uppercase">Match</p>
                </div>
              </div>
              <p className="text-xs text-stone-600 font-medium leading-relaxed">
                {diagnosisResult[`explanation_${lang}`] || diagnosisResult.explanation_en}
              </p>
            </div>

            {/* Low-Cost Organic Treatment Steps */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{t('doctorScreen.organicRemedy')}</span>
                </h4>
                <VoiceButton
                  text={diagnosisResult.organic_treatment_steps.join('. ')}
                  className="py-1 px-2.5 text-xs"
                />
              </div>

              <div className="space-y-2">
                {diagnosisResult.organic_treatment_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-emerald-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-bold text-stone-800 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
