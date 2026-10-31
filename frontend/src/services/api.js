const API_BASE = 'http://localhost:8000/api/v1';

export const api = {
  // Auth
  login: async (phone, role = 'farmer') => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, role })
    });
    return res.json();
  },

  // Sightings
  getSightings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/sightings?${query}`);
    return res.json();
  },

  getNearbySightings: async (lat, lon, radiusKm = 15) => {
    const res = await fetch(`${API_BASE}/sightings/nearby?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`);
    return res.json();
  },

  getSeasonalStats: async (speciesId = null, cropName = null) => {
    let url = `${API_BASE}/sightings/stats/seasonal`;
    const params = new URLSearchParams();
    if (speciesId) params.append('species_id', speciesId);
    if (cropName) params.append('crop_name', cropName);
    if (params.toString()) url += `?${params.toString()}`;
    const res = await fetch(url);
    return res.json();
  },

  uploadSighting: async (formData) => {
    const res = await fetch(`${API_BASE}/sightings/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // Species
  getSpecies: async () => {
    const res = await fetch(`${API_BASE}/species`);
    return res.json();
  },

  // Plant Doctor
  diagnosePlant: async (formData) => {
    const res = await fetch(`${API_BASE}/plant-doctor/diagnose`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  // Risk Intelligence
  getRiskStatus: async (lat = 18.0673, lon = 79.5484, village = 'Hasanparthy, Warangal') => {
    const res = await fetch(`${API_BASE}/risk/status?lat=${lat}&lon=${lon}&village=${encodeURIComponent(village)}`);
    return res.json();
  },

  broadcastAlert: async (phone, alertMessage, channel = 'whatsapp') => {
    const res = await fetch(`${API_BASE}/risk/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, alert_message: alertMessage, channel })
    });
    return res.json();
  },

  // Assistant
  askAssistant: async (message, language = 'te', lat = null, lon = null) => {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language, latitude: lat, longitude: lon })
    });
    return res.json();
  },

  // Expert Verification
  getExpertQueue: async (status = 'pending') => {
    const res = await fetch(`${API_BASE}/expert/queue?status=${status}`);
    return res.json();
  },

  verifySighting: async (sightingId, confirmedSpeciesId, notes = '', isApproved = true) => {
    const res = await fetch(`${API_BASE}/expert/verify/${sightingId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmed_species_id: confirmedSpeciesId,
        expert_notes: notes,
        is_approved: isApproved
      })
    });
    return res.json();
  },

  getExpertMetrics: async () => {
    const res = await fetch(`${API_BASE}/expert/metrics`);
    return res.json();
  },

  // Export URLs
  getExportGeoJsonUrl: () => `${API_BASE}/export/geojson`,
  getExportCsvUrl: () => `${API_BASE}/export/csv`
};
