import { ObjectId } from 'mongodb';

import { getEventsCollection } from '../db.js';
import { normalizeEvent } from './events.js';
import { readString } from '../utils/validation.js';

async function getTrustedEventById(eventId) {
  // La reserva solo acepta ids de Mongo; cualquier dato visible del evento se recalcula.
  if (!ObjectId.isValid(eventId)) {
    return null;
  }

  const eventsCollection = await getEventsCollection();
  const document = await eventsCollection.findOne({ _id: new ObjectId(eventId) });

  return document ? normalizeEvent(document) : null;
}

async function refreshTrustedAttendingEvents(session) {
  if (!session.profile || session.attendingEvents.length === 0) {
    return session;
  }

  const refreshedEvents = await Promise.all(
    session.attendingEvents.map(async (event) => {
      const trustedEvent = await getTrustedEventById(String(event.id || ''));

      return trustedEvent || event;
    }),
  );

  return {
    ...session,
    attendingEvents: refreshedEvents,
  };
}

export function registerSessionRoutes(app) {
  // Fuente única para que React conozca la sesión pública asociada a la cookie.
  app.get('/api/session', async (req, res) => {
    try {
      const currentSession = req.getPublicSession();
      const session = await refreshTrustedAttendingEvents(currentSession);

      if (session !== currentSession) {
        await req.patchServerSession({ attendingEvents: session.attendingEvents });
      }

      return res.status(200).json({
        ok: true,
        session,
      });
    } catch (error) {
      console.error('MongoDB session refresh error:', error);

      return res.status(200).json({
        ok: true,
        session: req.getPublicSession(),
      });
    }
  });

  app.delete('/api/session', async (req, res) => {
    // Elimina la sesión del store y pide al navegador borrar la cookie HttpOnly.
    await req.clearServerSession();

    return res.status(200).json({
      ok: true,
      session: req.getPublicSession(),
    });
  });

  app.post('/api/session/events', async (req, res) => {
    const currentSession = req.getPublicSession();

    // Las reservas pertenecen a la sesión del perfil, no a sessionStorage.
    if (!currentSession.profile) {
      return res.status(401).json({
        ok: false,
        message: 'Inicia sesión para reservar eventos',
      });
    }

    try {
      // El cliente no puede decidir título, claves o ubicación del evento reservado.
      const eventId = readString(req.body?.eventId, { maxLength: 80 });
      const event = await getTrustedEventById(eventId);

      if (!event) {
        return res.status(400).json({
          ok: false,
          message: 'El evento no existe',
        });
      }

      const eventExists = currentSession.attendingEvents.some(
        (storedEvent) => storedEvent.id === event.id,
      );
      const attendingEvents = eventExists
        ? currentSession.attendingEvents
        : [...currentSession.attendingEvents, event].slice(0, 50);
      const session = await req.patchServerSession({ attendingEvents });

      return res.status(200).json({
        ok: true,
        session,
      });
    } catch (error) {
      console.error('MongoDB session event error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudo guardar la reserva',
      });
    }
  });
}
