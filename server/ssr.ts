import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';

export async function renderPage(url: string, options?: { vite?: any }): Promise<string> {
  let template: string;
  let render: (url: string) => Promise<{ html: string; head?: string }>;

  if (isDev && options?.vite) {
    template = fs.readFileSync(path.resolve('index.html'), 'utf-8');
    template = await options.vite.transformIndexHtml(url, template);
    const mod = await options.vite.ssrLoadModule('/src/client/entry-server.tsx');
    render = mod.render;
  } else {
    const distPath = path.resolve(__dirname, '../dist');
    template = fs.readFileSync(path.join(distPath, 'client/index.html'), 'utf-8');
    const serverEntry = await import(path.join(distPath, 'server/entry-server.js'));
    render = serverEntry.render;
  }

  const { html: appHtml, head = '' } = await render(url);

  const finalHtml = template
    .replace('<!--head-tags-->', head)
    .replace('<!--app-html-->', appHtml);

  return finalHtml;
}
