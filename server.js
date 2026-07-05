import express from 'express';
import { createServer as createHttpServer } from 'node:http';
import path from 'path';
import { fileURLToPath } from 'url';

import { isProduction } from './server/config.js';
import { registerAuthRoutes } from './server/routes/auth.js';
import { registerEventRoutes } from './server/routes/events.js';
import { registerProfileRoutes } from './server/routes/profile.js';
import { configureSsr } from './server/ssr.js';

// Punto de entrada del backend: crea Express, registra rutas y sirve React.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);

  // Permite leer cuerpos JSON enviados desde los formularios del frontend.
  app.use(express.json());

  // Rutas de autenticación general y de perfiles/iniciados.
  registerAuthRoutes(app);
  registerEventRoutes(app);
  registerProfileRoutes(app);

  // En desarrollo usa Vite como middleware; en producción sirve dist/.
  await configureSsr(app, httpServer, {
    rootDir: __dirname,
    isProduction,
  });

  // Puerto base. En desarrollo prueba puertos siguientes si el 3000 está ocupado.
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

  // Reintenta con el siguiente puerto solo cuando es seguro hacerlo en desarrollo.
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
