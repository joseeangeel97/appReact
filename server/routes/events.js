import { getCloudinaryImageUrl } from '../cloudinary.js';
import { getEventsCollection } from '../db.js';

function getFirstValue(document, fieldNames) {
  // Mongo puede guardar los mismos datos con nombres ES/EN; usamos el primero válido.
  for (const fieldName of fieldNames) {
    const value = document[fieldName];

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'object') {
      if (Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0) {
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

export function normalizeEvent(document) {
  // Normaliza el documento de Mongo al contrato usado por la UI.
  const imageUrl = String(
    getFirstValue(document, [
      'image',
      'imagen',
      'imageUrl',
      'imagenUrl',
      'urlImagen',
      'foto',
      'src',
    ]),
  ).trim();

  return {
    id: String(document._id),
    title: String(getFirstValue(document, ['title', 'titulo', 'nombre'])).trim(),
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
      getFirstValue(document, [
        'accessKey',
        'claveAcceso',
        'claveDeAcceso',
        'codigoAcceso',
      ]),
    ).trim(),
    initialPassword: String(
      getFirstValue(document, [
        'initialPassword',
        'passwordInicial',
        'password',
        'claveInicial',
      ]),
    ).trim(),
    status: String(getFirstValue(document, ['status', 'estado'])).trim(),
    tags: Array.isArray(document.tags)
      ? document.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
    image: imageUrl
      ? getCloudinaryImageUrl(imageUrl, {
          width: 1200,
          height: 800,
          crop: 'cover',
        })
      : '',
    originalImage: imageUrl,
  };
}

export function registerEventRoutes(app) {
  // Devuelve los eventos reales de MongoDB para sustituir el listado estático.
  app.get('/api/events', async (req, res) => {
    try {
      const eventsCollection = await getEventsCollection();
      const events = await eventsCollection
        .find({})
        .sort({
          'nivel.orden': 1,
          horario: 1,
          fecha: 1,
          date: 1,
          titulo: 1,
          title: 1,
        })
        .toArray();

      return res.status(200).json({
        ok: true,
        events: events.map(normalizeEvent).filter((event) => event.title),
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
