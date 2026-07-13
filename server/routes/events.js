import { getCloudinaryImageUrl } from '../cloudinary.js';
import { getEventImagesCollection, getEventsCollection } from '../db.js';

function getFirstValue(document, fieldNames) {
  // Mongo puede guardar los mismos datos con nombres ES/EN; usamos el primero válido.
  for (const fieldName of fieldNames) {
    const value = document[fieldName];

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'object') {
      if (
        Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0
      ) {
        return value;
      }

      continue;
    }

    if (String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function getNestedValue(document, fieldPath) {
  return fieldPath.split('.').reduce((value, fieldName) => {
    if (!value || typeof value !== 'object') {
      return undefined;
    }

    return value[fieldName];
  }, document);
}

function getFirstNestedValue(document, fieldPaths) {
  for (const fieldPath of fieldPaths) {
    const value = getNestedValue(document, fieldPath);

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'object') {
      if (
        Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0
      ) {
        return value;
      }

      continue;
    }

    if (String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

function normalizeLookupKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function readImageSource(document) {
  return String(
    getFirstNestedValue(document, [
      'url',
      'image',
      'imagen',
      'imageUrl',
      'imagenUrl',
      'urlImagen',
      'foto',
      'src',
      'secure_url',
      'secureUrl',
    ]),
  ).trim();
}

function readSecondaryImageSource(document) {
  return String(
    getFirstNestedValue(document, [
      'co_image',
      'coImage',
      'secondaryImage',
      'secondaryImageUrl',
      'secondImage',
      'secondImageUrl',
      'image2',
      'image_2',
      'img2',
    ]),
  ).trim();
}

function readEventImageTitle(document) {
  return String(
    getFirstNestedValue(document, [
      'title',
      'titulo',
      'nombre',
      'name',
      'eventTitle',
      'event_title',
      'tituloEvento',
      'eventoTitulo',
      'event.title',
      'event.titulo',
      'evento.title',
      'evento.titulo',
      'event.name',
      'evento.nombre',
    ]),
  ).trim();
}

function getSafeImageUrl(imageUrl) {
  if (!imageUrl) {
    return '';
  }

  try {
    const parsedUrl = new URL(imageUrl);

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return '';
    }
  } catch {
    if (!imageUrl.startsWith('/')) {
      return '';
    }
  }

  return getCloudinaryImageUrl(imageUrl, {
    width: 1200,
    height: 800,
    crop: 'cover',
  });
}

function buildEventImageMap(imageDocuments) {
  const imagesByTitle = new Map();

  for (const document of imageDocuments) {
    const titleKey = normalizeLookupKey(readEventImageTitle(document));
    const primaryImageUrl = getSafeImageUrl(readImageSource(document));
    const secondaryImageUrl = getSafeImageUrl(
      readSecondaryImageSource(document),
    );

    if (
      titleKey &&
      (primaryImageUrl || secondaryImageUrl) &&
      !imagesByTitle.has(titleKey)
    ) {
      imagesByTitle.set(titleKey, {
        image: primaryImageUrl || secondaryImageUrl,
        secondaryImage:
          secondaryImageUrl && secondaryImageUrl !== primaryImageUrl
            ? secondaryImageUrl
            : '',
        originalImage:
          secondaryImageUrl && secondaryImageUrl !== primaryImageUrl
            ? secondaryImageUrl
            : primaryImageUrl,
      });
    }
  }

  return imagesByTitle;
}

function getEventImageLookupKeys(document) {
  return [
    getFirstValue(document, ['title', 'titulo', 'nombre']),
    getFirstValue(document, [
      'location',
      'ubicacion',
      'localizacion',
      'localizacionClave',
      'lugar',
      'sitio',
    ]),
  ]
    .map(normalizeLookupKey)
    .filter(Boolean);
}

function matchEventImages(eventDocuments, imagesByTitle) {
  const matchedImagesByEventId = new Map();
  const unmatchedEvents = [];
  const usedImageKeys = new Set();

  for (const document of eventDocuments) {
    const matchedKey = getEventImageLookupKeys(document).find((key) =>
      imagesByTitle.has(key),
    );

    if (matchedKey) {
      matchedImagesByEventId.set(
        String(document._id),
        imagesByTitle.get(matchedKey),
      );
      usedImageKeys.add(matchedKey);
    } else {
      unmatchedEvents.push(document);
    }
  }

  const unusedImages = [...imagesByTitle.entries()].filter(
    ([imageKey]) => !usedImageKeys.has(imageKey),
  );

  if (unmatchedEvents.length === 1 && unusedImages.length === 1) {
    matchedImagesByEventId.set(
      String(unmatchedEvents[0]._id),
      unusedImages[0][1],
    );
  }

  return matchedImagesByEventId;
}

function formatEventDate(value) {
  if (!value) {
    return '';
  }

  if (typeof value === 'object') {
    const start = value.inicio || value.start || value.desde;
    const end = value.fin || value.end || value.hasta;

    if (start && end) {
      return `${start} - ${end}`;
    }

    return String(start || end || '').trim();
  }

  if (value instanceof Date) {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  }

  return String(value).trim();
}

function normalizeLevel(value) {
  if (!value) {
    return {
      name: 'Sin nivel',
      order: 999,
    };
  }

  if (typeof value === 'object') {
    return {
      name: String(value.nombre || value.name || 'Sin nivel').trim(),
      order: Number(value.orden || value.order || 999),
    };
  }

  return {
    name: String(value).trim(),
    order: 999,
  };
}

export function normalizeEvent(document, imageMatch) {
  // Normaliza el documento de Mongo al contrato usado por la UI.
  const imageUrl = getSafeImageUrl(readImageSource(document));
  const title = String(
    getFirstValue(document, ['title', 'titulo', 'nombre']),
  ).trim();
  const matchedImage = imageMatch?.get(String(document._id));

  return {
    id: String(document._id),
    title,
    level: normalizeLevel(getFirstValue(document, ['level', 'nivel'])),
    type: String(
      getFirstValue(document, ['type', 'tipo', 'categoria', 'category']),
    ).trim(),
    date: formatEventDate(
      getFirstValue(document, ['date', 'fecha', 'dia', 'horario']),
    ),
    location: String(
      getFirstValue(document, [
        'location',
        'ubicacion',
        'localizacion',
        'localizacionClave',
        'lugar',
        'sitio',
      ]),
    ).trim(),
    description: String(
      getFirstValue(document, [
        'description',
        'descripcion',
        'resumen',
        'detalle',
      ]),
    ).trim(),
    accessKey: String(
      getFirstNestedValue(document, [
        'accessKey',
        'accessCode',
        'access_code',
        'codigo',
        'claveAcceso',
        'clave_acceso',
        'claveDeAcceso',
        'codigoAcceso',
        'codigo_acceso',
        'codigoDeAcceso',
        'códigoAcceso',
        'código_acceso',
        'códigoDeAcceso',
        'key',
        'clave',
        'access.key',
        'access.code',
        'access.codigo',
        'access.clave',
        'acceso.key',
        'acceso.codigo',
        'acceso.clave',
        'credentials.accessKey',
        'credentials.accessCode',
        'credenciales.codigo',
        'credenciales.clave',
      ]),
    ).trim(),
    initialPassword: String(
      getFirstNestedValue(document, [
        'initialPassword',
        'initial_password',
        'initialPass',
        'passwordInicial',
        'password_inicial',
        'password',
        'claveInicial',
        'clave_inicial',
        'passInicial',
        'contrasenaInicial',
        'contraseñaInicial',
        'access.initialPassword',
        'access.password',
        'access.initialPass',
        'acceso.password',
        'acceso.passwordInicial',
        'acceso.claveInicial',
        'credentials.initialPassword',
        'credentials.password',
        'credenciales.password',
        'credenciales.claveInicial',
      ]),
    ).trim(),
    status: String(getFirstValue(document, ['status', 'estado'])).trim(),
    tags: Array.isArray(document.tags)
      ? document.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    image: matchedImage?.image || imageUrl,
    secondaryImage:
      matchedImage?.secondaryImage ||
      matchedImage?.originalImage ||
      getSafeImageUrl(readSecondaryImageSource(document)) ||
      imageUrl,
    originalImage:
      matchedImage?.secondaryImage ||
      matchedImage?.originalImage ||
      getSafeImageUrl(readSecondaryImageSource(document)) ||
      imageUrl,
  };
}

export function registerEventRoutes(app) {
  // Devuelve los eventos reales de MongoDB para sustituir el listado estático.
  app.get('/api/events', async (req, res) => {
    try {
      const eventsCollection = await getEventsCollection();
      const eventImagesCollection = await getEventImagesCollection();
      const [events, eventImages] = await Promise.all([
        eventsCollection
          .find({})
          .sort({
            'nivel.orden': 1,
            horario: 1,
            fecha: 1,
            date: 1,
            titulo: 1,
            title: 1,
          })
          .toArray(),
        eventImagesCollection.find({}).toArray(),
      ]);
      const imagesByTitle = buildEventImageMap(eventImages);
      const matchedImagesByEventId = matchEventImages(events, imagesByTitle);

      return res.status(200).json({
        ok: true,
        events: events
          .map((event) => normalizeEvent(event, matchedImagesByEventId))
          .filter((event) => event.title),
      });
    } catch (error) {
      console.error('MongoDB events error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudieron cargar los eventos',
      });
    }
  });
}
