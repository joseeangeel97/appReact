import { randomBytes } from 'node:crypto';

import { isProduction } from './config.js';

const SESSION_COOKIE_NAME = 'minihub_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
// Store de sesiones en servidor: el navegador solo recibe el id opaco en cookie.
const sessionsById = new Map();

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

function readSession(sessionId) {
  const session = sessionsById.get(sessionId);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= Date.now()) {
    sessionsById.delete(sessionId);
    return null;
  }

  // Sesión deslizante: cada request válida renueva la expiración.
  session.expiresAt = Date.now() + SESSION_TTL_MS;

  return session;
}

export function getPublicSession(session) {
  // Solo exponemos datos necesarios para pintar la UI; nunca el id de sesión.
  return normalizeSessionData(session?.data);
}

export function sessionMiddleware(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const sessionId = cookies[SESSION_COOKIE_NAME];
  const session = sessionId ? readSession(sessionId) : null;

  req.sessionId = session ? sessionId : null;
  req.session = session;
  req.getPublicSession = () => getPublicSession(req.session);
  req.setServerSession = (data) => {
    // Reutiliza la sesión si existe; si no, crea un id criptográficamente aleatorio.
    const nextSessionId = req.sessionId || createSessionId();
    const nextSession = {
      data: normalizeSessionData(data),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };

    sessionsById.set(nextSessionId, nextSession);
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
  req.clearServerSession = () => {
    if (req.sessionId) {
      sessionsById.delete(req.sessionId);
    }

    req.sessionId = null;
    req.session = null;
    clearSessionCookie(res);
  };

  next();
}

export function startSessionCleanup() {
  const interval = setInterval(() => {
    const now = Date.now();

    for (const [sessionId, session] of sessionsById.entries()) {
      if (session.expiresAt <= now) {
        sessionsById.delete(sessionId);
      }
    }
  }, SESSION_TTL_MS);

  interval.unref?.();
}
