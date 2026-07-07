import { randomBytes } from 'node:crypto';

import { isProduction, sessionsCollectionName } from './config.js';
import { getMongoDb } from './db.js';

const SESSION_COOKIE_NAME = 'minihub_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

let sessionsCollectionPromise;

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const separatorIndex = cookie.indexOf('=');

    if (separatorIndex === -1) {
      return cookies;
    }

    const name = cookie.slice(0, separatorIndex).trim();
    const value = cookie.slice(separatorIndex + 1).trim();

    if (!name) {
      return cookies;
    }

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }

    return cookies;
  }, {});
}

function createSessionId() {
  return randomBytes(32).toString('base64url');
}

function normalizeSessionData(data = {}) {
  return {
    accessGranted: Boolean(data.accessGranted),
    profile: data.profile || null,
    attendingEvents: Array.isArray(data.attendingEvents)
      ? data.attendingEvents
      : [],
  };
}

function getCookieOptions(maxAgeMs = SESSION_TTL_MS) {
  const options = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    // HttpOnly impide que JavaScript del navegador lea o robe el id de sesión.
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];

  if (isProduction) {
    options.push('Secure');
  }

  return options;
}

function setSessionCookie(res, sessionId) {
  const options = getCookieOptions();

  options[0] = `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionId)}`;
  res.setHeader('Set-Cookie', options.join('; '));
}

function clearSessionCookie(res) {
  const options = getCookieOptions(0);

  res.setHeader('Set-Cookie', options.join('; '));
}

async function getSessionsCollection() {
  if (!sessionsCollectionPromise) {
    sessionsCollectionPromise = (async () => {
      const db = await getMongoDb();
      const collection = db.collection(sessionsCollectionName);

      // Mongo elimina automáticamente las sesiones vencidas con este índice TTL.
      await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

      return collection;
    })();
  }

  return sessionsCollectionPromise;
}

async function readSession(sessionId) {
  const collection = await getSessionsCollection();
  const session = await collection.findOne({ _id: sessionId });

  if (!session) {
    return null;
  }

  if (session.expiresAt <= new Date()) {
    await collection.deleteOne({ _id: sessionId });
    return null;
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  // Sesión deslizante: cada request válida renueva la expiración en Mongo.
  await collection.updateOne({ _id: sessionId }, { $set: { expiresAt } });

  return {
    ...session,
    expiresAt,
  };
}

async function writeSession(sessionId, data) {
  const collection = await getSessionsCollection();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const document = {
    _id: sessionId,
    data: normalizeSessionData(data),
    expiresAt,
    updatedAt: new Date(),
  };

  await collection.updateOne(
    { _id: sessionId },
    {
      $set: document,
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );

  return document;
}

export function getPublicSession(session) {
  // Solo exponemos datos necesarios para pintar la UI; nunca el id de sesión.
  return normalizeSessionData(session?.data);
}

export async function sessionMiddleware(req, res, next) {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const sessionId = cookies[SESSION_COOKIE_NAME];
    const session = sessionId ? await readSession(sessionId) : null;

    req.sessionId = session ? sessionId : null;
    req.session = session;
    req.getPublicSession = () => getPublicSession(req.session);
    req.setServerSession = async (data) => {
      // Reutiliza la sesión si existe; si no, crea un id criptográficamente aleatorio.
      const nextSessionId = req.sessionId || createSessionId();
      const nextSession = await writeSession(nextSessionId, data);

      req.sessionId = nextSessionId;
      req.session = nextSession;
      setSessionCookie(res, nextSessionId);

      return getPublicSession(nextSession);
    };
    req.patchServerSession = (data) =>
      // Actualiza una parte de la sesión sin borrar el resto de datos públicos.
      req.setServerSession({
        ...getPublicSession(req.session),
        ...data,
      });
    req.clearServerSession = async () => {
      if (req.sessionId) {
        const collection = await getSessionsCollection();

        await collection.deleteOne({ _id: req.sessionId });
      }

      req.sessionId = null;
      req.session = null;
      clearSessionCookie(res);
    };

    next();
  } catch (error) {
    next(error);
  }
}

export function startSessionCleanup() {
  // La limpieza real la hace Mongo con el índice TTL; se conserva la API del server.
}
