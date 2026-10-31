import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, HelpCircle, ArrowLeft, Volume2, ShieldCheck, MapPin, Sparkles, Camera, Info } from 'lucide-react';
import { useLanguage } from '../services/i18n';
import VoiceButton from './VoiceButton';
import { getSpeciesIllustration, resolvePhotoUrl } from '../services/insectImages';

export default function ResultScreen({ sighting, aiResult, onBackHome, onNavigateMap }) {
  const { t, lang, speakText } = useLanguage();

  const isNoInsect = Boolean(aiResult?.no_insect_detected);
  const isMixed = Boolean(aiResult?.is_mixed_detection || aiResult?.detected_insects?.length > 1);
  const detectedList = aiResult?.detected_insects || aiResult?.top_predictions || [];

  const top = detectedList[0] || {
    species_id: 1,
    scientific_name: 'Apis cerana indica',
    common_name_en: 'Indian Honeybee',
    common_name_te: 'తేనెటీగ',
    common_name_hi: 'भारतीय मधुमक्खी',
    confidence: 94.2,
    category: 'helpful',
    eco_tip_en: 'This bee pollinates your crops and boosts yield. Avoid spraying chemicals today!',
    eco_tip_te: 'ఈ తేనెటీగ మీ పంటలో పరాగసంపర్కం చేసి దిగుబడిని పెంచుతుంది. ఈ రోజు రసాయన మందులు చల్లవద్దు!',
    eco_tip_hi: 'यह मधुमक्खी परागण कर पैदावार बढ़ाती है। आज रासायनिक कीटनाशक न छिड़कें!'
  };

  const isLowConf = Boolean(top.confidence < 60.0 || aiResult?.requires_expert_review);

  const mixedAdvice = isMixed ? (
    aiResult?.[`mixed_ecological_advice_${lang}`] ||
    aiResult?.mixed_ecological_advice_en ||
    t('mixedBugs.ecoWarning')
  ) : null;

  const category = isNoInsect ? 'uncertain' : isMixed ? 'uncertain' : (top.category || aiResult?.primary_category || 'helpful').toLowerCase();

  // Auto-speak result on arrival
  useEffect(() => {
    if (isNoInsect) {
      speakText(aiResult?.voice_announcement_text?.[lang] || 'No insect detected in photo. Please take a closer photo with good lighting.');
    } else if (isMixed && mixedAdvice) {
      speakText(mixedAdvice);
    } else if (aiResult?.voice_announcement_text?.[lang]) {
      speakText(aiResult.voice_announcement_text[lang]);
    } else {
      const tip = top[`eco_tip_${lang}`] || top.eco_tip_en;
      speakText(tip);
    }
  }, [isMixed, isNoInsect]);

  const categoryThemes = {
    helpful: {
      badgeBg: 'bg-emerald-700 text-white',
      cardBg: 'bg-emerald-50/80 border-emerald-500 text-emerald-950',
      icon: CheckCircle,
      label: t('categories.helpful'),
      symbol: '🐝',
      borderColor: 'border-emerald-600'
    },
    harmful: {
      badgeBg: 'bg-red-700 text-white',
      cardBg: 'bg-red-50/80 border-red-500 text-red-950',
      icon: AlertTriangle,
      label: t('categories.harmful'),
      symbol: '🐛',
      borderColor: 'border-red-600'
    },
    uncertain: {
      badgeBg: 'bg-amber-600 text-white',
      cardBg: 'bg-amber-50/80 border-amber-500 text-amber-950',
      icon: HelpCircle,
      label: isMixed ? t('mixedBugs.title') : t('categories.uncertain'),
      symbol: isMixed ? '🌾' : '❓',
      borderColor: 'border-amber-600'
    }
  };

  const theme = categoryThemes[category] || categoryThemes.uncertain;
  const tipText = top[`eco_tip_${lang}`] || top.eco_tip_en;
  const commonName = top[`common_name_${lang}`] || top.common_name_en;

  // Resolve farmer photo & fallback illustration
  const farmerPhotoSrc = resolvePhotoUrl(sighting?.photo_url, top.species_id);
  const refIllustrationSrc = getSpeciesIllustration(top.species_id, commonName);

  return (
    <div className="space-y-5 pb-44 animate-in fade-in">
      {/* Top Bar with Home action & Listen button */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBackHome}
          className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-sm shadow-xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('resultScreen.backHome')}</span>
        </button>
        <VoiceButton
          text={isNoInsect ? 'ఈ ఫోటోలో పురుగు కనిపించలేదు.' : isMixed ? mixedAdvice : tipText}
          className="min-h-[44px] px-4 py-2.5"
        />
      </div>

      {/* CASE 1: NO INSECT DETECTED */}
      {isNoInsect ? (
        <div className="rounded-3xl p-6 border-3 border-amber-400 bg-amber-50/90 shadow-lg text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm">
            🔍
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
            ఫోటోలో పురుగు కనిపించలేదు / No Insect Detected
          </h2>
          <p className="text-sm font-bold text-stone-700 leading-relaxed max-w-md mx-auto">
            {aiResult?.voice_announcement_text?.[lang] || 'Please take a clear, close-up photograph of the insect on the crop in good natural light.'}
          </p>

          <div className="bg-white p-4 rounded-2xl border-2 border-amber-300 text-left space-y-2">
            <span className="text-xs font-black uppercase text-amber-900 block">💡 Tips for a good photo:</span>
            <ul className="text-xs font-bold text-stone-700 space-y-1 list-disc list-inside">
              <li>Get close (10–20 cm) to the leaf or bug.</li>
              <li>Hold camera steady to avoid motion blur.</li>
              <li>Ensure daylight or clear lighting.</li>
            </ul>
          </div>

          <button
            onClick={onBackHome}
            className="w-full min-h-[48px] btn-farmer bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base shadow-md"
          >
            <Camera className="w-5 h-5 mr-2" />
            మళ్లీ ఫోటో తీయండి / Take Photo Again
          </button>
        </div>
      ) : isMixed ? (
        /* CASE 2: MIXED INSECTS DETECTED (Dual Cards + Ecological Warning) */
        <div className="rounded-3xl p-5 sm:p-6 border-3 border-amber-500 bg-amber-50/80 shadow-lg space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500 text-amber-950 shadow-xs">
                🌾 {t('mixedBugs.badge')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 leading-tight">
                {t('mixedBugs.title')}
              </h2>
            </div>
            <VoiceButton text={mixedAdvice} className="min-h-[44px] px-3.5 py-2" />
          </div>

          <p className="text-xs sm:text-sm text-stone-700 font-bold leading-relaxed">
            {t('mixedBugs.subtitle')}
          </p>

          {/* Farmer's Uploaded Photo in Fixed Aspect Container with fallback */}
          <div className="w-full aspect-16/9 sm:aspect-2/1 rounded-2xl overflow-hidden border-3 border-amber-300 bg-stone-900 relative shadow-inner">
            <img
              src={farmerPhotoSrc}
              alt="Mixed field photo"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = INSECT_LOCAL_IMAGES.mixed;
              }}
              className="w-full h-full object-cover"
            />
            {/* Visual Overlays */}
            <div className="absolute top-2 left-2 bg-emerald-950/90 text-white text-[11px] font-black px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-md">
              🟢 1. {detectedList[0]?.[`common_name_${lang}`] || detectedList[0]?.common_name_en} ({detectedList[0]?.confidence}%)
            </div>
            <div className="absolute bottom-2 right-2 bg-red-950/90 text-white text-[11px] font-black px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-md">
              🔴 2. {detectedList[1]?.[`common_name_${lang}`] || detectedList[1]?.common_name_en} ({detectedList[1]?.confidence}%)
            </div>
          </div>

          {/* Dual Species Cards side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Bug 1 (Helpful) */}
            {detectedList[0] && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white">
                      🟢 Helpful Insect
                    </span>
                    <span className="text-lg font-black text-emerald-950">
                      {detectedList[0].confidence}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 my-2">
                    <img
                      src={getSpeciesIllustration(detectedList[0].species_id, detectedList[0].common_name_en)}
                      alt="Ref"
                      className="w-14 h-14 rounded-xl border border-emerald-300 p-1 bg-white object-contain shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-black text-stone-900 leading-tight">
                        {detectedList[0][`common_name_${lang}`] || detectedList[0].common_name_en}
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-800 uppercase mt-0.5">
                        {detectedList[0].scientific_name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-stone-700 leading-relaxed break-words whitespace-normal mt-1">
                    {detectedList[0][`eco_tip_${lang}`] || detectedList[0].eco_tip_en}
                  </p>
                </div>
              </div>
            )}

            {/* Bug 2 (Harmful) */}
            {detectedList[1] && (
              <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-400 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase px-2.5 py-1 rounded-full bg-red-600 text-white">
                      🔴 Harmful Pest
                    </span>
                    <span className="text-lg font-black text-red-950">
                      {detectedList[1].confidence}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 my-2">
                    <img
                      src={getSpeciesIllustration(detectedList[1].species_id, detectedList[1].common_name_en)}
                      alt="Ref"
                      className="w-14 h-14 rounded-xl border border-red-300 p-1 bg-white object-contain shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-black text-stone-900 leading-tight">
                        {detectedList[1][`common_name_${lang}`] || detectedList[1].common_name_en}
                      </h3>
                      <p className="text-[11px] font-bold text-red-800 uppercase mt-0.5">
                        {detectedList[1].scientific_name}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-stone-700 leading-relaxed break-words whitespace-normal mt-1">
                    {detectedList[1][`eco_tip_${lang}`] || detectedList[1].eco_tip_en}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Ecological Decision Rule Banner */}
          <div className="p-4 rounded-2xl bg-amber-500 text-amber-950 border-3 border-amber-600 shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-950 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  ⚠️ ECOLOGICAL DECISION: AVOID CHEMICAL SPRAYING TODAY
                </h4>
                <p className="text-sm font-black mt-1 leading-snug break-words whitespace-normal">
                  {mixedAdvice}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CASE 3: SINGLE INSECT RESULT CARD */
        <div className={`rounded-3xl p-5 sm:p-6 border-3 shadow-lg ${theme.cardBg} ${theme.borderColor}`}>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">{theme.symbol}</span>
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs ${theme.badgeBg}`}>
                  {theme.label}
                </span>
                <p className="text-xs font-bold text-stone-600 mt-1">
                  {top.scientific_name}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-stone-950 leading-none block">
                {top.confidence}%
              </span>
              <p className="text-[11px] font-black uppercase text-stone-600 tracking-wider">
                {t('resultScreen.confidence')}
              </p>
            </div>
          </div>

          {/* Big Common Name in Farmer's Language */}
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight mb-4">
            {commonName}
          </h2>

          {/* Image Display: Farmer's Photo + Reference Comparison Thumbnail */}
          <div className="relative mb-4">
            {/* Main Farmer Photo in fixed aspect ratio container */}
            <div className="w-full aspect-16/9 sm:aspect-2/1 rounded-2xl overflow-hidden border-2 border-stone-300 bg-stone-900 relative shadow-sm">
              <img
                src={farmerPhotoSrc}
                alt={commonName}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = refIllustrationSrc;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-lg">
                📸 మీ ఫోటో / Your Field Photo
              </div>
            </div>

            {/* Reference Species Thumbnail Badge in bottom corner */}
            <div className="absolute -bottom-3 right-3 bg-white rounded-2xl border-2 border-emerald-500 p-1.5 shadow-lg flex items-center gap-2">
              <img
                src={refIllustrationSrc}
                alt="Species Reference"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-contain bg-stone-50"
              />
              <div className="pr-2 hidden xs:block">
                <span className="text-[10px] font-black text-emerald-800 uppercase block">Reference Guide</span>
                <span className="text-xs font-black text-stone-900 block truncate max-w-[110px]">{commonName}</span>
              </div>
            </div>
          </div>

          {/* Farmer Advice Box with complete text wrapping */}
          <div className="p-4 rounded-2xl bg-white border-2 border-stone-200 shadow-xs mb-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <span>🌾</span> {t('resultScreen.actionTip')}
              </span>
              <VoiceButton text={tipText} className="min-h-[44px] px-3.5 py-2 text-xs" />
            </div>
            <p className="text-base sm:text-lg font-extrabold text-stone-900 leading-relaxed break-words whitespace-normal">
              {tipText}
            </p>
          </div>

          {/* Low Confidence Warning / Expert Queue Notice */}
          {isLowConf ? (
            <div className="flex items-start gap-2.5 p-3.5 bg-amber-100 border-2 border-amber-300 rounded-2xl text-amber-950 text-xs sm:text-sm font-bold shadow-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-800 mt-0.5" />
              <div>
                <span className="font-black block uppercase text-[11px] text-amber-800">
                  {top.confidence < 60.0 ? 'Low Confidence (<60%)' : 'Under Review'}
                </span>
                <span className="break-words whitespace-normal">
                  {t('resultScreen.expertNotice')} (Sent to KVK scientist queue for verification).
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-100 border-2 border-emerald-300 rounded-2xl text-emerald-950 text-xs sm:text-sm font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-700" />
              <span>High confidence AI match ({top.confidence}%).</span>
            </div>
          )}
        </div>
      )}

      {/* Honest AI Transfer Learning Disclaimer (Requirement 7) */}
      <div className="p-3 bg-stone-100 border border-stone-300 rounded-2xl flex items-center gap-2 text-stone-600 text-xs font-bold">
        <Info className="w-4 h-4 shrink-0 text-stone-500" />
        <span className="break-words whitespace-normal">
          {aiResult?.[`disclaimer_note_${lang}`] || "ℹ️ AI suggestion based on transfer learning. An agricultural expert will verify this record."}
        </span>
      </div>

      {/* Other Predictions Breakdown if available */}
      {aiResult?.top_predictions?.length > 1 && !isMixed && (
        <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-stone-200">
          <h3 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-3">
            {t('resultScreen.otherPossibilities')}
          </h3>
          <div className="space-y-2.5">
            {aiResult.top_predictions.slice(1).map((pred, idx) => {
              const pName = pred[`common_name_${lang}`] || pred.common_name_en;
              return (
                <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-extrabold text-stone-900">{pName}</span>
                    <span className="text-xs font-black text-stone-700">{pred.confidence}%</span>
                  </div>
                  <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Bottom Actions */}
      <div className="space-y-3 pt-2">
        <button
          onClick={onNavigateMap}
          className="w-full min-h-[56px] btn-farmer bg-teal-700 hover:bg-teal-800 text-white text-base font-black shadow-md border-2 border-teal-900 active:scale-98"
        >
          <MapPin className="w-5 h-5 mr-2" />
          {t('mapScreen.title')}
        </button>

        <button
          onClick={onBackHome}
          className="w-full min-h-[56px] btn-farmer bg-stone-200 hover:bg-stone-300 text-stone-900 text-base font-black border-2 border-stone-300 active:scale-98"
        >
          {t('resultScreen.backHome')}
        </button>
      </div>
    </div>
  );
}
