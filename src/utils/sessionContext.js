import { createContext } from 'react';

export const emptySession = {
  accessGranted: false,
  profile: null,
  attendingEvents: [],
};

export const SessionContext = createContext({
  session: emptySession,
  refreshSession: async () => emptySession,
  replaceSession: () => {},
  clearSession: async () => emptySession,
  saveAttendingEvent: async () => emptySession.attendingEvents,
});

export function normalizeSession(session) {
  return {
    accessGranted: Boolean(session?.accessGranted),
    profile: session?.profile || null,
    attendingEvents: Array.isArray(session?.attendingEvents)
      ? session.attendingEvents
      : [],
  };
}

export function readBrowserSession() {
  if (typeof window === 'undefined') {
    return emptySession;
  }

  return normalizeSession(window.__MINIHUB_SESSION__);
}

export async function readSessionFromServer() {
  const response = await fetch('/api/session', {
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return emptySession;
  }

  const data = await response.json();

  return normalizeSession(data.session);
}
