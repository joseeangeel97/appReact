# EventHub Paternoster

A private event platform built with React, Express, and MongoDB.

The project offers an invitation-based experience where users can create a profile, return as initiated members, browse private events organized by access level, and save reservations to a personal agenda.

> [!NOTE]
> The project is currently under development. It does not yet include an administration panel or a browser interface for creating and editing events.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [User Flow](#user-flow)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [MongoDB Setup](#mongodb-setup)
- [Available Scripts](#available-scripts)
- [Application Routes](#application-routes)
- [API](#api)
- [Sessions and Authentication](#sessions-and-authentication)
- [Events and Reservations](#events-and-reservations)
- [Images and Cloudinary](#images-and-cloudinary)
- [Server-Side Rendering](#server-side-rendering)
- [Security](#security)
- [Production](#production)
- [Current Limitations](#current-limitations)
- [License](#license)

## Overview

**EventHub Paternoster** is a web application designed to manage the experience of a private event community.

The application provides two access paths:

1. **General access:** validates a shared passphrase and allows a new profile to be created.
2. **Initiated-member access:** retrieves an existing profile using an alias, identification phrase, password phrase, and personal number.

Once identified, a user can:

- browse events loaded from MongoDB;
- navigate through events grouped by access level;
- reserve events;
- view the active profile;
- review a private agenda;
- see access codes, initial passwords, and reservation statuses;
- sign out.

The interface follows a ceremonial narrative style built around concepts such as the threshold, initiates, signs, and different levels of access.

## Features

- React application with React Router navigation.
- Express backend integrated into the same project.
- Server-side rendering, or SSR.
- React hydration in the browser.
- MongoDB data persistence.
- MongoDB-backed sessions.
- `HttpOnly` session cookie.
- Profile creation.
- Existing-profile access.
- Password protection with `bcrypt`.
- Dynamic event catalog.
- Event grouping by level.
- Event reservations from the active profile.
- Private agenda with book-style pagination.
- Profile image management.
- Image association for events.
- Optional image optimization through Cloudinary.
- Request rate limiting.
- Basic NoSQL injection protection.
- Security headers and a CSP policy.
- Server-side data validation and normalization.

## User Flow

### 1. Public Entry

The `/` route displays the main presentation page.

From this page, visitors can access:

- `/login`, to enter the general passphrase;
- `/login/initiated`, to sign in with an existing profile.

### 2. General Access

On `/login`, the user enters:

- a passphrase name;
- a passphrase password.

The form sends a `POST /login` request.

When the credentials are valid, the server creates an authorized session and redirects the user to `/profile`.

In development, the default credentials are:

```text
Name: SATOR
Password: TENET
```

These credentials are only used as development defaults. Production credentials must be supplied through environment variables.

### 3. Profile Creation

On `/profile`, the user provides:

- an alias;
- an identification phrase;
- a password phrase;
- a personal number;
- a profile image.

The available identification phrases and profile images are loaded from MongoDB.

When the form is submitted:

1. the browser sends the data to `POST /api/users`;
2. the server checks that the current session is authorized;
3. the server validates the selected image again;
4. text fields are normalized;
5. the password phrase is hashed with `bcrypt`;
6. the profile is saved to MongoDB;
7. the session is updated with the newly created profile;
8. the user is redirected to the home page.

### 4. Initiated-Member Access

On `/login/initiated`, an existing member enters:

- an alias;
- an identification phrase;
- a password phrase;
- a personal number.

The backend compares the normalized values against the profiles stored in MongoDB.

When they match, the session is linked to the selected profile and the user returns to the home page.

### 5. Browsing Events

The `/page-event` page requests events from `GET /api/events`.

The server:

1. queries the event and image collections;
2. normalizes field names written in Spanish or English;
3. associates images with each event;
4. sorts the events;
5. returns a consistent data contract to React.

The interface groups events by level and displays their main details.

### 6. Reservation

A user must have an active profile before reserving an event.

The browser sends only the event identifier to:

```http
POST /api/session/events
```

The server retrieves the event again from MongoDB. This prevents the client from altering the title, location, access code, initial password, or other sensitive reservation data.

The reservation is stored inside the user's session.

> [!IMPORTANT]
> A reservation is considered provisional. The interface itself explains that reserving does not guarantee final admission to an event.

### 7. Private Agenda

The `/profile-summary` route displays:

- the alias;
- the personal number;
- the profile image;
- the number of reserved events;
- a paginated agenda;
- the date and location of each event;
- the access code;
- the initial password;
- the event status.

When no active profile exists, the route redirects to `/login/initiated`.

## Architecture

The project uses a full-stack architecture contained within a single repository:

```text
Browser
   │
   ├── React + React Router
   │       │
   │       └── fetch / JSON API
   │
   └── Express
           │
           ├── Authentication routes
           ├── Profile routes
           ├── Event routes
           ├── Session management
           ├── SSR with Vite
           │
           └── MongoDB
                   ├── access credentials
                   ├── users
                   ├── events
                   ├── images
                   └── sessions
```

Express acts as:

- the HTTP server;
- the API server;
- the session manager;
- the SSR server;
- the static file server in production;
- Vite middleware during development.

## Technology Stack

### Frontend

- React 19
- React DOM
- React Router DOM
- CSS Modules
- Vite

### Backend

- Node.js
- Express
- MongoDB Node.js Driver
- bcryptjs
- dotenv
- Cloudinary

### Tooling

- ESLint
- Vite SSR

> [!NOTE]
> `mongoose` is installed as a dependency, but the current implementation uses `MongoClient` directly from the `mongodb` package.

## Project Structure

```text
appReact/
├── public/
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   ├── profile.js
│   │   └── session.js
│   ├── utils/
│   │   ├── text.js
│   │   └── validation.js
│   ├── cloudinary.js
│   ├── config.js
│   ├── db.js
│   ├── security.js
│   ├── session.js
│   └── ssr.js
├── src/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── Hall.jsx
│   │   ├── Login.jsx
│   │   ├── ProfileSummary.jsx
│   │   ├── initiated.jsx
│   │   ├── pageEvent.jsx
│   │   └── profile.jsx
│   ├── utils/
│   │   ├── SessionProvider.jsx
│   │   ├── sessionContext.js
│   │   └── sessionProfile.js
│   ├── App.jsx
│   ├── entry-server.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── server.js
└── vite.config.js
```

### Main Files

#### `server.js`

The project entry point.

It is responsible for:

- creating Express and the HTTP server;
- registering security protections;
- parsing JSON request bodies;
- loading the session;
- registering all routes;
- configuring SSR;
- starting the server.

#### `server/db.js`

Manages the reusable MongoDB connection and exposes access to the different collections.

It also prepares the initial general-access credential and migrates legacy plaintext passwords to hashes.

#### `server/session.js`

Implements persistent sessions:

- generates random identifiers;
- uses an `HttpOnly` cookie;
- stores sessions in MongoDB;
- renews active sessions;
- removes expired sessions through a TTL index.

#### `server/routes/`

Contains endpoints for:

- general authentication;
- profiles;
- events;
- sessions and reservations.

#### `server/ssr.js`

Configures server-side rendering.

During development, it uses Vite as middleware. In production, it serves the generated contents of `dist/`.

#### `src/utils/SessionProvider.jsx`

Keeps the public session state inside React and synchronizes changes with the server.

The persistent source is not `localStorage` or `sessionStorage`. It is the backend session associated with a cookie.

## Requirements

- A Node.js version compatible with the installed React and Vite versions.
- npm.
- Access to a MongoDB database.
- A Cloudinary account, optional.
- Initial collections containing images, phrases, and events.

A recent Node.js LTS release is recommended.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/joseeangeel97/appReact.git
cd appReact
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create the Environment File

Create a `.env` file in the project root:

```env
DB=mongodb://127.0.0.1:27017
DB_NAME=minihub

PORT=3000
NODE_ENV=development

DEFAULT_ACCESS_NAME=SATOR
DEFAULT_ACCESS_PASSWORD=TENET

CLOUDINARY_URL=

AUTH_COLLECTION=access_keys
USERS_COLLECTION=user
KEY_SENTENCES_COLLECTION=key_sentences
PROFILE_IMAGES_COLLECTION=images_profile
EVENTS_COLLECTION=events
EVENT_IMAGES_COLLECTION=img_events
SESSIONS_COLLECTION=sessions
```

### 4. Prepare MongoDB

Add at least:

- one identification phrase;
- one profile image;
- one event.

The general-access credential can be created automatically from `DEFAULT_ACCESS_NAME` and `DEFAULT_ACCESS_PASSWORD`.

### 5. Start the Project

```bash
npm run dev
```

The application will attempt to start at:

```text
http://localhost:3000
```

During development, when the port is already in use and `PORT` has not been explicitly defined, the server tries subsequent ports up to `3010`.

## Environment Variables

| Variable | Required | Default value | Description |
|---|---:|---|---|
| `DB` | Yes | None | MongoDB connection URI. |
| `DB_NAME` | No | Database specified in the URI | Explicit database name. |
| `PORT` | No | `3000` | HTTP port. |
| `NODE_ENV` | No | Development | Use `production` to enable production mode. |
| `DEFAULT_ACCESS_NAME` | In production | `SATOR` in development | General-access name. |
| `DEFAULT_ACCESS_PASSWORD` | In production | `TENET` in development | General-access password. |
| `CLOUDINARY_URL` | No | None | Cloudinary configuration. |
| `AUTH_COLLECTION` | No | `access_keys` | General-access credentials collection. |
| `USERS_COLLECTION` | No | `user` | Profile collection. |
| `KEY_SENTENCES_COLLECTION` | No | `key_sentences` | Identification phrase collection. |
| `PROFILE_IMAGES_COLLECTION` | No | `images_profile` | Profile image collection. |
| `EVENTS_COLLECTION` | No | `events` | Event collection. |
| `EVENT_IMAGES_COLLECTION` | No | `img_events` | Event image collection. |
| `SESSIONS_COLLECTION` | No | `sessions` | Session collection. |

> [!WARNING]
> Do not publish the `.env` file. The repository already excludes it through `.gitignore`.

## MongoDB Setup

The backend accepts several alternative field names, particularly for events. Even so, keeping a consistent structure is strongly recommended unless the database is meant to become a small archaeological site.

### General-Access Credentials

Default collection:

```text
access_keys
```

The server creates or updates the credential defined through environment variables.

Conceptual example:

```json
{
  "name": "SATOR",
  "passwordHash": "<bcrypt hash>",
  "createdAt": "<date>"
}
```

You do not need to generate `passwordHash` manually when using `DEFAULT_ACCESS_NAME` and `DEFAULT_ACCESS_PASSWORD`.

### Identification Phrases

Default collection:

```text
key_sentences
```

Example:

```json
{
  "texto": "The sign appears when the circle is complete"
}
```

The field name remains `texto` because that is the identifier currently recognized by the application data layer.

### Profile Images

Default collection:

```text
images_profile
```

Example:

```json
{
  "slug": "oraculo",
  "titulo": "The Oracle",
  "categoria": "Archetypes",
  "descripcion": "A presence that watches before speaking.",
  "imagenUrl": "https://res.cloudinary.com/your-cloud/image/upload/v123/profiles/oracle.jpg"
}
```

The `slug` field should be unique and stable because the browser uses it as the selection identifier.

The Spanish field names remain in the example because they match the current MongoDB contract accepted by the project.

### Events

Default collection:

```text
events
```

Recommended example:

```json
{
  "title": "Private Dinner: The Atrium",
  "level": {
    "name": "The Atrium",
    "order": 1
  },
  "type": "Dining experience",
  "date": "September 20, 9:00 PM",
  "location": "Madrid",
  "description": "A private gathering for new members.",
  "accessKey": "ATRIUM-204",
  "initialPassword": "LUMEN",
  "status": "Pending confirmation",
  "tags": [
    "Dining",
    "Networking"
  ],
  "image": "https://res.cloudinary.com/your-cloud/image/upload/v123/events/atrium.jpg"
}
```

The normalizer also recognizes variants such as:

- `titulo`, `nombre`;
- `nivel`;
- `tipo`, `categoria`;
- `fecha`, `horario`;
- `ubicacion`, `localizacion`, `lugar`;
- `descripcion`, `resumen`;
- `codigoAcceso`, `claveAcceso`;
- `passwordInicial`, `claveInicial`;
- `estado`.

These names are intentionally not translated because they are actual field aliases recognized by the server.

### Event Images

Default collection:

```text
img_events
```

Example:

```json
{
  "title": "Private Dinner: The Atrium",
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v123/events/atrium-1.jpg",
  "co_image": "https://res.cloudinary.com/your-cloud/image/upload/v123/events/atrium-2.jpg"
}
```

The server tries to associate these images with events by:

1. title;
2. location;
3. the only remaining match, when only one event and one unassigned image remain.

### Users

Default collection:

```text
user
```

New profiles are stored with a structure similar to:

```json
{
  "alias": "normalized-name",
  "phrase": "normalized-phrase",
  "hiddenThoughtHash": "<bcrypt hash>",
  "number": 42,
  "image": {
    "id": "oraculo",
    "label": "The Oracle",
    "category": "Archetypes",
    "description": "A presence that watches before speaking.",
    "src": "https://...",
    "originalSrc": "https://..."
  },
  "createdAt": "<date>",
  "updatedAt": "<date>"
}
```

The alias, identification phrase, and password phrase are normalized:

- surrounding whitespace is removed;
- text is converted to lowercase;
- accents are removed for comparison.

### Sessions

Default collection:

```text
sessions
```

Sessions are created automatically.

MongoDB uses a TTL index on `expiresAt`, so expired sessions are removed without requiring a manual cleanup task.

## Available Scripts

### Development

```bash
npm run dev
```

Runs:

```bash
node server.js
```

The server loads Vite as middleware and uses SSR during development.

### Build

```bash
npm run build
```

Generates:

1. the client bundle;
2. the SSR bundle inside `dist/server`.

The executed command is:

```bash
vite build && vite build --ssr src/entry-server.jsx --outDir dist/server
```

### Local Production Preview

```bash
npm run preview
```

Runs the server with `NODE_ENV=production`.

On Windows, the environment-variable assignment used in the script may require PowerShell, WSL, or a cross-platform tool such as `cross-env`.

### Lint

```bash
npm run lint
```

Runs ESLint across the project.

## Application Routes

| Route | Description | Profile required |
|---|---|---:|
| `/` | Main presentation page. | No |
| `/login` | General access through the shared passphrase. | No |
| `/login/initiated` | Access for existing members. | No |
| `/profile` | New-profile creation. | General access required |
| `/page-event` | Private event catalog. | Recommended |
| `/profile-summary` | Profile and private agenda. | Yes |
| `/about` | Project information and event types. | No |

The main header is displayed only when an active profile exists.

## API

### General Authentication

#### `POST /login`

Validates the general-access passphrase.

Request body:

```json
{
  "name": "SATOR",
  "password": "TENET"
}
```

Successful response:

```json
{
  "ok": true,
  "session": {
    "accessGranted": true,
    "profile": null,
    "attendingEvents": []
  }
}
```

### Initiated-Member Profile

#### `POST /api/initiated`

Signs in with an existing profile.

Request body:

```json
{
  "alias": "my alias",
  "phrase": "my phrase",
  "hiddenThought": "my password phrase",
  "number": 42
}
```

### Profile Creation

#### `POST /api/users`

Creates a new profile.

Requires a session with `accessGranted: true`.

Request body:

```json
{
  "alias": "my alias",
  "phrase": "my phrase",
  "hiddenThought": "my password phrase",
  "number": 42,
  "imageId": "oraculo"
}
```

### Profile Images

#### `GET /api/profile-images`

Returns the allowed profile images for profile creation.

### Identification Phrases

#### `GET /api/key-sentences`

Returns the phrases available in the profile selector.

### Events

#### `GET /api/events`

Returns normalized and sorted events.

### Session

#### `GET /api/session`

Returns the current public session.

#### `DELETE /api/session`

Deletes the server-side session and clears the cookie.

### Reservations

#### `POST /api/session/events`

Adds an event to the active session's agenda.

Request body:

```json
{
  "eventId": "MONGODB_IDENTIFIER"
}
```

Requires an active profile.

## Sessions and Authentication

The application does not use JWT tokens in the browser.

Instead:

1. the server generates a random 32-byte identifier;
2. it stores the identifier in a cookie named `minihub_session`;
3. the cookie is configured as `HttpOnly`;
4. session data is stored in MongoDB;
5. React receives only the public part of the session.

The public session contains:

```json
{
  "accessGranted": false,
  "profile": null,
  "attendingEvents": []
}
```

### Duration

Sessions last eight hours.

When an active session passes half of its lifetime, the server renews its expiration time.

### Cookie

Properties:

- `HttpOnly`;
- `SameSite=Lax`;
- `Path=/`;
- `Secure` in production.

JavaScript cannot directly read the session identifier.

## Events and Reservations

Events are retrieved from MongoDB and normalized before being sent to the client.

Normalization allows legacy or imported data to use different field names.

### Current Interface Levels

The interface defines special messages for:

| Order | Level | Informational capacity |
|---:|---|---:|
| 1 | The Atrium | 80 |
| 2 | The Circle | 50 |
| 3 | The Sanctuary | 20 |

These capacities are used as informational frontend text. There is currently no persistent capacity system that subtracts available places in MongoDB.

### Reservation Persistence

Reservations:

- are associated with the session;
- cannot be duplicated;
- are limited to a maximum of 50 events;
- are refreshed from MongoDB when the session is requested;
- disappear when the session expires or is closed.

Therefore, reservations are not currently permanent records associated with the user document.

## Images and Cloudinary

Cloudinary is optional.

When `CLOUDINARY_URL` exists and an image URL contains `/image/upload/`, the server modifies the URL to apply:

- automatic format selection;
- automatic quality selection;
- resizing;
- smart cropping where appropriate.

When the URL does not belong to Cloudinary, it is returned unchanged.

The project does not upload files directly to Cloudinary. Image URLs must already exist in MongoDB.

## Server-Side Rendering

The application uses SSR in both development and production.

### Development

Express creates a Vite server in middleware mode.

For every route, it:

1. reads `index.html`;
2. lets Vite transform the template;
3. loads `src/entry-server.jsx`;
4. renders React with `renderToString`;
5. injects the initial public session;
6. returns the generated HTML.

### Browser

`src/main.jsx` uses `hydrateRoot` to connect React to the server-generated HTML.

The initial session is received through:

```js
window.__MINIHUB_SESSION__
```

After hydration, the frontend requests `/api/session` again to confirm that the session is still valid.

### Production

Express serves the files from `dist/` and loads:

```text
dist/server/entry-server.js
```

SSR responses are sent with:

```http
Cache-Control: no-store
```

This prevents a cache from accidentally reusing personalized HTML generated for another user, a small detail that keeps private sessions from becoming unexpectedly communal.

## Security

The project includes several security measures.

### Passwords

- General-access credentials are stored with `bcrypt`.
- New profile password phrases are stored as hashes.
- The `bcrypt` cost is 12 rounds.
- Temporary compatibility exists for legacy profiles stored in plaintext.

### Sessions

- Cryptographically random identifiers.
- `HttpOnly` cookies.
- `Secure` cookies in production.
- MongoDB-backed sessions.
- Automatic expiration through TTL.
- The API never exposes the internal session identifier.

### Validation

- Maximum lengths for text fields.
- Strict number validation.
- Rejection of MongoDB keys beginning with `$`.
- Rejection of keys containing periods.
- A 32 KB JSON body limit.
- Rejection of malformed JSON.

### Trusted Data Protection

The server does not trust:

- image URLs submitted by the browser;
- complete event data submitted during reservation;
- access codes or passwords submitted by the client.

To create a profile, the browser sends `imageId`.

To reserve an event, the browser sends `eventId`.

The server retrieves the trusted documents from MongoDB.

### Rate Limiting

Rate limits are applied to:

- general API routes;
- authentication attempts;
- profile creation.

The limiter uses in-memory storage. Deployments with multiple instances should replace it with Redis or another shared store.

### Headers

Among other headers, the server configures:

- `Content-Security-Policy`;
- `X-Content-Type-Options`;
- `X-Frame-Options`;
- `Referrer-Policy`;
- `Cross-Origin-Opener-Policy`;
- `Cross-Origin-Resource-Policy`;
- `Permissions-Policy`;
- `Strict-Transport-Security` in production.

It also rejects write requests that the browser marks as originating from another site.

## Production

### 1. Configure Variables

At minimum, production should define:

```env
NODE_ENV=production
DB=mongodb+srv://...
DB_NAME=minihub
DEFAULT_ACCESS_NAME=...
DEFAULT_ACCESS_PASSWORD=...
PORT=3000
```

Do not rely on `SATOR` and `TENET` in production. The code does not use those fallback credentials in production mode.

### 2. Build

```bash
npm run build
```

### 3. Start

```bash
NODE_ENV=production node server.js
```

You can also use:

```bash
npm run preview
```

### 4. Reverse Proxy

In production, the server enables:

```js
app.set('trust proxy', 1)
```

This allows it to work behind a secure proxy such as Nginx, Render, Railway, or a similar platform.

The proxy must provide HTTPS for the `Secure` cookie to work correctly.

### 5. Considerations

- The `dist/` directory must exist before startup.
- MongoDB must be reachable from the server.
- Sensitive environment variables must not be committed to Git.
- The process only requires persistent storage in MongoDB.
- Images must be available through public URLs or Cloudinary.
- Multi-instance deployments should use a shared rate-limit store.

## Current Limitations

- There is no administration panel.
- There is no event CRUD interface.
- There is no direct image upload.
- Reservations live in the session rather than in the permanent profile.
- There is no real capacity control.
- There is no administrative confirmation process.
- There is no password-phrase recovery flow.
- Alias and personal-number uniqueness are not enforced.
- There are no automated tests.
- A minimum Node.js version is not declared.
- The request limiter uses local memory.
- `mongoose` is installed but unused.
- Profile creation depends on the user having completed general access first.
- The “confirmed events” wording in the agenda may be confusing because reservations are also described as provisional.

## Suggested Improvements

- Add an administration panel.
- Create event CRUD operations.
- Persist reservations in their own collection.
- Associate reservations with users instead of sessions.
- Implement real capacity limits and waiting lists.
- Add reservation states such as requested, accepted, and rejected.
- Add unique indexes for aliases and personal numbers.
- Add unit and integration tests.
- Document a minimum Node.js version.
- Remove unused dependencies.
- Add schema validation with Zod, Joi, or an equivalent solution.
- Use Redis for distributed rate limiting.
- Add signed Cloudinary image uploads.
- Add structured logging and monitoring.
- Create a seed-data collection or setup tool for development.

## License

The repository does not currently include a license file.

Without an explicit license, the code remains fully protected by the author's default copyright. Add a `LICENSE` file before allowing third parties to reuse, modify, or distribute the project.

## Author

Developed by [joseeangeel97](https://github.com/joseeangeel97).
