// En production, le site et l'API sont sur deux domaines différents.
// VITE_API_URL (fixée au build) préfixe tous les appels « /api/... » ; en développement
// elle est vide et le proxy Vite transmet /api au backend local.
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (path) => (API_URL && path.startsWith('/api') ? API_URL + path : path);

// Jeton expiré ou invalide côté voyageur : on prévient l'application pour qu'elle
// déconnecte proprement. Les routes admin (jeton distinct) et de connexion sont exclues.
const SESSION_ERRORS = /token|unauthorized|user not found/i;
const isUserApi = (path) =>
  path.startsWith('/api') && !path.startsWith('/api/admin') && !/\/(login|register|auth)/.test(path);

const nativeFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  const path = typeof input === 'string' ? input : '';
  const res = await nativeFetch(typeof input === 'string' ? apiUrl(input) : input, init);
  const hasToken = Boolean(init?.headers?.Authorization);
  if (hasToken && isUserApi(path) && (res.status === 401 || res.status === 403)) {
    const body = await res.clone().json().catch(() => ({}));
    if (SESSION_ERRORS.test(body.error || '')) window.dispatchEvent(new Event('session-expired'));
  }
  return res;
};
