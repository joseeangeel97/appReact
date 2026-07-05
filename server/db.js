import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

import {
  authCollectionName,
  bcryptSaltRounds,
  dbName,
  defaultAccessName,
  defaultAccessPassword,
  eventsCollectionName,
  keySentencesCollectionName,
  mongoUri,
  profileImagesCollectionName,
  usersCollectionName,
} from './config.js';

let mongoDbPromise;
let authCollectionPromise;

// Reutiliza una única promesa de conexión para evitar abrir varios clientes Mongo.
export async function getMongoDb() {
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

// Prepara la colección de acceso y migra la contraseña inicial a hash si hace falta.
export async function getAuthCollection() {
  if (!authCollectionPromise) {
    authCollectionPromise = (async () => {
      const db = await getMongoDb();
      const collection = db.collection(authCollectionName);

      // El santo de acceso debe ser único.
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

      // Si la contraseña antigua estaba en texto plano, se guarda como hash.
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

// Helpers pequeños para que las rutas no conozcan nombres de colecciones.
export async function getProfileImagesCollection() {
  const db = await getMongoDb();

  return db.collection(profileImagesCollectionName);
}

export async function getUsersCollection() {
  const db = await getMongoDb();

  return db.collection(usersCollectionName);
}

export async function getKeySentencesCollection() {
  const db = await getMongoDb();

  return db.collection(keySentencesCollectionName);
}

export async function getEventsCollection() {
  const db = await getMongoDb();

  return db.collection(eventsCollectionName);
}
