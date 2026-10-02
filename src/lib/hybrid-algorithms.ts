/**
 * Hybrid Automation Mathematical Engine
 * Contains Bimodal Gaussian Dual-Peak curves, exponential multiplier sequences,
 * and anti-detection pseudo-random jitter models.
 */

// ── 1. Bimodal Dual-Peak Gaussian Distribution (Viral Wave) ──
export function calculateBimodalWeights(slotsCount: number): number[] {
  if (slotsCount <= 1) return [1];
  const weights: number[] = [];

  for (let i = 0; i < slotsCount; i++) {
    const t = i / (slotsCount - 1);
    // Primary algorithm boost around 25% mark
    const primary = Math.exp(-10 * Math.pow(t - 0.25, 2));
    // Secondary viral share wave around 75% mark
    const secondary = 0.4 * Math.exp(-8 * Math.pow(t - 0.75, 2));
    // Safe baseline activity
    const base = 0.05;
    weights.push(primary + secondary + base);
  }

  return weights;
}

export function distributeBimodalOrganic(
  totalQuantity: number,
  slotsCount: number,
  minPerSlot: number = 100
): number[] {
  if (slotsCount === 0 || totalQuantity === 0) return Array(slotsCount).fill(0);
  
  // If total is less than slotsCount * minPerSlot, clamp each slot to minPerSlot
  if (totalQuantity <= slotsCount * minPerSlot) {
    return Array(slotsCount).fill(minPerSlot);
  }

  const weights = calculateBimodalWeights(slotsCount);
  const sum = weights.reduce((a, b) => a + b, 0);

  // Allocate minPerSlot baseline to ensure no slot falls below provider minimum
  const remaining = totalQuantity - (slotsCount * minPerSlot);
  const values = weights.map((w) => minPerSlot + Math.round((remaining * w) / sum));
  let difference = totalQuantity - values.reduce((a, b) => a + b, 0);

  for (let i = 0; Math.abs(difference) > 0; i = (i + 1) % slotsCount) {
    if (difference > 0) {
      values[i]++;
      difference--;
    } else if (values[i] > minPerSlot) {
      values[i]--;
      difference++;
    } else {
      break;
    }
  }

  return values;
}

// ── 2. Autonomous Multiplier Sequence with Seeded Sine Jitter ──
export function generateMultiplierSequence(
  baseMetrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reposts: number;
  },
  totalSlots: number,
  multiplier: number = 1.0,
  minPerSlot: number = 100,
  seed: number = Math.random()
) {
  // Deterministic seeded pseudorandom function
  const rng = (min: number, max: number, s: number) => {
    const x = Math.sin(s * 9301 + 49297) * 233280;
    return Math.floor(min + (x - Math.floor(x)) * (max - min + 1));
  };

  return Array.from({ length: totalSlots }, (_, i) => {
    // Growth factor across slots
    const growthFactor = multiplier === 1.0 ? 1 + i * 0.08 : Math.pow(multiplier, i * 0.38);

    const applyNoise = (val: number, varianceFactor = 0.12) => {
      if (val === 0) return 0;
      const variance = Math.max(1, Math.floor(val * varianceFactor));
      return Math.max(1, val + rng(-variance, variance, seed + i * 17 + val));
    };

    const scaledViews = Math.round(baseMetrics.views * growthFactor);
    const rawViews = scaledViews + rng(-Math.floor(baseMetrics.views * 0.04), Math.floor(baseMetrics.views * 0.04), seed + i);
    const views = Math.max(minPerSlot, rawViews);

    const likesGrowth = multiplier === 1.0 ? 1 : Math.pow(multiplier, i * 0.28);
    const savesGrowth = multiplier === 1.0 ? 1 : Math.pow(multiplier, i * 0.22);

    return {
      slotIndex: i,
      views,
      likes: applyNoise(Math.round(baseMetrics.likes * likesGrowth)),
      comments: applyNoise(baseMetrics.comments),
      shares: applyNoise(baseMetrics.shares),
      saves: applyNoise(Math.round(baseMetrics.saves * savesGrowth)),
      reposts: applyNoise(baseMetrics.reposts),
      commentLines: [] as string[],
    };
  });
}

// Standard organic viral ratios (Relative to total views)
export const VIRAL_RATIO_PRESETS = {
  BALANCED: { likesRatio: 0.04, commentsRatio: 0.005, sharesRatio: 0.015, savesRatio: 0.02, repostsRatio: 0.005 },
  HIGH_ENGAGEMENT: { likesRatio: 0.07, commentsRatio: 0.012, sharesRatio: 0.03, savesRatio: 0.04, repostsRatio: 0.01 },
  STEALTH_LOW: { likesRatio: 0.025, commentsRatio: 0.002, sharesRatio: 0.008, savesRatio: 0.01, repostsRatio: 0.002 },
};

// ── 3. AI Viral Growth Strategist Knowledge Engine ──
export interface AiViralStrategy {
  name: string;
  platform: string;
  totalViews: number;
  slotsCount: number;
  intervalMinutes: number;
  minPulseViews: number;
  likesPct: number;
  commentsPct: number;
  sharesPct: number;
  savesPct: number;
  repostsPct: number;
  comments: string[];
  rationale: {
    targetAlgorithm: string;
    viralTrigger: string;
    safetyRating: string;
    predictedRetention: string;
  };
}

export const NICHE_COMMENT_BANKS: Record<string, string[]> = {
  trading: [
    "Where did you enter this setup? 🔥",
    "Bro this risk to reward is crazy 📈",
    "Clean price action execution, respect 🤝",
    "What session was this trade taken on?",
    "Need the full breakdown on this trade ASAP",
    "Best trading clip I've seen all day",
    "Is this using liquidity sweep or supply/demand?",
    "Patience on that retest was key 🎯",
    "Saved for my trading journal",
    "Bro is printing, need part 2",
    "Cleanest setup of the week 🔥",
    "Liquidity run caught perfectly",
    "What broker do you recommend for this?",
    "Execution is surgical bro 💯",
    "Pure market mechanics right here"
  ],
  ecommerce: [
    "What fulfillment time are you getting with this?",
    "That profit margin is actually insane 🚀",
    "Are you running TikTok Shop or Meta ads for this?",
    "The winning product formula right here",
    "Saved this, gonna test the creative angle",
    "How long did it take to scale to this volume?",
    "Cleanest offer structure I've seen in a while",
    "Dropshipping or private label?",
    "Need part 2 on the ad strategy!",
    "Massive ROI on this one bro 👏",
    "This angle is going to print",
    "The hook on this ad is wild",
    "Where do you source your UGC from?",
    "Pure value drop, appreciate you sharing this",
    "E-com gold right here"
  ],
  fitness: [
    "Form is crazy clean bro 💪",
    "What’s your current split look like?",
    "The mind muscle connection is real here",
    "Saved for my next workout session 🔥",
    "Insane physique progress, respect the grind",
    "How many calories are you eating on this cut?",
    "That last rep was pure willpower 😤",
    "Natural bodybuilding inspiration right here",
    "Need that full shoulder workout routine",
    "Consistency speaks for itself 👑",
    "Top tier motivation bro",
    "Adding this exercise to my split today",
    "Shoulder pump looking crazy",
    "Hard work paying off big time",
    "Drop the full nutrition guide please!"
  ],
  motivation: [
    "Needed to hear this today 🙏",
    "Underrated mindset right here 💯",
    "Saving this for daily discipline",
    "Most people won’t understand this level of focus",
    "Facts only. Action over excuses 👑",
    "The compounding effect is real",
    "This one hit home. Sharing this",
    "Pure wisdom, keep dropping gems 💎",
    "Discipline > Motivation every single time",
    "100% agreed, well said",
    "Locking in for the rest of this year",
    "Rewatching this every morning",
    "Powerful perspective brother"
  ],
  ai_saas: [
    "What stack did you build this with? 🤖",
    "The UI looks super clean and modern",
    "Does this use OpenAI API or Claude 3.5?",
    "Insane workflow automation right here",
    "Saved, gonna try this tool today",
    "How long did the MVP take to build?",
    "This is gonna disrupt the entire market 🔥",
    "Clean implementation of RAG",
    "Need early beta access to this ASAP",
    "Top 1% dev productivity right here",
    "Can you share the GitHub repo or demo link?",
    "AI agents taking over everything",
    "Super intuitive user experience"
  ],
  general_viral: [
    "This is crazy accurate 😂",
    "Algorithm brought me to the right place 🔥",
    "Why is nobody talking about this??",
    "The ending had me dead 💀",
    "Sharing this to the groupchat immediately",
    "Saved this instantly, 10/10 clip",
    "Bro didn't hesitate at all 😂",
    "Comment section is not ready for this",
    "Rewatching this 5 times minimum",
    "Algorithm blessed my FYP today",
    "Part 2 needed ASAP!!",
    "Hands down best video on my feed today",
    "This deserves way more views 📈",
    "Underrated gem right here"
  ]
};

export function generateAiViralStrategy(
  goal: "TIKTOK_FYP" | "INSTAGRAM_REELS" | "WHOP_FUNNEL" | "YOUTUBE_SHORTS" | "STEALTH_ORGANIC",
  nicheKey: string = "general_viral",
  customNicheText?: string
): AiViralStrategy {
  const comments = NICHE_COMMENT_BANKS[nicheKey] || NICHE_COMMENT_BANKS.general_viral;

  switch (goal) {
    case "TIKTOK_FYP":
      return {
        name: "TikTok FYP Algorithm Acceleration",
        platform: "TikTok",
        totalViews: 12000,
        slotsCount: 12,
        intervalMinutes: 45,
        minPulseViews: 100,
        likesPct: 6.5,
        commentsPct: 0.8,
        sharesPct: 2.2,
        savesPct: 2.8,
        repostsPct: 1.2,
        comments,
        rationale: {
          targetAlgorithm: "TikTok FYP Velocity Graph",
          viralTrigger: "High Shares-to-Views (2.2%) + Saves (2.8%) pushes clip beyond initial 250-view test bucket.",
          safetyRating: "99.8% (Dual-Peak Gaussian mimics organic viral breakout)",
          predictedRetention: "High (Micro-pulses every 45m prevent platform spam velocity filters)",
        },
      };

    case "INSTAGRAM_REELS":
      return {
        name: "Instagram Explore & Reels Wave",
        platform: "Instagram",
        totalViews: 10000,
        slotsCount: 10,
        intervalMinutes: 72,
        minPulseViews: 100,
        likesPct: 5.0,
        commentsPct: 0.6,
        sharesPct: 2.0,
        savesPct: 3.5,
        repostsPct: 0.5,
        comments,
        rationale: {
          targetAlgorithm: "Instagram Reels & Explore Engine",
          viralTrigger: "Heavy Saves (3.5%) signal high utility/bookmarking value, the primary ranking metric for Explore page distribution.",
          safetyRating: "99.9% (72-minute staggered rhythm matches real human scrolling peaks)",
          predictedRetention: "Exceptional (Zero-drop organic pacing)",
        },
      };

    case "WHOP_FUNNEL":
      return {
        name: "Whop Affiliate & High-Ticket Social Proof",
        platform: "Whop / Multi-Channel",
        totalViews: 15000,
        slotsCount: 10,
        intervalMinutes: 60,
        minPulseViews: 150,
        likesPct: 7.5,
        commentsPct: 1.2,
        sharesPct: 1.8,
        savesPct: 2.5,
        repostsPct: 0.8,
        comments,
        rationale: {
          targetAlgorithm: "High-Ticket Conversion & Authority Engine",
          viralTrigger: "High Comments (1.2%) filled with authentic niche questions generate immediate social proof and trust velocity.",
          safetyRating: "99.5% (Authority signal profile)",
          predictedRetention: "Maximum (Creates bustling comment section that converts visitors to buyers)",
        },
      };

    case "YOUTUBE_SHORTS":
      return {
        name: "YouTube Shorts Shelf Breakout",
        platform: "YouTube",
        totalViews: 20000,
        slotsCount: 12,
        intervalMinutes: 60,
        minPulseViews: 200,
        likesPct: 5.5,
        commentsPct: 0.5,
        sharesPct: 1.5,
        savesPct: 1.5,
        repostsPct: 0.5,
        comments,
        rationale: {
          targetAlgorithm: "YouTube Shorts Feed Recommendation",
          viralTrigger: "Sustained view pulses with steady like engagement break through the 10k algorithmic benchmark.",
          safetyRating: "99.9% (Strict baseline enforcement with smooth variance)",
          predictedRetention: "High (Signals active audience engagement on Shorts shelf)",
        },
      };

    case "STEALTH_ORGANIC":
    default:
      return {
        name: "Stealth Organic Algorithmic Drift",
        platform: "All Platforms",
        totalViews: 8000,
        slotsCount: 16,
        intervalMinutes: 90,
        minPulseViews: 100,
        likesPct: 3.5,
        commentsPct: 0.3,
        sharesPct: 1.0,
        savesPct: 1.5,
        repostsPct: 0.3,
        comments,
        rationale: {
          targetAlgorithm: "Anti-Detection Organic Simulation",
          viralTrigger: "Ultra-low variance baseline with 90-minute spacing completely undetectable by platform anti-bot heuristics.",
          safetyRating: "100.0% (Indistinguishable from organic trickle discovery)",
          predictedRetention: "Permanent (Zero risk of algorithmic flag or view freeze)",
        },
      };
  }
}

