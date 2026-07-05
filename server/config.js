import 'dotenv/config';

// Configuración centralizada para no leer process.env desde todos los módulos.
export const isProduction = globalThis.process?.env?.NODE_ENV === 'production';

// Datos de conexión a MongoDB.
export const mongoUri = globalThis.process?.env?.DB;
export const dbName = globalThis.process?.env?.DB_NAME?.trim();

// Nombres de colecciones. Se pueden cambiar desde variables de entorno.
export const authCollectionName =
  globalThis.process?.env?.AUTH_COLLECTION || 'access_keys';
export const usersCollectionName =
  globalThis.process?.env?.USERS_COLLECTION || 'user';
export const keySentencesCollectionName =
  globalThis.process?.env?.KEY_SENTENCES_COLLECTION || 'key_sentences';
export const profileImagesCollectionName =
  globalThis.process?.env?.PROFILE_IMAGES_COLLECTION || 'images_profile';
export const eventsCollectionName =
  globalThis.process?.env?.EVENTS_COLLECTION || 'events';

// Credenciales iniciales para asegurar que exista una entrada de acceso.
export const defaultAccessName =
  globalThis.process?.env?.DEFAULT_ACCESS_NAME?.trim() || 'SATOR';
export const defaultAccessPassword =
  globalThis.process?.env?.DEFAULT_ACCESS_PASSWORD?.trim() || 'TENET';

// Parámetros compartidos por seguridad e imágenes.
export const bcryptSaltRounds = 10;
export const cloudinaryUrl = globalThis.process?.env?.CLOUDINARY_URL;
