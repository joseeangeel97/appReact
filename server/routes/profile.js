import bcrypt from 'bcryptjs';

import { getCloudinaryImageUrl } from '../cloudinary.js';
import { bcryptSaltRounds } from '../config.js';
import {
  getKeySentencesCollection,
  getProfileImagesCollection,
  getUsersCollection,
} from '../db.js';
import { normalizeProfileText } from '../utils/text.js';

export function registerProfileRoutes(app) {
  // Devuelve las imágenes disponibles para el carrusel de creación de perfil.
  app.get('/api/profile-images', async (req, res) => {
    try {
      const profileImagesCollection = await getProfileImagesCollection();
      const images = await profileImagesCollection
        .find(
          { imagenUrl: { $type: 'string', $ne: '' } },
          {
            projection: {
              _id: 1,
              titulo: 1,
              slug: 1,
              categoria: 1,
              descripcion: 1,
              imagenUrl: 1,
            },
          },
        )
        .sort({ titulo: 1 })
        .toArray();

      return res.status(200).json({
        ok: true,
        // El frontend espera objetos ya preparados para ImageCarousel.
        images: images.map((image) => ({
          id: image.slug || String(image._id),
          label: image.titulo || image.slug || 'Imagen de perfil',
          category: image.categoria || '',
          description: image.descripcion || '',
          src: getCloudinaryImageUrl(image.imagenUrl, {
            width: 900,
            height: 900,
          }),
          originalSrc: image.imagenUrl,
        })),
      });
    } catch (error) {
      console.error('MongoDB profile images error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudieron cargar las imágenes de perfil',
      });
    }
  });

  // Devuelve las frases identificativas que puede seleccionar el usuario.
  app.get('/api/key-sentences', async (req, res) => {
    try {
      const keySentencesCollection = await getKeySentencesCollection();
      const documents = await keySentencesCollection
        .find(
          {},
          {
            projection: {
              _id: 1,
              texto: 1,
            },
          },
        )
        .toArray();

      // Normaliza el formato de Mongo a { id, text } y elimina frases vacías.
      const sentences = documents
        .map((document) => {
          const text = document.texto || '';

          return {
            id: String(document._id),
            text: String(text).trim(),
          };
        })
        .filter((sentence) => sentence.text)
        .sort((firstSentence, secondSentence) =>
          firstSentence.text.localeCompare(secondSentence.text, 'es'),
        );

      return res.status(200).json({
        ok: true,
        sentences,
      });
    } catch (error) {
      console.error('MongoDB key sentences error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudieron cargar las frases',
      });
    }
  });

  // Login de iniciados: comprueba alias, frase, contraseña y número del perfil.
  app.post('/api/initiated', async (req, res) => {
    // Los textos se comparan sin acentos y en minúsculas.
    const alias = normalizeProfileText(req.body?.alias);
    const phrase = normalizeProfileText(req.body?.phrase);
    const rawHiddenThought = String(req.body?.hiddenThought || '').trim();
    const hiddenThought = normalizeProfileText(rawHiddenThought);
    const rawNumber = String(req.body?.number || '').trim();
    const number = Number(rawNumber);

    if (!alias || !phrase || !hiddenThought || !Number.isFinite(number)) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos de acceso son obligatorios',
      });
    }

    try {
      const usersCollection = await getUsersCollection();
      const matchingProfiles = await usersCollection
        .find(
          {
            number: {
              // Compatibilidad con números guardados como Number o como String.
              $in: [...new Set([number, rawNumber, String(number)])],
            },
          },
          {
            projection: {
              alias: 1,
              phrase: 1,
              hiddenThought: 1,
              hiddenThoughtHash: 1,
              image: 1,
              number: 1,
            },
          },
        )
        .limit(50)
        .toArray();

      for (const profile of matchingProfiles) {
        // También normaliza perfiles antiguos que pudieran tener acentos/mayúsculas.
        const profileAlias = normalizeProfileText(profile.alias);
        const profilePhrase = normalizeProfileText(profile.phrase);
        const savedHiddenThought = normalizeProfileText(profile.hiddenThought);
        // Comprueba el hash nuevo y, si procede, el hash creado antes de normalizar.
        const hiddenThoughtMatchesHash =
          profile.hiddenThoughtHash &&
          ((await bcrypt.compare(hiddenThought, profile.hiddenThoughtHash)) ||
            (rawHiddenThought !== hiddenThought &&
              (await bcrypt.compare(
                rawHiddenThought,
                profile.hiddenThoughtHash,
              ))));
        // Fallback para perfiles antiguos que pudieran tener contraseña en texto plano.
        const hiddenThoughtMatchesPlainText =
          savedHiddenThought && savedHiddenThought === hiddenThought;

        if (
          profileAlias === alias &&
          profilePhrase === phrase &&
          (hiddenThoughtMatchesHash || hiddenThoughtMatchesPlainText)
        ) {
          return res.status(200).json({
            ok: true,
            profile: {
              alias: profile.alias || alias,
              number: profile.number ?? number,
              image: profile.image || null,
            },
          });
        }
      }

      return res.status(401).json({
        ok: false,
        message: 'Los datos de acceso no coinciden con ningún perfil',
      });
    } catch (error) {
      console.error('MongoDB initiated access error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudo comprobar el acceso',
      });
    }
  });

  // Crea un perfil nuevo con datos normalizados y la frase contraseña protegida.
  app.post('/api/users', async (req, res) => {
    const alias = normalizeProfileText(req.body?.alias);
    const phrase = normalizeProfileText(req.body?.phrase);
    const hiddenThought = normalizeProfileText(req.body?.hiddenThought);
    const number = Number(req.body?.number);
    const image = req.body?.image;
    const selectedImage =
      image && typeof image === 'object'
        ? {
            id: String(image.id || '').trim(),
            label: String(image.label || '').trim(),
            category: String(image.category || '').trim(),
            description: String(image.description || '').trim(),
            src: String(image.src || '').trim(),
            originalSrc: String(image.originalSrc || '').trim(),
          }
        : null;

    if (
      !alias ||
      !phrase ||
      !hiddenThought ||
      !Number.isFinite(number) ||
      number < 1 ||
      !selectedImage?.id ||
      !selectedImage?.src
    ) {
      return res.status(400).json({
        ok: false,
        message: 'Todos los campos del perfil son obligatorios',
      });
    }

    try {
      const usersCollection = await getUsersCollection();
      const createdAt = new Date();
      // La frase contraseña nunca se guarda en claro en perfiles nuevos.
      const hiddenThoughtHash = await bcrypt.hash(
        hiddenThought,
        bcryptSaltRounds,
      );
      const result = await usersCollection.insertOne({
        alias,
        phrase,
        hiddenThoughtHash,
        number,
        image: selectedImage,
        createdAt,
        updatedAt: createdAt,
      });

      return res.status(201).json({
        ok: true,
        userId: String(result.insertedId),
        profile: {
          alias,
          number,
          image: selectedImage,
        },
      });
    } catch (error) {
      console.error('MongoDB user profile error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudo guardar el perfil',
      });
    }
  });
}
