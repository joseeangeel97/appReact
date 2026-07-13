# MiniHub · Paternostrum

React application with custom server-side rendering, an Express API, MongoDB-backed sessions, and image assets served through Cloudinary.

## Local Development

```bash
npm install
npm run dev
```

The application uses the variables defined in `.env`. This file is ignored by Git and must never be committed to the repository.

## Validation

```bash
npm run lint
npm run build
npm run preview
```

The build process generates two outputs:

* `dist/index.html` and `dist/server/`: private SSR template and server bundle.
* `public/assets/`: versioned JavaScript, CSS, and image assets intended for the CDN.

`public/assets/` is generated automatically and is ignored by Git.

## Deployment on Vercel

The `vercel` branch exports Express as a single Vercel Function. The HTML template is not published as a static file, ensuring that every navigation request preserves server-side rendering and the user session.

Configure the following variables in both the Preview and Production environments on Vercel:

```text
DB
DB_NAME
CLOUDINARY_URL
DEFAULT_ACCESS_NAME
DEFAULT_ACCESS_PASSWORD
```

Collection names are optional and can be customized using:

```text
AUTH_COLLECTION
USERS_COLLECTION
KEY_SENTENCES_COLLECTION
PROFILE_IMAGES_COLLECTION
EVENTS_COLLECTION
EVENT_IMAGES_COLLECTION
SESSIONS_COLLECTION
```

To test the Vercel build locally before deploying:

```bash
vercel pull
vercel build
```
