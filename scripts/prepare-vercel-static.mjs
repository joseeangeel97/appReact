import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const clientAssets = path.join(projectRoot, 'dist', 'assets');
const publicAssets = path.join(projectRoot, 'public', 'assets');

// Vercel ignora express.static(). Solo los bundles públicos van al CDN; el
// index permanece en dist para que todas las páginas sigan pasando por SSR.
await rm(publicAssets, { recursive: true, force: true });
await mkdir(path.dirname(publicAssets), { recursive: true });
await cp(clientAssets, publicAssets, { recursive: true });
