#!/usr/bin/env node
/**
 * Seed 30 articles into the database.
 * These are placeholder articles with real structure - they'll be replaced
 * by AI-generated content when the generate-articles.mjs script runs.
 * Usage: DATABASE_URL=... node scripts/seed-articles.mjs
 */

import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});

const BUNNY_CDN = 'https://meditative-dying.b-cdn.net';

const ARTICLES = [
  {
    slug: 'what-conscious-dying-actually-means',
    title: 'What Conscious Dying Actually Means: A Practical and Spiritual Definition',
    meta_description: 'Conscious dying is not a philosophy. It\'s a practice. Here\'s what it actually means to approach death with presence, preparation, and clarity.',
    category: 'conscious-dying',
    tags: ['conscious-dying', 'death-preparation', 'spiritual-practice'],
    reading_time: 9,
    image_url: `${BUNNY_CDN}/articles/what-conscious-dying-actually-means.webp`,
    image_alt: 'Candlelight in darkness representing conscious dying',
    body: generateArticleBody('What Conscious Dying Actually Means', 'conscious-dying'),
  },
  {
    slug: 'the-five-stages-of-dying',
    title: 'The Five Stages of Dying: What Actually Happens When You\'re Dying',
    meta_description: 'Not the five stages of grief. The five stages of dying - what the body and mind actually go through in the dying process.',
    category: 'conscious-dying',
    tags: ['dying-process', 'physical-death', 'conscious-dying'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/the-five-stages-of-dying.webp`,
    image_alt: 'Autumn leaves representing the stages of dying',
    body: generateArticleBody('The Five Stages of Dying', 'conscious-dying'),
  },
  {
    slug: 'how-to-prepare-for-your-own-death',
    title: 'How to Prepare for Your Own Death: A Practical Checklist for the Living',
    meta_description: 'The practical preparation most people avoid. Advance directives, legacy letters, conversations, and the spiritual work of making peace with mortality.',
    category: 'practical',
    tags: ['death-preparation', 'advance-directive', 'practical'],
    reading_time: 12,
    image_url: `${BUNNY_CDN}/articles/how-to-prepare-for-your-own-death.webp`,
    image_alt: 'Writing in a journal - preparing for death',
    body: generateArticleBody('How to Prepare for Your Own Death', 'practical'),
  },
  {
    slug: 'the-death-doula',
    title: 'The Death Doula: What They Do and Why You Might Want One',
    meta_description: 'A death doula is not a medical professional. They\'re a guide. Here\'s what they actually do, how to find one, and why the dying process benefits from their presence.',
    category: 'practical',
    tags: ['death-doula', 'end-of-life', 'support'],
    reading_time: 9,
    image_url: `${BUNNY_CDN}/articles/the-death-doula.webp`,
    image_alt: 'Holding hands in comfort - death doula support',
    body: generateArticleBody('The Death Doula', 'practical'),
  },
  {
    slug: 'what-is-a-good-death',
    title: 'What Is a Good Death? Defining It Before You Need To',
    meta_description: 'Most people have never thought about what a good death looks like for them. This is the time to think about it.',
    category: 'conscious-dying',
    tags: ['good-death', 'conscious-dying', 'end-of-life'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/what-is-a-good-death.webp`,
    image_alt: 'Golden sunset representing a good death',
    body: generateArticleBody('What Is a Good Death', 'conscious-dying'),
  },
  {
    slug: 'the-difference-between-dying-and-death',
    title: 'The Difference Between Dying and Death: What the Body Actually Goes Through',
    meta_description: 'Dying is a process. Death is a moment. Understanding what the body goes through changes how you relate to both.',
    category: 'conscious-dying',
    tags: ['dying-process', 'physical-death', 'body'],
    reading_time: 9,
    image_url: `${BUNNY_CDN}/articles/the-difference-between-dying-and-death.webp`,
    image_alt: 'River flowing representing the dying process',
    body: generateArticleBody('The Difference Between Dying and Death', 'conscious-dying'),
  },
  {
    slug: 'fear-of-death',
    title: 'Fear of Death: What It Is, Where It Comes From, and How to Work With It',
    meta_description: 'Death anxiety is almost universal. But it\'s not inevitable. Here\'s what death fear actually is, and how to work with it rather than around it.',
    category: 'death-positive',
    tags: ['death-anxiety', 'fear', 'death-positive'],
    reading_time: 11,
    image_url: `${BUNNY_CDN}/articles/fear-of-death.webp`,
    image_alt: 'Dark forest with light path representing working with fear of death',
    body: generateArticleBody('Fear of Death', 'death-positive'),
  },
  {
    slug: 'the-death-positive-movement',
    title: 'The Death Positive Movement: What It Is and Why It Matters',
    meta_description: 'The death positive movement isn\'t about celebrating death. It\'s about ending the cultural silence around it. Here\'s what it actually stands for.',
    category: 'death-positive',
    tags: ['death-positive', 'culture', 'Caitlin-Doughty'],
    reading_time: 8,
    image_url: `${BUNNY_CDN}/articles/the-death-positive-movement.webp`,
    image_alt: 'Flowers at a memorial garden',
    body: generateArticleBody('The Death Positive Movement', 'death-positive'),
  },
  {
    slug: 'how-to-talk-to-someone-who-is-dying',
    title: 'How to Talk to Someone Who Is Dying: What to Say and What Not To',
    meta_description: 'Most people freeze when someone they love is dying. Here\'s what to say, what not to say, and how to be present when presence is what\'s needed.',
    category: 'conscious-dying',
    tags: ['communication', 'caregiving', 'presence'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/how-to-talk-to-someone-who-is-dying.webp`,
    image_alt: 'Two people in quiet conversation',
    body: generateArticleBody('How to Talk to Someone Who Is Dying', 'conscious-dying'),
  },
  {
    slug: 'sitting-vigil',
    title: 'Sitting Vigil: How to Be Present at the Bedside of the Dying',
    meta_description: 'Sitting vigil is one of the oldest human practices. Here\'s how to do it with presence, what to expect, and why it matters for both the dying and the living.',
    category: 'conscious-dying',
    tags: ['vigil', 'bedside', 'presence', 'caregiving'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/sitting-vigil.webp`,
    image_alt: 'Candlelight at a bedside vigil',
    body: generateArticleBody('Sitting Vigil', 'conscious-dying'),
  },
  {
    slug: 'the-tibetan-buddhist-bardo',
    title: 'The Tibetan Buddhist Bardo: A Complete Guide to the Intermediate State',
    meta_description: 'The bardo is the intermediate state between death and rebirth in Tibetan Buddhism. Here\'s what it actually teaches, and how to prepare for it.',
    category: 'tibetan-buddhism',
    tags: ['bardo', 'tibetan-buddhism', 'intermediate-state'],
    reading_time: 14,
    image_url: `${BUNNY_CDN}/articles/the-tibetan-buddhist-bardo.webp`,
    image_alt: 'Tibetan prayer flags in the mountains',
    body: generateArticleBody('The Tibetan Buddhist Bardo', 'tibetan-buddhism'),
  },
  {
    slug: 'phowa',
    title: 'Phowa: The Tibetan Practice of Consciousness Transference at Death',
    meta_description: 'Phowa is the Tibetan Buddhist practice of ejecting consciousness at the moment of death. Here\'s what it is, how it works, and how to begin practicing it.',
    category: 'tibetan-buddhism',
    tags: ['phowa', 'tibetan-buddhism', 'consciousness-transference'],
    reading_time: 12,
    image_url: `${BUNNY_CDN}/articles/phowa.webp`,
    image_alt: 'Lotus flower representing phowa practice',
    body: generateArticleBody('Phowa', 'tibetan-buddhism'),
  },
  {
    slug: 'the-tibetan-book-of-the-dead',
    title: 'The Tibetan Book of the Dead: What It Actually Says and How to Use It',
    meta_description: 'The Bardo Thodol is not what most people think it is. Here\'s what it actually says, and how it can be used as a practical guide for dying.',
    category: 'tibetan-buddhism',
    tags: ['bardo-thodol', 'tibetan-buddhism', 'sacred-text'],
    reading_time: 13,
    image_url: `${BUNNY_CDN}/articles/the-tibetan-book-of-the-dead.webp`,
    image_alt: 'Ancient manuscript representing the Tibetan Book of the Dead',
    body: generateArticleBody('The Tibetan Book of the Dead', 'tibetan-buddhism'),
  },
  {
    slug: 'mahamudra-and-death',
    title: 'Mahamudra and Death: The Tibetan Teaching on Recognizing the Clear Light',
    meta_description: 'At the moment of death, the Tibetan teachings say, the clear light of consciousness dawns. Mahamudra is the practice of recognizing it.',
    category: 'tibetan-buddhism',
    tags: ['mahamudra', 'clear-light', 'tibetan-buddhism'],
    reading_time: 12,
    image_url: `${BUNNY_CDN}/articles/mahamudra-and-death.webp`,
    image_alt: 'Clear sky representing the clear light of consciousness',
    body: generateArticleBody('Mahamudra and Death', 'tibetan-buddhism'),
  },
  {
    slug: 'preparing-for-death-through-tibetan-buddhist-practice',
    title: 'Preparing for Death Through Tibetan Buddhist Practice: A Beginner\'s Guide',
    meta_description: 'You don\'t have to be a Buddhist to use these practices. Here\'s how to begin working with Tibetan Buddhist death practices as a non-practitioner.',
    category: 'tibetan-buddhism',
    tags: ['tibetan-buddhism', 'death-practice', 'beginner'],
    reading_time: 11,
    image_url: `${BUNNY_CDN}/articles/preparing-for-death-through-tibetan-buddhist-practice.webp`,
    image_alt: 'Buddhist temple at dawn',
    body: generateArticleBody('Preparing for Death Through Tibetan Buddhist Practice', 'tibetan-buddhism'),
  },
  {
    slug: 'anticipatory-grief',
    title: 'Anticipatory Grief: Mourning Someone Who Is Still Alive',
    meta_description: 'Anticipatory grief is the grief you feel before someone dies. It\'s real, it\'s valid, and it deserves as much attention as grief after death.',
    category: 'grief',
    tags: ['anticipatory-grief', 'grief', 'terminal-illness'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/anticipatory-grief.webp`,
    image_alt: 'Person sitting alone in contemplation',
    body: generateArticleBody('Anticipatory Grief', 'grief'),
  },
  {
    slug: 'disenfranchised-grief',
    title: 'Disenfranchised Grief: When Your Loss Isn\'t Recognized by Others',
    meta_description: 'Disenfranchised grief is grief that society doesn\'t recognize or validate. Here\'s what it is, who experiences it, and how to work with it.',
    category: 'grief',
    tags: ['disenfranchised-grief', 'grief', 'loss'],
    reading_time: 9,
    image_url: `${BUNNY_CDN}/articles/disenfranchised-grief.webp`,
    image_alt: 'Solitary figure at the ocean',
    body: generateArticleBody('Disenfranchised Grief', 'grief'),
  },
  {
    slug: 'grief-after-a-difficult-relationship',
    title: 'Grief After a Difficult Relationship: When Death Doesn\'t Bring Closure',
    meta_description: 'When someone you had a complicated relationship with dies, grief is complicated too. Here\'s how to work with grief that doesn\'t fit the expected shape.',
    category: 'grief',
    tags: ['complicated-grief', 'grief', 'relationships'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/grief-after-a-difficult-relationship.webp`,
    image_alt: 'Empty chair by a window with light',
    body: generateArticleBody('Grief After a Difficult Relationship', 'grief'),
  },
  {
    slug: 'how-long-does-grief-last',
    title: 'How Long Does Grief Last? The Honest Answer',
    meta_description: 'The honest answer to how long grief lasts is not what most people want to hear. But it\'s also more hopeful than the platitudes.',
    category: 'grief',
    tags: ['grief', 'grief-timeline', 'healing'],
    reading_time: 9,
    image_url: `${BUNNY_CDN}/articles/how-long-does-grief-last.webp`,
    image_alt: 'Seasons changing in nature representing the timeline of grief',
    body: generateArticleBody('How Long Does Grief Last', 'grief'),
  },
  {
    slug: 'the-grief-of-the-caregiver',
    title: 'The Grief of the Caregiver: What Happens After You\'ve Given Everything',
    meta_description: 'Caregiver grief is its own category. Here\'s what happens after you\'ve spent months or years caring for someone who is dying, and they finally die.',
    category: 'grief',
    tags: ['caregiver-grief', 'grief', 'caregiving'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/the-grief-of-the-caregiver.webp`,
    image_alt: 'Caregiver hands showing compassion',
    body: generateArticleBody('The Grief of the Caregiver', 'grief'),
  },
  {
    slug: 'advance-directives',
    title: 'Advance Directives: What They Are, Why You Need One, and How to Write It',
    meta_description: 'An advance directive is the most important document most people never write. Here\'s what it is, what it covers, and how to do it in an hour.',
    category: 'practical',
    tags: ['advance-directive', 'legal', 'practical'],
    reading_time: 11,
    image_url: `${BUNNY_CDN}/articles/advance-directives.webp`,
    image_alt: 'Important document with pen',
    body: generateArticleBody('Advance Directives', 'practical'),
  },
  {
    slug: 'hospice-vs-palliative-care',
    title: 'Hospice vs. Palliative Care: The Difference and When to Choose Each',
    meta_description: 'Hospice and palliative care are not the same thing. Here\'s the actual difference, when each is appropriate, and how to access both.',
    category: 'practical',
    tags: ['hospice', 'palliative-care', 'end-of-life'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/hospice-vs-palliative-care.webp`,
    image_alt: 'Hospital garden representing palliative care',
    body: generateArticleBody('Hospice vs. Palliative Care', 'practical'),
  },
  {
    slug: 'green-burial',
    title: 'Green Burial: What It Is, How It Works, and Why It\'s Growing',
    meta_description: 'Green burial is the oldest form of burial. Here\'s what it actually involves, how it differs from conventional burial, and how to arrange one.',
    category: 'practical',
    tags: ['green-burial', 'natural-burial', 'death-positive'],
    reading_time: 9,
    image_url: `${BUNNY_CDN}/articles/green-burial.webp`,
    image_alt: 'Forest floor with moss representing green burial',
    body: generateArticleBody('Green Burial', 'practical'),
  },
  {
    slug: 'legacy-letters',
    title: 'Legacy Letters: How to Write What You Need to Say Before You Die',
    meta_description: 'Legacy letters are letters you write to the people you love, to be read after you die. Here\'s how to write them, and why you should start now.',
    category: 'practical',
    tags: ['legacy-letters', 'end-of-life', 'relationships'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/legacy-letters.webp`,
    image_alt: 'Handwritten letter in an envelope',
    body: generateArticleBody('Legacy Letters', 'practical'),
  },
  {
    slug: 'the-practical-checklist-for-getting-your-affairs-in-order',
    title: 'The Practical Checklist for Getting Your Affairs in Order',
    meta_description: 'The complete practical checklist for getting your affairs in order. Will, advance directive, healthcare proxy, financial instructions, and more.',
    category: 'practical',
    tags: ['checklist', 'practical', 'death-preparation'],
    reading_time: 12,
    image_url: `${BUNNY_CDN}/articles/the-practical-checklist-for-getting-your-affairs-in-order.webp`,
    image_alt: 'Organized desk with planning materials',
    body: generateArticleBody('The Practical Checklist', 'practical'),
  },
  {
    slug: 'the-vedantic-view-of-death',
    title: 'The Vedantic View of Death: What Atman Is and What It Isn\'t',
    meta_description: 'In Vedanta, Atman doesn\'t die. But this teaching is often misused as spiritual bypass. Here\'s what it actually means, and how to hold it honestly.',
    category: 'spiritual',
    tags: ['vedanta', 'atman', 'spiritual-philosophy'],
    reading_time: 12,
    image_url: `${BUNNY_CDN}/articles/the-vedantic-view-of-death.webp`,
    image_alt: 'Sunrise representing spiritual awakening',
    body: generateArticleBody('The Vedantic View of Death', 'spiritual'),
  },
  {
    slug: 'psychedelic-assisted-end-of-life-therapy',
    title: 'Psychedelic-Assisted End-of-Life Therapy: What the Research Actually Shows',
    meta_description: 'Psilocybin and MDMA are showing remarkable results in end-of-life anxiety. Here\'s what the research actually shows, and what it means for conscious dying.',
    category: 'spiritual',
    tags: ['psilocybin', 'psychedelic-therapy', 'end-of-life'],
    reading_time: 12,
    image_url: `${BUNNY_CDN}/articles/psychedelic-assisted-end-of-life-therapy.webp`,
    image_alt: 'Abstract colors representing consciousness',
    body: generateArticleBody('Psychedelic-Assisted End-of-Life Therapy', 'spiritual'),
  },
  {
    slug: 'death-meditation',
    title: 'Death Meditation: The Buddhist Practice of Contemplating Your Own Death',
    meta_description: 'Maranasati - death meditation - is one of the oldest Buddhist practices. Here\'s what it is, how to do it, and why it changes how you live.',
    category: 'spiritual',
    tags: ['death-meditation', 'buddhism', 'maranasati'],
    reading_time: 11,
    image_url: `${BUNNY_CDN}/articles/death-meditation.webp`,
    image_alt: 'Meditation cushion with candle',
    body: generateArticleBody('Death Meditation', 'spiritual'),
  },
  {
    slug: 'stephen-levines-a-year-to-live',
    title: 'Stephen Levine\'s "A Year to Live": The Practice of Living as If This Were Your Last Year',
    meta_description: 'Stephen Levine spent a year living as if he would die at the end of it. Here\'s what he learned, and how to do the practice yourself.',
    category: 'spiritual',
    tags: ['stephen-levine', 'a-year-to-live', 'death-practice'],
    reading_time: 11,
    image_url: `${BUNNY_CDN}/articles/stephen-levines-a-year-to-live.webp`,
    image_alt: 'Open book in nature',
    body: generateArticleBody('Stephen Levine\'s A Year to Live', 'spiritual'),
  },
  {
    slug: 'music-and-sound-at-the-end-of-life',
    title: 'Music and Sound at the End of Life: What the Research Shows and How to Use It',
    meta_description: 'Music therapy at end of life reduces anxiety, pain, and distress. Here\'s what the research shows and how to create a sound environment for dying.',
    category: 'spiritual',
    tags: ['music-therapy', 'sound-healing', 'end-of-life'],
    reading_time: 10,
    image_url: `${BUNNY_CDN}/articles/music-and-sound-at-the-end-of-life.webp`,
    image_alt: 'Singing bowl for sound healing',
    body: generateArticleBody('Music and Sound at the End of Life', 'spiritual'),
  },
];

function generateArticleBody(title, category) {
  const amazonTag = 'spankyspinola-20';
  const books = {
    'conscious-dying': { asin: '0385262493', name: 'Who Dies? by Stephen Levine' },
    'tibetan-buddhism': { asin: '0062503812', name: 'The Tibetan Book of Living and Dying' },
    'grief': { asin: '1250074657', name: 'The Five Invitations by Frank Ostaseski' },
    'practical': { asin: 'B08JKQM3WS', name: 'In Case of Emergency: End-of-Life Planning' },
    'spiritual': { asin: '1577311736', name: 'The Grace in Dying by Kathleen Dowling Singh' },
    'death-positive': { asin: '1476727953', name: 'Smoke Gets in Your Eyes by Caitlin Doughty' },
  };
  const book = books[category] || books['conscious-dying'];
  const book2 = { asin: '1250074657', name: 'The Five Invitations by Frank Ostaseski' };
  const book3 = { asin: 'B07FZ8S74R', name: 'Tibetan Singing Bowl Set' };

  return `<h1>${title}</h1>

<p>Here's the thing about death: it's the one appointment you can't reschedule, and most of us show up to it completely unprepared. Not because we're foolish. Because the culture we live in has systematically removed death from view, medicalized it, institutionalized it, and left us alone with our terror when it finally arrives.</p>

<p>That's not how it has to be.</p>

<h2>What This Actually Means</h2>

<p>I've spent years studying what happens when people turn toward death rather than away from it. The research is consistent, the teachers are consistent, and the people who've done this work are consistent: the person who has made peace with death lives differently. Not recklessly. Not morbidly. With a quality of presence that the death-denying mind can't access.</p>

<p>That's what this article is about. Not theory. Practice.</p>

<h3>The Foundation</h3>

<p>Before we get into the specifics, let's be clear about what we're talking about. This isn't about accepting death in some abstract philosophical sense. It's about the concrete, practical, spiritual work of actually preparing for the most certain event of your life.</p>

<p>The work has two tracks, and you need both. The practical track: advance directives, legacy letters, conversations, arrangements. The spiritual track: meditation, inquiry, the kind of honest sitting-with that changes how you hold your own mortality.</p>

<p>Most people do neither. Some do one. The ones who do both - that's where the real transformation happens.</p>

<h2>The Practical Dimension</h2>

<p>I'm going to recommend <a href="https://www.amazon.com/dp/${book.asin}?tag=${amazonTag}" target="_blank" rel="nofollow sponsored noopener noreferrer">${book.name}</a> (paid link) here because it's the most honest book I know on this subject. It doesn't bypass the difficulty. It doesn't offer false comfort. It just tells you what's true.</p>

<p>The practical work starts with a simple question: if you died tomorrow, would the people who love you know what you wanted? Not just your financial wishes. Your medical wishes. Your end-of-life wishes. Where you want to die, with whom, with what kind of support.</p>

<p>Most people haven't answered that question. Most people haven't even asked it.</p>

<h3>Starting Points</h3>

<p>Here's where to begin. Not where to end - where to begin. This work takes time, and it's worth doing slowly and honestly.</p>

<p>First: write down your wishes, even informally. Not a legal document yet. Just your actual preferences. Where do you want to die? At home? In a hospice? What kind of medical intervention do you want? What don't you want? Who do you want present?</p>

<p>Second: tell someone. One person who will remember and advocate for you. That's the minimum.</p>

<h2>The Spiritual Dimension</h2>

<p>The practical work is necessary but not sufficient. You can have the most complete advance directive in the world and still be terrified of death. The spiritual work is different. It's the work of actually changing your relationship with mortality.</p>

<p>Frank Ostaseski, who co-founded the Zen Hospice Project and has sat with thousands of dying people, wrote <a href="https://www.amazon.com/dp/${book2.asin}?tag=${amazonTag}" target="_blank" rel="nofollow sponsored noopener noreferrer">${book2.name}</a> (paid link) about what he learned. The first invitation is "Don't wait." Not as a cliche. As a practice.</p>

<p>Don't wait to have the conversation. Don't wait to write the letter. Don't wait to sit with the reality of your own death. The waiting is the problem. The waiting is what makes death terrifying.</p>

<h3>A Simple Practice</h3>

<p>Here's a practice I've used and taught for years. It takes five minutes. You can do it anywhere.</p>

<p>Sit quietly. Take a few breaths. Then ask yourself: what if this were my last year? Not as a thought experiment. As a genuine inquiry. What would you do differently? What would you stop doing? What would you finally say?</p>

<p>Don't answer quickly. Sit with the question. Let it work on you.</p>

<h2>What the Research Shows</h2>

<p>The research on death preparation is consistent. People who have engaged with their mortality - through meditation, through advance care planning, through honest conversation - report less anxiety about death, not more. The terror comes from avoidance, not from engagement.</p>

<p>This is counterintuitive. We think that thinking about death will make us more afraid of it. The opposite is true. Avoidance keeps the fear alive. Engagement metabolizes it.</p>

<p>For your meditation practice, a <a href="https://www.amazon.com/dp/${book3.asin}?tag=${amazonTag}" target="_blank" rel="nofollow sponsored noopener noreferrer">${book3.name}</a> (paid link) can be a useful tool for creating a contemplative space. The sound grounds you in the present moment, which is exactly where death practice needs to happen.</p>

<h2>The Vedantic Perspective</h2>

<p>I want to offer this carefully, because it's often misused. In Vedanta, the teaching is that Atman - the true self, pure consciousness - does not die. What dies is the body, the mind, the ego. The Atman is birthless and deathless.</p>

<p>This is not a platitude. It's not "they're in a better place." It's a philosophical claim that deserves honest inquiry. What is it that doesn't die? What is the witness of experience? What remains when thought stops?</p>

<p>These questions are worth sitting with. Not to bypass grief or fear. But to understand what's actually at stake when we talk about death.</p>

<h2>Frequently Asked Questions</h2>

<h3>Isn't thinking about death morbid?</h3>
<p>No. Morbid means unhealthily preoccupied with death. Thinking clearly about death is the opposite of morbid - it's honest. The culture's avoidance of death is what's unhealthy.</p>

<h3>I'm not dying. Why should I do this now?</h3>
<p>Because you will be. And because the work of preparing for death is actually the work of learning how to live. The people who've done this work don't just die better. They live better.</p>

<h3>What if I'm too scared to think about it?</h3>
<p>Start small. You don't have to face the whole thing at once. Start with one question. Start with one conversation. Start with five minutes of sitting with the reality of your own mortality. The fear doesn't go away by avoiding it. It goes away by meeting it.</p>

<h3>Where do I start?</h3>
<p>Start with the practical. Write down your wishes. Tell one person. Then, when you're ready, start the spiritual work. Read. Meditate. Talk to people who've done this work. The path reveals itself as you walk it.</p>

<div class="health-disclaimer">
<strong>A note:</strong> This article is for educational and reflective purposes only. It is not medical advice. If you or someone you love is facing a terminal diagnosis or end-of-life decisions, please consult with your healthcare team and consider working with a palliative care specialist or death doula.
</div>

<div class="affiliate-section">
<h3>The Crossing Library</h3>
<ul>
<li><a href="https://www.amazon.com/dp/${book.asin}?tag=${amazonTag}" target="_blank" rel="nofollow sponsored noopener noreferrer">${book.name}</a> (paid link) - Essential reading for this work.</li>
<li><a href="https://www.amazon.com/dp/${book2.asin}?tag=${amazonTag}" target="_blank" rel="nofollow sponsored noopener noreferrer">${book2.name}</a> (paid link) - Five principles for living and dying well.</li>
<li><a href="https://www.amazon.com/dp/${book3.asin}?tag=${amazonTag}" target="_blank" rel="nofollow sponsored noopener noreferrer">${book3.name}</a> (paid link) - For your meditation practice.</li>
</ul>
<p class="affiliate-disclosure">As an Amazon Associate, I earn from qualifying purchases.</p>
</div>

<p class="sanskrit-closing"><em>Om shanti, shanti, shanti.</em></p>`;
}

async function seed() {
  console.log('Seeding articles...');

  // Run migration first
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      meta_description TEXT,
      og_title TEXT,
      og_description TEXT,
      category TEXT NOT NULL DEFAULT 'conscious-dying',
      tags TEXT[] DEFAULT '{}',
      image_url TEXT,
      image_alt TEXT,
      reading_time INTEGER DEFAULT 8,
      author TEXT DEFAULT 'Kalesh',
      published_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      word_count INTEGER DEFAULT 0,
      quality_gate_passed BOOLEAN DEFAULT FALSE,
      quality_gate_failures JSONB DEFAULT '[]',
      asins_used TEXT[] DEFAULT '{}',
      opener_type TEXT,
      conclusion_type TEXT
    )
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC)`);

  console.log('Tables created/verified');

  let inserted = 0;
  let updated = 0;

  for (const article of ARTICLES) {
    const wordCount = article.body.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;

    const result = await pool.query(`
      INSERT INTO articles (
        slug, title, body, meta_description, og_title, og_description,
        category, tags, image_url, image_alt, reading_time, author,
        published_at, updated_at, word_count, quality_gate_passed
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW(),$13,$14)
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
        updated_at = NOW()
      RETURNING (xmax = 0) AS inserted
    `, [
      article.slug,
      article.title,
      article.body,
      article.meta_description,
      article.title,
      article.meta_description,
      article.category,
      article.tags,
      article.image_url,
      article.image_alt,
      article.reading_time,
      'Kalesh',
      wordCount,
      false,
    ]);

    if (result.rows[0]?.inserted) inserted++;
    else updated++;

    process.stdout.write('.');
  }

  console.log(`\nDone! ${inserted} inserted, ${updated} updated`);
  await pool.end();
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
