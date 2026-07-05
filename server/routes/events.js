import { getCloudinaryImageUrl } from '../cloudinary.js';
import { getEventsCollection } from '../db.js';

function getFirstValue(document, fieldNames) {
  // Mongo puede guardar los mismos datos con nombres ES/EN; usamos el primero válido.
  for (const fieldName of fieldNames) {
    const value = document[fieldName];

    if (value !== undefined && value !== null && String(value).trim() !== '') {
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

function normalizeEvent(document) {
  // Expone solo los campos públicos que necesita la UI, evitando claves privadas.
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
    type: String(
      getFirstValue(document, ['type', 'tipo', 'categoria', 'category', 'nivel']),
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
        .sort({ horario: 1, fecha: 1, date: 1, titulo: 1, title: 1 })
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
