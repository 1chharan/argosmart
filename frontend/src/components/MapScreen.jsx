import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Filter, Download, Calendar, MapPin, Layers, RefreshCw, Volume2 } from 'lucide-react';
import L from 'leaflet';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useLanguage } from '../services/i18n';
import VoiceButton from './VoiceButton';
import { api } from '../services/api';

export default function MapScreen({ onBack }) {
  const { t, lang, speakText } = useLanguage();

  const [sightings, setSightings] = useState([]);
  const [seasonalData, setSeasonalData] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Load sightings and seasonal stats
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedCrop) params.crop_name = selectedCrop;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedMonth) params.month = selectedMonth;
      if (selectedVillage) params.village = selectedVillage;

      const [sightingsRes, statsRes] = await Promise.all([
        api.getSightings(params),
        api.getSeasonalStats(null, selectedCrop || null)
      ]);

      setSightings(sightingsRes || []);
      setSeasonalData(statsRes?.seasonal_distribution || []);
    } catch (err) {
      console.error('Failed to load map sightings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCrop, selectedCategory, selectedMonth, selectedVillage]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [18.0673, 79.5484], // Warangal heartland center
        zoom: 10,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;
    }
  }, []);

  // Update Markers on Sightings Change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (sightings.length === 0) return;

    const bounds = L.latLngBounds();

    sightings.forEach((s) => {
      const isHelpful = s.category === 'helpful';
      const isHarmful = s.category === 'harmful';
      const pinColor = isHelpful ? '#16a34a' : isHarmful ? '#dc2626' : '#d97706';
      const emoji = isHelpful ? '🐝' : isHarmful ? '🐛' : '❓';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background-color: ${pinColor}; width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35); font-size: 16px; cursor: pointer;">${emoji}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });

      const sp = s.species || s.ai_species;
      const spName = sp ? (sp[`common_name_${lang}`] || sp.common_name_en) : 'Insect';
      const tip = sp ? (sp[`eco_tip_${lang}`] || sp.eco_tip_en) : '';

      const marker = L.marker([s.latitude, s.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; min-width: 180px; padding: 4px;">
          <div style="font-size: 11px; font-weight: 800; color: ${pinColor}; text-transform: uppercase;">
            ${isHelpful ? 'Helpful Insect' : isHarmful ? 'Harmful Pest' : 'Under Review'}
          </div>
          <div style="font-size: 14px; font-weight: 800; color: #1c1917; margin: 2px 0;">
            ${spName}
          </div>
          <div style="font-size: 11px; color: #78716c; margin-bottom: 6px;">
            🌾 ${s.crop_name || 'Crop'} • 📍 ${s.village || 'Field'}
          </div>
          <div style="font-size: 12px; line-height: 1.3; color: #292524; background: #f5f5f4; padding: 6px; border-radius: 6px;">
            ${tip}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      markersLayerRef.current.addLayer(marker);
      bounds.extend([s.latitude, s.longitude]);
    });

    if (sightings.length > 0 && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [sightings, lang]);

  return (
    <div className="space-y-4 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('home')}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Export Buttons */}
          <a
            href={api.getExportGeoJsonUrl()}
            download="agrosmart_sightings.geojson"
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl border border-stone-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GeoJSON</span>
          </a>
          <a
            href={api.getExportCsvUrl()}
            download="agrosmart_sightings.csv"
            className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl border border-stone-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </a>
          <VoiceButton
            text="రుతువుల మ్యాప్ లో మీ ప్రాంతంలో తేనెటీగలు మరియు చీడపీడల సంచారం కనిపిస్తుంది. పైనున్న ఫిల్టర్ల ద్వారా పంటను లేదా నెలను ఎంచుకోవచ్చు."
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-md border-2 border-stone-200">
        <div className="mb-4">
          <h2 className="text-xl font-black text-stone-900 leading-tight">
            {t('mapScreen.title')}
          </h2>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            {t('mapScreen.subtitle')}
          </p>
        </div>

        {/* High-Contrast Farmer Filter Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {/* Crop Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-stone-500 block mb-1">
              {t('mapScreen.filterByCrop')}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border-2 border-stone-200 text-xs font-bold text-stone-800 bg-stone-50 focus:border-emerald-600"
            >
              <option value="">All Crops (అన్నీ)</option>
              {['Cotton', 'Chilli', 'Paddy', 'Maize', 'Groundnut', 'Mustard', 'Tomato'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-stone-500 block mb-1">
              {t('mapScreen.filterByCategory')}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border-2 border-stone-200 text-xs font-bold text-stone-800 bg-stone-50 focus:border-emerald-600"
            >
              <option value="">All Types (అన్నీ)</option>
              <option value="helpful">🟢 Helpful (మిత్ర పురుగు)</option>
              <option value="harmful">🔴 Harmful (శత్రు పురుగు)</option>
              <option value="uncertain">🟡 Uncertain (సందేహం)</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-stone-500 block mb-1">
              {t('mapScreen.filterByMonth')}
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border-2 border-stone-200 text-xs font-bold text-stone-800 bg-stone-50 focus:border-emerald-600"
            >
              <option value="">All Months (అన్ని నెలలు)</option>
              {[
                { m: 1, name: 'Jan (జనవరి)' },
                { m: 2, name: 'Feb (ఫిబ్రవరి)' },
                { m: 3, name: 'Mar (మార్చి)' },
                { m: 4, name: 'Apr (ఏప్రిల్)' },
                { m: 5, name: 'May (మే)' },
                { m: 6, name: 'Jun (జూన్)' },
                { m: 7, name: 'Jul (జూలై)' },
                { m: 8, name: 'Aug (ఆగస్టు)' },
                { m: 9, name: 'Sep (సెప్టెంబరు)' },
                { m: 10, name: 'Oct (అక్టోబరు)' },
                { m: 11, name: 'Nov (నవంబరు)' },
                { m: 12, name: 'Dec (డిసెంబరు)' },
              ].map(item => (
                <option key={item.m} value={item.m}>{item.name}</option>
              ))}
            </select>
          </div>

          {/* Village Filter */}
          <div>
            <label className="text-[10px] font-black uppercase text-stone-500 block mb-1">
              Village (గ్రామం)
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border-2 border-stone-200 text-xs font-bold text-stone-800 bg-stone-50 focus:border-emerald-600"
            >
              <option value="">All Villages</option>
              {['Hasanparthy', 'Dharmasagar', 'Wardhannapet', 'Narsampet', 'Guntur', 'Tenali', 'Nizamabad', 'Nashik'].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div className="h-80 w-full rounded-2xl overflow-hidden border-2 border-stone-300 relative shadow-inner mb-6">
          <div ref={mapContainerRef} className="h-full w-full" />
          <div className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-xl shadow-md border border-stone-200 flex items-center gap-3 text-xs font-bold pointer-events-none">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Helpful
            </span>
            <span className="flex items-center gap-1 text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" /> Harmful
            </span>
          </div>
        </div>

        {/* Month-by-Month Calendar Distribution Chart (Recharts) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>{t('mapScreen.monthChartTitle')}</span>
            </h3>
            <span className="text-xs font-bold text-stone-500">
              {sightings.length} total observations
            </span>
          </div>

          <div className="h-64 w-full bg-stone-50 rounded-2xl p-2 border border-stone-200">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '2px solid #e5e5e5', fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="helpful" name="Helpful Insects 🐝" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="harmful" name="Harmful Pests 🐛" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
