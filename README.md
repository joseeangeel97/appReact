# EventHub Paternoster

Plataforma privada de eventos construida con React, Express y MongoDB.

El proyecto propone una experiencia de acceso por invitación en la que los usuarios pueden crear un perfil, volver a entrar como miembros iniciados, consultar eventos privados organizados por niveles y guardar reservas en una agenda personal.

> [!NOTE]
> El proyecto se encuentra en desarrollo. Actualmente no incluye un panel de administración ni una interfaz para crear o editar eventos desde el navegador.

## Índice

- [Descripción](#descripción)
- [Características](#características)
- [Flujo de uso](#flujo-de-uso)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Preparación de MongoDB](#preparación-de-mongodb)
- [Scripts disponibles](#scripts-disponibles)
- [Rutas de la aplicación](#rutas-de-la-aplicación)
- [API](#api)
- [Sesiones y autenticación](#sesiones-y-autenticación)
- [Eventos y reservas](#eventos-y-reservas)
- [Imágenes y Cloudinary](#imágenes-y-cloudinary)
- [Renderizado SSR](#renderizado-ssr)
- [Seguridad](#seguridad)
- [Producción](#producción)
- [Limitaciones actuales](#limitaciones-actuales)
- [Licencia](#licencia)

## Descripción

**EventHub Paternoster** es una aplicación web para gestionar la experiencia de una comunidad privada de eventos.

La aplicación dispone de dos caminos de acceso:

1. **Acceso general:** valida un santo y seña compartido y permite crear un perfil nuevo.
2. **Acceso de iniciado:** permite recuperar un perfil existente mediante alias, frase identificativa, frase contraseña y número personal.

Una vez identificado, el usuario puede:

- consultar eventos obtenidos desde MongoDB;
- navegar por eventos agrupados según su nivel;
- reservar eventos;
- consultar su perfil activo;
- revisar su agenda privada;
- visualizar códigos, contraseñas iniciales y estado de los eventos reservados;
- cerrar la sesión.

La interfaz utiliza una estética narrativa y ceremonial, con conceptos como el umbral, los iniciados, las señales y los distintos niveles de acceso.

## Características

- Aplicación React con navegación mediante React Router.
- Backend Express integrado en el mismo proyecto.
- Renderizado del lado del servidor, SSR.
- Hidratación de React en el navegador.
- Persistencia de datos en MongoDB.
- Sesiones guardadas en MongoDB.
- Cookie de sesión `HttpOnly`.
- Creación de perfiles.
- Acceso de perfiles existentes.
- Contraseñas protegidas con `bcrypt`.
- Catálogo de eventos dinámico.
- Agrupación de eventos por nivel.
- Reserva de eventos desde el perfil activo.
- Agenda privada con paginación tipo libro.
- Gestión de imágenes de perfil.
- Asociación de imágenes con eventos.
- Optimización opcional de imágenes mediante Cloudinary.
- Limitación de solicitudes.
- Protección básica frente a inyección NoSQL.
- Cabeceras de seguridad y política CSP.
- Validación y normalización de datos en el servidor.

## Flujo de uso

### 1. Entrada pública

La ruta `/` muestra la presentación general de la plataforma.

Desde esta página se puede acceder a:

- `/login`, para utilizar el santo y seña general;
- `/login/initiated`, para iniciar sesión con un perfil existente.

### 2. Acceso general

En `/login`, el usuario introduce:

- santo;
- seña.

El formulario envía una petición `POST /login`.

Cuando las credenciales son correctas, el servidor crea una sesión con permiso de acceso y redirige al usuario a `/profile`.

En desarrollo, las credenciales predeterminadas son:

```text
Santo: SATOR
Seña: TENET
```

Estas credenciales solo se utilizan como valores predeterminados en desarrollo. En producción deben configurarse mediante variables de entorno.

### 3. Creación del perfil

En `/profile`, el usuario completa:

- alias;
- frase identificativa;
- frase contraseña;
- número personal;
- imagen de perfil.

Las frases identificativas y las imágenes disponibles se cargan desde MongoDB.

Al enviar el formulario:

1. el navegador envía los datos a `POST /api/users`;
2. el servidor comprueba que existe una sesión autorizada;
3. el servidor valida nuevamente la imagen elegida;
4. normaliza los textos;
5. cifra la frase contraseña con `bcrypt`;
6. guarda el perfil en MongoDB;
7. actualiza la sesión con el perfil creado;
8. redirige al inicio.

### 4. Acceso de iniciado

En `/login/initiated`, un miembro existente introduce:

- alias;
- frase identificativa;
- frase contraseña;
- número personal.

El backend compara los datos normalizados con los perfiles de MongoDB.

Si coinciden, la sesión queda asociada al perfil encontrado y el usuario vuelve a la página principal.

### 5. Consulta de eventos

La página `/page-event` solicita los eventos a `GET /api/events`.

El servidor:

1. consulta las colecciones de eventos e imágenes;
2. normaliza nombres de campos en español e inglés;
3. asocia las imágenes con cada evento;
4. ordena los eventos;
5. devuelve un contrato uniforme para React.

La interfaz agrupa los eventos por nivel y muestra sus datos principales.

### 6. Reserva

Para reservar es necesario tener un perfil activo.

El navegador envía únicamente el identificador del evento a:

```http
POST /api/session/events
```

El servidor recupera nuevamente el evento desde MongoDB. De esta forma, el cliente no puede alterar el título, la ubicación, el código de acceso ni otros datos sensibles de la reserva.

La reserva se almacena dentro de la sesión del usuario.

> [!IMPORTANT]
> La reserva se considera provisional. La propia interfaz indica que reservar no garantiza el acceso definitivo al evento.

### 7. Agenda privada

La ruta `/profile-summary` muestra:

- alias;
- número personal;
- imagen de perfil;
- cantidad de eventos reservados;
- agenda paginada;
- fecha y lugar de cada evento;
- código de acceso;
- contraseña inicial;
- estado del evento.

Si no existe un perfil activo, la ruta redirige a `/login/initiated`.

## Arquitectura

El proyecto utiliza una arquitectura de aplicación completa dentro de un único repositorio:

```text
Navegador
   │
   ├── React + React Router
   │       │
   │       └── fetch / API JSON
   │
   └── Express
           │
           ├── Rutas de autenticación
           ├── Rutas de perfiles
           ├── Rutas de eventos
           ├── Gestión de sesiones
           ├── SSR con Vite
           │
           └── MongoDB
                   ├── accesos
                   ├── usuarios
                   ├── eventos
                   ├── imágenes
                   └── sesiones
```

Express actúa como:

- servidor HTTP;
- API;
- gestor de sesiones;
- servidor SSR;
- servidor de archivos estáticos en producción;
- middleware de Vite durante el desarrollo.

## Tecnologías

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

### Herramientas

- ESLint
- Vite SSR

> [!NOTE]
> `mongoose` aparece instalado como dependencia, pero el código actual utiliza directamente `MongoClient` del paquete `mongodb`.

## Estructura del proyecto

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

### Archivos principales

#### `server.js`

Punto de entrada del proyecto.

Se encarga de:

- crear Express y el servidor HTTP;
- registrar las protecciones de seguridad;
- leer cuerpos JSON;
- cargar la sesión;
- registrar todas las rutas;
- configurar SSR;
- iniciar el servidor.

#### `server/db.js`

Gestiona la conexión reutilizable con MongoDB y expone los accesos a las distintas colecciones.

También prepara la credencial general inicial y migra contraseñas antiguas en texto plano a hashes.

#### `server/session.js`

Implementa las sesiones persistentes:

- genera identificadores aleatorios;
- utiliza una cookie `HttpOnly`;
- guarda la sesión en MongoDB;
- renueva sesiones activas;
- elimina sesiones vencidas mediante un índice TTL.

#### `server/routes/`

Contiene los endpoints de:

- autenticación general;
- perfiles;
- eventos;
- sesión y reservas.

#### `server/ssr.js`

Configura el renderizado del lado del servidor.

En desarrollo usa Vite como middleware. En producción sirve el contenido generado dentro de `dist/`.

#### `src/utils/SessionProvider.jsx`

Mantiene el estado público de la sesión dentro de React y sincroniza los cambios con el servidor.

La fuente persistente no es `localStorage` ni `sessionStorage`, sino la sesión del backend asociada a una cookie.

## Requisitos

- Node.js compatible con las versiones instaladas de React y Vite.
- npm.
- Una base de datos MongoDB accesible.
- Una cuenta de Cloudinary, opcional.
- Colecciones iniciales con imágenes, frases y eventos.

Se recomienda utilizar una versión LTS reciente de Node.js.

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/joseeangeel97/appReact.git
cd appReact
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear el archivo de entorno

Crea un archivo `.env` en la raíz:

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

### 4. Preparar MongoDB

Añade al menos:

- una frase identificativa;
- una imagen de perfil;
- un evento.

La credencial general puede crearse automáticamente a partir de `DEFAULT_ACCESS_NAME` y `DEFAULT_ACCESS_PASSWORD`.

### 5. Iniciar el proyecto

```bash
npm run dev
```

La aplicación intentará iniciarse en:

```text
http://localhost:3000
```

En desarrollo, si el puerto está ocupado y no se ha definido `PORT`, el servidor probará los siguientes puertos hasta llegar al `3010`.

## Variables de entorno

| Variable | Obligatoria | Valor predeterminado | Descripción |
|---|---:|---|---|
| `DB` | Sí | Ninguno | URI de conexión a MongoDB. |
| `DB_NAME` | No | Base indicada en la URI | Nombre explícito de la base de datos. |
| `PORT` | No | `3000` | Puerto HTTP. |
| `NODE_ENV` | No | Desarrollo | Usa `production` para activar el modo de producción. |
| `DEFAULT_ACCESS_NAME` | En producción | `SATOR` en desarrollo | Nombre de acceso general. |
| `DEFAULT_ACCESS_PASSWORD` | En producción | `TENET` en desarrollo | Contraseña de acceso general. |
| `CLOUDINARY_URL` | No | Ninguno | Configuración de Cloudinary. |
| `AUTH_COLLECTION` | No | `access_keys` | Colección de credenciales generales. |
| `USERS_COLLECTION` | No | `user` | Colección de perfiles. |
| `KEY_SENTENCES_COLLECTION` | No | `key_sentences` | Colección de frases identificativas. |
| `PROFILE_IMAGES_COLLECTION` | No | `images_profile` | Colección de imágenes de perfil. |
| `EVENTS_COLLECTION` | No | `events` | Colección de eventos. |
| `EVENT_IMAGES_COLLECTION` | No | `img_events` | Colección de imágenes asociadas a eventos. |
| `SESSIONS_COLLECTION` | No | `sessions` | Colección de sesiones. |

> [!WARNING]
> No publiques el archivo `.env`. El repositorio ya lo excluye mediante `.gitignore`.

## Preparación de MongoDB

El backend admite distintos nombres de campos, especialmente en los eventos. Aun así, conviene mantener una estructura uniforme para evitar convertir la base de datos en una excavación arqueológica.

### Credenciales generales

Colección predeterminada:

```text
access_keys
```

El servidor crea o actualiza la credencial definida mediante variables de entorno.

Ejemplo conceptual:

```json
{
  "name": "SATOR",
  "passwordHash": "<hash bcrypt>",
  "createdAt": "<fecha>"
}
```

No es necesario generar manualmente `passwordHash` cuando se utilizan `DEFAULT_ACCESS_NAME` y `DEFAULT_ACCESS_PASSWORD`.

### Frases identificativas

Colección predeterminada:

```text
key_sentences
```

Ejemplo:

```json
{
  "texto": "La señal aparece cuando el círculo se completa"
}
```

### Imágenes de perfil

Colección predeterminada:

```text
images_profile
```

Ejemplo:

```json
{
  "slug": "oraculo",
  "titulo": "El Oráculo",
  "categoria": "Arquetipos",
  "descripcion": "Una presencia que observa antes de hablar.",
  "imagenUrl": "https://res.cloudinary.com/tu-cloud/image/upload/v123/perfiles/oraculo.jpg"
}
```

El campo `slug` debería ser único y estable, porque el navegador lo utiliza como identificador de selección.

### Eventos

Colección predeterminada:

```text
events
```

Ejemplo recomendado:

```json
{
  "title": "Cena privada: El Atrio",
  "level": {
    "name": "El Atrio",
    "order": 1
  },
  "type": "Experiencia gastronómica",
  "date": "20 de septiembre, 21:00",
  "location": "Madrid",
  "description": "Encuentro privado para nuevos miembros.",
  "accessKey": "ATRIUM-204",
  "initialPassword": "LUMEN",
  "status": "Pendiente de confirmación",
  "tags": [
    "Gastronomía",
    "Networking"
  ],
  "image": "https://res.cloudinary.com/tu-cloud/image/upload/v123/eventos/atrio.jpg"
}
```

El normalizador también reconoce variantes como:

- `titulo`, `nombre`;
- `nivel`;
- `tipo`, `categoria`;
- `fecha`, `horario`;
- `ubicacion`, `localizacion`, `lugar`;
- `descripcion`, `resumen`;
- `codigoAcceso`, `claveAcceso`;
- `passwordInicial`, `claveInicial`;
- `estado`.

### Imágenes de eventos

Colección predeterminada:

```text
img_events
```

Ejemplo:

```json
{
  "title": "Cena privada: El Atrio",
  "url": "https://res.cloudinary.com/tu-cloud/image/upload/v123/eventos/atrio-1.jpg",
  "co_image": "https://res.cloudinary.com/tu-cloud/image/upload/v123/eventos/atrio-2.jpg"
}
```

El servidor intenta asociar estas imágenes con los eventos por:

1. título;
2. ubicación;
3. única coincidencia restante, cuando solo queda un evento y una imagen sin asociar.

### Usuarios

Colección predeterminada:

```text
user
```

Los perfiles nuevos se guardan con una estructura similar a:

```json
{
  "alias": "nombre-normalizado",
  "phrase": "frase-normalizada",
  "hiddenThoughtHash": "<hash bcrypt>",
  "number": 42,
  "image": {
    "id": "oraculo",
    "label": "El Oráculo",
    "category": "Arquetipos",
    "description": "Una presencia que observa antes de hablar.",
    "src": "https://...",
    "originalSrc": "https://..."
  },
  "createdAt": "<fecha>",
  "updatedAt": "<fecha>"
}
```

El alias, la frase identificativa y la frase contraseña se normalizan:

- se eliminan espacios exteriores;
- se convierten a minúsculas;
- se eliminan acentos para la comparación.

### Sesiones

Colección predeterminada:

```text
sessions
```

Las sesiones se crean automáticamente.

MongoDB utiliza un índice TTL sobre `expiresAt`, por lo que elimina las sesiones vencidas sin necesitar una tarea manual.

## Scripts disponibles

### Desarrollo

```bash
npm run dev
```

Ejecuta:

```bash
node server.js
```

El servidor carga Vite como middleware y utiliza SSR durante el desarrollo.

### Compilación

```bash
npm run build
```

Genera:

1. el bundle cliente;
2. el bundle SSR dentro de `dist/server`.

El comando ejecutado es:

```bash
vite build && vite build --ssr src/entry-server.jsx --outDir dist/server
```

### Producción local

```bash
npm run preview
```

Ejecuta el servidor con `NODE_ENV=production`.

En Windows, la asignación de variables incluida en el script puede requerir PowerShell, WSL o una herramienta multiplataforma como `cross-env`.

### Lint

```bash
npm run lint
```

Ejecuta ESLint sobre el proyecto.

## Rutas de la aplicación

| Ruta | Descripción | Requiere perfil |
|---|---|---:|
| `/` | Página principal y presentación. | No |
| `/login` | Acceso general mediante santo y seña. | No |
| `/login/initiated` | Acceso de miembros existentes. | No |
| `/profile` | Creación de un perfil nuevo. | Requiere acceso general |
| `/page-event` | Catálogo de eventos privados. | Recomendado |
| `/profile-summary` | Perfil y agenda privada. | Sí |
| `/about` | Información sobre el proyecto y los tipos de eventos. | No |

El encabezado principal solo aparece cuando existe un perfil activo.

## API

### Autenticación general

#### `POST /login`

Valida el santo y seña general.

Cuerpo:

```json
{
  "name": "SATOR",
  "password": "TENET"
}
```

Respuesta correcta:

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

### Perfil iniciado

#### `POST /api/initiated`

Inicia sesión con un perfil existente.

Cuerpo:

```json
{
  "alias": "mi alias",
  "phrase": "mi frase",
  "hiddenThought": "mi frase contraseña",
  "number": 42
}
```

### Creación de perfiles

#### `POST /api/users`

Crea un perfil nuevo.

Requiere una sesión con `accessGranted: true`.

Cuerpo:

```json
{
  "alias": "mi alias",
  "phrase": "mi frase",
  "hiddenThought": "mi frase contraseña",
  "number": 42,
  "imageId": "oraculo"
}
```

### Imágenes de perfil

#### `GET /api/profile-images`

Devuelve las imágenes permitidas para la creación de perfiles.

### Frases identificativas

#### `GET /api/key-sentences`

Devuelve las frases disponibles para el selector de perfil.

### Eventos

#### `GET /api/events`

Devuelve los eventos normalizados y ordenados.

### Sesión

#### `GET /api/session`

Devuelve la sesión pública actual.

#### `DELETE /api/session`

Elimina la sesión del servidor y borra la cookie.

### Reservas

#### `POST /api/session/events`

Añade un evento a la agenda de la sesión activa.

Cuerpo:

```json
{
  "eventId": "IDENTIFICADOR_DE_MONGODB"
}
```

Requiere un perfil activo.

## Sesiones y autenticación

La aplicación no utiliza tokens JWT en el navegador.

En su lugar:

1. el servidor genera un identificador aleatorio de 32 bytes;
2. lo almacena en una cookie llamada `minihub_session`;
3. la cookie se configura como `HttpOnly`;
4. los datos de sesión se almacenan en MongoDB;
5. React solo recibe la parte pública de la sesión.

La sesión pública contiene:

```json
{
  "accessGranted": false,
  "profile": null,
  "attendingEvents": []
}
```

### Duración

Las sesiones duran ocho horas.

Cuando una sesión activa supera la mitad de su periodo de vida, el servidor renueva su vencimiento.

### Cookie

Propiedades:

- `HttpOnly`;
- `SameSite=Lax`;
- `Path=/`;
- `Secure` en producción.

JavaScript no puede leer directamente el identificador de sesión.

## Eventos y reservas

Los eventos se recuperan desde MongoDB y se normalizan antes de enviarlos al cliente.

La normalización permite que datos antiguos o importados utilicen nombres de campos diferentes.

### Niveles actuales de la interfaz

La interfaz define mensajes especiales para:

| Orden | Nivel | Capacidad informativa |
|---:|---|---:|
| 1 | El Atrio | 80 |
| 2 | El Círculo | 50 |
| 3 | El Santuario | 20 |

Estas capacidades se utilizan como texto informativo en el frontend. No existe todavía una lógica de cupos persistente que descuente plazas en MongoDB.

### Persistencia de reservas

Las reservas:

- quedan asociadas a la sesión;
- no se duplican;
- se limitan a un máximo de 50 eventos;
- se refrescan desde MongoDB al consultar la sesión;
- desaparecen cuando la sesión expira o se cierra.

Por tanto, actualmente no constituyen una reserva permanente asociada al documento del usuario.

## Imágenes y Cloudinary

Cloudinary es opcional.

Cuando existe `CLOUDINARY_URL` y una imagen contiene `/image/upload/`, el servidor modifica la URL para aplicar:

- formato automático;
- calidad automática;
- redimensionado;
- recorte inteligente cuando corresponde.

Si la URL no pertenece a Cloudinary, se devuelve sin modificar.

El proyecto no sube archivos directamente a Cloudinary. Las URLs deben existir previamente en MongoDB.

## Renderizado SSR

La aplicación utiliza SSR tanto en desarrollo como en producción.

### Desarrollo

Express crea un servidor Vite en modo middleware.

Para cada ruta:

1. lee `index.html`;
2. Vite transforma la plantilla;
3. carga `src/entry-server.jsx`;
4. renderiza React con `renderToString`;
5. inserta la sesión pública inicial;
6. devuelve el HTML.

### Navegador

`src/main.jsx` utiliza `hydrateRoot` para conectar React con el HTML generado por el servidor.

La sesión inicial se recibe mediante:

```js
window.__MINIHUB_SESSION__
```

Después de hidratar, el frontend vuelve a consultar `/api/session` para comprobar que la sesión sigue siendo válida.

### Producción

Express sirve los archivos de `dist/` y carga:

```text
dist/server/entry-server.js
```

Las respuestas SSR se envían con:

```http
Cache-Control: no-store
```

Esto evita que una caché reutilice por error el HTML personalizado de otro usuario.

## Seguridad

El proyecto incorpora varias medidas de seguridad.

### Contraseñas

- Las credenciales generales se almacenan con `bcrypt`.
- Las frases contraseña de perfiles nuevos se almacenan como hash.
- El coste de `bcrypt` es de 12 rondas.
- Existe compatibilidad temporal con perfiles antiguos guardados en texto plano.

### Sesiones

- Identificadores aleatorios criptográficamente.
- Cookies `HttpOnly`.
- Cookies `Secure` en producción.
- Sesiones almacenadas en MongoDB.
- Expiración automática mediante TTL.
- La API nunca expone el identificador interno de sesión.

### Validación

- Longitudes máximas para campos de texto.
- Validación estricta de números.
- Rechazo de claves MongoDB que comiencen por `$`.
- Rechazo de claves que contienen puntos.
- Límite del cuerpo JSON de 32 KB.
- Rechazo de JSON mal formado.

### Protección de datos confiables

El servidor no confía en:

- la URL de imagen enviada por el navegador;
- los datos completos de un evento reservado;
- códigos o contraseñas enviados desde el cliente.

Para crear un perfil, el navegador envía `imageId`.

Para reservar, el navegador envía `eventId`.

El servidor recupera los documentos válidos desde MongoDB.

### Rate limiting

Se aplican límites a:

- rutas generales de API;
- intentos de autenticación;
- creación de perfiles.

El almacenamiento del limitador está en memoria. En despliegues con varias instancias sería necesario sustituirlo por Redis u otro almacén compartido.

### Cabeceras

Entre otras, el servidor configura:

- `Content-Security-Policy`;
- `X-Content-Type-Options`;
- `X-Frame-Options`;
- `Referrer-Policy`;
- `Cross-Origin-Opener-Policy`;
- `Cross-Origin-Resource-Policy`;
- `Permissions-Policy`;
- `Strict-Transport-Security` en producción.

También rechaza escrituras marcadas por el navegador como procedentes de otro sitio.

## Producción

### 1. Configurar variables

En producción deben definirse como mínimo:

```env
NODE_ENV=production
DB=mongodb+srv://...
DB_NAME=minihub
DEFAULT_ACCESS_NAME=...
DEFAULT_ACCESS_PASSWORD=...
PORT=3000
```

No dependas de `SATOR` y `TENET` en producción. En ese modo, el código no utiliza esas credenciales como respaldo.

### 2. Compilar

```bash
npm run build
```

### 3. Iniciar

```bash
NODE_ENV=production node server.js
```

También puede utilizarse:

```bash
npm run preview
```

### 4. Proxy inverso

En producción, el servidor activa:

```js
app.set('trust proxy', 1)
```

Esto permite trabajar detrás de un proxy seguro como Nginx, Render, Railway o una plataforma similar.

El proxy debe proporcionar HTTPS para que la cookie `Secure` funcione correctamente.

### 5. Consideraciones

- La carpeta `dist/` debe existir antes de iniciar.
- MongoDB debe ser accesible desde el servidor.
- Las variables sensibles no deben incluirse en Git.
- El proceso necesita almacenamiento persistente únicamente en MongoDB.
- Las imágenes deben estar disponibles mediante URLs públicas o Cloudinary.
- Para varias instancias, el rate limiter debería usar un almacén compartido.

## Limitaciones actuales

- No existe panel de administración.
- No existe CRUD de eventos desde la interfaz.
- No existe subida directa de imágenes.
- Las reservas viven en la sesión y no en el perfil permanente.
- No existe control real de aforo.
- No existe proceso de confirmación administrativa.
- No existe recuperación de la frase contraseña.
- No existe verificación de unicidad para alias o número personal.
- No hay pruebas automatizadas.
- No se declara una versión mínima de Node.js.
- El limitador de solicitudes utiliza memoria local.
- `mongoose` está instalado, pero no se utiliza.
- La ruta de creación de perfil depende de que el usuario haya superado previamente el acceso general.
- El texto “eventos confirmados” de la agenda puede resultar confuso, porque la reserva se presenta también como provisional.

## Próximas mejoras sugeridas

- Añadir un panel de administración.
- Crear CRUD de eventos.
- Persistir reservas en una colección propia.
- Relacionar reservas con usuarios en lugar de sesiones.
- Implementar cupos reales y listas de espera.
- Añadir estados de reserva: solicitada, aceptada y rechazada.
- Añadir índices únicos para alias y número.
- Incorporar pruebas unitarias y de integración.
- Documentar una versión mínima de Node.js.
- Eliminar dependencias sin uso.
- Añadir validación de esquema con Zod, Joi o una solución equivalente.
- Utilizar Redis para el rate limiting distribuido.
- Añadir carga firmada de imágenes a Cloudinary.
- Añadir logs estructurados y monitorización.
- Crear una colección o herramienta de datos iniciales para desarrollo.

## Licencia

Actualmente el repositorio no incluye un archivo de licencia.

Sin una licencia explícita, el código conserva por defecto todos los derechos de su autor. Añade un archivo `LICENSE` antes de permitir reutilización, modificación o distribución por terceros.

## Autor

Proyecto desarrollado por [joseeangeel97](https://github.com/joseeangeel97).
