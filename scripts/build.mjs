import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, 'dist');
const serverDirectory = path.join(outputDirectory, 'server');
const html = await readFile(path.join(projectRoot, 'index.html'), 'utf8');

const worker = `const html = ${JSON.stringify(html)};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== '/' && url.pathname !== '/index.html') {
      return new Response('Not found', { status: 404 });
    }

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
        'cache-control': 'public, max-age=300'
      }
    });
  }
};
`;

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(serverDirectory, { recursive: true });
await writeFile(path.join(serverDirectory, 'index.js'), worker, 'utf8');
