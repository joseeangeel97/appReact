import { useContext } from 'react';

import { SessionContext } from './sessionContext';

export function useSession() {
  return useContext(SessionContext);
}

export function useActiveProfile() {
  return useSession().session.profile;
}

export function useAttendingEvents() {
  return useSession().session.attendingEvents;
}

export function useSessionActions() {
  const { refreshSession, replaceSession, clearSession, saveAttendingEvent } =
    useSession();

  return {
    refreshSession,
    replaceSession,
    clearSession,
    saveAttendingEvent,
  };
}
