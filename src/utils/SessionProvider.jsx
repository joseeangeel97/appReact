import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  const sessionVersionRef = useRef(0);

  const replaceSession = useCallback((nextSession) => {
    sessionVersionRef.current += 1;
    setSession(normalizeSession(nextSession));
  }, []);

  const refreshSession = useCallback(async () => {
    const requestVersion = sessionVersionRef.current;
    const nextSession = await readSessionFromServer();

    if (requestVersion === sessionVersionRef.current) {
      setSession(nextSession);
    }

    return nextSession;
  }, []);

  const clearSession = useCallback(async () => {
    sessionVersionRef.current += 1;
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
    sessionVersionRef.current += 1;
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
    const requestVersion = sessionVersionRef.current;

    async function loadSession() {
      try {
        // Revalida al hidratar por si la cookie expiró o cambió tras el SSR.
        const nextSession = await readSessionFromServer();

        if (isMounted && requestVersion === sessionVersionRef.current) {
          setSession(nextSession);
        }
      } catch {
        if (isMounted && requestVersion === sessionVersionRef.current) {
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
