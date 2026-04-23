#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const proc = spawn('node', ['dist/index.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit',
});

proc.on('exit', (code) => {
  console.log(`[start] Process exited with code ${code}`);
  process.exit(code ?? 0);
});

process.on('SIGTERM', () => {
  console.log('[start] SIGTERM received, shutting down...');
  proc.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('[start] SIGINT received, shutting down...');
  proc.kill('SIGINT');
});
