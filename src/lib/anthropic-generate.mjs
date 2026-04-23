import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const BUNNY_CDN_BASE = 'https://meditative-dying.b-cdn.net';

// Product catalog for affiliate links
const PRODUCT_CATALOG = [
  { asin: '0385262493', name: 'Who Dies? by Stephen Levine', category: 'books', tags: ['conscious-dying', 'death-meditation'] },
  { asin: '0062503812', name: 'The Tibetan Book of Living and Dying', category: 'books', tags: ['tibetan-buddhism', 'bardo'] },
  { asin: '1250074657', name: 'The Five Invitations by Frank Ostaseski', category: 'books', tags: ['conscious-dying', 'hospice'] },
  { asin: '1577311736', name: 'The Grace in Dying by Kathleen Dowling Singh', category: 'books', tags: ['spiritual', 'dying-process'] },
  { asin: '1590302052', name: 'Being with Dying by Roshi Joan Halifax', category: 'books', tags: ['buddhism', 'caregiving'] },
  { asin: '1476727953', name: 'Smoke Gets in Your Eyes by Caitlin Doughty', category: 'books', tags: ['death-positive', 'funeral'] },
  { asin: '0743266560', name: 'The Four Things That Matter Most by Ira Byock', category: 'books', tags: ['end-of-life', 'relationships'] },
  { asin: 'B07FZ8S74R', name: 'Tibetan Singing Bowl Set', category: 'meditation', tags: ['meditation', 'sound-healing'] },
  { asin: 'B07NQJVWMN', name: 'Meditation Cushion Set', category: 'meditation', tags: ['meditation', 'practice'] },
  { asin: 'B08JKQM3WS', name: 'End-of-Life Planning Workbook', category: 'planning', tags: ['advance-directive', 'practical'] },
  { asin: 'B07Q7BFHKQ', name: 'Five Wishes Advance Directive', category: 'planning', tags: ['advance-directive', 'legal'] },
  { asin: 'B07NQJVWMN', name: 'Frankincense Essential Oil', category: 'comfort', tags: ['aromatherapy', 'ritual'] },
  { asin: 'B07NQJVWMN', name: 'Himalayan Salt Lamp', category: 'comfort', tags: ['comfort', 'light'] },
];

function selectProducts(topic, count = 3) {
  // Simple keyword matching to select relevant products
  const topicLower = topic.toLowerCase();
  const scored = PRODUCT_CATALOG.map(p => {
    let score = 0;
    if (topicLower.includes('tibetan') || topicLower.includes('bardo') || topicLower.includes('phowa')) {
      if (p.tags.includes('tibetan-buddhism') || p.tags.includes('bardo')) score += 5;
    }
    if (topicLower.includes('meditation') || topicLower.includes('practice')) {
      if (p.category === 'meditation') score += 5;
    }
    if (topicLower.includes('advance directive') || topicLower.includes('planning') || topicLower.includes('checklist')) {
      if (p.category === 'planning') score += 5;
    }
    if (topicLower.includes('doula') || topicLower.includes('hospice') || topicLower.includes('palliative')) {
      if (p.tags.includes('hospice') || p.tags.includes('end-of-life')) score += 5;
    }
    if (topicLower.includes('grief')) {
      if (p.tags.includes('relationships') || p.tags.includes('conscious-dying')) score += 3;
    }
    // Books are always relevant
    if (p.category === 'books') score += 2;
    return { ...p, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count);
}

const OPENER_TYPES = ['gut-punch', 'question', 'micro-story', 'counterintuitive'];
const CONCLUSION_TYPES = ['call-to-action', 'reflection', 'question', 'challenge', 'benediction'];

const KALESH_PHRASES = [
  "Death is not the opposite of life. It's the opposite of birth. Life has no opposite.",
  "You've been preparing for this your entire existence. You just didn't know it.",
  "The culture's terror of death is not your terror. You can put that down.",
  "Conscious dying isn't morbid. It's the most honest thing you can do with the time you have.",
  "What if preparing for death is actually what teaches you how to live?",
  "The Tibetans call it bardo. The Vedantists call it dissolution. Your grandmother called it 'crossing over.' They're all pointing at the same door.",
  "Grief for the living is anticipatory grief. It deserves as much space as grief for the dead.",
  "The question isn't whether you'll die. The question is whether you'll be present for it.",
];

export async function generateArticle({ topic, openerType, conclusionType, articleIndex = 0 }) {
  const opener = openerType || OPENER_TYPES[articleIndex % OPENER_TYPES.length];
  const conclusion = conclusionType || CONCLUSION_TYPES[articleIndex % CONCLUSION_TYPES.length];
  const products = selectProducts(topic, 3);
  const kaleshPhrase = KALESH_PHRASES[articleIndex % KALESH_PHRASES.length];

  const productLinks = products.map(p =>
    `<a href="https://www.amazon.com/dp/${p.asin}?tag=spankyspinola-20" target="_blank" rel="nofollow sponsored noopener noreferrer">${p.name}</a> (paid link)`
  ).join(', ');

  const prompt = `You are Kalesh, a consciousness teacher and writer. Write a complete article for The Conscious Crossing website.

TOPIC: ${topic}

VOICE: Kalesh's voice is intellectually warm, direct, and unflinching. He holds death as a philosophical reality and a lived human experience simultaneously. He doesn't bypass grief with spiritual platitudes, but he also doesn't wallow. The Vedantic truth is earned through honesty.

OPENER TYPE: ${opener}
- gut-punch: Start with a stark, undeniable fact about death that stops the reader
- question: Start with a direct question that the reader hasn't let themselves ask
- micro-story: Start with a brief scene (2-3 sentences) that puts the reader in a moment
- counterintuitive: Start with a claim that seems wrong but is actually true

CONCLUSION TYPE: ${conclusion}
- call-to-action: End with a specific, concrete invitation to do something
- reflection: End with a quiet observation that lingers
- question: End with a question that stays with the reader
- challenge: End with a direct challenge to the reader
- benediction: End with a blessing or sending-forth

KALESH SIGNATURE PHRASE TO INCLUDE (work it in naturally): "${kaleshPhrase}"

STRUCTURE:
- H1 title (compelling, specific, not clickbait)
- Opening paragraph (use the opener type above)
- 3-5 H2 sections with H3 subsections where appropriate
- Author bio section at the end
- FAQ section (3-5 questions, varied count)
- Conclusion (use the conclusion type above)
- Sanskrit mantra closing (1 line, italicized, in a <p class="sanskrit-closing"> tag)

AFFILIATE LINKS (embed naturally in prose, 3-4 total):
Use these products where they fit naturally:
${products.map(p => `- ${p.name}: https://www.amazon.com/dp/${p.asin}?tag=spankyspinola-20`).join('\n')}
Each link must be followed by "(paid link)" in plain text.

HARD RULES:
- 1,600 to 2,000 words (strict; under 1,200 or over 2,500 = regenerate)
- Zero em-dashes (—). Use commas, periods, colons, or parentheses instead.
- Never use these words: delve, tapestry, paradigm, synergy, leverage, unlock, empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, comprehensive, transformative, groundbreaking, innovative, cutting-edge, revolutionary, state-of-the-art, ever-evolving, profound, holistic, nuanced, multifaceted, stakeholders, ecosystem, furthermore, moreover, additionally, consequently, subsequently, thereby, streamline, optimize, facilitate, amplify, catalyze
- Never use these phrases: "it's important to note," "in conclusion," "in summary," "in the realm of," "dive deep into," "at the end of the day," "in today's fast-paced world," "plays a crucial role," "a testament to," "when it comes to," "cannot be overstated"
- Contractions throughout. You're. Don't. It's. That's. I've.
- Vary sentence length aggressively. Some fragments. Some long. Some three-word sentences.
- Direct address ("you") throughout OR first-person ("I / my") throughout. Pick one and stay consistent.
- Include at least 2 conversational openers: "Here's the thing," "Honestly," "Look," "Truth is," "But here's what's interesting," "That said."
- Concrete specifics over abstractions. A name. A number. A moment.
- No "they're in a better place" bypassing. No casual "death is just a transition."
- The Vedantic truth (Atman does not die) is earned through honesty, not offered as a platitude.
- No em-dashes. No em-dashes. No em-dashes.

HEALTH DISCLAIMER (include at end of article, before author bio):
<div class="health-disclaimer">
<strong>A note:</strong> This article is for educational and reflective purposes only. It is not medical advice. If you or someone you love is facing a terminal diagnosis or end-of-life decisions, please consult with your healthcare team and consider working with a palliative care specialist or death doula.
</div>

AFFILIATE SECTION (include after health disclaimer):
<div class="affiliate-section">
<h3>The Crossing Library</h3>
<ul>
[3-4 product links embedded here naturally]
</ul>
<p class="affiliate-disclosure">As an Amazon Associate, I earn from qualifying purchases.</p>
</div>

Output the article as clean HTML (no markdown). Use proper HTML tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <blockquote>, <strong>, <em>. Include the health disclaimer and affiliate section as shown above.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });

  const body = response.content[0].text;

  // Extract title from H1
  const titleMatch = body.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  const title = titleMatch ? titleMatch[1].trim() : topic;

  // Generate slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

  // Generate meta description (first paragraph text)
  const firstParaMatch = body.match(/<p[^>]*>([^<]+(?:<[^/][^>]*>[^<]*<\/[^>]+>)*[^<]*)<\/p>/i);
  const metaDescription = firstParaMatch
    ? firstParaMatch[1].replace(/<[^>]+>/g, '').slice(0, 160)
    : topic;

  // Determine category from topic
  const category = determineCategory(topic);
  const tags = determineTags(topic);

  // Image URL from Bunny CDN
  const imageUrl = `${BUNNY_CDN_BASE}/articles/${slug}.webp`;

  return {
    slug,
    title,
    body,
    metaDescription,
    ogTitle: title,
    ogDescription: metaDescription,
    category,
    tags,
    imageUrl,
    imageAlt: `${title} - The Conscious Crossing`,
    readingTime: Math.ceil(body.replace(/<[^>]+>/g, ' ').split(/\s+/).length / 200),
    author: 'Kalesh',
    openerType: opener,
    conclusionType: conclusion,
    asinsUsed: products.map(p => p.asin),
  };
}

function determineCategory(topic) {
  const t = topic.toLowerCase();
  if (t.includes('tibetan') || t.includes('bardo') || t.includes('phowa') || t.includes('buddhis')) return 'tibetan-buddhism';
  if (t.includes('grief') || t.includes('anticipatory') || t.includes('mourning')) return 'grief';
  if (t.includes('advance directive') || t.includes('checklist') || t.includes('planning') || t.includes('hospice') || t.includes('palliative') || t.includes('burial') || t.includes('memorial') || t.includes('funeral') || t.includes('doula')) return 'practical';
  if (t.includes('vedantic') || t.includes('spiritual') || t.includes('psychedelic') || t.includes('tcm') || t.includes('music') || t.includes('sound')) return 'spiritual';
  if (t.includes('death positive') || t.includes('death cafe') || t.includes('fear')) return 'death-positive';
  return 'conscious-dying';
}

function determineTags(topic) {
  const t = topic.toLowerCase();
  const tags = [];
  if (t.includes('tibetan')) tags.push('tibetan-buddhism');
  if (t.includes('bardo')) tags.push('bardo');
  if (t.includes('meditation')) tags.push('death-meditation');
  if (t.includes('grief')) tags.push('grief');
  if (t.includes('doula')) tags.push('death-doula');
  if (t.includes('advance directive')) tags.push('advance-directive');
  if (t.includes('hospice')) tags.push('hospice');
  if (t.includes('palliative')) tags.push('palliative-care');
  if (t.includes('vedantic') || t.includes('vedanta')) tags.push('vedanta');
  if (t.includes('stephen levine')) tags.push('stephen-levine');
  if (t.includes('psychedelic')) tags.push('psilocybin');
  if (t.includes('burial')) tags.push('green-burial');
  tags.push('conscious-dying');
  return [...new Set(tags)];
}
