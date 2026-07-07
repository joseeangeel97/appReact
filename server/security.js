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
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  next();
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
