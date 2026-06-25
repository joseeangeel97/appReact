import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

async function createServer() {
  const app = express();

  if (!isProd) {
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: 'ssr' },
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

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

createServer();
