const OFFLINE_QUEUE_KEY = 'agrosmart_offline_sightings';
const LEGACY_QUEUE_KEY = 'kisanmitra_offline_sightings';

export const getOfflineSightings = () => {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY) || localStorage.getItem(LEGACY_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline sightings', e);
    return [];
  }
};

const notifyUpdate = () => {
  window.dispatchEvent(new Event('agrosmart_storage_update'));
  notifyUpdate();
};

export const saveOfflineSighting = (sighting) => {
  const current = getOfflineSightings();
  const newItem = {
    ...sighting,
    id: `offline_${Date.now()}`,
    is_synced: false,
    created_at: new Date().toISOString()
  };
  current.unshift(newItem);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(current));
  notifyUpdate();
  return newItem;
};

export const removeOfflineSighting = (offlineId) => {
  const current = getOfflineSightings().filter(item => item.id !== offlineId);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(current));
  notifyUpdate();
};

export const syncOfflineQueue = async (apiBaseUrl = 'http://localhost:8000/api/v1') => {
  const pending = getOfflineSightings().filter(item => !item.is_synced);
  if (pending.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const formData = new FormData();
      // If photo is a base64 or blob URL, create blob
      if (item.photo_blob) {
        formData.append('file', item.photo_blob, 'offline_sighting.jpg');
      } else {
        // Mock fallback file
        const blob = new Blob(['sample'], { type: 'image/jpeg' });
        formData.append('file', blob, 'offline_sighting.jpg');
      }
      formData.append('crop_name', item.crop_name || 'Cotton');
      formData.append('latitude', item.latitude || 17.9689);
      formData.append('longitude', item.longitude || 79.5941);
      formData.append('village', item.village || 'Warangal');
      formData.append('notes', item.notes || '');
      formData.append('is_offline_sync', 'true');

      const res = await fetch(`${apiBaseUrl}/sightings/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        removeOfflineSighting(item.id);
        synced++;
      } else {
        failed++;
      }
    } catch (e) {
      console.warn('Sync failed for item', item.id, e);
      failed++;
    }
  }

  notifyUpdate();
  return { synced, failed };
};
