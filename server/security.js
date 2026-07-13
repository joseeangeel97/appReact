import { randomBytes } from 'node:crypto';

import { isProduction } from './config.js';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 300;
const stores = new Map();

function isPlainObject(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function hasUnsafeMongoKey(value, depth = 0) {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (depth > 20) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasUnsafeMongoKey(item, depth + 1));
  }

  if (!isPlainObject(value)) {
    return false;
  }

  return Object.entries(value).some(([key, childValue]) => {
    const trimmedKey = String(key).trim();

    return (
      trimmedKey.startsWith('$') ||
      trimmedKey.includes('.') ||
      hasUnsafeMongoKey(childValue, depth + 1)
    );
  });
}

function getClientKey(req) {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function getRequestPath(req) {
  return String(req.originalUrl || req.url || req.path || '').split('?')[0];
}

export function securityHeaders(req, res, next) {
  // El nonce autoriza únicamente el pequeño script SSR que hidrata la sesión pública.
  const cspNonce = randomBytes(18).toString('base64url');
  const scriptPolicy = isProduction
    ? `script-src 'self' 'nonce-${cspNonce}'`
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
  const connectPolicy = isProduction
    ? "connect-src 'self'"
    : "connect-src 'self' ws: wss:";

  res.locals.cspNonce = cspNonce;
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Origin-Agent-Cluster', '?1');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      scriptPolicy,
      // React usa variables CSS inline; los scripts siguen protegidos por nonce.
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https:",
      connectPolicy,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  );

  if (isProduction) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
  }

  next();
}

export function crossSiteRequestGuard(req, res, next) {
  const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  const fetchSite = String(req.get('Sec-Fetch-Site') || '').toLowerCase();

  // Las cookies SameSite ya protegen la sesión; esta segunda barrera rechaza
  // explícitamente escrituras iniciadas desde otro sitio en navegadores modernos.
  if (unsafeMethod && fetchSite === 'cross-site') {
    return res.status(403).json({
      ok: false,
      message: 'Origen de solicitud no permitido',
    });
  }

  return next();
}

export function jsonErrorHandler(error, req, res, next) {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).json({
      ok: false,
      message: 'El cuerpo JSON no es válido',
    });
  }

  return next(error);
}

export function noSqlInjectionGuard(req, res, next) {
  if (
    hasUnsafeMongoKey(req.body) ||
    hasUnsafeMongoKey(req.query) ||
    hasUnsafeMongoKey(req.params)
  ) {
    return res.status(400).json({
      ok: false,
      message: 'La solicitud contiene campos no permitidos',
    });
  }

  return next();
}

export function createRateLimiter({
  name,
  windowMs = DEFAULT_WINDOW_MS,
  max = DEFAULT_MAX_REQUESTS,
  message = 'Demasiadas solicitudes. Inténtalo de nuevo más tarde',
} = {}) {
  const storeName = name || `${windowMs}:${max}`;
  const hits = new Map();

  stores.set(storeName, hits);

  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = `${getClientKey(req)}:${req.method}:${getRequestPath(req)}`;
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      const resetAt = now + windowMs;

      hits.set(key, {
        count: 1,
        resetAt,
      });
      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(max - 1));
      res.setHeader('RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

      return next();
    }

    current.count += 1;

    const remaining = Math.max(max - current.count, 0);
    const resetSeconds = Math.ceil((current.resetAt - now) / 1000);

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(Math.ceil(current.resetAt / 1000)));

    if (current.count > max) {
      res.setHeader('Retry-After', String(resetSeconds));

      return res.status(429).json({
        ok: false,
        message,
      });
    }

    return next();
  };
}

export function startRateLimitCleanup() {
  const interval = setInterval(() => {
    const now = Date.now();

    for (const hits of stores.values()) {
      for (const [key, value] of hits.entries()) {
        if (value.resetAt <= now) {
          hits.delete(key);
        }
      }
    }
  }, DEFAULT_WINDOW_MS);

  interval.unref?.();
}
