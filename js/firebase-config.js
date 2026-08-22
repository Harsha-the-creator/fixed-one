let configPromise;

export function loadFirebaseConfig() {
  if (!configPromise) {
    const endpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? '/api/firebase-config'
      : '/.netlify/functions/firebase-config';

    configPromise = fetch(endpoint, { cache: 'no-store' }).then(async response => {
      if (!response.ok) {
        throw new Error(`Firebase configuration request failed with status ${response.status}`);
      }

      const config = await response.json();
      if (Object.values(config).some(value => !value)) {
        throw new Error('Firebase configuration is incomplete');
      }

      return config;
    });
  }

  return configPromise;
}