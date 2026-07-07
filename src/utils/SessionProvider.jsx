import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  emptySession,
  normalizeSession,
  readBrowserSession,
  readSessionFromServer,
  SessionContext,
} from './sessionContext';

export default function SessionProvider({ children, initialSession }) {
  // Estado en memoria de React: la fuente persistente es la cookie HttpOnly + servidor.
  const [session, setSession] = useState(() =>
    normalizeSession(initialSession || readBrowserSession()),
  );

  const replaceSession = useCallback((nextSession) => {
    setSession(normalizeSession(nextSession));
  }, []);

  const refreshSession = useCallback(async () => {
    const nextSession = await readSessionFromServer();

    setSession(nextSession);

    return nextSession;
  }, []);

  const clearSession = useCallback(async () => {
    const response = await fetch('/api/session', {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    const data = response.ok ? await response.json() : null;
    const nextSession = normalizeSession(data?.session);

    setSession(nextSession);

    return nextSession;
  }, []);

  const saveAttendingEvent = useCallback(async (event) => {
    // La reserva se guarda en la sesión del servidor, no en almacenamiento local.
    const response = await fetch('/api/session/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      // Enviamos solo el id; el servidor reconstruye el evento confiable desde Mongo.
      body: JSON.stringify({ eventId: event?.id }),
    });

    if (!response.ok) {
      throw new Error('Event reservation failed');
    }

    const data = await response.json();
    const nextSession = normalizeSession(data.session);

    setSession(nextSession);

    return nextSession.attendingEvents;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        // Revalida al hidratar por si la cookie expiró o cambió tras el SSR.
        const nextSession = await readSessionFromServer();

        if (isMounted) {
          setSession(nextSession);
        }
      } catch {
        if (isMounted) {
          setSession(emptySession);
        }
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      refreshSession,
      replaceSession,
      clearSession,
      saveAttendingEvent,
    }),
    [clearSession, refreshSession, replaceSession, saveAttendingEvent, session],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
