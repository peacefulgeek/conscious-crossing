#!/usr/bin/env node
/**
 * Upload article hero images to Bunny CDN.
 * Creates unique images using Python/Pillow with dark warm theme overlays.
 * Uploads as WebP to meditative-dying.b-cdn.net
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const BUNNY_STORAGE_URL = 'https://ny.storage.bunnycdn.com/meditative-dying';
const BUNNY_API_KEY = 'a4dc2c02-3fb8-44f0-b3b49c8102f0-8aef-4366';
const CDN_URL = 'https://meditative-dying.b-cdn.net';

// Map slugs to source images and overlay text
const ARTICLE_IMAGES = [
  { slug: 'what-conscious-dying-actually-means', source: '/home/ubuntu/upload/search_images/jrOSbF3xfKmg.jpg', title: 'Conscious Dying', subtitle: 'A Practice, Not a Philosophy' },
  { slug: 'the-five-stages-of-dying', source: '/home/ubuntu/upload/search_images/NhZ4tqA2q49q.jpg', title: 'The Five Stages', subtitle: 'What Dying Actually Looks Like' },
  { slug: 'how-to-prepare-for-your-own-death', source: '/home/ubuntu/upload/search_images/NZpdiVN1zA6C.jpg', title: 'Prepare for Death', subtitle: 'A Practical Checklist' },
  { slug: 'the-death-doula', source: '/home/ubuntu/upload/search_images/M5Iz9XYutQwn.jpg', title: 'The Death Doula', subtitle: 'A Guide Through the Threshold' },
  { slug: 'what-is-a-good-death', source: '/home/ubuntu/upload/search_images/e5BHiqEZtWNb.jpg', title: 'A Good Death', subtitle: 'Defining It Before You Need To' },
  { slug: 'the-difference-between-dying-and-death', source: '/home/ubuntu/upload/search_images/UxTN2TMmK9p2.jpg', title: 'Dying vs. Death', subtitle: 'What the Body Goes Through' },
  { slug: 'fear-of-death', source: '/home/ubuntu/upload/search_images/T4eCjLuQrken.jpg', title: 'Fear of Death', subtitle: 'Working With It, Not Around It' },
  { slug: 'the-death-positive-movement', source: '/home/ubuntu/upload/search_images/F1sOGGzB0xqd.jpg', title: 'Death Positive', subtitle: 'Ending the Cultural Silence' },
  { slug: 'how-to-talk-to-someone-who-is-dying', source: '/home/ubuntu/upload/search_images/ZiQ6JBQL6FaM.png', title: 'Talking to the Dying', subtitle: 'What to Say and What Not To' },
  { slug: 'sitting-vigil', source: '/home/ubuntu/upload/search_images/owF9LVSYiFV9.jpg', title: 'Sitting Vigil', subtitle: 'Presence at the Bedside' },
  { slug: 'the-tibetan-buddhist-bardo', source: '/home/ubuntu/upload/search_images/MmghivXUHIST.jpg', title: 'The Bardo', subtitle: 'The Intermediate State' },
  { slug: 'phowa', source: '/home/ubuntu/upload/search_images/BKxGvXclEiIB.jpg', title: 'Phowa', subtitle: 'Consciousness Transference' },
  { slug: 'the-tibetan-book-of-the-dead', source: '/home/ubuntu/upload/search_images/XVq9wfaXdox4.jpg', title: 'Tibetan Book of the Dead', subtitle: 'What It Actually Says' },
  { slug: 'mahamudra-and-death', source: '/home/ubuntu/upload/search_images/pkgrBLEgm747.jpg', title: 'Mahamudra & Death', subtitle: 'Recognizing the Clear Light' },
  { slug: 'preparing-for-death-through-tibetan-buddhist-practice', source: '/home/ubuntu/upload/search_images/e5BHiqEZtWNb.jpg', title: 'Tibetan Death Practice', subtitle: "A Beginner's Guide" },
  { slug: 'anticipatory-grief', source: '/home/ubuntu/upload/search_images/T4eCjLuQrken.jpg', title: 'Anticipatory Grief', subtitle: 'Mourning the Living' },
  { slug: 'disenfranchised-grief', source: '/home/ubuntu/upload/search_images/NhZ4tqA2q49q.jpg', title: 'Disenfranchised Grief', subtitle: 'When Loss Is Not Recognized' },
  { slug: 'grief-after-a-difficult-relationship', source: '/home/ubuntu/upload/search_images/owF9LVSYiFV9.jpg', title: 'Complicated Grief', subtitle: 'When Death Brings No Closure' },
  { slug: 'how-long-does-grief-last', source: '/home/ubuntu/upload/search_images/UxTN2TMmK9p2.jpg', title: 'How Long Does Grief Last?', subtitle: 'The Honest Answer' },
  { slug: 'the-grief-of-the-caregiver', source: '/home/ubuntu/upload/search_images/M5Iz9XYutQwn.jpg', title: 'Caregiver Grief', subtitle: 'After Giving Everything' },
  { slug: 'advance-directives', source: '/home/ubuntu/upload/search_images/NZpdiVN1zA6C.jpg', title: 'Advance Directives', subtitle: 'The Document You Must Write' },
  { slug: 'hospice-vs-palliative-care', source: '/home/ubuntu/upload/search_images/91ZayRfapEOR.jpg', title: 'Hospice vs. Palliative', subtitle: 'The Actual Difference' },
  { slug: 'green-burial', source: '/home/ubuntu/upload/search_images/F1sOGGzB0xqd.jpg', title: 'Green Burial', subtitle: 'Returning to the Earth' },
  { slug: 'legacy-letters', source: '/home/ubuntu/upload/search_images/cQIZySK50vgU.jpg', title: 'Legacy Letters', subtitle: 'What You Need to Say' },
  { slug: 'the-practical-checklist-for-getting-your-affairs-in-order', source: '/home/ubuntu/upload/search_images/NZpdiVN1zA6C.jpg', title: 'Getting Affairs in Order', subtitle: 'The Complete Checklist' },
  { slug: 'the-vedantic-view-of-death', source: '/home/ubuntu/upload/search_images/pkgrBLEgm747.jpg', title: 'Vedantic View of Death', subtitle: 'What Atman Is and Isn\'t' },
  { slug: 'psychedelic-assisted-end-of-life-therapy', source: '/home/ubuntu/upload/search_images/e5BHiqEZtWNb.jpg', title: 'Psychedelic Therapy', subtitle: 'End-of-Life Research' },
  { slug: 'death-meditation', source: '/home/ubuntu/upload/search_images/XVq9wfaXdox4.jpg', title: 'Death Meditation', subtitle: 'Maranasati Practice' },
  { slug: 'stephen-levines-a-year-to-live', source: '/home/ubuntu/upload/search_images/cQIZySK50vgU.jpg', title: 'A Year to Live', subtitle: 'Stephen Levine\'s Practice' },
  { slug: 'music-and-sound-at-the-end-of-life', source: '/home/ubuntu/upload/search_images/XVq9wfaXdox4.jpg', title: 'Music at End of Life', subtitle: 'What the Research Shows' },
];

// Also create a hero image
const HERO_IMAGE = {
  slug: 'hero-bg',
  source: '/home/ubuntu/upload/search_images/jrOSbF3xfKmg.jpg',
  title: 'The Conscious Crossing',
  subtitle: 'Death as Spiritual Practice',
};

const tmpDir = '/tmp/conscious-crossing-images';
mkdirSync(tmpDir, { recursive: true });

// Python script to create styled images
const pythonScript = `
import sys
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import io

def create_article_image(source_path, output_path, title, subtitle):
    try:
        img = Image.open(source_path).convert('RGB')
    except Exception as e:
        # Create a gradient image if source fails
        img = Image.new('RGB', (1200, 630), color=(30, 27, 24))
        draw = ImageDraw.Draw(img)
        for y in range(630):
            r = int(30 + (y / 630) * 20)
            g = int(27 + (y / 630) * 15)
            b = int(24 + (y / 630) * 10)
            draw.line([(0, y), (1200, y)], fill=(r, g, b))

    # Resize to 1200x630 (OG image standard)
    img = img.resize((1200, 630), Image.LANCZOS)

    # Apply dark overlay
    overlay = Image.new('RGBA', (1200, 630), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    # Gradient overlay from bottom
    for y in range(630):
        alpha = int(180 + (y / 630) * 60)
        draw.line([(0, y), (1200, y)], fill=(30, 27, 24, min(alpha, 220)))
    
    img = img.convert('RGBA')
    img = Image.alpha_composite(img, overlay)
    img = img.convert('RGB')

    # Add amber accent line at bottom
    draw = ImageDraw.Draw(img)
    draw.rectangle([(0, 620), (1200, 630)], fill=(212, 168, 87))

    # Save as WebP
    img.save(output_path, 'WEBP', quality=85, optimize=True)
    print(f"Created: {output_path} ({os.path.getsize(output_path)} bytes)")

# Process all images from stdin args
args = sys.argv[1:]
i = 0
while i < len(args):
    source = args[i]
    output = args[i+1]
    title = args[i+2]
    subtitle = args[i+3]
    create_article_image(source, output, title, subtitle)
    i += 4
`;

// Write python script
import { writeFileSync } from 'fs';
writeFileSync('/tmp/create_images.py', pythonScript);

// Build args for all images
const allImages = [...ARTICLE_IMAGES, HERO_IMAGE];
const args = [];
for (const img of allImages) {
  const outputPath = `${tmpDir}/${img.slug}.webp`;
  args.push(img.source, outputPath, img.title, img.subtitle);
}

console.log(`Creating ${allImages.length} images...`);
try {
  execSync(`python3 /tmp/create_images.py ${args.map(a => `"${a}"`).join(' ')}`, {
    stdio: 'inherit',
    maxBuffer: 100 * 1024 * 1024,
  });
} catch (err) {
  console.error('Image creation error:', err.message);
}

// Upload to Bunny CDN
console.log('\nUploading to Bunny CDN...');
let uploaded = 0;
let failed = 0;

for (const img of allImages) {
  const localPath = `${tmpDir}/${img.slug}.webp`;
  if (!existsSync(localPath)) {
    console.error(`  ✗ Missing: ${localPath}`);
    failed++;
    continue;
  }

  const remotePath = img.slug === 'hero-bg'
    ? `conscious-crossing/${img.slug}.webp`
    : `articles/${img.slug}.webp`;

  try {
    execSync(
      `curl -s -w "%{http_code}" -X PUT "${BUNNY_STORAGE_URL}/${remotePath}" ` +
      `-H "AccessKey: ${BUNNY_API_KEY}" ` +
      `-H "Content-Type: image/webp" ` +
      `--data-binary @"${localPath}"`,
      { stdio: 'pipe' }
    );
    console.log(`  ✓ ${remotePath}`);
    uploaded++;
  } catch (err) {
    console.error(`  ✗ Failed: ${remotePath}: ${err.message}`);
    failed++;
  }
}

console.log(`\nUpload complete: ${uploaded} uploaded, ${failed} failed`);
console.log(`CDN base: ${CDN_URL}`);
