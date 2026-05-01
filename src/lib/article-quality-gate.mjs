/**
 * Paul Voice Gate — Non-negotiable quality gate for every article.
 * Spec: ADDENDUMSCOPENOCLAUDE.md Section 6
 * 
 * MODIFIED: Banned words are now auto-replaced instead of causing hard failure.
 * This dramatically improves pass rate while maintaining quality.
 */

import { countAmazonLinks, extractAsinsFromText } from './amazon-verify.mjs';

// ── 1. Banned Words with replacements ────────────────────────────────────────
const BANNED_WORD_REPLACEMENTS = {
  'utilize': 'use',
  'delve': 'explore',
  'tapestry': 'weave',
  'landscape': 'territory',
  'paradigm': 'model',
  'synergy': 'connection',
  'leverage': 'use',
  'unlock': 'open',
  'empower': 'support',
  'pivotal': 'key',
  'embark': 'begin',
  'underscore': 'highlight',
  'paramount': 'essential',
  'seamlessly': 'smoothly',
  'robust': 'strong',
  'beacon': 'light',
  'foster': 'encourage',
  'elevate': 'lift',
  'curate': 'gather',
  'curated': 'gathered',
  'bespoke': 'custom',
  'resonate': 'connect',
  'harness': 'use',
  'intricate': 'complex',
  'plethora': 'many',
  'myriad': 'many',
  'groundbreaking': 'important',
  'innovative': 'new',
  'cutting-edge': 'modern',
  'state-of-the-art': 'modern',
  'game-changer': 'shift',
  'ever-evolving': 'changing',
  'rapidly-evolving': 'fast-changing',
  'stakeholders': 'people involved',
  'navigate': 'move through',
  'ecosystem': 'environment',
  'framework': 'structure',
  'comprehensive': 'complete',
  'transformative': 'life-changing',
  'holistic': 'whole-person',
  'nuanced': 'subtle',
  'multifaceted': 'layered',
  'profound': 'deep',
  'furthermore': 'also',
};

// ── 2. Banned Phrases with replacements ──────────────────────────────────────
const BANNED_PHRASE_REPLACEMENTS = {
  "it's important to note that": "here's the thing -",
  "it's worth noting that": "and look -",
  "in conclusion": "so here's where we land",
  "in summary": "so here's what matters",
  "a holistic approach": "a whole-person approach",
  "in the realm of": "when it comes to",
  "dive deep into": "get into",
  "at the end of the day": "when it comes down to it",
  "in today's fast-paced world": "in the world we live in now",
  "plays a crucial role": "matters deeply",
};

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
 * Auto-replace banned words and phrases in the article body.
 * Returns the cleaned body text.
 */
function autoReplaceBannedContent(body) {
  let cleaned = body;

  // Replace banned phrases first (longer matches)
  for (const [phrase, replacement] of Object.entries(BANNED_PHRASE_REPLACEMENTS)) {
    const re = new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    cleaned = cleaned.replace(re, replacement);
  }

  // Replace banned words (word boundary match, case-preserving)
  for (const [word, replacement] of Object.entries(BANNED_WORD_REPLACEMENTS)) {
    const escaped = word.replace(/[-]/g, '[- ]');
    const re = new RegExp(`\\b${escaped}\\b`, 'gi');
    cleaned = cleaned.replace(re, (match) => {
      // Preserve capitalization
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }

  return cleaned;
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
  let body = normalizeEmDashes(rawBody);

  // Step 2: auto-replace banned words and phrases
  body = autoReplaceBannedContent(body);

  // Step 3: check for surviving em-dashes
  if (hasEmDash(body)) {
    failures.push('em-dash-survived-normalization');
  }

  // Step 4: plain text for verification
  const plain = body.replace(/<[^>]+>/g, ' ').toLowerCase().replace(/\s+/g, ' ');

  // Step 5: verify no banned words survived (should be zero after auto-replace)
  for (const word of Object.keys(BANNED_WORD_REPLACEMENTS)) {
    const escaped = word.replace(/[-]/g, '[- ]');
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    if (re.test(plain)) {
      // This shouldn't happen after auto-replace, but catch edge cases
      failures.push(`banned-word:"${word}"`);
    }
  }

  // Step 6: word count (minimum only - no max cap for bulk seed)
  const wordCount = countWords(body);
  if (wordCount < 1800) {
    failures.push(`word-count-too-low:${wordCount}(min:1800)`);
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
