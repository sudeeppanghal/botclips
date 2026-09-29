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

export function distributeBimodalOrganic(totalQuantity: number, slotsCount: number): number[] {
  if (slotsCount === 0 || totalQuantity === 0) return Array(slotsCount).fill(0);
  const weights = calculateBimodalWeights(slotsCount);
  const sum = weights.reduce((a, b) => a + b, 0);

  const values = weights.map((w) => Math.round((totalQuantity * w) / sum));
  let difference = totalQuantity - values.reduce((a, b) => a + b, 0);

  for (let i = 0; Math.abs(difference) > 0; i = (i + 1) % slotsCount) {
    if (difference > 0) {
      values[i]++;
      difference--;
    } else if (values[i] > 0) {
      values[i]--;
      difference++;
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
    const views = Math.max(
      1,
      scaledViews + rng(-Math.floor(baseMetrics.views * 0.04), Math.floor(baseMetrics.views * 0.04), seed + i)
    );

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
