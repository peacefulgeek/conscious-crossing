/**
 * Bunny CDN Image Assignment — Library Copy Pattern
 * Spec: ADDENDUMSCOPENOCLAUDE.md Section 4
 *
 * When an article is published:
 * 1. Randomly pick one of lib-01.webp through lib-40.webp
 * 2. Download it from the CDN
 * 3. Re-upload it to /images/{article-slug}.webp
 * 4. Return the unique CDN URL for that article
 *
 * This gives Google a unique, indexable image URL per article
 * while eliminating recurring image generation costs.
 *
 * CREDENTIALS HARDCODED PER SPEC (not in env vars)
 */

const BUNNY_STORAGE_ZONE = 'meditative-dying';
const BUNNY_API_KEY = 'a4dc2c02-3fb8-44f0-b3b49c8102f0-8aef-4366';
const BUNNY_PULL_ZONE = 'https://meditative-dying.b-cdn.net';
const BUNNY_HOSTNAME = 'ny.storage.bunnycdn.com';
const LIBRARY_SIZE = 40;

/**
 * Assign a hero image to an article slug.
 * Downloads a random library image and re-uploads it as /images/{slug}.webp
 *
 * @param {string} slug - Article slug (e.g. "what-conscious-dying-actually-means")
 * @returns {Promise<string>} CDN URL for the article's image
 */
export async function assignHeroImage(slug) {
  const libNum = String(Math.floor(Math.random() * LIBRARY_SIZE) + 1).padStart(2, '0');
  const sourceFile = `lib-${libNum}.webp`;
  const destFile = `${slug}.webp`;

  try {
    // Download from library
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const downloadRes = await fetch(sourceUrl);
    if (!downloadRes.ok) {
      throw new Error(`Download failed: ${downloadRes.status} ${sourceUrl}`);
    }
    const imageBuffer = await downloadRes.arrayBuffer();

    // Re-upload as article-specific image
    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'image/webp',
      },
      body: imageBuffer,
    });

    if (!uploadRes.ok) {
      throw new Error(`Upload failed: ${uploadRes.status} -> ${uploadUrl}`);
    }

    const cdnUrl = `${BUNNY_PULL_ZONE}/images/${destFile}`;
    console.log(`[image-assign] ${slug} -> ${sourceFile} -> ${cdnUrl}`);
    return cdnUrl;
  } catch (err) {
    // Fallback: link directly to the library image (no unique URL but won't break)
    const fallbackUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    console.warn(`[image-assign] Fallback for ${slug}: ${err.message} -> ${fallbackUrl}`);
    return fallbackUrl;
  }
}

/**
 * Get the CDN URL for an existing article image (if already assigned).
 * @param {string} slug
 * @returns {string}
 */
export function getImageUrl(slug) {
  return `${BUNNY_PULL_ZONE}/images/${slug}.webp`;
}
