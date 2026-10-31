/**
 * Local insect and disease illustrations mapping.
 * Eliminates external hotlinking/CORS failures and guarantees offline visual rendering.
 */

export const INSECT_LOCAL_IMAGES = {
  1: '/insects/honeybee.svg',
  2: '/insects/ladybird.svg',
  3: '/insects/lacewing.svg',
  4: '/insects/armyworm.svg',
  5: '/insects/whitefly.svg',
  6: '/insects/hoverfly.svg',
  7: '/insects/pod_borer.svg',
  8: '/insects/trichogramma.svg',
  mixed: '/insects/mixed_colony.svg',
  blast: '/insects/leaf_blast.svg',
  curl: '/insects/leaf_curl.svg',
  tikka: '/insects/tikka_spot.svg',
};

export const getSpeciesIllustration = (speciesId, nameOrHint = '') => {
  if (speciesId && INSECT_LOCAL_IMAGES[speciesId]) {
    return INSECT_LOCAL_IMAGES[speciesId];
  }
  const text = (nameOrHint || '').toLowerCase();
  if (text.includes('bee') || text.includes('apis') || text.includes('తేనె')) return INSECT_LOCAL_IMAGES[1];
  if (text.includes('lady') || text.includes('coccinella') || text.includes('సీతమ్మ')) return INSECT_LOCAL_IMAGES[2];
  if (text.includes('lace') || text.includes('chryso') || text.includes('పచ్చ')) return INSECT_LOCAL_IMAGES[3];
  if (text.includes('army') || text.includes('spodoptera') || text.includes('కత్తెర')) return INSECT_LOCAL_IMAGES[4];
  if (text.includes('white') || text.includes('bemisia') || text.includes('తెల్లదోమ')) return INSECT_LOCAL_IMAGES[5];
  if (text.includes('hover') || text.includes('flower') || text.includes('పూల')) return INSECT_LOCAL_IMAGES[6];
  if (text.includes('borer') || text.includes('helico') || text.includes('శనగ')) return INSECT_LOCAL_IMAGES[7];
  if (text.includes('tricho') || text.includes('wasp') || text.includes('కందిరీగ')) return INSECT_LOCAL_IMAGES[8];
  if (text.includes('mix') || text.includes('combo') || text.includes('multi')) return INSECT_LOCAL_IMAGES.mixed;
  if (text.includes('blast')) return INSECT_LOCAL_IMAGES.blast;
  if (text.includes('curl')) return INSECT_LOCAL_IMAGES.curl;
  if (text.includes('tikka')) return INSECT_LOCAL_IMAGES.tikka;

  return INSECT_LOCAL_IMAGES[1];
};

export const resolvePhotoUrl = (url, fallbackSpeciesId = 1) => {
  if (!url) return getSpeciesIllustration(fallbackSpeciesId);
  // If it's a backend relative upload, prepend backend host or use as is
  if (url.startsWith('/uploads/')) {
    return `http://localhost:8000${url}`;
  }
  return url;
};
