# MiniHub · Paternostrum

Aplicación React con SSR propio, API Express, sesiones almacenadas en MongoDB
y recursos de imagen servidos desde Cloudinary.

## Desarrollo local

```bash
npm install
npm run dev
```

La aplicación utiliza las variables definidas en `.env`. Este archivo está
ignorado por Git y nunca debe subirse al repositorio.

## Validación

```bash
npm run lint
npm run build
npm run preview
```

El build genera dos salidas:

- `dist/index.html` y `dist/server/`: plantilla y bundle SSR privados.
- `public/assets/`: JavaScript, CSS e imágenes versionadas para el CDN.

`public/assets/` es generado y está ignorado por Git.

## Despliegue en Vercel

La rama `vercel` exporta Express como una única Vercel Function. La plantilla
HTML no se publica como archivo estático para que cada navegación conserve el
SSR y la sesión del usuario.

Configura estas variables en los entornos Preview y Production de Vercel:

```text
DB
DB_NAME
CLOUDINARY_URL
DEFAULT_ACCESS_NAME
DEFAULT_ACCESS_PASSWORD
```

Los nombres de colecciones son opcionales y pueden personalizarse con:

```text
AUTH_COLLECTION
USERS_COLLECTION
KEY_SENTENCES_COLLECTION
PROFILE_IMAGES_COLLECTION
EVENTS_COLLECTION
EVENT_IMAGES_COLLECTION
SESSIONS_COLLECTION
```

Para probar el empaquetado de Vercel antes de publicar:

```bash
vercel pull
vercel build
```
