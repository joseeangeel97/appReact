import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import express from 'express';
import 'dotenv/config';
import { createServer as createHttpServer } from 'node:http';
import { MongoClient } from 'mongodb';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = globalThis.process?.env?.NODE_ENV === 'production';

//Mongo

const mongoUri = globalThis.process?.env?.DB;
const dbName = globalThis.process?.env?.DB_NAME?.trim();
const authCollectionName =
  globalThis.process?.env?.AUTH_COLLECTION || 'access_keys';
const usersCollectionName = globalThis.process?.env?.USERS_COLLECTION || 'user';
const keySentencesCollectionName =
  globalThis.process?.env?.KEY_SENTENCES_COLLECTION || 'key_sentences';
const profileImagesCollectionName =
  globalThis.process?.env?.PROFILE_IMAGES_COLLECTION || 'images_profile';
const defaultAccessName =
  globalThis.process?.env?.DEFAULT_ACCESS_NAME?.trim() || 'SATOR';
const defaultAccessPassword =
  globalThis.process?.env?.DEFAULT_ACCESS_PASSWORD?.trim() || 'TENET';
const bcryptSaltRounds = 10;
const cloudinaryUrl = globalThis.process?.env?.CLOUDINARY_URL;

let mongoDbPromise;
let authCollectionPromise;

async function getMongoDb() {
  if (!mongoUri) {
    throw new Error('Missing DB environment variable');
  }

  if (!mongoDbPromise) {
    mongoDbPromise = (async () => {
      const client = new MongoClient(mongoUri);
      await client.connect();

      return dbName ? client.db(dbName) : client.db();
    })();
  }

  return mongoDbPromise;
}

async function getAuthCollection() {
  if (!authCollectionPromise) {
    authCollectionPromise = (async () => {
      const db = await getMongoDb();
      const collection = db.collection(authCollectionName);

      await collection.createIndex({ name: 1 }, { unique: true });
      await collection.updateOne(
        { name: defaultAccessName },
        {
          $setOnInsert: {
            name: defaultAccessName,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );

      const defaultUser = await collection.findOne(
        { name: defaultAccessName },
        { projection: { password: 1, passwordHash: 1 } },
      );

      if (!defaultUser?.passwordHash) {
        const passwordToHash = defaultUser?.password || defaultAccessPassword;
        const passwordHash = await bcrypt.hash(
          passwordToHash,
          bcryptSaltRounds,
        );

        await collection.updateOne(
          { name: defaultAccessName },
          {
            $set: { passwordHash },
            $unset: { password: '' },
          },
        );
      } else if (defaultUser.password) {
        await collection.updateOne(
          { name: defaultAccessName },
          { $unset: { password: '' } },
        );
      }

      console.log(
        `MongoDB connected: ${db.databaseName}.${authCollectionName}`,
      );

      return collection;
    })();
  }

  return authCollectionPromise;
}

async function getProfileImagesCollection() {
  const db = await getMongoDb();

  return db.collection(profileImagesCollectionName);
}

async function getUsersCollection() {
  const db = await getMongoDb();

  return db.collection(usersCollectionName);
}

async function getKeySentencesCollection() {
  const db = await getMongoDb();

  return db.collection(keySentencesCollectionName);
}

//Cloudinary
if (cloudinaryUrl) {
  cloudinary.config({ secure: true });
}

function getCloudinaryImageUrl(imageUrl, { width, height, crop = 'limit' }) {
  if (!cloudinaryUrl || !imageUrl.includes('/image/upload/')) {
    return imageUrl;
  }

  const cloudinaryCrop = crop === 'cover' ? 'fill' : crop;
  const gravity = cloudinaryCrop === 'fill' ? ',g_auto' : '';
  const background = cloudinaryCrop === 'pad' ? ',b_gen_fill' : '';
  const transformation = `f_auto,q_auto,c_${cloudinaryCrop}${gravity}${background},w_${width},h_${height}`;
  return imageUrl.replace('/image/upload/', `/image/upload/${transformation}/`);
}

//Express
async function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);

  app.use(express.json());

  app.post('/login', async (req, res) => {
    const name = String(req.body?.name || '').trim();
    const password = String(req.body?.password || '').trim();

    try {
      const authCollection = await getAuthCollection();
      const user = await authCollection.findOne(
        { name },
        { projection: { passwordHash: 1 } },
      );
      const validUser =
        user?.passwordHash &&
        (await bcrypt.compare(password, user.passwordHash));

      if (!validUser) {
        return res
          .status(401)
          .json({ ok: false, message: 'Santo o seña incorrecta' });
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('MongoDB login error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudo comprobar el santo y seña',
      });
    }
  });

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

  app.post('/api/users', async (req, res) => {
    const alias = String(req.body?.alias || '').trim();
    const phrase = String(req.body?.phrase || '').trim();
    const hiddenThought = String(req.body?.hiddenThought || '').trim();
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
      });
    } catch (error) {
      console.error('MongoDB user profile error:', error);

      return res.status(503).json({
        ok: false,
        message: 'No se pudo guardar el perfil',
      });
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      root: globalThis.process?.cwd(),
      server: {
        middlewareMode: 'ssr',
        hmr: { server: httpServer },
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8',
        );
        template = await vite.transformIndexHtml(url, template);

        const { render } = await vite.ssrLoadModule('/src/entry-server.jsx');
        const appHtml = render(url);

        const html = template.replace('<!--ssr-outlet-->', appHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));

    app.use('*', async (req, res) => {
      try {
        const url = req.originalUrl;
        const template = fs.readFileSync(
          path.resolve(__dirname, 'dist/index.html'),
          'utf-8',
        );
        const { render } = await import(
          path.resolve(__dirname, 'dist/server/entry-server.js')
        );
        const appHtml = render(url);

        const html = template.replace('<!--ssr-outlet-->', appHtml);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  }

  //Puerto
  const envPort = globalThis.process?.env?.PORT;
  const port = Number(envPort || 3000);
  const canFallbackPort = !isProduction && !envPort;
  const maxFallbackPort = port + 10;
  let attemptedPort = port;

  function listen(currentPort) {
    attemptedPort = currentPort;

    httpServer.listen(currentPort, () => {
      console.log(`Server listening on http://localhost:${currentPort}`);
    });
  }

  httpServer.on('error', (error) => {
    const currentPort = attemptedPort;

    if (
      error.code === 'EADDRINUSE' &&
      canFallbackPort &&
      currentPort < maxFallbackPort
    ) {
      const nextPort = currentPort + 1;

      console.warn(
        `Port ${currentPort} is in use, trying http://localhost:${nextPort}`,
      );
      listen(nextPort);
      return;
    }

    if (error.code === 'EADDRINUSE') {
      console.error(
        `Port ${currentPort} is already in use. Stop that process or start this app with PORT=${currentPort + 1} npm run dev.`,
      );
    }

    throw error;
  });

  listen(port);
}

createServer();
