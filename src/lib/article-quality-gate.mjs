/**
 * Paul Voice Gate — Non-negotiable quality gate for every article.
 * Spec: ADDENDUMSCOPENOCLAUDE.md Section 6
 */

import { countAmazonLinks, extractAsinsFromText } from './amazon-verify.mjs';

// ── 1. Banned Words (exact list from spec) ────────────────────────────────────
const BANNED_WORDS = [
  'utilize', 'delve', 'tapestry', 'landscape', 'paradigm', 'synergy',
  'leverage', 'unlock', 'empower', 'pivotal', 'embark', 'underscore',
  'paramount', 'seamlessly', 'robust', 'beacon', 'foster', 'elevate',
  'curate', 'curated', 'bespoke', 'resonate', 'harness', 'intricate',
  'plethora', 'myriad', 'groundbreaking', 'innovative', 'cutting-edge',
  'state-of-the-art', 'game-changer', 'ever-evolving', 'rapidly-evolving',
  'stakeholders', 'navigate', 'ecosystem', 'framework', 'comprehensive',
  'transformative', 'holistic', 'nuanced', 'multifaceted', 'profound',
  'furthermore',
];

// ── 2. Banned Phrases (exact list from spec) ──────────────────────────────────
const BANNED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "in conclusion",
  "in summary",
  "a holistic approach",
  "in the realm of",
  "dive deep into",
  "at the end of the day",
  "in today's fast-paced world",
  "plays a crucial role",
];

// ── Amazon link regex ─────────────────────────────────────────────────────────
const AMAZON_LINK_RE = /href="https:\/\/www\.amazon\.com\/dp\/[A-Z0-9]{10}\?tag=spankyspinola-20"/gi;

/**
 * Pre-process: replace em-dashes with " - " before checking.
 */
export function normalizeEmDashes(text) {
  return text.replace(/\u2014|\u2013/g, ' - ');
}

export function countWords(text) {
  const stripped = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

export function hasEmDash(text) {
  return /\u2014|\u2013/.test(text);
}

/**
 * Run the full Paul Voice Gate.
 * @param {string} rawBody - Raw article body (HTML allowed)
 * @returns {{ passed: boolean, failures: string[], warnings: string[], body: string, wordCount: number, amazonLinks: number, asins: string[] }}
 */
export function runQualityGate(rawBody) {
  const failures = [];
  const warnings = [];

  // Step 1: normalize em-dashes
  const body = normalizeEmDashes(rawBody);

  // Step 2: check for surviving em-dashes
  if (hasEmDash(body)) {
    failures.push('em-dash-survived-normalization');
  }

  // Step 3: plain text for word/phrase checks
  const plain = body.replace(/<[^>]+>/g, ' ').toLowerCase().replace(/\s+/g, ' ');

  // Step 4: banned words (word boundary match)
  for (const word of BANNED_WORDS) {
    const escaped = word.replace(/[-]/g, '[- ]');
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    if (re.test(plain)) {
      failures.push(`banned-word:"${word}"`);
    }
  }

  // Step 5: banned phrases (string match)
  for (const phrase of BANNED_PHRASES) {
    if (plain.includes(phrase.toLowerCase())) {
      failures.push(`banned-phrase:"${phrase}"`);
    }
  }

  // Step 6: word count
  const wordCount = countWords(body);
  if (wordCount < 1200) {
    failures.push(`word-count-too-low:${wordCount}(min:1200)`);
  }
  if (wordCount > 2500) {
    failures.push(`word-count-too-high:${wordCount}(max:2500)`);
  }

  // Step 7: Amazon affiliate links (exactly 3 or 4)
  const linkMatches = body.match(AMAZON_LINK_RE) || [];
  const amazonLinks = linkMatches.length;
  if (amazonLinks < 3 || amazonLinks > 4) {
    failures.push(`amazon-link-count:${amazonLinks}(must-be-3-or-4)`);
  }

  // Step 8: voice signals (warnings only, not failures)
  const contractionCount = (plain.match(/\b\w+'(s|re|ve|d|ll|m|t)\b/g) || []).length;
  const per1k = (n) => (n / (wordCount || 1)) * 1000;
  if (per1k(contractionCount) < 4) {
    warnings.push(`contractions-low:${contractionCount}(${per1k(contractionCount).toFixed(1)}/1k)`);
  }

  const dialogueMarkers = [
    /right\?!/i, /know what i mean\?/i, /does that land\?/i, /how does that make you feel\?/i,
  ];
  const markerCount = dialogueMarkers.filter(r => r.test(body)).length;
  if (markerCount < 2) {
    warnings.push(`dialogue-markers-low:${markerCount}(want:2-3)`);
  }

  return {
    passed: failures.length === 0,
    failures,
    warnings,
    body,
    wordCount,
    amazonLinks,
    asins: extractAsinsFromText(body),
  };
}
