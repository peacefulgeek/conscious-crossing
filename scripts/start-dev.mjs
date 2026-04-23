#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const proc = spawn('node', ['--loader', 'ts-node/esm', 'server/index.ts'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'inherit',
});

proc.on('exit', (code) => process.exit(code ?? 0));
