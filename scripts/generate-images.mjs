#!/usr/bin/env node
/**
 * Generate hero images for all articles using Unsplash/Pexels and upload to Bunny CDN.
 * Falls back to a generated placeholder if image not found.
 * Usage: node scripts/generate-images.mjs [--slug=some-slug] [--all]
 */

import { query } from '../src/lib/db.mjs';
import { uploadToBunny, checkBunnyFile } from '../src/lib/image-upload.mjs';
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

const ARTICLE_IMAGE_QUERIES = {
  'what-conscious-dying-actually-means': 'candle flame meditation peaceful',
  'the-five-stages-of-dying': 'autumn leaves falling nature cycle',
  'how-to-prepare-for-your-own-death': 'writing journal peaceful morning',
  'the-death-doula': 'holding hands comfort care',
  'what-is-a-good-death': 'sunset golden hour peaceful',
  'the-difference-between-dying-and-death': 'river flowing nature peaceful',
  'fear-of-death': 'dark forest light path',
  'the-death-positive-movement': 'flowers memorial garden',
  'how-to-talk-to-someone-who-is-dying': 'two people talking quietly',
  'sitting-vigil': 'candle light bedside vigil',
  'the-tibetan-buddhist-bardo': 'tibetan prayer flags mountains',
  'phowa': 'lotus flower meditation spiritual',
  'the-tibetan-book-of-the-dead': 'ancient manuscript sacred text',
  'mahamudra-and-death': 'clear light sky meditation',
  'preparing-for-death-through-tibetan-buddhist-practice': 'buddhist temple meditation',
  'anticipatory-grief': 'person sitting alone contemplating',
  'disenfranchised-grief': 'solitary figure ocean',
  'grief-after-a-difficult-relationship': 'empty chair window light',
  'how-long-does-grief-last': 'seasons change nature time',
  'the-grief-of-the-caregiver': 'caregiver hands compassion',
  'advance-directives': 'document pen writing important',
  'hospice-vs-palliative-care': 'hospital garden peaceful',
  'green-burial': 'forest floor moss nature burial',
  'legacy-letters': 'handwritten letter envelope',
  'the-practical-checklist-for-getting-your-affairs-in-order': 'organized desk planning',
  'the-vedantic-view-of-death': 'sunrise spiritual awakening',
  'psychedelic-assisted-end-of-life-therapy': 'colorful abstract consciousness',
  'death-meditation': 'meditation cushion candle zen',
  'stephen-levines-a-year-to-live': 'open book nature peaceful',
  'music-and-sound-at-the-end-of-life': 'singing bowl sound healing',
};

const DEFAULT_QUERIES = [
  'peaceful nature meditation',
  'candle flame dark background',
  'autumn leaves contemplation',
  'sunset horizon spiritual',
  'forest path light',
];

async function fetchUnsplashImage(query) {
  if (!UNSPLASH_ACCESS_KEY) return null;

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&content_filter=high`;
    const res = await fetch(url, {
      headers: { 'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;
    const photo = data.results[0];
    return {
      url: photo.urls.regular,
      credit: `Photo by ${photo.user.name} on Unsplash`,
      creditUrl: photo.links.html,
    };
  } catch (err) {
    console.warn(`Unsplash error: ${err.message}`);
    return null;
  }
}

async function fetchPexelsImage(query) {
  if (!PEXELS_API_KEY) return null;

  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    const res = await fetch(url, {
      headers: { 'Authorization': PEXELS_API_KEY },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.photos || data.photos.length === 0) return null;
    const photo = data.photos[0];
    return {
      url: photo.src.large2x || photo.src.large,
      credit: `Photo by ${photo.photographer} on Pexels`,
      creditUrl: photo.url,
    };
  } catch (err) {
    console.warn(`Pexels error: ${err.message}`);
    return null;
  }
}

async function downloadAndConvertToWebP(imageUrl, outputPath) {
  // Download image
  const tmpPath = path.join(tmpdir(), `cc-img-${Date.now()}.jpg`);

  const res = await fetch(imageUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; image-fetcher/1.0)' },
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) throw new Error(`Failed to download: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(tmpPath, buffer);

  // Convert to WebP using Python/Pillow
  const script = `
from PIL import Image
import sys
img = Image.open('${tmpPath}')
# Resize to max 1200x800 maintaining aspect ratio
img.thumbnail((1200, 800), Image.LANCZOS)
# Convert to RGB if needed (handles PNG with alpha)
if img.mode in ('RGBA', 'P', 'LA'):
    img = img.convert('RGB')
img.save('${outputPath}', 'WebP', quality=82, method=6)
print(f'Converted: {img.size}')
`;
  execSync(`python3 -c "${script.replace(/'/g, '"').replace(/\n/g, '; ')}"`, { stdio: 'pipe' });

  // Cleanup
  try { unlinkSync(tmpPath); } catch {}

  return outputPath;
}

async function processArticle(article) {
  const slug = article.slug;
  const remotePath = `articles/${slug}.webp`;

  console.log(`\nProcessing: ${slug}`);

  // Check if already exists on CDN
  const existing = await checkBunnyFile(remotePath);
  if (existing.exists) {
    console.log(`  Already on CDN: ${existing.url}`);
    return existing.url;
  }

  // Find image query
  const imageQuery = ARTICLE_IMAGE_QUERIES[slug]
    || DEFAULT_QUERIES[Math.floor(Math.random() * DEFAULT_QUERIES.length)];

  console.log(`  Searching for: "${imageQuery}"`);

  // Try Unsplash first, then Pexels
  let imageInfo = await fetchUnsplashImage(imageQuery);
  if (!imageInfo) {
    console.log(`  Unsplash empty, trying Pexels...`);
    imageInfo = await fetchPexelsImage(imageQuery);
  }

  if (!imageInfo) {
    console.warn(`  No image found for "${imageQuery}", using placeholder`);
    // Create a placeholder WebP
    const outputPath = path.join(tmpdir(), `${slug}.webp`);
    const script = `
from PIL import Image, ImageDraw, ImageFont
import sys
img = Image.new('RGB', (1200, 800), color=(30, 27, 24))
draw = ImageDraw.Draw(img)
# Draw a simple pattern
for i in range(0, 1200, 40):
    draw.line([(i, 0), (i, 800)], fill=(40, 37, 34), width=1)
for j in range(0, 800, 40):
    draw.line([(0, j), (1200, j)], fill=(40, 37, 34), width=1)
img.save('${outputPath}', 'WebP', quality=82)
`;
    execSync(`python3 -c "${script.replace(/\n/g, '; ')}"`, { stdio: 'pipe' });
    const cdnUrl = await uploadToBunny(outputPath, remotePath);
    console.log(`  Uploaded placeholder: ${cdnUrl}`);
    try { unlinkSync(outputPath); } catch {}
    return cdnUrl;
  }

  // Download, convert, upload
  const outputPath = path.join(tmpdir(), `${slug}.webp`);
  try {
    await downloadAndConvertToWebP(imageInfo.url, outputPath);
    const cdnUrl = await uploadToBunny(outputPath, remotePath);
    console.log(`  Uploaded: ${cdnUrl}`);
    console.log(`  Credit: ${imageInfo.credit}`);
    try { unlinkSync(outputPath); } catch {}
    return cdnUrl;
  } catch (err) {
    console.error(`  Error processing image: ${err.message}`);
    return null;
  }
}

async function updateArticleImageUrl(slug, imageUrl) {
  await query(
    'UPDATE articles SET image_url = $1, updated_at = NOW() WHERE slug = $2',
    [imageUrl, slug]
  );
}

async function main() {
  const args = process.argv.slice(2);
  const specificSlug = args.find(a => a.startsWith('--slug='))?.split('=')[1];
  const all = args.includes('--all');

  let articles;
  if (specificSlug) {
    const res = await query('SELECT id, slug FROM articles WHERE slug = $1', [specificSlug]);
    articles = res.rows;
  } else if (all) {
    const res = await query('SELECT id, slug FROM articles ORDER BY id', []);
    articles = res.rows;
  } else {
    // Process articles missing images
    const res = await query(
      "SELECT id, slug FROM articles WHERE image_url IS NULL OR image_url = '' ORDER BY id",
      []
    );
    articles = res.rows;
  }

  console.log(`Processing ${articles.length} articles...`);

  for (const article of articles) {
    try {
      const cdnUrl = await processArticle(article);
      if (cdnUrl) {
        await updateArticleImageUrl(article.slug, cdnUrl);
      }
      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`Error for ${article.slug}:`, err.message);
    }
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
