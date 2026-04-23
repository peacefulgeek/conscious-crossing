#!/usr/bin/env node
/**
 * Generate all 30 articles for The Conscious Crossing.
 * Usage: node scripts/generate-articles.mjs [--start=0] [--end=29] [--dry-run]
 */

import { generateArticle } from '../src/lib/anthropic-generate.mjs';
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';
import { query } from '../src/lib/db.mjs';
import { execSync } from 'child_process';
import path from 'path';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const TOPICS = [
  // Conscious Dying (core)
  { topic: "What Conscious Dying Actually Means: A Practical and Spiritual Definition", category: "conscious-dying" },
  { topic: "The Five Stages of Dying: What Actually Happens When You're Dying", category: "conscious-dying" },
  { topic: "How to Prepare for Your Own Death: A Practical Checklist for the Living", category: "practical" },
  { topic: "The Death Doula: What They Do and Why You Might Want One", category: "practical" },
  { topic: "What Is a Good Death? Defining It Before You Need To", category: "conscious-dying" },
  { topic: "The Difference Between Dying and Death: What the Body Actually Goes Through", category: "conscious-dying" },
  { topic: "Fear of Death: What It Is, Where It Comes From, and How to Work With It", category: "death-positive" },
  { topic: "The Death Positive Movement: What It Is and Why It Matters", category: "death-positive" },
  { topic: "How to Talk to Someone Who Is Dying: What to Say and What Not To", category: "conscious-dying" },
  { topic: "Sitting Vigil: How to Be Present at the Bedside of the Dying", category: "conscious-dying" },

  // Tibetan Buddhism
  { topic: "The Tibetan Buddhist Bardo: A Complete Guide to the Intermediate State", category: "tibetan-buddhism" },
  { topic: "Phowa: The Tibetan Practice of Consciousness Transference at Death", category: "tibetan-buddhism" },
  { topic: "The Tibetan Book of the Dead: What It Actually Says and How to Use It", category: "tibetan-buddhism" },
  { topic: "Mahamudra and Death: The Tibetan Teaching on Recognizing the Clear Light", category: "tibetan-buddhism" },
  { topic: "Preparing for Death Through Tibetan Buddhist Practice: A Beginner's Guide", category: "tibetan-buddhism" },

  // Grief
  { topic: "Anticipatory Grief: Mourning Someone Who Is Still Alive", category: "grief" },
  { topic: "Disenfranchised Grief: When Your Loss Isn't Recognized by Others", category: "grief" },
  { topic: "Grief After a Difficult Relationship: When Death Doesn't Bring Closure", category: "grief" },
  { topic: "How Long Does Grief Last? The Honest Answer", category: "grief" },
  { topic: "The Grief of the Caregiver: What Happens After You've Given Everything", category: "grief" },

  // Practical
  { topic: "Advance Directives: What They Are, Why You Need One, and How to Write It", category: "practical" },
  { topic: "Hospice vs. Palliative Care: The Difference and When to Choose Each", category: "practical" },
  { topic: "Green Burial: What It Is, How It Works, and Why It's Growing", category: "practical" },
  { topic: "Legacy Letters: How to Write What You Need to Say Before You Die", category: "practical" },
  { topic: "The Practical Checklist for Getting Your Affairs in Order", category: "practical" },

  // Spiritual
  { topic: "The Vedantic View of Death: What Atman Is and What It Isn't", category: "spiritual" },
  { topic: "Psychedelic-Assisted End-of-Life Therapy: What the Research Actually Shows", category: "spiritual" },
  { topic: "Death Meditation: The Buddhist Practice of Contemplating Your Own Death", category: "spiritual" },
  { topic: "Stephen Levine's 'A Year to Live': The Practice of Living as If This Were Your Last Year", category: "spiritual" },
  { topic: "Music and Sound at the End of Life: What the Research Shows and How to Use It", category: "spiritual" },
];

const args = process.argv.slice(2);
const startIdx = parseInt(args.find(a => a.startsWith('--start='))?.split('=')[1] || '0');
const endIdx = parseInt(args.find(a => a.startsWith('--end='))?.split('=')[1] || String(TOPICS.length - 1));
const dryRun = args.includes('--dry-run');
const maxRetries = 3;

const outputDir = path.join(process.cwd(), 'generated-articles');
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

async function generateWithRetry(topicObj, index, retries = 0) {
  console.log(`\n[${index + 1}/${TOPICS.length}] Generating: ${topicObj.topic}`);

  const result = await generateArticle({
    topic: topicObj.topic,
    articleIndex: index,
  });

  const qg = runQualityGate(result.body);

  if (!qg.passed) {
    console.warn(`  Quality gate FAILED (attempt ${retries + 1}/${maxRetries}):`);
    qg.failures.forEach(f => console.warn(`    - ${f}`));

    if (retries < maxRetries - 1) {
      console.log(`  Retrying...`);
      await new Promise(r => setTimeout(r, 2000));
      return generateWithRetry(topicObj, index, retries + 1);
    } else {
      console.error(`  GIVING UP after ${maxRetries} attempts. Saving anyway with failures noted.`);
    }
  } else {
    console.log(`  Quality gate PASSED (${qg.wordCount} words, ${qg.amazonLinks} Amazon links)`);
    if (qg.warnings.length > 0) {
      qg.warnings.forEach(w => console.warn(`  Warning: ${w}`));
    }
  }

  return { ...result, qualityGate: qg };
}

async function saveArticle(articleData) {
  const { slug, title, body, metaDescription, ogTitle, ogDescription, category, tags, imageUrl, imageAlt, readingTime, author, asinsUsed, qualityGate } = articleData;

  // Save to file for inspection
  const filePath = path.join(outputDir, `${slug}.json`);
  writeFileSync(filePath, JSON.stringify(articleData, null, 2));
  console.log(`  Saved to: ${filePath}`);

  if (dryRun) {
    console.log(`  [DRY RUN] Would insert into DB: ${slug}`);
    return;
  }

  // Insert into database
  try {
    await query(`
      INSERT INTO articles (
        slug, title, body, meta_description, og_title, og_description,
        category, tags, image_url, image_alt, reading_time, author,
        published_at, word_count, quality_gate_passed, quality_gate_failures,
        asins_used
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),$13,$14,$15,$16)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        body = EXCLUDED.body,
        meta_description = EXCLUDED.meta_description,
        og_title = EXCLUDED.og_title,
        og_description = EXCLUDED.og_description,
        category = EXCLUDED.category,
        tags = EXCLUDED.tags,
        image_url = EXCLUDED.image_url,
        image_alt = EXCLUDED.image_alt,
        reading_time = EXCLUDED.reading_time,
        word_count = EXCLUDED.word_count,
        quality_gate_passed = EXCLUDED.quality_gate_passed,
        quality_gate_failures = EXCLUDED.quality_gate_failures,
        asins_used = EXCLUDED.asins_used,
        updated_at = NOW()
    `, [
      slug, title, body, metaDescription, ogTitle, ogDescription,
      category, JSON.stringify(tags), imageUrl, imageAlt, readingTime, author,
      qualityGate.wordCount, qualityGate.passed, JSON.stringify(qualityGate.failures),
      JSON.stringify(asinsUsed || [])
    ]);
    console.log(`  Saved to DB: ${slug}`);
  } catch (err) {
    console.error(`  DB error for ${slug}:`, err.message);
  }
}

async function main() {
  console.log(`Generating articles ${startIdx + 1} to ${endIdx + 1} of ${TOPICS.length}`);
  if (dryRun) console.log('DRY RUN MODE - no DB writes');

  const subset = TOPICS.slice(startIdx, endIdx + 1);

  for (let i = 0; i < subset.length; i++) {
    const globalIndex = startIdx + i;
    try {
      const result = await generateWithRetry(subset[i], globalIndex);
      await saveArticle(result);
      // Rate limiting
      if (i < subset.length - 1) {
        console.log(`  Waiting 3s before next article...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch (err) {
      console.error(`  FATAL error for topic "${subset[i].topic}":`, err.message);
    }
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
