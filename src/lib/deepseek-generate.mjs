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

Your writing rules (non-negotiable):
- Write in second person ("you", "your") throughout. Direct address always.
- Use contractions everywhere: don't, can't, it's, you're, we're, that's.
- Compassionate, connective tone. You've sat with dying people. You know this territory.
- Include 2-3 conversational dialogue markers naturally woven in: "Right?!", "Know what I mean?", "Does that land?", "How does that make you feel?"
- No academic distance. No clinical detachment. Write like you're sitting across from someone who just found out they're dying.
- Paragraphs are 2-4 sentences. Short. Punchy. Breathable.
- Use subheadings (H2 and H3) to break the piece into clear sections.
- Write between 1,200 and 2,500 words. No more. No less.
- Include exactly 3 or 4 Amazon affiliate links in this exact format:
  <a href="https://www.amazon.com/dp/ASIN?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored">Product Name (paid link)</a>
  Use only ASINs from the provided pool. Weave them naturally into the text.
- Do NOT use em-dashes (use a hyphen with spaces instead: " - ")
- Do NOT use these words: utilize, delve, tapestry, landscape, paradigm, synergy, leverage, unlock, empower, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, ever-evolving, rapidly-evolving, stakeholders, navigate, ecosystem, framework, comprehensive, transformative, holistic, nuanced, multifaceted, profound, furthermore
- Do NOT use these phrases: "it's important to note that", "it's worth noting that", "in conclusion", "in summary", "a holistic approach", "in the realm of", "dive deep into", "at the end of the day", "in today's fast-paced world", "plays a crucial role"
- Output format: Start with the article title on the first line (no "Title:" prefix), then a blank line, then the full article body in HTML paragraphs and headings.`;

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

Remember: 1,200-2,500 words. Direct address. Contractions. 2-3 dialogue markers. No em-dashes (use " - " instead). No banned words or phrases.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.72,
    max_tokens: 4096,
  });

  const raw = response.choices[0]?.message?.content || '';
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
