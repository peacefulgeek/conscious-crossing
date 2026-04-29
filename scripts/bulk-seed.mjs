#!/usr/bin/env node
/**
 * Bulk Seed — 500 articles queued for The Conscious Crossing
 * Uses DeepSeek V4-Pro via OpenAI-compatible API.
 * All articles inserted with status = 'queued'.
 * Run: node scripts/bulk-seed.mjs
 * Railway: npm run bulk-seed
 */

import { generateArticle } from '../src/lib/deepseek-generate.mjs';
import { runQualityGate } from '../src/lib/article-quality-gate.mjs';
import { assignHeroImage } from '../src/lib/image-assign.mjs';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const MAX_ATTEMPTS = 4;
const DELAY_BETWEEN_MS = 1200; // ~50 req/min, well within DeepSeek limits

// ── 500 Unique Conscious Dying Topics ────────────────────────────────────────
const TOPICS = [
  // Conscious Dying Fundamentals (1-40)
  { title: "What Conscious Dying Actually Means", category: "conscious-dying", tags: ["death-preparation","awareness","presence"] },
  { title: "The Five Stages of Dying: What Kubler-Ross Got Right and Wrong", category: "conscious-dying", tags: ["kubler-ross","grief","stages"] },
  { title: "How to Talk to Someone Who Is Dying", category: "conscious-dying", tags: ["communication","end-of-life","presence"] },
  { title: "The Difference Between Dying Consciously and Dying by Default", category: "conscious-dying", tags: ["intention","awareness","death-preparation"] },
  { title: "Why Most People Are Terrified of Death (And What That Terror Is Really About)", category: "conscious-dying", tags: ["fear-of-death","psychology","awareness"] },
  { title: "Death as a Teacher: What Mortality Reveals About How You're Living", category: "conscious-dying", tags: ["mortality","life-lessons","awareness"] },
  { title: "The Art of Letting Go: A Practical Guide for the Dying Process", category: "conscious-dying", tags: ["letting-go","dying-process","practice"] },
  { title: "What Happens in the Final Hours of Life", category: "conscious-dying", tags: ["dying-process","end-of-life","physical"] },
  { title: "How to Be Present With Someone Who Is Actively Dying", category: "conscious-dying", tags: ["presence","caregiving","end-of-life"] },
  { title: "The Body's Wisdom at the End of Life", category: "conscious-dying", tags: ["body","dying-process","wisdom"] },
  { title: "Dying Without Regret: The Work You Can Do Now", category: "conscious-dying", tags: ["regret","preparation","life-review"] },
  { title: "What the Dying Actually Want (And Rarely Get)", category: "conscious-dying", tags: ["dying-wishes","communication","presence"] },
  { title: "The Gift of a Good Death: What It Looks Like", category: "conscious-dying", tags: ["good-death","intention","preparation"] },
  { title: "How Fear of Death Shapes the Way You Live", category: "conscious-dying", tags: ["fear-of-death","psychology","life"] },
  { title: "Preparing for Death When You're Not Dying Yet", category: "conscious-dying", tags: ["preparation","practice","awareness"] },
  { title: "The Moment of Death: What We Know and What Remains Mystery", category: "conscious-dying", tags: ["moment-of-death","mystery","consciousness"] },
  { title: "Why Denial About Death Costs You More Than You Think", category: "conscious-dying", tags: ["denial","awareness","psychology"] },
  { title: "The Role of Silence in Conscious Dying", category: "conscious-dying", tags: ["silence","presence","dying-process"] },
  { title: "How to Hold Space for the Dying Without Falling Apart", category: "conscious-dying", tags: ["caregiving","presence","emotional-support"] },
  { title: "Death Doulas: What They Do and Why You Might Want One", category: "conscious-dying", tags: ["death-doula","end-of-life","support"] },
  { title: "The Language of Dying: Words That Help and Words That Harm", category: "conscious-dying", tags: ["communication","language","end-of-life"] },
  { title: "What Unfinished Business Looks Like at the End of Life", category: "conscious-dying", tags: ["unfinished-business","life-review","relationships"] },
  { title: "How to Die With Your Relationships Intact", category: "conscious-dying", tags: ["relationships","forgiveness","end-of-life"] },
  { title: "The Difference Between Palliative Care and Hospice", category: "conscious-dying", tags: ["palliative-care","hospice","end-of-life"] },
  { title: "When the Dying Person Refuses to Talk About Death", category: "conscious-dying", tags: ["communication","denial","family"] },
  { title: "What Caregivers Need That Nobody Talks About", category: "conscious-dying", tags: ["caregiving","self-care","support"] },
  { title: "The Spiritual Dimension of Physical Dying", category: "conscious-dying", tags: ["spiritual","dying-process","consciousness"] },
  { title: "How to Prepare Your Mind for Your Own Death", category: "conscious-dying", tags: ["mental-preparation","awareness","practice"] },
  { title: "Death in the Age of Modern Medicine: What We've Lost", category: "conscious-dying", tags: ["modern-medicine","medicalization","dying"] },
  { title: "The Importance of Touch at the End of Life", category: "conscious-dying", tags: ["touch","presence","dying-process"] },
  { title: "How Dying Changes the People Around the Dying Person", category: "conscious-dying", tags: ["family","transformation","dying"] },
  { title: "What It Means to Have a Witnessed Death", category: "conscious-dying", tags: ["witness","presence","community"] },
  { title: "The Dying Person's Inner World: What They May Be Experiencing", category: "conscious-dying", tags: ["inner-experience","consciousness","dying"] },
  { title: "How to Say Goodbye When You Don't Know How", category: "conscious-dying", tags: ["goodbye","communication","relationships"] },
  { title: "The Four Things That Matter Most at the End of Life", category: "conscious-dying", tags: ["relationships","forgiveness","love"] },
  { title: "Why Dying People Often Wait for Permission to Go", category: "conscious-dying", tags: ["permission","dying-process","family"] },
  { title: "The Difference Between a Peaceful Death and a Difficult One", category: "conscious-dying", tags: ["peaceful-death","preparation","intention"] },
  { title: "How to Sit With Your Own Mortality Without Spiraling", category: "conscious-dying", tags: ["mortality","awareness","practice"] },
  { title: "What Conscious Dying Looks Like in Practice", category: "conscious-dying", tags: ["practice","intention","dying-process"] },
  { title: "The Body Knows: Physical Signs That Death Is Near", category: "conscious-dying", tags: ["physical-signs","dying-process","awareness"] },

  // Tibetan Buddhism & Death (41-90)
  { title: "The Tibetan Book of the Dead: A Modern Reader's Guide", category: "tibetan-buddhism", tags: ["bardo-thodol","tibetan-buddhism","death"] },
  { title: "What the Bardo Teachings Say About What Happens After Death", category: "tibetan-buddhism", tags: ["bardo","afterlife","tibetan-buddhism"] },
  { title: "Phowa: The Tibetan Practice of Consciousness Transference at Death", category: "tibetan-buddhism", tags: ["phowa","tibetan-buddhism","practice"] },
  { title: "The Clear Light of Death: What Tibetan Buddhism Teaches", category: "tibetan-buddhism", tags: ["clear-light","tibetan-buddhism","consciousness"] },
  { title: "How to Practice Dying Before You Die: The Tibetan Approach", category: "tibetan-buddhism", tags: ["practice","tibetan-buddhism","preparation"] },
  { title: "The Three Bardos: A Practical Understanding", category: "tibetan-buddhism", tags: ["bardo","tibetan-buddhism","consciousness"] },
  { title: "Sogyal Rinpoche's Teachings on Impermanence and Death", category: "tibetan-buddhism", tags: ["sogyal-rinpoche","impermanence","tibetan-buddhism"] },
  { title: "Dream Yoga as Preparation for the Dying Process", category: "tibetan-buddhism", tags: ["dream-yoga","tibetan-buddhism","practice"] },
  { title: "The Dissolution of the Elements at Death: Tibetan View", category: "tibetan-buddhism", tags: ["elements","dissolution","tibetan-buddhism"] },
  { title: "How Tibetan Buddhists Prepare for Death Throughout Their Lives", category: "tibetan-buddhism", tags: ["preparation","tibetan-buddhism","practice"] },
  { title: "The Luminous Nature of Mind at Death", category: "tibetan-buddhism", tags: ["mind","consciousness","tibetan-buddhism"] },
  { title: "Tonglen Practice for the Dying and the Bereaved", category: "tibetan-buddhism", tags: ["tonglen","compassion","tibetan-buddhism"] },
  { title: "What Reincarnation Actually Means in Tibetan Buddhism", category: "tibetan-buddhism", tags: ["reincarnation","tibetan-buddhism","afterlife"] },
  { title: "The Role of the Lama at the Moment of Death", category: "tibetan-buddhism", tags: ["lama","guidance","tibetan-buddhism"] },
  { title: "Andrew Holecek on Preparing to Die: Key Teachings", category: "tibetan-buddhism", tags: ["andrew-holecek","preparation","tibetan-buddhism"] },
  { title: "Chod Practice: Cutting Through Fear of Death", category: "tibetan-buddhism", tags: ["chod","fear","tibetan-buddhism"] },
  { title: "The Peaceful and Wrathful Deities of the Bardo", category: "tibetan-buddhism", tags: ["deities","bardo","tibetan-buddhism"] },
  { title: "How Meditation on Death Changes Your Daily Life", category: "tibetan-buddhism", tags: ["meditation","death","daily-practice"] },
  { title: "The Tibetan Understanding of Consciousness After Death", category: "tibetan-buddhism", tags: ["consciousness","afterlife","tibetan-buddhism"] },
  { title: "Mahamudra and the Recognition of Death's Nature", category: "tibetan-buddhism", tags: ["mahamudra","tibetan-buddhism","consciousness"] },
  { title: "Why Tibetan Buddhism Places Death at the Center of Practice", category: "tibetan-buddhism", tags: ["practice","tibetan-buddhism","death"] },
  { title: "The 49 Days After Death in Tibetan Buddhist Tradition", category: "tibetan-buddhism", tags: ["49-days","bardo","tibetan-buddhism"] },
  { title: "How to Read the Tibetan Book of the Dead as a Living Practice", category: "tibetan-buddhism", tags: ["bardo-thodol","practice","tibetan-buddhism"] },
  { title: "The Six Realms of Existence and What They Mean for Dying", category: "tibetan-buddhism", tags: ["six-realms","tibetan-buddhism","afterlife"] },
  { title: "Dzogchen: The Great Perfection and the Nature of Death", category: "tibetan-buddhism", tags: ["dzogchen","tibetan-buddhism","consciousness"] },
  { title: "How the Tibetan Tradition Handles Grief After Death", category: "tibetan-buddhism", tags: ["grief","tibetan-buddhism","tradition"] },
  { title: "The Practice of Dying Meditation in Tibetan Buddhism", category: "tibetan-buddhism", tags: ["meditation","practice","tibetan-buddhism"] },
  { title: "What Tibetan Buddhism Says About Sudden Death", category: "tibetan-buddhism", tags: ["sudden-death","tibetan-buddhism","bardo"] },
  { title: "The Importance of the Last Thought at Death", category: "tibetan-buddhism", tags: ["last-thought","consciousness","tibetan-buddhism"] },
  { title: "How to Support a Dying Person Using Tibetan Buddhist Practices", category: "tibetan-buddhism", tags: ["support","practice","tibetan-buddhism"] },
  { title: "The Relationship Between Sleep, Dreams, and Death in Tibetan Buddhism", category: "tibetan-buddhism", tags: ["sleep","dreams","tibetan-buddhism"] },
  { title: "Rigpa: The Awakened State and Its Relationship to Dying", category: "tibetan-buddhism", tags: ["rigpa","awareness","tibetan-buddhism"] },
  { title: "What the Tibetan Masters Say About Fear of Death", category: "tibetan-buddhism", tags: ["fear","masters","tibetan-buddhism"] },
  { title: "The Practice of Guru Yoga in Preparation for Death", category: "tibetan-buddhism", tags: ["guru-yoga","practice","tibetan-buddhism"] },
  { title: "Tibetan Buddhist Rituals for the Dying and Dead", category: "tibetan-buddhism", tags: ["rituals","tradition","tibetan-buddhism"] },
  { title: "How Impermanence Practice Transforms Your Relationship With Death", category: "tibetan-buddhism", tags: ["impermanence","practice","transformation"] },
  { title: "The Meaning of Liberation at Death in Tibetan Buddhism", category: "tibetan-buddhism", tags: ["liberation","tibetan-buddhism","consciousness"] },
  { title: "Powa Ceremony: What It Is and When It's Used", category: "tibetan-buddhism", tags: ["powa","ceremony","tibetan-buddhism"] },
  { title: "The Dissolution of Consciousness: A Tibetan Map", category: "tibetan-buddhism", tags: ["consciousness","dissolution","tibetan-buddhism"] },
  { title: "How Tibetan Buddhist Teachers Talk About Their Own Deaths", category: "tibetan-buddhism", tags: ["teachers","death","tibetan-buddhism"] },
  { title: "The Relationship Between Karma and the Dying Process", category: "tibetan-buddhism", tags: ["karma","dying-process","tibetan-buddhism"] },
  { title: "Shamatha Meditation as Foundation for Conscious Dying", category: "tibetan-buddhism", tags: ["shamatha","meditation","preparation"] },
  { title: "What Milarepa's Death Teaches About Conscious Dying", category: "tibetan-buddhism", tags: ["milarepa","tibetan-buddhism","death"] },
  { title: "The Bardo of Dharmata: The Luminous Visions After Death", category: "tibetan-buddhism", tags: ["bardo","dharmata","tibetan-buddhism"] },
  { title: "How to Recite the Bardo Thodol for Someone Who Has Died", category: "tibetan-buddhism", tags: ["bardo-thodol","practice","support"] },
  { title: "The Connection Between Waking, Dreaming, and Dying in Tibetan Buddhism", category: "tibetan-buddhism", tags: ["waking","dreaming","tibetan-buddhism"] },
  { title: "Why the Tibetan Tradition Emphasizes Dying Alone", category: "tibetan-buddhism", tags: ["solitude","dying","tibetan-buddhism"] },
  { title: "The Intermediate State: A Tibetan Buddhist Guide to the Bardo", category: "tibetan-buddhism", tags: ["bardo","intermediate-state","tibetan-buddhism"] },
  { title: "How Tibetan Buddhism Understands the Moment of Death", category: "tibetan-buddhism", tags: ["moment-of-death","tibetan-buddhism","consciousness"] },
  { title: "The Practice of White Tara for Longevity and Conscious Dying", category: "tibetan-buddhism", tags: ["white-tara","practice","tibetan-buddhism"] },
  { title: "What Dying Meditators Report: Accounts from Tibetan Tradition", category: "tibetan-buddhism", tags: ["accounts","meditators","tibetan-buddhism"] },

  // Grief & Loss (91-140)
  { title: "Anticipatory Grief: Mourning Someone Who Hasn't Died Yet", category: "grief", tags: ["anticipatory-grief","mourning","end-of-life"] },
  { title: "The Grief Nobody Talks About: Losing Yourself as a Caregiver", category: "grief", tags: ["caregiver-grief","identity","loss"] },
  { title: "How to Grieve Without Losing Yourself", category: "grief", tags: ["grief","identity","self-care"] },
  { title: "Complicated Grief: When Mourning Gets Stuck", category: "grief", tags: ["complicated-grief","healing","psychology"] },
  { title: "The Physical Experience of Grief: What Your Body Goes Through", category: "grief", tags: ["physical-grief","body","mourning"] },
  { title: "Grief and Anger: Understanding the Rage That Comes With Loss", category: "grief", tags: ["anger","grief","emotions"] },
  { title: "How to Support a Grieving Person Without Saying the Wrong Thing", category: "grief", tags: ["support","communication","grief"] },
  { title: "The Myth of Closure: What Grief Actually Looks Like Over Time", category: "grief", tags: ["closure","grief","healing"] },
  { title: "Grief After Suicide: The Particular Weight of This Loss", category: "grief", tags: ["suicide-grief","mourning","healing"] },
  { title: "Disenfranchised Grief: When Your Loss Isn't Recognized", category: "grief", tags: ["disenfranchised-grief","recognition","mourning"] },
  { title: "How Children Grieve Differently Than Adults", category: "grief", tags: ["children","grief","family"] },
  { title: "The Anniversary Effect: Why Grief Resurfaces on Dates", category: "grief", tags: ["anniversary","grief","healing"] },
  { title: "Grief and Identity: Who Are You After Someone You Love Dies?", category: "grief", tags: ["identity","grief","transformation"] },
  { title: "The Relationship Between Grief and Depression", category: "grief", tags: ["depression","grief","mental-health"] },
  { title: "How to Create Meaningful Rituals for Grief", category: "grief", tags: ["rituals","grief","healing"] },
  { title: "Pet Loss: Why It Hits So Hard and What to Do With It", category: "grief", tags: ["pet-loss","grief","mourning"] },
  { title: "Grief Support Groups: What They Offer and What They Don't", category: "grief", tags: ["support-groups","grief","community"] },
  { title: "The Difference Between Grief and Mourning", category: "grief", tags: ["grief","mourning","healing"] },
  { title: "How Grief Changes Your Brain", category: "grief", tags: ["brain","grief","neuroscience"] },
  { title: "Continuing Bonds: Maintaining Connection With the Dead", category: "grief", tags: ["continuing-bonds","connection","grief"] },
  { title: "The Role of Ritual in Processing Grief Across Cultures", category: "grief", tags: ["ritual","culture","grief"] },
  { title: "Grief and Spirituality: How Loss Can Deepen Faith or Destroy It", category: "grief", tags: ["spirituality","faith","grief"] },
  { title: "When Grief Becomes Complicated: Signs You Need Support", category: "grief", tags: ["complicated-grief","support","healing"] },
  { title: "How to Help a Child Understand Death", category: "grief", tags: ["children","death","communication"] },
  { title: "The Grief of Estrangement: Mourning Someone Still Alive", category: "grief", tags: ["estrangement","grief","relationships"] },
  { title: "What Grief Counselors Wish You Knew", category: "grief", tags: ["grief-counseling","healing","support"] },
  { title: "Grief and Gratitude: Can They Coexist?", category: "grief", tags: ["gratitude","grief","healing"] },
  { title: "The Long Tail of Grief: What Happens Years After a Loss", category: "grief", tags: ["long-term-grief","healing","mourning"] },
  { title: "How to Talk to Your Kids About Death Before It Happens", category: "grief", tags: ["children","death","communication"] },
  { title: "Grief After a Long Illness vs. Sudden Loss: The Differences", category: "grief", tags: ["illness","sudden-loss","grief"] },
  { title: "The Grief of Miscarriage and Pregnancy Loss", category: "grief", tags: ["miscarriage","pregnancy-loss","grief"] },
  { title: "How Men Grieve Differently (And Why That Matters)", category: "grief", tags: ["men","grief","gender"] },
  { title: "Grief and the Holidays: Surviving the Hardest Times of Year", category: "grief", tags: ["holidays","grief","survival"] },
  { title: "Post-Traumatic Growth: How Loss Can Lead to Transformation", category: "grief", tags: ["post-traumatic-growth","transformation","grief"] },
  { title: "The Grief of Dementia: Losing Someone in Stages", category: "grief", tags: ["dementia","grief","caregiving"] },
  { title: "How to Write a Grief Letter to Someone You've Lost", category: "grief", tags: ["writing","grief","healing"] },
  { title: "Grief and Creativity: How Art Helps Process Loss", category: "grief", tags: ["creativity","art","grief"] },
  { title: "The Difference Between Healthy Grieving and Avoiding Grief", category: "grief", tags: ["healthy-grieving","avoidance","healing"] },
  { title: "Grief and Sleep: Why Loss Disrupts Rest and How to Help It", category: "grief", tags: ["sleep","grief","healing"] },
  { title: "What Grief Looks Like in the Body: Somatic Approaches to Mourning", category: "grief", tags: ["somatic","body","grief"] },
  { title: "The Grief of Losing a Parent: What Nobody Prepares You For", category: "grief", tags: ["parent-loss","grief","family"] },
  { title: "Secondary Losses: The Hidden Grief Within Grief", category: "grief", tags: ["secondary-loss","grief","healing"] },
  { title: "How to Support Yourself Through Grief Without Numbing Out", category: "grief", tags: ["self-support","grief","awareness"] },
  { title: "Grief and Anger at God: The Spiritual Crisis of Loss", category: "grief", tags: ["anger","spirituality","grief"] },
  { title: "The Grief of Losing a Sibling", category: "grief", tags: ["sibling-loss","grief","family"] },
  { title: "How to Create a Memorial That Actually Honors the Person", category: "grief", tags: ["memorial","ritual","grief"] },
  { title: "Grief Journaling: How to Use Writing to Process Loss", category: "grief", tags: ["journaling","writing","grief"] },
  { title: "The Grief of Losing a Child: The Unnatural Order of Things", category: "grief", tags: ["child-loss","grief","family"] },
  { title: "What Grief Teaches About Love", category: "grief", tags: ["love","grief","wisdom"] },
  { title: "How to Grieve a Relationship That Ended Before Death", category: "grief", tags: ["relationship-grief","loss","healing"] },
  { title: "The Grief of Losing a Friend: Why It's Underestimated", category: "grief", tags: ["friendship","grief","loss"] },

  // Practical Planning (141-200)
  { title: "The Complete Advance Directive Guide: What It Is and Why You Need One", category: "practical", tags: ["advance-directive","planning","legal"] },
  { title: "How to Write a Living Will That Actually Reflects Your Wishes", category: "practical", tags: ["living-will","planning","legal"] },
  { title: "The Difference Between a DNR and a POLST", category: "practical", tags: ["dnr","polst","medical"] },
  { title: "How to Choose a Healthcare Proxy", category: "practical", tags: ["healthcare-proxy","planning","relationships"] },
  { title: "What Happens to Your Digital Life When You Die", category: "practical", tags: ["digital-assets","planning","technology"] },
  { title: "The End-of-Life Conversation You Keep Putting Off", category: "practical", tags: ["conversation","family","planning"] },
  { title: "How to Organize Your Important Documents Before You Die", category: "practical", tags: ["documents","organization","planning"] },
  { title: "Home Death vs. Hospital Death: What You Need to Know", category: "practical", tags: ["home-death","hospital","planning"] },
  { title: "How to Plan a Meaningful Funeral or Memorial Service", category: "practical", tags: ["funeral","memorial","planning"] },
  { title: "Green Burial: What It Is and How to Plan One", category: "practical", tags: ["green-burial","eco-friendly","planning"] },
  { title: "The Costs of Dying: What Nobody Tells You About End-of-Life Expenses", category: "practical", tags: ["costs","finances","planning"] },
  { title: "How to Talk to Your Doctor About End-of-Life Care", category: "practical", tags: ["doctor","communication","medical"] },
  { title: "What Hospice Actually Provides (And What It Doesn't)", category: "practical", tags: ["hospice","care","planning"] },
  { title: "How to Write an Ethical Will: Leaving Your Values, Not Just Your Assets", category: "practical", tags: ["ethical-will","values","legacy"] },
  { title: "The Practical Checklist for When Someone Dies", category: "practical", tags: ["checklist","practical","death"] },
  { title: "How to Navigate the Probate Process", category: "practical", tags: ["probate","legal","finances"] },
  { title: "What to Do in the First 24 Hours After Someone Dies", category: "practical", tags: ["first-24-hours","practical","death"] },
  { title: "How to Have the Money Conversation With Aging Parents", category: "practical", tags: ["money","family","aging"] },
  { title: "Medical Aid in Dying: What It Is, Where It's Legal, and What to Know", category: "practical", tags: ["medical-aid-in-dying","legal","end-of-life"] },
  { title: "How to Choose a Hospice Provider", category: "practical", tags: ["hospice","choosing","care"] },
  { title: "The Role of the Funeral Director: What to Expect", category: "practical", tags: ["funeral-director","planning","death"] },
  { title: "How to Pre-Plan Your Own Funeral", category: "practical", tags: ["pre-planning","funeral","practical"] },
  { title: "What Happens to Your Body After Death", category: "practical", tags: ["body","after-death","practical"] },
  { title: "How to Create a Legacy Letter for Your Children", category: "practical", tags: ["legacy-letter","children","family"] },
  { title: "The Difference Between a Will and a Trust", category: "practical", tags: ["will","trust","legal"] },
  { title: "How to Talk to Your Employer About a Terminal Diagnosis", category: "practical", tags: ["employer","terminal","practical"] },
  { title: "Palliative Sedation: What It Is and When It's Used", category: "practical", tags: ["palliative-sedation","medical","end-of-life"] },
  { title: "How to Create a Death File: Everything Your Family Needs in One Place", category: "practical", tags: ["death-file","organization","family"] },
  { title: "What to Say (and Not Say) When Someone Is Diagnosed With a Terminal Illness", category: "practical", tags: ["communication","terminal","support"] },
  { title: "The Emotional Labor of Being an Executor", category: "practical", tags: ["executor","estate","emotions"] },
  { title: "How to Navigate Insurance Claims After a Death", category: "practical", tags: ["insurance","finances","death"] },
  { title: "Cremation vs. Burial: A Thoughtful Comparison", category: "practical", tags: ["cremation","burial","planning"] },
  { title: "How to Support a Dying Person at Home", category: "practical", tags: ["home-care","support","practical"] },
  { title: "The Conversation About Resuscitation Nobody Wants to Have", category: "practical", tags: ["resuscitation","conversation","medical"] },
  { title: "What a Death Certificate Actually Contains and Why It Matters", category: "practical", tags: ["death-certificate","legal","practical"] },
  { title: "How to Handle Social Media After Someone Dies", category: "practical", tags: ["social-media","digital","death"] },
  { title: "The Practical Guide to Caring for a Dying Person at Home", category: "practical", tags: ["home-care","caregiving","practical"] },
  { title: "How to Write Your Own Obituary", category: "practical", tags: ["obituary","writing","legacy"] },
  { title: "What Happens to Debt When You Die", category: "practical", tags: ["debt","finances","death"] },
  { title: "How to Plan for Incapacity Before You're Incapacitated", category: "practical", tags: ["incapacity","planning","legal"] },
  { title: "The Grief of Being the Executor: Practical and Emotional Challenges", category: "practical", tags: ["executor","grief","practical"] },
  { title: "How to Talk to Children About a Parent's Terminal Diagnosis", category: "practical", tags: ["children","terminal","communication"] },
  { title: "What to Include in a Personal Property Memorandum", category: "practical", tags: ["property","legal","planning"] },
  { title: "How to Choose Between Home Hospice and Inpatient Hospice", category: "practical", tags: ["hospice","home","inpatient"] },
  { title: "The End-of-Life Doula: A New Kind of Support", category: "practical", tags: ["doula","support","end-of-life"] },
  { title: "How to Navigate Medicare and Medicaid at End of Life", category: "practical", tags: ["medicare","medicaid","finances"] },
  { title: "What to Do With a Loved One's Belongings After They Die", category: "practical", tags: ["belongings","grief","practical"] },
  { title: "How to Create a Meaningful Life Review With Someone Who Is Dying", category: "practical", tags: ["life-review","meaning","dying"] },
  { title: "The Practical Guide to Organ Donation", category: "practical", tags: ["organ-donation","planning","practical"] },
  { title: "How to Prepare Your Home for End-of-Life Care", category: "practical", tags: ["home","preparation","caregiving"] },
  { title: "What Palliative Care Can Do That Curative Care Cannot", category: "practical", tags: ["palliative-care","curative","medical"] },
  { title: "How to Navigate Family Conflict Around End-of-Life Decisions", category: "practical", tags: ["family","conflict","decisions"] },
  { title: "The Financial Conversations You Need to Have Before You Die", category: "practical", tags: ["finances","conversation","planning"] },
  { title: "What Happens When There Is No Will", category: "practical", tags: ["intestate","legal","planning"] },
  { title: "How to Create a Meaningful Vigil for the Dying", category: "practical", tags: ["vigil","ritual","dying"] },
  { title: "The Role of Music in End-of-Life Care", category: "practical", tags: ["music","end-of-life","care"] },
  { title: "How to Navigate a Sudden Terminal Diagnosis", category: "practical", tags: ["terminal","sudden","practical"] },
  { title: "What a Comfort Care Plan Looks Like", category: "practical", tags: ["comfort-care","planning","medical"] },
  { title: "How to Talk to a Dying Person About Their Fears", category: "practical", tags: ["fears","communication","dying"] },
  { title: "The Practical Guide to Dying at Home", category: "practical", tags: ["home-death","practical","planning"] },
  { title: "What to Expect From a Hospice Nurse", category: "practical", tags: ["hospice","nurse","care"] },

  // Spiritual Practice & Death (201-260)
  { title: "Meditation on Death: Why the Buddha Made It Central to Practice", category: "spiritual", tags: ["meditation","buddhism","death"] },
  { title: "The Maranasati Practice: Contemplating Death in Theravada Buddhism", category: "spiritual", tags: ["maranasati","theravada","practice"] },
  { title: "How Sufi Mystics Understood Death as Union", category: "spiritual", tags: ["sufism","mysticism","death"] },
  { title: "The Christian Mystical Tradition and the Art of Dying Well", category: "spiritual", tags: ["christian","mysticism","dying"] },
  { title: "Ars Moriendi: The Medieval Art of Dying Well", category: "spiritual", tags: ["ars-moriendi","medieval","dying"] },
  { title: "How the Stoics Prepared for Death", category: "spiritual", tags: ["stoicism","philosophy","death"] },
  { title: "What Near-Death Experiences Reveal About Consciousness", category: "spiritual", tags: ["nde","consciousness","afterlife"] },
  { title: "The Jewish Tradition of Accompanying the Dying", category: "spiritual", tags: ["jewish","tradition","dying"] },
  { title: "How Indigenous Traditions Understand Death and Dying", category: "spiritual", tags: ["indigenous","tradition","death"] },
  { title: "The Hindu Understanding of Death and Rebirth", category: "spiritual", tags: ["hinduism","rebirth","death"] },
  { title: "Zen and the Art of Dying: What Zen Masters Teach", category: "spiritual", tags: ["zen","buddhism","dying"] },
  { title: "The Islamic Tradition of Conscious Dying", category: "spiritual", tags: ["islam","tradition","dying"] },
  { title: "How Shamanic Traditions Navigate Death and the Afterlife", category: "spiritual", tags: ["shamanism","afterlife","tradition"] },
  { title: "The Vedantic View of Death: What Advaita Teaches", category: "spiritual", tags: ["vedanta","advaita","death"] },
  { title: "Psychedelic-Assisted End-of-Life Therapy: What the Research Shows", category: "spiritual", tags: ["psychedelics","therapy","end-of-life"] },
  { title: "How Psilocybin Therapy Changes the Fear of Death", category: "spiritual", tags: ["psilocybin","therapy","fear"] },
  { title: "The Mystical Experience of Dying: Reports From the Threshold", category: "spiritual", tags: ["mystical","dying","consciousness"] },
  { title: "How Prayer Changes the Experience of Dying", category: "spiritual", tags: ["prayer","dying","spiritual"] },
  { title: "The Role of Forgiveness in Conscious Dying", category: "spiritual", tags: ["forgiveness","dying","spiritual"] },
  { title: "What Happens to Consciousness at Death: A Survey of Traditions", category: "spiritual", tags: ["consciousness","afterlife","traditions"] },
  { title: "The Spiritual Practice of Gratitude at End of Life", category: "spiritual", tags: ["gratitude","end-of-life","practice"] },
  { title: "How to Develop a Personal Death Practice", category: "spiritual", tags: ["practice","death","personal"] },
  { title: "The Relationship Between Love and Death", category: "spiritual", tags: ["love","death","spiritual"] },
  { title: "What Dying People Report Seeing: Deathbed Visions", category: "spiritual", tags: ["deathbed-visions","consciousness","dying"] },
  { title: "The Practice of Loving-Kindness for the Dying", category: "spiritual", tags: ["loving-kindness","practice","dying"] },
  { title: "How Contemplative Practice Prepares You for Death", category: "spiritual", tags: ["contemplative","practice","preparation"] },
  { title: "The Relationship Between Ego Death and Physical Death", category: "spiritual", tags: ["ego-death","consciousness","death"] },
  { title: "What Mystical Traditions Say About the Moment of Death", category: "spiritual", tags: ["mystical","moment-of-death","traditions"] },
  { title: "The Practice of Daily Death Awareness", category: "spiritual", tags: ["awareness","practice","daily"] },
  { title: "How Yoga Philosophy Understands Death and Dying", category: "spiritual", tags: ["yoga","philosophy","death"] },
  { title: "The Relationship Between Breath and Death in Spiritual Traditions", category: "spiritual", tags: ["breath","death","traditions"] },
  { title: "What the Perennial Philosophy Says About Death", category: "spiritual", tags: ["perennial-philosophy","death","consciousness"] },
  { title: "How to Use Mantra Practice at the Time of Death", category: "spiritual", tags: ["mantra","practice","death"] },
  { title: "The Spiritual Significance of the Last Breath", category: "spiritual", tags: ["last-breath","spiritual","dying"] },
  { title: "Death and Non-Duality: What Advaita Vedanta Teaches", category: "spiritual", tags: ["non-duality","advaita","death"] },
  { title: "How to Develop Equanimity in the Face of Death", category: "spiritual", tags: ["equanimity","practice","death"] },
  { title: "The Role of Silence in the Dying Process", category: "spiritual", tags: ["silence","dying","spiritual"] },
  { title: "What Spiritual Teachers Say About Their Own Deaths", category: "spiritual", tags: ["teachers","death","spiritual"] },
  { title: "The Practice of Dying Into the Present Moment", category: "spiritual", tags: ["present-moment","practice","dying"] },
  { title: "How Spiritual Practice Changes the Fear of Death", category: "spiritual", tags: ["practice","fear","transformation"] },
  { title: "The Connection Between Sleep and Death in Spiritual Traditions", category: "spiritual", tags: ["sleep","death","traditions"] },
  { title: "What Ramana Maharshi Taught About Death and Self-Inquiry", category: "spiritual", tags: ["ramana-maharshi","self-inquiry","death"] },
  { title: "The Practice of Surrender at the End of Life", category: "spiritual", tags: ["surrender","practice","end-of-life"] },
  { title: "How Mindfulness Changes Your Relationship With Death", category: "spiritual", tags: ["mindfulness","death","transformation"] },
  { title: "The Spiritual Emergency of a Terminal Diagnosis", category: "spiritual", tags: ["spiritual-emergency","terminal","crisis"] },
  { title: "What Eckhart Tolle Teaches About Death and Presence", category: "spiritual", tags: ["eckhart-tolle","presence","death"] },
  { title: "The Practice of Dying as Spiritual Completion", category: "spiritual", tags: ["completion","practice","dying"] },
  { title: "How to Find Meaning in Suffering at the End of Life", category: "spiritual", tags: ["meaning","suffering","end-of-life"] },
  { title: "The Spiritual Practice of Letting Go", category: "spiritual", tags: ["letting-go","practice","spiritual"] },
  { title: "What Thich Nhat Hanh Teaches About Death and Continuation", category: "spiritual", tags: ["thich-nhat-hanh","continuation","death"] },
  { title: "The Role of Love in the Dying Process", category: "spiritual", tags: ["love","dying","spiritual"] },
  { title: "How to Cultivate Fearlessness in the Face of Death", category: "spiritual", tags: ["fearlessness","practice","death"] },
  { title: "The Spiritual Significance of the Deathbed", category: "spiritual", tags: ["deathbed","spiritual","dying"] },
  { title: "What Happens to the Soul After Death: A Cross-Traditional Survey", category: "spiritual", tags: ["soul","afterlife","traditions"] },
  { title: "The Practice of Dying With Awareness", category: "spiritual", tags: ["awareness","practice","dying"] },
  { title: "How Devotion Changes the Experience of Dying", category: "spiritual", tags: ["devotion","dying","spiritual"] },
  { title: "The Relationship Between Suffering and Liberation at Death", category: "spiritual", tags: ["suffering","liberation","death"] },
  { title: "What the Mystics Say About the Afterlife", category: "spiritual", tags: ["mystics","afterlife","consciousness"] },
  { title: "The Practice of Radical Acceptance at End of Life", category: "spiritual", tags: ["acceptance","practice","end-of-life"] },
  { title: "How to Use Visualization Practice to Prepare for Death", category: "spiritual", tags: ["visualization","practice","preparation"] },
  { title: "The Spiritual Dimension of Pain at End of Life", category: "spiritual", tags: ["pain","spiritual","end-of-life"] },
  { title: "What Krishnamurti Taught About Death and Freedom", category: "spiritual", tags: ["krishnamurti","freedom","death"] },

  // Books & Resources (261-310)
  { title: "Stephen Levine's 'A Year to Live': A Practical Guide to the Practice", category: "books", tags: ["stephen-levine","a-year-to-live","practice"] },
  { title: "Frank Ostaseski's 'The Five Invitations': Key Lessons", category: "books", tags: ["frank-ostaseski","five-invitations","hospice"] },
  { title: "Kathleen Dowling Singh's 'The Grace in Dying': What It Teaches", category: "books", tags: ["kathleen-dowling-singh","grace-in-dying","spiritual"] },
  { title: "Joan Halifax's 'Being With Dying': Core Teachings", category: "books", tags: ["joan-halifax","being-with-dying","buddhism"] },
  { title: "Ira Byock's 'Dying Well': What Good Dying Looks Like", category: "books", tags: ["ira-byock","dying-well","hospice"] },
  { title: "Ernest Becker's 'The Denial of Death': Why It Still Matters", category: "books", tags: ["ernest-becker","denial-of-death","psychology"] },
  { title: "Paul Kalanithi's 'When Breath Becomes Air': A Doctor's Death", category: "books", tags: ["paul-kalanithi","when-breath-becomes-air","memoir"] },
  { title: "Andrew Holecek's 'Preparing to Die': A Tibetan Buddhist Guide", category: "books", tags: ["andrew-holecek","preparing-to-die","tibetan-buddhism"] },
  { title: "Atul Gawande's 'Being Mortal': Medicine and What Matters in the End", category: "books", tags: ["atul-gawande","being-mortal","medicine"] },
  { title: "Ram Dass and Mirabai Bush's 'Walking Each Other Home'", category: "books", tags: ["ram-dass","walking-each-other-home","spiritual"] },
  { title: "Rainer Maria Rilke's Letters on Death: What the Poet Knew", category: "books", tags: ["rilke","poetry","death"] },
  { title: "Sherwin Nuland's 'How We Die': The Medical Reality", category: "books", tags: ["sherwin-nuland","how-we-die","medicine"] },
  { title: "Caitlin Doughty's 'Smoke Gets in Your Eyes': Death Work Demystified", category: "books", tags: ["caitlin-doughty","funeral","death-work"] },
  { title: "Irvin Yalom's 'Staring at the Sun': Overcoming the Terror of Death", category: "books", tags: ["irvin-yalom","staring-at-the-sun","psychology"] },
  { title: "Viktor Frankl's 'Man's Search for Meaning' and What It Teaches About Death", category: "books", tags: ["viktor-frankl","meaning","death"] },
  { title: "Sogyal Rinpoche's 'The Tibetan Book of Living and Dying': A Deep Read", category: "books", tags: ["sogyal-rinpoche","tibetan-book","dying"] },
  { title: "David Kessler's 'Finding Meaning': The Sixth Stage of Grief", category: "books", tags: ["david-kessler","finding-meaning","grief"] },
  { title: "Simone de Beauvoir's 'A Very Easy Death': A Daughter's Account", category: "books", tags: ["simone-de-beauvoir","memoir","dying"] },
  { title: "Leo Tolstoy's 'The Death of Ivan Ilyich': What Fiction Teaches About Dying", category: "books", tags: ["tolstoy","fiction","dying"] },
  { title: "Pema Chodron's Teachings on Death and Impermanence", category: "books", tags: ["pema-chodron","impermanence","buddhism"] },
  { title: "Thich Nhat Hanh's 'No Death, No Fear': A Buddhist Perspective", category: "books", tags: ["thich-nhat-hanh","no-death-no-fear","buddhism"] },
  { title: "Mary Oliver's Poetry and the Art of Dying Well", category: "books", tags: ["mary-oliver","poetry","dying"] },
  { title: "The Best Books on Grief: A Curated Reading List", category: "books", tags: ["grief","reading-list","books"] },
  { title: "The Best Books on Conscious Dying: Where to Start", category: "books", tags: ["conscious-dying","reading-list","books"] },
  { title: "Documentaries About Death and Dying Worth Watching", category: "books", tags: ["documentaries","death","resources"] },
  { title: "Podcasts About Death and Dying That Are Actually Worth Your Time", category: "books", tags: ["podcasts","death","resources"] },
  { title: "Online Courses on Conscious Dying: What's Available", category: "books", tags: ["courses","conscious-dying","resources"] },
  { title: "The Best Meditation Apps for Death Awareness Practice", category: "books", tags: ["apps","meditation","resources"] },
  { title: "Death Cafes: What They Are and Why You Should Go", category: "books", tags: ["death-cafe","community","resources"] },
  { title: "The Best Journals for End-of-Life Planning", category: "books", tags: ["journals","planning","resources"] },
  { title: "Rumi's Poems on Death: A Guide for the Modern Reader", category: "books", tags: ["rumi","poetry","death"] },
  { title: "Hafiz on Death and the Beloved: Sufi Poetry for the Dying", category: "books", tags: ["hafiz","sufi","poetry"] },
  { title: "Kabir's Songs on Death: The Weaver Poet's Wisdom", category: "books", tags: ["kabir","poetry","death"] },
  { title: "Mirabai's Devotional Songs and the Longing for Death as Union", category: "books", tags: ["mirabai","devotion","death"] },
  { title: "The Upanishads on Death: Key Passages and Their Meaning", category: "books", tags: ["upanishads","hinduism","death"] },
  { title: "The Bhagavad Gita on Death: What Krishna Teaches Arjuna", category: "books", tags: ["bhagavad-gita","krishna","death"] },
  { title: "Plato's 'Phaedo': Philosophy as Preparation for Death", category: "books", tags: ["plato","phaedo","philosophy"] },
  { title: "Marcus Aurelius on Death: The Stoic Emperor's Wisdom", category: "books", tags: ["marcus-aurelius","stoicism","death"] },
  { title: "Montaigne's Essays on Death: 'To Philosophize Is to Learn to Die'", category: "books", tags: ["montaigne","philosophy","death"] },
  { title: "Heidegger's 'Being-Toward-Death': What It Actually Means", category: "books", tags: ["heidegger","philosophy","death"] },
  { title: "Epicurus on Death: 'Death Is Nothing to Us'", category: "books", tags: ["epicurus","philosophy","death"] },
  { title: "Seneca's Letters on Death: Practical Wisdom for the Modern Reader", category: "books", tags: ["seneca","stoicism","death"] },
  { title: "Keats and Negative Capability: The Poet Who Embraced Death", category: "books", tags: ["keats","poetry","death"] },
  { title: "Emily Dickinson's Death Poems: A Close Reading", category: "books", tags: ["emily-dickinson","poetry","death"] },
  { title: "Walt Whitman's 'Song of Myself' and the Acceptance of Death", category: "books", tags: ["whitman","poetry","death"] },
  { title: "Rilke's 'Duino Elegies' and the Transformation of Death", category: "books", tags: ["rilke","elegies","death"] },
  { title: "The Best Memoirs About Watching Someone Die", category: "books", tags: ["memoir","dying","books"] },
  { title: "Books That Changed How I Think About Death", category: "books", tags: ["personal","books","death"] },
  { title: "The Best Books on Near-Death Experiences", category: "books", tags: ["nde","books","consciousness"] },
  { title: "What the Hospice Literature Teaches About Good Dying", category: "books", tags: ["hospice","literature","dying"] },
  { title: "The Best Books for Grieving Parents", category: "books", tags: ["grief","parents","books"] },

  // Psychology & Death (311-360)
  { title: "Terror Management Theory: Why Death Anxiety Drives Human Behavior", category: "psychology", tags: ["terror-management","anxiety","psychology"] },
  { title: "The Psychology of Death Denial: How We Avoid What We Know", category: "psychology", tags: ["denial","psychology","death"] },
  { title: "Death Anxiety: What It Is and How to Work With It", category: "psychology", tags: ["anxiety","psychology","death"] },
  { title: "How Attachment Style Affects How You Grieve", category: "psychology", tags: ["attachment","grief","psychology"] },
  { title: "The Psychology of Near-Death Experiences", category: "psychology", tags: ["nde","psychology","consciousness"] },
  { title: "How Childhood Experiences With Death Shape Adult Behavior", category: "psychology", tags: ["childhood","death","psychology"] },
  { title: "The Relationship Between Depression and Death Anxiety", category: "psychology", tags: ["depression","anxiety","psychology"] },
  { title: "Post-Traumatic Stress and Grief: When Loss Becomes Trauma", category: "psychology", tags: ["ptsd","grief","trauma"] },
  { title: "The Psychology of Survivor's Guilt", category: "psychology", tags: ["survivor-guilt","psychology","grief"] },
  { title: "How Meaning-Making Helps With Grief and Dying", category: "psychology", tags: ["meaning","grief","psychology"] },
  { title: "The Relationship Between Narcissism and Fear of Death", category: "psychology", tags: ["narcissism","fear","psychology"] },
  { title: "How Acceptance and Commitment Therapy Approaches Death", category: "psychology", tags: ["act","therapy","death"] },
  { title: "The Psychology of Anticipatory Grief", category: "psychology", tags: ["anticipatory-grief","psychology","mourning"] },
  { title: "How Mindfulness-Based Stress Reduction Helps With Death Anxiety", category: "psychology", tags: ["mbsr","anxiety","mindfulness"] },
  { title: "The Role of Narrative in Processing Death and Grief", category: "psychology", tags: ["narrative","grief","psychology"] },
  { title: "How Existential Therapy Approaches Death and Dying", category: "psychology", tags: ["existential","therapy","death"] },
  { title: "The Psychology of Deathbed Visions", category: "psychology", tags: ["deathbed-visions","psychology","consciousness"] },
  { title: "How Trauma Affects the Ability to Be Present With Dying", category: "psychology", tags: ["trauma","presence","dying"] },
  { title: "The Relationship Between Ego and Fear of Death", category: "psychology", tags: ["ego","fear","psychology"] },
  { title: "How Somatic Therapy Helps Process Grief", category: "psychology", tags: ["somatic","therapy","grief"] },
  { title: "The Psychology of Continuing Bonds With the Dead", category: "psychology", tags: ["continuing-bonds","psychology","grief"] },
  { title: "How Cognitive Behavioral Therapy Addresses Death Anxiety", category: "psychology", tags: ["cbt","anxiety","therapy"] },
  { title: "The Relationship Between Control and Fear of Death", category: "psychology", tags: ["control","fear","psychology"] },
  { title: "How Psychotherapy Helps People Prepare for Death", category: "psychology", tags: ["psychotherapy","preparation","death"] },
  { title: "The Psychology of Meaning at the End of Life", category: "psychology", tags: ["meaning","end-of-life","psychology"] },
  { title: "How Grief Changes Your Identity", category: "psychology", tags: ["identity","grief","psychology"] },
  { title: "The Relationship Between Perfectionism and Death Anxiety", category: "psychology", tags: ["perfectionism","anxiety","psychology"] },
  { title: "How Emotional Intelligence Affects the Dying Process", category: "psychology", tags: ["emotional-intelligence","dying","psychology"] },
  { title: "The Psychology of Regret at End of Life", category: "psychology", tags: ["regret","end-of-life","psychology"] },
  { title: "How Dialectical Behavior Therapy Skills Help With Grief", category: "psychology", tags: ["dbt","grief","therapy"] },
  { title: "The Relationship Between Shame and Grief", category: "psychology", tags: ["shame","grief","psychology"] },
  { title: "How Psychedelic Therapy Changes Attitudes Toward Death", category: "psychology", tags: ["psychedelics","therapy","death"] },
  { title: "The Psychology of Legacy: Why We Need to Leave Something Behind", category: "psychology", tags: ["legacy","psychology","death"] },
  { title: "How Anxiety Disorders Affect the Experience of Dying", category: "psychology", tags: ["anxiety","dying","psychology"] },
  { title: "The Relationship Between Self-Compassion and Grief", category: "psychology", tags: ["self-compassion","grief","psychology"] },
  { title: "How Narrative Therapy Helps People Make Sense of Death", category: "psychology", tags: ["narrative","therapy","death"] },
  { title: "The Psychology of Unresolved Grief", category: "psychology", tags: ["unresolved-grief","psychology","healing"] },
  { title: "How Mindfulness Helps With Death Anxiety", category: "psychology", tags: ["mindfulness","anxiety","psychology"] },
  { title: "The Relationship Between Loneliness and Fear of Death", category: "psychology", tags: ["loneliness","fear","psychology"] },
  { title: "How Acceptance Changes the Experience of Dying", category: "psychology", tags: ["acceptance","dying","psychology"] },
  { title: "The Psychology of the Dying Person's Inner World", category: "psychology", tags: ["inner-world","dying","psychology"] },
  { title: "How Resilience Develops Through Encounters With Death", category: "psychology", tags: ["resilience","death","psychology"] },
  { title: "The Relationship Between Creativity and Death Awareness", category: "psychology", tags: ["creativity","awareness","psychology"] },
  { title: "How Grief Therapy Differs From Regular Therapy", category: "psychology", tags: ["grief-therapy","therapy","psychology"] },
  { title: "The Psychology of the Caregiver: Burnout, Compassion Fatigue, and Renewal", category: "psychology", tags: ["caregiver","burnout","psychology"] },
  { title: "How Positive Psychology Approaches Death and Dying", category: "psychology", tags: ["positive-psychology","death","psychology"] },
  { title: "The Relationship Between Humor and Death", category: "psychology", tags: ["humor","death","psychology"] },
  { title: "How to Develop a Healthy Relationship With Your Own Mortality", category: "psychology", tags: ["mortality","health","psychology"] },
  { title: "The Psychology of the Death Positive Movement", category: "psychology", tags: ["death-positive","movement","psychology"] },
  { title: "How Witnessing Death Changes You", category: "psychology", tags: ["witness","transformation","psychology"] },
  { title: "The Relationship Between Meaning and Mortality", category: "psychology", tags: ["meaning","mortality","psychology"] },

  // End-of-Life Care (361-420)
  { title: "What Good End-of-Life Care Actually Looks Like", category: "end-of-life-care", tags: ["care","quality","end-of-life"] },
  { title: "The Hospice Philosophy: What It Means to Comfort Rather Than Cure", category: "end-of-life-care", tags: ["hospice","philosophy","comfort"] },
  { title: "How to Advocate for a Dying Person in the Hospital", category: "end-of-life-care", tags: ["advocacy","hospital","dying"] },
  { title: "The Role of the Chaplain in End-of-Life Care", category: "end-of-life-care", tags: ["chaplain","spiritual","care"] },
  { title: "Pain Management at End of Life: What You Need to Know", category: "end-of-life-care", tags: ["pain","management","end-of-life"] },
  { title: "How to Recognize When Someone Is Entering the Active Dying Phase", category: "end-of-life-care", tags: ["active-dying","recognition","care"] },
  { title: "The Role of Social Workers in End-of-Life Care", category: "end-of-life-care", tags: ["social-work","care","end-of-life"] },
  { title: "How to Create a Comfortable Dying Environment at Home", category: "end-of-life-care", tags: ["environment","home","dying"] },
  { title: "The Importance of Continuity of Care at End of Life", category: "end-of-life-care", tags: ["continuity","care","end-of-life"] },
  { title: "How Nurses Experience Working With the Dying", category: "end-of-life-care", tags: ["nurses","dying","care"] },
  { title: "The Role of Volunteers in Hospice Care", category: "end-of-life-care", tags: ["volunteers","hospice","care"] },
  { title: "How to Navigate the ICU When Someone Is Dying", category: "end-of-life-care", tags: ["icu","hospital","dying"] },
  { title: "The Difference Between Comfort Care and Curative Care", category: "end-of-life-care", tags: ["comfort","curative","care"] },
  { title: "How to Communicate With the Medical Team About End-of-Life Goals", category: "end-of-life-care", tags: ["communication","medical","goals"] },
  { title: "The Role of Music Therapy in End-of-Life Care", category: "end-of-life-care", tags: ["music-therapy","care","end-of-life"] },
  { title: "How to Support a Dying Person's Spiritual Needs", category: "end-of-life-care", tags: ["spiritual","support","dying"] },
  { title: "The Role of Art Therapy in End-of-Life Care", category: "end-of-life-care", tags: ["art-therapy","care","end-of-life"] },
  { title: "How to Handle Difficult Symptoms at End of Life", category: "end-of-life-care", tags: ["symptoms","management","end-of-life"] },
  { title: "The Role of Massage Therapy in End-of-Life Care", category: "end-of-life-care", tags: ["massage","care","end-of-life"] },
  { title: "How to Create a Care Team for a Dying Person", category: "end-of-life-care", tags: ["care-team","support","dying"] },
  { title: "The Importance of Dignity in End-of-Life Care", category: "end-of-life-care", tags: ["dignity","care","end-of-life"] },
  { title: "How to Handle Delirium at End of Life", category: "end-of-life-care", tags: ["delirium","management","end-of-life"] },
  { title: "The Role of Pet Therapy in End-of-Life Care", category: "end-of-life-care", tags: ["pet-therapy","care","end-of-life"] },
  { title: "How to Support a Dying Person's Nutritional Needs", category: "end-of-life-care", tags: ["nutrition","support","dying"] },
  { title: "The Role of Occupational Therapy in End-of-Life Care", category: "end-of-life-care", tags: ["occupational-therapy","care","end-of-life"] },
  { title: "How to Handle Breathing Difficulties at End of Life", category: "end-of-life-care", tags: ["breathing","management","end-of-life"] },
  { title: "The Role of Physical Therapy in End-of-Life Care", category: "end-of-life-care", tags: ["physical-therapy","care","end-of-life"] },
  { title: "How to Create a Peaceful Environment for Dying", category: "end-of-life-care", tags: ["environment","peaceful","dying"] },
  { title: "The Importance of Presence in End-of-Life Care", category: "end-of-life-care", tags: ["presence","care","end-of-life"] },
  { title: "How to Support a Dying Person's Emotional Needs", category: "end-of-life-care", tags: ["emotional","support","dying"] },
  { title: "The Role of Humor in End-of-Life Care", category: "end-of-life-care", tags: ["humor","care","end-of-life"] },
  { title: "How to Handle Anxiety and Restlessness at End of Life", category: "end-of-life-care", tags: ["anxiety","restlessness","end-of-life"] },
  { title: "The Role of Storytelling in End-of-Life Care", category: "end-of-life-care", tags: ["storytelling","care","end-of-life"] },
  { title: "How to Support a Dying Person's Relational Needs", category: "end-of-life-care", tags: ["relationships","support","dying"] },
  { title: "The Importance of Cultural Competence in End-of-Life Care", category: "end-of-life-care", tags: ["culture","competence","care"] },
  { title: "How to Handle Nausea and Vomiting at End of Life", category: "end-of-life-care", tags: ["nausea","management","end-of-life"] },
  { title: "The Role of Reminiscence Therapy in End-of-Life Care", category: "end-of-life-care", tags: ["reminiscence","therapy","end-of-life"] },
  { title: "How to Support a Dying Person's Legacy Needs", category: "end-of-life-care", tags: ["legacy","support","dying"] },
  { title: "The Importance of Informed Consent in End-of-Life Care", category: "end-of-life-care", tags: ["consent","care","end-of-life"] },
  { title: "How to Handle Skin Care at End of Life", category: "end-of-life-care", tags: ["skin-care","management","end-of-life"] },
  { title: "The Role of Complementary Therapies in End-of-Life Care", category: "end-of-life-care", tags: ["complementary","therapy","end-of-life"] },
  { title: "How to Support a Dying Person's Practical Needs", category: "end-of-life-care", tags: ["practical","support","dying"] },
  { title: "The Importance of Communication in End-of-Life Care", category: "end-of-life-care", tags: ["communication","care","end-of-life"] },
  { title: "How to Handle Mouth Care at End of Life", category: "end-of-life-care", tags: ["mouth-care","management","end-of-life"] },
  { title: "The Role of Aromatherapy in End-of-Life Care", category: "end-of-life-care", tags: ["aromatherapy","care","end-of-life"] },
  { title: "How to Support a Caregiver Who Is Burning Out", category: "end-of-life-care", tags: ["caregiver","burnout","support"] },
  { title: "The Importance of Self-Care for End-of-Life Care Providers", category: "end-of-life-care", tags: ["self-care","providers","care"] },
  { title: "How to Handle Constipation and Bowel Issues at End of Life", category: "end-of-life-care", tags: ["bowel","management","end-of-life"] },
  { title: "The Role of Narrative Medicine in End-of-Life Care", category: "end-of-life-care", tags: ["narrative-medicine","care","end-of-life"] },
  { title: "How to Create a Meaningful Life Review With a Dying Person", category: "end-of-life-care", tags: ["life-review","meaning","dying"] },
  { title: "The Importance of Hope in End-of-Life Care", category: "end-of-life-care", tags: ["hope","care","end-of-life"] },
  { title: "How to Handle Urinary Issues at End of Life", category: "end-of-life-care", tags: ["urinary","management","end-of-life"] },
  { title: "The Role of Spiritual Care in End-of-Life Settings", category: "end-of-life-care", tags: ["spiritual-care","settings","end-of-life"] },
  { title: "How to Support a Dying Person Through the Night", category: "end-of-life-care", tags: ["night","support","dying"] },
  { title: "The Importance of Continuity in End-of-Life Care Relationships", category: "end-of-life-care", tags: ["continuity","relationships","care"] },
  { title: "How to Handle Fever at End of Life", category: "end-of-life-care", tags: ["fever","management","end-of-life"] },
  { title: "The Role of Palliative Care Consultants", category: "end-of-life-care", tags: ["palliative","consultants","care"] },
  { title: "How to Support a Dying Person's Cognitive Needs", category: "end-of-life-care", tags: ["cognitive","support","dying"] },
  { title: "The Importance of Advance Care Planning in End-of-Life Care", category: "end-of-life-care", tags: ["advance-care","planning","end-of-life"] },
  { title: "How to Handle Edema at End of Life", category: "end-of-life-care", tags: ["edema","management","end-of-life"] },
  { title: "The Role of Bereavement Support in End-of-Life Care", category: "end-of-life-care", tags: ["bereavement","support","care"] },
  { title: "How to Support a Dying Person's Sensory Needs", category: "end-of-life-care", tags: ["sensory","support","dying"] },

  // Death Culture & Society (421-500)
  { title: "The Death Positive Movement: What It Is and Why It Matters", category: "culture", tags: ["death-positive","movement","culture"] },
  { title: "How Different Cultures Celebrate Death", category: "culture", tags: ["culture","celebration","death"] },
  { title: "Dia de los Muertos: The Mexican Tradition of Honoring the Dead", category: "culture", tags: ["dia-de-muertos","mexico","tradition"] },
  { title: "The Japanese Obon Festival: Welcoming the Dead Home", category: "culture", tags: ["obon","japan","tradition"] },
  { title: "How the Modern Funeral Industry Shapes How We Die", category: "culture", tags: ["funeral-industry","culture","death"] },
  { title: "The Medicalization of Death: How Hospitals Took Over Dying", category: "culture", tags: ["medicalization","hospitals","death"] },
  { title: "How Social Media Has Changed How We Grieve", category: "culture", tags: ["social-media","grief","culture"] },
  { title: "The Death Cafe Movement: Talking About Death Over Tea and Cake", category: "culture", tags: ["death-cafe","movement","culture"] },
  { title: "How Western Culture Avoids Death (And What It Costs Us)", category: "culture", tags: ["western-culture","avoidance","death"] },
  { title: "The History of the Funeral: How Death Rituals Have Changed", category: "culture", tags: ["history","funeral","rituals"] },
  { title: "How Art Has Always Been a Response to Death", category: "culture", tags: ["art","death","culture"] },
  { title: "The Role of Music in Death and Mourning Across Cultures", category: "culture", tags: ["music","mourning","culture"] },
  { title: "How Literature Has Always Grappled With Death", category: "culture", tags: ["literature","death","culture"] },
  { title: "The History of Embalming: Why We Preserve the Dead", category: "culture", tags: ["embalming","history","death"] },
  { title: "How Different Religions Understand the Afterlife", category: "culture", tags: ["religion","afterlife","culture"] },
  { title: "The Role of Cemeteries in Human Culture", category: "culture", tags: ["cemeteries","culture","death"] },
  { title: "How the AIDS Crisis Changed How We Talk About Death", category: "culture", tags: ["aids","history","death"] },
  { title: "The Death Positive Podcast Landscape: What's Worth Listening To", category: "culture", tags: ["podcasts","death-positive","culture"] },
  { title: "How COVID-19 Changed Our Relationship With Death", category: "culture", tags: ["covid","death","culture"] },
  { title: "The Role of Humor in Death Culture", category: "culture", tags: ["humor","death","culture"] },
  { title: "How Different Cultures Prepare the Body After Death", category: "culture", tags: ["body","culture","death"] },
  { title: "The History of Mourning Dress and Death Fashion", category: "culture", tags: ["mourning-dress","history","culture"] },
  { title: "How Technology Is Changing Death and Dying", category: "culture", tags: ["technology","death","culture"] },
  { title: "The Role of Photography in Death Culture", category: "culture", tags: ["photography","death","culture"] },
  { title: "How the Internet Has Created New Forms of Grief", category: "culture", tags: ["internet","grief","culture"] },
  { title: "The Death Industry: Who Profits From Dying", category: "culture", tags: ["industry","profit","death"] },
  { title: "How Different Cultures Handle the Body After Death", category: "culture", tags: ["body","culture","death"] },
  { title: "The Role of Architecture in Death Culture: Tombs, Mausoleums, and Memorials", category: "culture", tags: ["architecture","memorials","death"] },
  { title: "How Film Has Explored Death and Dying", category: "culture", tags: ["film","death","culture"] },
  { title: "The Death Positive Community: Who's Doing the Work", category: "culture", tags: ["community","death-positive","culture"] },
  { title: "How the Hospice Movement Changed Death in America", category: "culture", tags: ["hospice","history","america"] },
  { title: "The Role of the Coroner and Medical Examiner in Death Culture", category: "culture", tags: ["coroner","medical-examiner","death"] },
  { title: "How Different Cultures Mark the Anniversary of Death", category: "culture", tags: ["anniversary","culture","death"] },
  { title: "The History of Grief: How Mourning Has Changed Over Time", category: "culture", tags: ["history","grief","culture"] },
  { title: "How the Natural Death Movement Is Changing Burial", category: "culture", tags: ["natural-death","burial","culture"] },
  { title: "The Role of Storytelling in Death Culture", category: "culture", tags: ["storytelling","death","culture"] },
  { title: "How Different Cultures Understand the Soul After Death", category: "culture", tags: ["soul","culture","afterlife"] },
  { title: "The Death Positive Art Movement: Artists Who Work With Mortality", category: "culture", tags: ["art","death-positive","culture"] },
  { title: "How the Pandemic Changed Funeral Practices", category: "culture", tags: ["pandemic","funeral","culture"] },
  { title: "The Role of the Wake in Death Culture", category: "culture", tags: ["wake","ritual","culture"] },
  { title: "How Different Cultures Understand Time After Death", category: "culture", tags: ["time","culture","afterlife"] },
  { title: "The History of the Hospice Movement", category: "culture", tags: ["hospice","history","culture"] },
  { title: "How Death Education Is Changing in Schools", category: "culture", tags: ["education","schools","death"] },
  { title: "The Role of the Coroner's Inquest in Death Culture", category: "culture", tags: ["inquest","culture","death"] },
  { title: "How Different Cultures Handle Suicide and Its Aftermath", category: "culture", tags: ["suicide","culture","death"] },
  { title: "The Death Positive Bookstore: What to Read", category: "culture", tags: ["books","death-positive","culture"] },
  { title: "How the Natural Burial Movement Is Growing", category: "culture", tags: ["natural-burial","movement","culture"] },
  { title: "The Role of the Funeral Director in Modern Death Culture", category: "culture", tags: ["funeral-director","culture","death"] },
  { title: "How Different Cultures Mark the Transition From Life to Death", category: "culture", tags: ["transition","culture","death"] },
  { title: "The Death Positive Podcast: Conversations Worth Having", category: "culture", tags: ["podcast","death-positive","culture"] },
  { title: "How Caitlin Doughty Changed the Conversation About Death", category: "culture", tags: ["caitlin-doughty","death-positive","culture"] },
  { title: "The Role of the Grief Counselor in Modern Culture", category: "culture", tags: ["grief-counselor","culture","death"] },
  { title: "How Different Cultures Understand the Relationship Between the Living and the Dead", category: "culture", tags: ["living","dead","culture"] },
  { title: "The Death Positive Movement in the UK: What's Happening", category: "culture", tags: ["uk","death-positive","culture"] },
  { title: "How the Internet Has Changed Grief Support", category: "culture", tags: ["internet","grief","support"] },
  { title: "The Role of the Mortician in Death Culture", category: "culture", tags: ["mortician","culture","death"] },
  { title: "How Different Cultures Prepare Children for Death", category: "culture", tags: ["children","culture","death"] },
  { title: "The Death Positive Movement in Australia: What's Happening", category: "culture", tags: ["australia","death-positive","culture"] },
  { title: "How the Natural Death Centre Changed Death in the UK", category: "culture", tags: ["natural-death-centre","uk","culture"] },
  { title: "The Role of the Bereavement Counselor in Modern Culture", category: "culture", tags: ["bereavement","counselor","culture"] },
  { title: "How Different Cultures Understand the Relationship Between Death and Nature", category: "culture", tags: ["nature","culture","death"] },
  { title: "The Death Positive Movement in Canada: What's Happening", category: "culture", tags: ["canada","death-positive","culture"] },
  { title: "How the Hospice Movement Changed Death in the UK", category: "culture", tags: ["hospice","uk","culture"] },
  { title: "The Role of the Funeral Celebrant in Modern Death Culture", category: "culture", tags: ["celebrant","funeral","culture"] },
  { title: "How Different Cultures Understand the Relationship Between Death and Community", category: "culture", tags: ["community","culture","death"] },
  { title: "The Death Positive Movement in New Zealand: What's Happening", category: "culture", tags: ["new-zealand","death-positive","culture"] },
  { title: "How the Natural Burial Movement Is Changing Cemeteries", category: "culture", tags: ["natural-burial","cemeteries","culture"] },
  { title: "The Role of the Death Doula in Modern Culture", category: "culture", tags: ["death-doula","culture","death"] },
  { title: "How Different Cultures Understand the Relationship Between Death and Time", category: "culture", tags: ["time","culture","death"] },
  { title: "The Death Positive Movement in Europe: What's Happening", category: "culture", tags: ["europe","death-positive","culture"] },
  { title: "How the Hospice Movement Changed Death in Australia", category: "culture", tags: ["hospice","australia","culture"] },
  { title: "The Role of the Grief Therapist in Modern Culture", category: "culture", tags: ["grief-therapist","culture","death"] },
  { title: "How Different Cultures Understand the Relationship Between Death and Identity", category: "culture", tags: ["identity","culture","death"] },
  { title: "The Death Positive Movement in Asia: What's Happening", category: "culture", tags: ["asia","death-positive","culture"] },
  { title: "How the Natural Death Movement Is Changing Funeral Practices", category: "culture", tags: ["natural-death","funeral","culture"] },
  { title: "The Role of the Palliative Care Nurse in Modern Culture", category: "culture", tags: ["palliative-nurse","culture","death"] },
  { title: "How Different Cultures Understand the Relationship Between Death and Meaning", category: "culture", tags: ["meaning","culture","death"] },
  { title: "The Death Positive Movement in Africa: What's Happening", category: "culture", tags: ["africa","death-positive","culture"] },
];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

async function getPublishedCount() {
  const { rows } = await pool.query(`SELECT COUNT(*) FROM articles WHERE status = 'published'`);
  return parseInt(rows[0].count);
}

async function articleExists(slug) {
  const { rows } = await pool.query('SELECT id FROM articles WHERE slug = $1', [slug]);
  return rows.length > 0;
}

async function seed() {
  console.log(`[bulk-seed] Starting bulk seed of ${TOPICS.length} articles`);
  console.log('[bulk-seed] All articles will be inserted with status = "queued"');

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    const slug = slugify(topic.title);

    if (await articleExists(slug)) {
      console.log(`[bulk-seed] [${i + 1}/${TOPICS.length}] SKIP (exists): ${slug}`);
      skipped++;
      continue;
    }

    console.log(`[bulk-seed] [${i + 1}/${TOPICS.length}] Generating: ${topic.title}`);

    let success = false;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const article = await generateArticle(topic);
        const gate = runQualityGate(article.body);

        if (!gate.passed) {
          console.warn(`  Attempt ${attempt}/${MAX_ATTEMPTS} FAILED gate: ${gate.failures.join(', ')}`);
          continue;
        }

        // Assign hero image from library
        const imageUrl = await assignHeroImage(slug);
        const readingTime = Math.ceil(gate.wordCount / 200);

        await pool.query(`
          INSERT INTO articles (
            slug, title, body, meta_description, category, tags,
            image_url, image_alt, reading_time, author,
            status, queued_at, published_at,
            word_count, quality_gate_passed, quality_gate_failures, asins_used
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Kalesh','queued',NOW(),NULL,$10,$11,$12,$13)
          ON CONFLICT (slug) DO NOTHING
        `, [
          slug,
          article.title,
          gate.body,
          article.metaDescription,
          topic.category,
          JSON.stringify(topic.tags),
          imageUrl,
          `${article.title} - The Conscious Crossing`,
          readingTime,
          gate.wordCount,
          true,
          JSON.stringify(gate.failures),
          JSON.stringify(gate.asins),
        ]);

        console.log(`  QUEUED: ${slug} (${gate.wordCount} words, ${gate.amazonLinks} links)`);
        inserted++;
        success = true;
        break;
      } catch (err) {
        console.error(`  Attempt ${attempt}/${MAX_ATTEMPTS} ERROR: ${err.message}`);
        if (attempt < MAX_ATTEMPTS) await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (!success) {
      console.error(`  FAILED after ${MAX_ATTEMPTS} attempts: ${topic.title}`);
      failed++;
    }

    // Rate limiting delay
    if (i < TOPICS.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_BETWEEN_MS));
    }
  }

  console.log(`\n[bulk-seed] Complete:`);
  console.log(`  Inserted (queued): ${inserted}`);
  console.log(`  Skipped (exists):  ${skipped}`);
  console.log(`  Failed:            ${failed}`);
  console.log(`  Total topics:      ${TOPICS.length}`);

  const publishedCount = await getPublishedCount();
  console.log(`  Currently published: ${publishedCount}`);
  await pool.end();
}

seed().catch(err => {
  console.error('[bulk-seed] Fatal error:', err);
  process.exit(1);
});
