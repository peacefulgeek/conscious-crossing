import { createReadStream, existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

const BUNNY_STORAGE_ZONE = 'meditative-dying';
const BUNNY_STORAGE_ENDPOINT = 'https://ny.storage.bunnycdn.com';
const BUNNY_CDN_BASE = 'https://meditative-dying.b-cdn.net';
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || 'a4dc2c02-3fb8-44f0-b3b49c8102f0-8aef-4366';

export async function uploadToBunny(localPath, remotePath) {
  if (!existsSync(localPath)) {
    throw new Error(`File not found: ${localPath}`);
  }

  const fileBuffer = await readFile(localPath);
  const url = `${BUNNY_STORAGE_ENDPOINT}/${BUNNY_STORAGE_ZONE}/${remotePath}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_API_KEY,
      'Content-Type': 'image/webp',
      'Content-Length': String(fileBuffer.length),
    },
    body: fileBuffer,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Bunny upload failed: ${response.status} ${text}`);
  }

  const cdnUrl = `${BUNNY_CDN_BASE}/${remotePath}`;
  return cdnUrl;
}

export async function uploadImageFromUrl(imageUrl, remotePath) {
  const response = await fetch(imageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; image-fetcher/1.0)' },
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${imageUrl}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const url = `${BUNNY_STORAGE_ENDPOINT}/${BUNNY_STORAGE_ZONE}/${remotePath}`;

  const uploadResponse = await fetch(url, {
    method: 'PUT',
    headers: {
      'AccessKey': BUNNY_API_KEY,
      'Content-Type': 'image/webp',
      'Content-Length': String(buffer.length),
    },
    body: buffer,
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text();
    throw new Error(`Bunny upload failed: ${uploadResponse.status} ${text}`);
  }

  return `${BUNNY_CDN_BASE}/${remotePath}`;
}

export async function checkBunnyFile(remotePath) {
  const url = `${BUNNY_CDN_BASE}/${remotePath}`;
  try {
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    return { exists: response.ok, status: response.status, url };
  } catch (err) {
    return { exists: false, error: err.message, url };
  }
}

export function buildCdnUrl(remotePath) {
  return `${BUNNY_CDN_BASE}/${remotePath}`;
}
