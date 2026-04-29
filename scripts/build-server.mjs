#!/usr/bin/env node
import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// Build SSR entry
await build({
  entryPoints: [path.join(root, 'src/client/entry-server.tsx')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: path.join(root, 'dist/server/entry-server.js'),
  external: ['react', 'react-dom', 'react-router-dom'],
  jsx: 'automatic',
});

// Build server
await build({
  entryPoints: [path.join(root, 'server/index.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: path.join(root, 'dist/index.js'),
  external: [
    'express', 'compression', 'serve-static', 'pg', 'node-cron',
    'vite', 'react', 'react-dom', 'react-router-dom',
    './dist/server/entry-server.js',
    '../dist/server/entry-server.js',
  ],
  packages: 'external',
  jsx: 'automatic',
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});

console.log('[build-server] Done');
