import fs from 'fs';
import path from 'path';

import express from 'express';
import { createServer as createViteServer } from 'vite';

export async function configureSsr(app, httpServer, { rootDir, isProduction }) {
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
          path.resolve(rootDir, 'index.html'),
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

    return;
  }

  app.use(express.static(path.resolve(rootDir, 'dist'), { index: false }));

  app.use('*', async (req, res) => {
    try {
      const url = req.originalUrl;
      const template = fs.readFileSync(
        path.resolve(rootDir, 'dist/index.html'),
        'utf-8',
      );
      const { render } = await import(
        path.resolve(rootDir, 'dist/server/entry-server.js')
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
