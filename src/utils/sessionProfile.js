// Clave única para guardar el perfil activo durante la sesión del navegador.
const sessionProfileKey = 'eventhub-active-profile';
const sessionProfileChangeEvent = 'eventhub-active-profile-change';

let cachedProfileValue;
let cachedProfile;

export function saveActiveProfile(profile) {
  // En SSR no existe window; esta guarda solo debe ejecutarse en navegador.
  if (typeof window === 'undefined' || !profile) {
    return;
  }

  // sessionStorage mantiene el perfil hasta cerrar la pestaña o el navegador.
  cachedProfileValue = JSON.stringify(profile);
  cachedProfile = profile;
  window.sessionStorage.setItem(sessionProfileKey, cachedProfileValue);
  window.dispatchEvent(new Event(sessionProfileChangeEvent));
}

export function getActiveProfile() {
  // Evita errores cuando React renderiza en servidor.
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedProfile = window.sessionStorage.getItem(sessionProfileKey);

    if (storedProfile === cachedProfileValue) {
      return cachedProfile;
    }

    cachedProfileValue = storedProfile;
    cachedProfile = storedProfile ? JSON.parse(storedProfile) : null;

    // Si no hay perfil guardado, page-event simplemente no muestra insignia.
    return cachedProfile;
  } catch {
    // Si el JSON estuviera corrupto, ignoramos el dato y seguimos sin perfil.
    cachedProfileValue = null;
    cachedProfile = null;
    return null;
  }
}

export function subscribeActiveProfile(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorageChange = (event) => {
    if (event.type === sessionProfileChangeEvent || event.key === sessionProfileKey) {
      callback();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener(sessionProfileChangeEvent, handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener(sessionProfileChangeEvent, handleStorageChange);
  };
}
