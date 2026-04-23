/**
 * Re-upload article hero images to Bunny CDN with higher quality.
 * Uses Python/Pillow to create dark warm themed images with proper quality.
 */

import { execSync, spawnSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const BUNNY_STORAGE_URL = 'https://ny.storage.bunnycdn.com/meditative-dying';
const BUNNY_API_KEY = 'a4dc2c02-3fb8-44f0-b3b49c8102f0-8aef-4366';
const CDN_URL = 'https://meditative-dying.b-cdn.net';

const ARTICLE_IMAGES = [
  { slug: 'what-conscious-dying-actually-means', source: '/home/ubuntu/upload/search_images/jrOSbF3xfKmg.jpg' },
  { slug: 'the-five-stages-of-dying', source: '/home/ubuntu/upload/search_images/NhZ4tqA2q49q.jpg' },
  { slug: 'how-to-prepare-for-your-own-death', source: '/home/ubuntu/upload/search_images/NZpdiVN1zA6C.jpg' },
  { slug: 'the-death-doula', source: '/home/ubuntu/upload/search_images/M5Iz9XYutQwn.jpg' },
  { slug: 'what-is-a-good-death', source: '/home/ubuntu/upload/search_images/e5BHiqEZtWNb.jpg' },
  { slug: 'the-difference-between-dying-and-death', source: '/home/ubuntu/upload/search_images/UxTN2TMmK9p2.jpg' },
  { slug: 'fear-of-death', source: '/home/ubuntu/upload/search_images/T4eCjLuQrken.jpg' },
  { slug: 'the-death-positive-movement', source: '/home/ubuntu/upload/search_images/F1sOGGzB0xqd.jpg' },
  { slug: 'how-to-talk-to-someone-who-is-dying', source: '/home/ubuntu/upload/search_images/ZiQ6JBQL6FaM.png' },
  { slug: 'sitting-vigil', source: '/home/ubuntu/upload/search_images/owF9LVSYiFV9.jpg' },
  { slug: 'the-tibetan-buddhist-bardo', source: '/home/ubuntu/upload/search_images/MmghivXUHIST.jpg' },
  { slug: 'phowa', source: '/home/ubuntu/upload/search_images/BKxGvXclEiIB.jpg' },
  { slug: 'the-tibetan-book-of-the-dead', source: '/home/ubuntu/upload/search_images/XVq9wfaXdox4.jpg' },
  { slug: 'mahamudra-and-death', source: '/home/ubuntu/upload/search_images/pkgrBLEgm747.jpg' },
  { slug: 'preparing-for-death-through-tibetan-buddhist-practice', source: '/home/ubuntu/upload/search_images/MmghivXUHIST.jpg' },
  { slug: 'anticipatory-grief', source: '/home/ubuntu/upload/search_images/T4eCjLuQrken.jpg' },
  { slug: 'disenfranchised-grief', source: '/home/ubuntu/upload/search_images/NhZ4tqA2q49q.jpg' },
  { slug: 'grief-after-a-difficult-relationship', source: '/home/ubuntu/upload/search_images/owF9LVSYiFV9.jpg' },
  { slug: 'how-long-does-grief-last', source: '/home/ubuntu/upload/search_images/UxTN2TMmK9p2.jpg' },
  { slug: 'the-grief-of-the-caregiver', source: '/home/ubuntu/upload/search_images/M5Iz9XYutQwn.jpg' },
  { slug: 'advance-directives', source: '/home/ubuntu/upload/search_images/NZpdiVN1zA6C.jpg' },
  { slug: 'hospice-vs-palliative-care', source: '/home/ubuntu/upload/search_images/91ZayRfapEOR.jpg' },
  { slug: 'green-burial', source: '/home/ubuntu/upload/search_images/F1sOGGzB0xqd.jpg' },
  { slug: 'legacy-letters', source: '/home/ubuntu/upload/search_images/cQIZySK50vgU.jpg' },
  { slug: 'the-practical-checklist-for-getting-your-affairs-in-order', source: '/home/ubuntu/upload/search_images/NZpdiVN1zA6C.jpg' },
  { slug: 'the-vedantic-view-of-death', source: '/home/ubuntu/upload/search_images/pkgrBLEgm747.jpg' },
  { slug: 'psychedelic-assisted-end-of-life-therapy', source: '/home/ubuntu/upload/search_images/e5BHiqEZtWNb.jpg' },
  { slug: 'death-meditation', source: '/home/ubuntu/upload/search_images/XVq9wfaXdox4.jpg' },
  { slug: 'stephen-levines-a-year-to-live', source: '/home/ubuntu/upload/search_images/cQIZySK50vgU.jpg' },
  { slug: 'music-and-sound-at-the-end-of-life', source: '/home/ubuntu/upload/search_images/XVq9wfaXdox4.jpg' },
  // Hero background
  { slug: 'hero-bg', source: '/home/ubuntu/upload/search_images/jrOSbF3xfKmg.jpg', isHero: true },
];

const tmpDir = '/tmp/cc-images-hq';
mkdirSync(tmpDir, { recursive: true });

// Python script for high quality image processing
const pythonScript = `
import sys
import os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import io

def process_image(source_path, output_path, is_hero=False):
    try:
        img = Image.open(source_path).convert('RGB')
    except Exception as e:
        print(f"Error opening {source_path}: {e}", file=sys.stderr)
        # Create gradient fallback
        img = Image.new('RGB', (1200, 630), color=(20, 17, 14))
        draw = ImageDraw.Draw(img)
        for y in range(630):
            darkness = int(20 + (y/630) * 15)
            r = min(darkness + 10, 255)
            g = min(darkness + 8, 255)
            b = min(darkness + 5, 255)
            draw.line([(0, y), (1200, y)], fill=(r, g, b))

    # Resize to 1200x630 (OG image standard)
    img = img.resize((1200, 630), Image.LANCZOS)

    # Enhance contrast slightly
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.1)

    # Enhance saturation slightly
    enhancer = ImageEnhance.Color(img)
    img = enhancer.enhance(0.85)  # Slightly desaturate for moody look

    # Darken the image
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(0.7)

    # Apply warm color tint overlay
    overlay = Image.new('RGB', (1200, 630), (40, 30, 15))
    img = Image.blend(img, overlay, alpha=0.25)

    # Add gradient overlay (darker at edges, lighter in center)
    gradient = Image.new('RGBA', (1200, 630), (0, 0, 0, 0))
    draw = ImageDraw.Draw(gradient)
    
    if is_hero:
        # For hero: gradient from left (dark) to right (transparent)
        for x in range(1200):
            alpha = int(180 * (1 - x/1200) + 60)
            draw.line([(x, 0), (x, 630)], fill=(14, 12, 10, alpha))
    else:
        # For article cards: gradient from bottom (dark) to top (transparent)
        for y in range(630):
            alpha = int(160 * (y/630))
            draw.line([(0, y), (1200, y)], fill=(14, 12, 10, alpha))

    img = img.convert('RGBA')
    img = Image.alpha_composite(img, gradient)
    img = img.convert('RGB')

    # Save as high quality WebP
    img.save(output_path, 'WEBP', quality=85, method=6)
    size = os.path.getsize(output_path)
    print(f"Saved {output_path} ({size} bytes)")

if __name__ == '__main__':
    source = sys.argv[1]
    output = sys.argv[2]
    is_hero = len(sys.argv) > 3 and sys.argv[3] == 'hero'
    process_image(source, output, is_hero)
`;

const pyScriptPath = `${tmpDir}/process_image.py`;
writeFileSync(pyScriptPath, pythonScript);

let uploaded = 0;
let failed = 0;

for (const img of ARTICLE_IMAGES) {
  const outputPath = `${tmpDir}/${img.slug}.webp`;
  const cdnPath = img.isHero ? `conscious-crossing/${img.slug}.webp` : `articles/${img.slug}.webp`;
  
  console.log(`Processing: ${img.slug}...`);
  
  // Generate image
  const result = spawnSync('python3', [pyScriptPath, img.source, outputPath, img.isHero ? 'hero' : 'article'], {
    encoding: 'utf8',
    timeout: 30000
  });
  
  if (result.status !== 0) {
    console.error(`  Failed to generate: ${result.stderr}`);
    failed++;
    continue;
  }
  
  // Upload to Bunny CDN
  try {
    const uploadResult = execSync(
      `curl -s -o /dev/null -w "%{http_code}" -X PUT ` +
      `-H "AccessKey: ${BUNNY_API_KEY}" ` +
      `-H "Content-Type: image/webp" ` +
      `--data-binary @"${outputPath}" ` +
      `"${BUNNY_STORAGE_URL}/${cdnPath}"`,
      { encoding: 'utf8', timeout: 30000 }
    ).trim();
    
    if (uploadResult === '201' || uploadResult === '200') {
      console.log(`  ✓ Uploaded: ${CDN_URL}/${cdnPath}`);
      uploaded++;
    } else {
      console.error(`  ✗ Upload failed with HTTP ${uploadResult}`);
      failed++;
    }
  } catch (err) {
    console.error(`  ✗ Upload error: ${err.message}`);
    failed++;
  }
}

console.log(`\nDone: ${uploaded} uploaded, ${failed} failed`);
