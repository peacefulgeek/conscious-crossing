#!/usr/bin/env node
/**
 * Visual QA script - checks build output for common issues.
 * Runs after build to catch broken imports, missing files, etc.
 */
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const errors = [];
const warnings = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function warn(condition, message) {
  if (!condition) warnings.push(message);
}

// Check required build outputs
check(existsSync(path.join(root, 'dist/client/index.html')), 'dist/client/index.html missing');
check(existsSync(path.join(root, 'dist/index.js')), 'dist/index.js missing');
check(existsSync(path.join(root, 'dist/server/entry-server.js')), 'dist/server/entry-server.js missing');

// Check index.html has correct placeholders
if (existsSync(path.join(root, 'dist/client/index.html'))) {
  const html = readFileSync(path.join(root, 'dist/client/index.html'), 'utf-8');
  check(html.includes('<!--head-tags-->'), 'dist/client/index.html missing <!--head-tags--> placeholder');
  check(html.includes('<!--app-html-->'), 'dist/client/index.html missing <!--app-html--> placeholder');
  check(html.includes('The Conscious Crossing'), 'dist/client/index.html missing title');
  warn(!html.includes('undefined'), 'dist/client/index.html contains "undefined"');
}

// Check server entry
if (existsSync(path.join(root, 'dist/index.js'))) {
  const serverJs = readFileSync(path.join(root, 'dist/index.js'), 'utf-8');
  check(serverJs.includes('healthRouter') || serverJs.includes('/health'), 'dist/index.js missing health route');
  check(serverJs.includes('articlesRouter') || serverJs.includes('/api/articles'), 'dist/index.js missing articles route');
}

// Report
if (warnings.length > 0) {
  console.warn('[visual-qa] Warnings:');
  warnings.forEach(w => console.warn(`  ⚠ ${w}`));
}

if (errors.length > 0) {
  console.error('[visual-qa] ERRORS:');
  errors.forEach(e => console.error(`  ✗ ${e}`));
  process.exit(1);
} else {
  console.log('[visual-qa] All checks passed ✓');
}
