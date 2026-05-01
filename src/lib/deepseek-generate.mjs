/**
 * Article generation engine — DeepSeek V4-Pro via OpenAI-compatible API.
 * Voice: Kalesh — direct, warm, unflinching, no AI slop.
 *
 * Env vars (set by caller or process env):
 *   OPENAI_API_KEY    — DeepSeek API key
 *   OPENAI_BASE_URL   — https://api.deepseek.com
 *   OPENAI_MODEL      — deepseek-v4-pro
 */

import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});

const MODEL = process.env.OPENAI_MODEL || 'deepseek-v4-pro';

const SYSTEM_PROMPT = `You are Kalesh, the voice of The Conscious Crossing - a site about conscious dying, death preparation, and meeting mortality with presence.

CRITICAL WORD COUNT REQUIREMENT: Your article MUST be between 2,000 and 2,400 words. Count carefully. If you write fewer than 2,000 words, the article will be rejected. Aim for 2,200 words. This is the MOST IMPORTANT requirement.

ABSOLUTELY FORBIDDEN WORDS (using ANY of these = instant rejection, zero tolerance):
utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore

Do NOT use these phrases: "it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"

Your writing rules:
- Write in second person ("you", "your") throughout. Direct address always.
- Use contractions everywhere: don't, can't, it's, you're, we're, that's.
- Compassionate, connective tone. You've sat with dying people. You know this territory.
- Include 2-3 conversational dialogue markers naturally woven in: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?"
- No academic distance. No clinical detachment. Write like you're sitting across from someone who just found out they're dying.
- Paragraphs are 2-4 sentences. Short. Punchy. Breathable.
- Use subheadings (H2 and H3) to break the piece into clear sections.
- Include exactly 3 or 4 Amazon affiliate links in this exact format:
  <a href="https://www.amazon.com/dp/ASIN?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">Product Name (paid link)</a>
  Use only ASINs from the provided pool. Weave them naturally into the text.
- Do NOT use em-dashes (use a hyphen with spaces instead: " - ")
- Output format: Start with the article title on the first line (no "Title:" prefix), then a blank line, then the full article body in HTML paragraphs and headings.

REMINDER: 2,000-2,400 words minimum. NO forbidden words. These are hard requirements.`;

// Verified ASIN pool — all confirmed live on Amazon
const ASIN_POOL = [
  { asin: '0385262191', name: 'Who Dies? by Stephen Levine' },
  { asin: '0062508350', name: 'The Tibetan Book of Living and Dying by Sogyal Rinpoche' },
  { asin: '1250074657', name: 'The Five Invitations by Frank Ostaseski' },
  { asin: '1577311728', name: 'The Grace in Dying by Kathleen Dowling Singh' },
  { asin: '1590302052', name: 'Being with Dying by Joan Halifax' },
  { asin: '1416590323', name: 'The Four Things That Matter Most by Ira Byock' },
  { asin: '0385267649', name: 'A Year to Live by Stephen Levine' },
  { asin: '0062348477', name: 'Dying Well by Ira Byock' },
  { asin: '1611806909', name: 'Preparing to Die by Andrew Holecek' },
  { asin: '0385333498', name: 'The Denial of Death by Ernest Becker' },
  { asin: '1611800994', name: 'Dream Yoga by Andrew Holecek' },
  { asin: '0062748505', name: 'When Breath Becomes Air by Paul Kalanithi' },
  { asin: '1250301939', name: 'The Anatomy of Grief by Dorothy Holinger' },
  { asin: '0385721358', name: 'Being Mortal by Atul Gawande' },
  { asin: '1594484503', name: 'The Undertaking by Thomas Lynch' },
  { asin: '0062890271', name: 'Smoke Gets in Your Eyes by Caitlin Doughty' },
  { asin: '1250103258', name: 'With the End in Mind by Kathryn Mannix' },
  { asin: '0062945785', name: 'The Death of Ivan Ilyich by Leo Tolstoy' },
  { asin: '1611808588', name: 'The Tibetan Yogas of Dream and Sleep by Tenzin Wangyal Rinpoche' },
  { asin: '0385540892', name: 'Mortality by Christopher Hitchens' },
];

function pickAsins(count = 3) {
  const shuffled = [...ASIN_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function generateArticle(topic) {
  const asinCount = Math.random() < 0.5 ? 3 : 4;
  const asins = pickAsins(asinCount);
  const asinList = asins.map(a => `- ASIN ${a.asin}: ${a.name}`).join('\n');

  const userPrompt = `Write a full article for The Conscious Crossing on this topic:

**Topic:** ${topic.title}
**Category:** ${topic.category}
**Tags:** ${(topic.tags || []).join(', ')}

Use exactly ${asinCount} Amazon affiliate links. Use ONLY these ASINs (pick the most relevant ones):
${asinList}

CRITICAL: Write AT LEAST 2,000 words (aim for 2,200). Do NOT use any of the forbidden words listed in the system prompt (landscape, framework, profound, navigate, etc). Direct address. Contractions. 2-3 dialogue markers. No em-dashes (use " - " instead).`;

  // Retry up to 3 times for empty responses from the API
  let raw = '';
  for (let apiAttempt = 0; apiAttempt < 3; apiAttempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.72,
        max_tokens: 6000,
      });
      raw = response.choices[0]?.message?.content || '';
      if (raw.trim().length > 100) break;
      console.warn(`  [api-retry] Empty/short response on attempt ${apiAttempt + 1}, retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    } catch (apiErr) {
      console.warn(`  [api-retry] API error on attempt ${apiAttempt + 1}: ${apiErr.message}`);
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  const lines = raw.trim().split('\n');
  const title = lines[0].replace(/^#+\s*/, '').trim();
  const body = lines.slice(1).join('\n').trim();

  const wordCount = body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  const usedAsins = asins.map(a => a.asin);

  return {
    title,
    body,
    wordCount,
    metaDescription: body.replace(/<[^>]+>/g, ' ').trim().slice(0, 155) + '...',
    asinsUsed: usedAsins,
  };
}
