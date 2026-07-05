// Clave única para guardar el perfil activo durante la sesión del navegador.
const sessionProfileKey = 'eventhub-active-profile';
const sessionProfileChangeEvent = 'eventhub-active-profile-change';
const sessionAttendingEventsKey = 'eventhub-attending-events';
const sessionAttendingEventsChangeEvent = 'eventhub-attending-events-change';

let cachedProfileValue;
let cachedProfile;
let cachedAttendingEventsValue;
let cachedAttendingEvents;
const emptyAttendingEvents = [];

function getProfileStorageKey(profile) {
  if (!profile) {
    return 'anonymous';
  }

  return [profile.alias, profile.number].filter(Boolean).join('-') || 'active';
}

function getEventsForActiveProfile(eventsByProfile) {
  const activeProfile = getActiveProfile();
  const profileKey = getProfileStorageKey(activeProfile);
  const profileEvents = eventsByProfile?.[profileKey];

  return Array.isArray(profileEvents) ? profileEvents : emptyAttendingEvents;
}

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

export function clearActiveProfile() {
  // Cierra la sesión de perfil y avisa a los componentes suscritos.
  if (typeof window === 'undefined') {
    return;
  }

  cachedProfileValue = null;
  cachedProfile = null;
  window.sessionStorage.removeItem(sessionProfileKey);
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
    if (
      event.type === sessionProfileChangeEvent ||
      event.key === sessionProfileKey
    ) {
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

export function getAttendingEvents() {
  if (typeof window === 'undefined') {
    return emptyAttendingEvents;
  }

  try {
    const storedEvents = window.sessionStorage.getItem(sessionAttendingEventsKey);

    if (storedEvents === cachedAttendingEventsValue) {
      return getEventsForActiveProfile(cachedAttendingEvents);
    }

    cachedAttendingEventsValue = storedEvents;
    cachedAttendingEvents = storedEvents ? JSON.parse(storedEvents) : {};

    return getEventsForActiveProfile(cachedAttendingEvents);
  } catch {
    cachedAttendingEventsValue = null;
    cachedAttendingEvents = {};
    return emptyAttendingEvents;
  }
}

export function saveAttendingEvent(event) {
  // Guarda reservas por perfil para que cada iniciado vea solo su agenda.
  if (typeof window === 'undefined' || !event) {
    return emptyAttendingEvents;
  }

  const activeProfile = getActiveProfile();
  const profileKey = getProfileStorageKey(activeProfile);
  const storedEvents = getAttendingEvents();
  const eventId = event.id || event.title;
  const eventExists = storedEvents.some(
    (storedEvent) => (storedEvent.id || storedEvent.title) === eventId,
  );
  const nextProfileEvents = eventExists ? storedEvents : [...storedEvents, event];

  cachedAttendingEvents = {
    ...(cachedAttendingEvents || {}),
    [profileKey]: nextProfileEvents,
  };
  cachedAttendingEventsValue = JSON.stringify(cachedAttendingEvents);

  window.sessionStorage.setItem(
    sessionAttendingEventsKey,
    cachedAttendingEventsValue,
  );
  window.dispatchEvent(new Event(sessionAttendingEventsChangeEvent));

  return nextProfileEvents;
}

export function subscribeAttendingEvents(callback) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorageChange = (event) => {
    if (
      event.type === sessionAttendingEventsChangeEvent ||
      event.key === sessionAttendingEventsKey ||
      event.type === sessionProfileChangeEvent ||
      event.key === sessionProfileKey
    ) {
      callback();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener(sessionAttendingEventsChangeEvent, handleStorageChange);
  window.addEventListener(sessionProfileChangeEvent, handleStorageChange);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener(
      sessionAttendingEventsChangeEvent,
      handleStorageChange,
    );
    window.removeEventListener(sessionProfileChangeEvent, handleStorageChange);
  };
}
