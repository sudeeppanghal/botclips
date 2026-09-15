export interface DeliveryCurve {
  id: string;
  name: string;
  category: "WHOP_CLIPPERS" | "VIRAL" | "ORGANIC_SAFE" | "MULTI_WAVE" | "ALGORITHM_TRIGGER" | "TIME_TARGETED";
  description: string;
  durationHours: number;
  velocityType: string;
  recommendedFor: string;
  safetyRating: number;
  dataPoints: number[];
  svgPath: string;
}

export const DELIVERY_CATEGORIES = [
  { key: "ALL", label: "All Curves (62)" },
  { key: "WHOP_CLIPPERS", label: "🔥 Whop Clippers (Signature)" },
  { key: "VIRAL", label: "Viral & Spikes (12)" },
  { key: "ORGANIC_SAFE", label: "Organic & Safe (12)" },
  { key: "MULTI_WAVE", label: "Multi-Wave (12)" },
  { key: "ALGORITHM_TRIGGER", label: "Algorithm Trigger (12)" },
  { key: "TIME_TARGETED", label: "Time-Targeted (12)" },
] as const;

export const DELIVERY_GRAPHS: DeliveryCurve[] = [
  {
    "id": "whop_clipper_organic_signature",
    "name": "👑 Whop Clipper Signature Multi-Signal Organic Curve",
    "category": "WHOP_CLIPPERS",
    "description": "Engineered exclusively for Whop clippers and short-form affiliate channels. Seeds organic micro-hook views first, then triggers TikTok/Reels FYP via proportional bursts of saves, shares, and high-retention likes with non-linear time jitter.",
    "durationHours": 24,
    "velocityType": "Multi-Signal Algorithm Sync",
    "recommendedFor": "Whop Creators, TikTok FYP, Reels Virality",
    "safetyRating": 100.0,
    "dataPoints": [0, 8, 22, 48, 75, 89, 96, 100],
    "svgPath": "M 0,95 Q 15,92 28,78 T 55,42 T 80,18 T 100,5"
  },
  {
    "id": "whop_affiliate_stealth_wave",
    "name": "⚡ Whop Clipper Stealth Jitter Pacing",
    "category": "WHOP_CLIPPERS",
    "description": "Staggers views, likes, comments, and saves in 12 non-robotic micro-waves with pseudo-random delay intervals (6-18 mins) so anti-spam filters see 100% human browse behavior.",
    "durationHours": 48,
    "velocityType": "Stealth Micro-Jitter Wave",
    "recommendedFor": "High-Ticket Whop Offers & YouTube Shorts",
    "safetyRating": 100.0,
    "dataPoints": [0, 12, 28, 45, 62, 78, 91, 100],
    "svgPath": "M 0,95 Q 20,85 35,65 T 65,35 T 100,5"
  },
  {
    "id": "viral_exp_takeoff",
    "name": "Viral Algorithm Surge (Exponential)",
    "category": "VIRAL",
    "description": "Slow natural start for first 2 hours, then exponential acceleration peaking between 8h-12h to trigger platform recommendation engines.",
    "durationHours": 12,
    "velocityType": "Exponential Growth",
    "recommendedFor": "TikTok FYP & Instagram Reels",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      5,
      12,
      28,
      55,
      80,
      95,
      100
    ],
    "svgPath": "M 0,95 Q 30,90 50,60 T 80,15 T 100,5"
  },
  {
    "id": "golden_hour_burst",
    "name": "Golden Hour First 90-Min Burst",
    "category": "VIRAL",
    "description": "Pumps 80% of volume in the initial 90 minutes post-upload to dominate feed ranking before the algorithm sets initial reach.",
    "durationHours": 6,
    "velocityType": "Front-Loaded Burst",
    "recommendedFor": "Breaking Videos & New Releases",
    "safetyRating": 99.4,
    "dataPoints": [
      0,
      60,
      80,
      88,
      93,
      97,
      100
    ],
    "svgPath": "M 0,95 Q 15,20 40,15 T 70,10 T 100,5"
  },
  {
    "id": "parabolic_hyperscale",
    "name": "Parabolic Hyper-Scale",
    "category": "VIRAL",
    "description": "Simulates sudden exponential trend discovery when a video begins receiving massive external shares.",
    "durationHours": 18,
    "velocityType": "Parabolic Ramp",
    "recommendedFor": "Trending Challenges & Viral Audio",
    "safetyRating": 99.7,
    "dataPoints": [
      0,
      2,
      8,
      20,
      42,
      72,
      94,
      100
    ],
    "svgPath": "M 0,98 Q 45,95 65,45 T 85,12 T 100,5"
  },
  {
    "id": "fyp_explore_blast",
    "name": "FYP / Explore Page Algorithm Blast",
    "category": "VIRAL",
    "description": "Sharp initial spike followed by high-velocity plateau matching algorithmic Explore page placement.",
    "durationHours": 24,
    "velocityType": "Step-Rise Plateau",
    "recommendedFor": "Instagram Explore & TikTok FYP",
    "safetyRating": 99.6,
    "dataPoints": [
      0,
      35,
      65,
      78,
      85,
      92,
      97,
      100
    ],
    "svgPath": "M 0,95 Q 20,35 40,25 T 70,18 T 100,5"
  },
  {
    "id": "reels_momentum_wave",
    "name": "Reels Viral Accelerator",
    "category": "VIRAL",
    "description": "3 distinct acceleration bursts matching Instagram Reels 3-tier audience test distribution.",
    "durationHours": 24,
    "velocityType": "Multi-Stage Surge",
    "recommendedFor": "Instagram Reels & Stories",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      20,
      28,
      55,
      62,
      88,
      96,
      100
    ],
    "svgPath": "M 0,95 Q 15,75 25,72 T 50,40 T 75,18 T 100,5"
  },
  {
    "id": "shorts_rapid_discovery",
    "name": "YouTube Shorts Rapid Discovery",
    "category": "VIRAL",
    "description": "Optimized for the YouTube Shorts shelf algorithm with high initial velocity and sustained retention pace.",
    "durationHours": 12,
    "velocityType": "Rapid Shelf Push",
    "recommendedFor": "YouTube Shorts",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      30,
      55,
      75,
      88,
      95,
      100
    ],
    "svgPath": "M 0,95 Q 25,45 50,28 T 80,12 T 100,5"
  },
  {
    "id": "breaking_news_flash",
    "name": "X / Twitter Trend Breakout",
    "category": "VIRAL",
    "description": "Ultra-fast delivery within 45 minutes designed to trigger Twitter Trending Topic hashtags.",
    "durationHours": 4,
    "velocityType": "Lightning Flash",
    "recommendedFor": "Twitter (X) Retweets & Trending",
    "safetyRating": 99.2,
    "dataPoints": [
      0,
      70,
      85,
      92,
      97,
      100
    ],
    "svgPath": "M 0,95 Q 10,18 30,12 T 70,8 T 100,5"
  },
  {
    "id": "hyper_viral_cascade",
    "name": "Cascading Viral Multiplier",
    "category": "VIRAL",
    "description": "Simulates compounding network effects where each view triggers secondary recommendations.",
    "durationHours": 36,
    "velocityType": "Cascading Compound",
    "recommendedFor": "Major Campaign Launches",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      5,
      15,
      32,
      58,
      82,
      95,
      100
    ],
    "svgPath": "M 0,98 Q 35,88 55,50 T 80,18 T 100,5"
  },
  {
    "id": "sound_audio_trending",
    "name": "Trending Audio Sync Push",
    "category": "VIRAL",
    "description": "Designed for videos using trending sounds to boost ranking on the audio track feed.",
    "durationHours": 16,
    "velocityType": "Audio Track Wave",
    "recommendedFor": "TikTok & Reels Audio Feeds",
    "safetyRating": 99.7,
    "dataPoints": [
      0,
      15,
      38,
      64,
      82,
      93,
      100
    ],
    "svgPath": "M 0,95 Q 30,60 55,35 T 80,15 T 100,5"
  },
  {
    "id": "midnight_viral_run",
    "name": "Overnight Momentum Builder",
    "category": "VIRAL",
    "description": "Starts gentle in evening and reaches peak velocity at 6am to greet morning feed algorithms.",
    "durationHours": 14,
    "velocityType": "Ascending Night Run",
    "recommendedFor": "Early Morning Discovery",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      8,
      18,
      35,
      62,
      88,
      100
    ],
    "svgPath": "M 0,95 Q 40,85 60,55 T 85,15 T 100,5"
  },
  {
    "id": "velocity_breakout_pulse",
    "name": "Algorithmic Breakout Spike",
    "category": "VIRAL",
    "description": "Engineered to break through regional geo-fences into international recommendation pools.",
    "durationHours": 20,
    "velocityType": "Threshold Breakthrough",
    "recommendedFor": "International Viral Expansion",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      10,
      22,
      52,
      78,
      92,
      100
    ],
    "svgPath": "M 0,96 Q 30,82 50,45 T 75,15 T 100,5"
  },
  {
    "id": "trending_tab_takeover",
    "name": "YouTube Trending Tab Pacer",
    "category": "VIRAL",
    "description": "Sustained high velocity tailored specifically to meet YouTube Trending review thresholds.",
    "durationHours": 24,
    "velocityType": "High Velocity Sustained",
    "recommendedFor": "YouTube High Retention Views",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      25,
      48,
      68,
      82,
      92,
      100
    ],
    "svgPath": "M 0,95 Q 25,52 50,32 T 80,12 T 100,5"
  },
  {
    "id": "steady_linear_drip",
    "name": "Natural Steady Linear Drip",
    "category": "ORGANIC_SAFE",
    "description": "Perfect clockwork delivery with constant velocity evenly distributed across 24 hours.",
    "durationHours": 24,
    "velocityType": "Constant Linear",
    "recommendedFor": "Long-Term Account Growth",
    "safetyRating": 100,
    "dataPoints": [
      0,
      15,
      30,
      45,
      60,
      75,
      90,
      100
    ],
    "svgPath": "M 0,95 L 100,5"
  },
  {
    "id": "slow_burn_authority",
    "name": "Deep Stealth Slow Burn (48h)",
    "category": "ORGANIC_SAFE",
    "description": "Ultra-low velocity stretched across 48-72 hours. Completely invisible to bot detection.",
    "durationHours": 48,
    "velocityType": "Ultra-Slow Drip",
    "recommendedFor": "High-Value & Business Accounts",
    "safetyRating": 100,
    "dataPoints": [
      0,
      8,
      18,
      32,
      50,
      68,
      85,
      100
    ],
    "svgPath": "M 0,98 Q 50,75 100,5"
  },
  {
    "id": "prime_time_gaussian",
    "name": "Prime-Time Bell Curve (Gaussian)",
    "category": "ORGANIC_SAFE",
    "description": "Smooth bell curve mirroring human activity cycles. Peaks during 7pm-10pm prime time.",
    "durationHours": 24,
    "velocityType": "Normal Gaussian Bell",
    "recommendedFor": "General Audience & Engagement",
    "safetyRating": 100,
    "dataPoints": [
      0,
      5,
      20,
      50,
      80,
      95,
      100
    ],
    "svgPath": "M 0,98 Q 25,95 40,65 T 60,20 T 80,8 T 100,5"
  },
  {
    "id": "natural_human_decay",
    "name": "Natural Half-Life Decay",
    "category": "ORGANIC_SAFE",
    "description": "Highest speed immediately upon posting, followed by classic mathematical 1/t decay.",
    "durationHours": 36,
    "velocityType": "Logarithmic Decay",
    "recommendedFor": "Feed Posts & Photos",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      42,
      65,
      78,
      86,
      92,
      97,
      100
    ],
    "svgPath": "M 0,95 Q 20,40 50,22 T 100,5"
  },
  {
    "id": "circadian_day_active",
    "name": "Circadian Day/Night Cycle",
    "category": "ORGANIC_SAFE",
    "description": "Pumps during daylight hours (9am-11pm) and drops to near-zero during overnight sleep hours.",
    "durationHours": 24,
    "velocityType": "Circadian Wave",
    "recommendedFor": "Followers & Profile Growth",
    "safetyRating": 100,
    "dataPoints": [
      0,
      20,
      45,
      70,
      75,
      78,
      92,
      100
    ],
    "svgPath": "M 0,95 Q 20,60 40,40 T 60,35 T 80,15 T 100,5"
  },
  {
    "id": "stealth_micro_drip",
    "name": "Micro-Batch Randomizer",
    "category": "ORGANIC_SAFE",
    "description": "Dispatches engagement in randomized micro-batches every 12-25 minutes with organic jitter.",
    "durationHours": 24,
    "velocityType": "Stochastic Jitter",
    "recommendedFor": "Accounts with Past Warnings",
    "safetyRating": 100,
    "dataPoints": [
      0,
      12,
      26,
      44,
      58,
      76,
      90,
      100
    ],
    "svgPath": "M 0,95 Q 25,75 50,52 T 75,25 T 100,5"
  },
  {
    "id": "organic_weekend_ramp",
    "name": "Weekend Audience Ramp",
    "category": "ORGANIC_SAFE",
    "description": "Gentle delivery on Friday leading into aggressive peaks across Saturday and Sunday afternoon.",
    "durationHours": 48,
    "velocityType": "Weekend Curve",
    "recommendedFor": "Weekend Content Drops",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      10,
      25,
      55,
      75,
      90,
      100
    ],
    "svgPath": "M 0,98 Q 30,85 55,45 T 85,15 T 100,5"
  },
  {
    "id": "audience_discovery_ramp",
    "name": "Gradual Audience Expansion",
    "category": "ORGANIC_SAFE",
    "description": "Upward sloping velocity curve mimicking word-of-mouth recommendations growing over time.",
    "durationHours": 24,
    "velocityType": "Upward Linear Ramp",
    "recommendedFor": "Podcasts & Long Videos",
    "safetyRating": 100,
    "dataPoints": [
      0,
      8,
      20,
      38,
      58,
      78,
      100
    ],
    "svgPath": "M 0,98 Q 40,80 70,40 T 100,5"
  },
  {
    "id": "shadowban_safe_guard",
    "name": "Anti-Shadowban Warmup Shield",
    "category": "ORGANIC_SAFE",
    "description": "Specifically engineered with extreme variance prevention to heal cold or flagged accounts.",
    "durationHours": 48,
    "velocityType": "Shielded Micro-Flow",
    "recommendedFor": "Recovering Accounts",
    "safetyRating": 100,
    "dataPoints": [
      0,
      6,
      16,
      30,
      48,
      68,
      86,
      100
    ],
    "svgPath": "M 0,98 Q 50,78 100,5"
  },
  {
    "id": "steady_marathon_48h",
    "name": "48-Hour Extended Marathon",
    "category": "ORGANIC_SAFE",
    "description": "Long-duration campaign that feeds consistent engagement over 2 full days for SEO ranking.",
    "durationHours": 48,
    "velocityType": "Marathon Flow",
    "recommendedFor": "YouTube Search & SEO Ranking",
    "safetyRating": 100,
    "dataPoints": [
      0,
      12,
      25,
      38,
      50,
      65,
      82,
      100
    ],
    "svgPath": "M 0,95 L 50,52 L 100,5"
  },
  {
    "id": "smooth_sigmoid_scurve",
    "name": "Sigmoid S-Curve Natural Flow",
    "category": "ORGANIC_SAFE",
    "description": "Gentle adoption start, accelerated middle velocity, followed by smooth deceleration.",
    "durationHours": 24,
    "velocityType": "Sigmoidal S-Curve",
    "recommendedFor": "High-Ticket Influencer Posts",
    "safetyRating": 100,
    "dataPoints": [
      0,
      6,
      20,
      50,
      80,
      94,
      100
    ],
    "svgPath": "M 0,98 Q 30,96 50,50 T 70,8 T 100,5"
  },
  {
    "id": "evergreen_content_pacer",
    "name": "Evergreen Search Traffic Pacer",
    "category": "ORGANIC_SAFE",
    "description": "Mimics organic search engine clicks arriving continuously at all hours of the week.",
    "durationHours": 72,
    "velocityType": "Evergreen Flow",
    "recommendedFor": "Tutorials & How-To Content",
    "safetyRating": 100,
    "dataPoints": [
      0,
      14,
      28,
      42,
      57,
      71,
      85,
      100
    ],
    "svgPath": "M 0,95 L 100,5"
  },
  {
    "id": "rollercoaster_triple_peak",
    "name": "Rollercoaster Triple-Peak",
    "category": "MULTI_WAVE",
    "description": "3 major surge waves separated by natural breathers. Simulates viral reposting across social networks.",
    "durationHours": 36,
    "velocityType": "Triple Sinusoid",
    "recommendedFor": "Re-Shares & Virality",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      25,
      32,
      60,
      68,
      92,
      100
    ],
    "svgPath": "M 0,95 Q 15,40 25,55 T 50,25 T 75,38 T 100,5"
  },
  {
    "id": "echo_chamber_waves",
    "name": "Echo Chamber Resonant Waves",
    "category": "MULTI_WAVE",
    "description": "Initial massive spike followed by 4 diminishing resonant wave ripples.",
    "durationHours": 30,
    "velocityType": "Damped Harmonic Waves",
    "recommendedFor": "Controversy & Debates",
    "safetyRating": 99.7,
    "dataPoints": [
      0,
      45,
      52,
      75,
      80,
      94,
      100
    ],
    "svgPath": "M 0,95 Q 12,25 22,40 T 45,18 T 68,28 T 100,5"
  },
  {
    "id": "dual_timezone_burst",
    "name": "US & Asia Dual Timezone Peaks",
    "category": "MULTI_WAVE",
    "description": "Two powerful peaks spaced 12 hours apart to target both Western and Asian peak active hours.",
    "durationHours": 24,
    "velocityType": "Bimodal Timezone",
    "recommendedFor": "Global International Audiences",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      38,
      45,
      52,
      85,
      94,
      100
    ],
    "svgPath": "M 0,95 Q 20,30 35,45 T 60,50 T 80,15 T 100,5"
  },
  {
    "id": "quad_pulse_cycle",
    "name": "6-Hour Quad Pulse Flow",
    "category": "MULTI_WAVE",
    "description": "4 scheduled burst pulses every 6 hours across a 24-hour campaign window.",
    "durationHours": 24,
    "velocityType": "Periodic Quad Pulse",
    "recommendedFor": "Daily Retention Maintenance",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      22,
      26,
      48,
      52,
      74,
      78,
      100
    ],
    "svgPath": "M 0,95 Q 12,65 20,68 T 40,42 T 60,45 T 80,18 T 100,5"
  },
  {
    "id": "sinusoidal_fluid_wave",
    "name": "Sinusoidal Fluid Oscillation",
    "category": "MULTI_WAVE",
    "description": "Smooth undulating harmonic curve avoiding sharp artificial delivery spikes.",
    "durationHours": 28,
    "velocityType": "Harmonic Oscillation",
    "recommendedFor": "Natural Feed Blending",
    "safetyRating": 100,
    "dataPoints": [
      0,
      18,
      30,
      52,
      68,
      88,
      100
    ],
    "svgPath": "M 0,95 Q 25,65 45,55 T 75,25 T 100,5"
  },
  {
    "id": "bouncing_ball_decay",
    "name": "Bouncing Ball Resonant Surge",
    "category": "MULTI_WAVE",
    "description": "Starts with 50% surge, rebounds with 25% wave, then 15%, then 10% tail.",
    "durationHours": 24,
    "velocityType": "Decaying Bounces",
    "recommendedFor": "Viral Meme Reposts",
    "safetyRating": 99.7,
    "dataPoints": [
      0,
      50,
      58,
      78,
      84,
      94,
      100
    ],
    "svgPath": "M 0,95 Q 15,25 25,45 T 50,18 T 75,28 T 100,5"
  },
  {
    "id": "cross_platform_ripple",
    "name": "Cross-Platform Ripple Effect",
    "category": "MULTI_WAVE",
    "description": "Simulates content discovered on TikTok and subsequently shared to Instagram and X.",
    "durationHours": 32,
    "velocityType": "Cascading Ripple",
    "recommendedFor": "Multi-Platform Syndication",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      28,
      35,
      62,
      70,
      90,
      100
    ],
    "svgPath": "M 0,95 Q 18,52 30,58 T 60,25 T 85,15 T 100,5"
  },
  {
    "id": "weekend_double_peak",
    "name": "Saturday & Sunday Twin Peaks",
    "category": "MULTI_WAVE",
    "description": "Two giant peaks covering Saturday afternoon and Sunday evening prime hours.",
    "durationHours": 48,
    "velocityType": "Twin Weekend Hump",
    "recommendedFor": "Weekend Special Releases",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      15,
      45,
      52,
      60,
      88,
      100
    ],
    "svgPath": "M 0,98 Q 25,35 40,55 T 60,60 T 80,15 T 100,5"
  },
  {
    "id": "morning_evening_commute",
    "name": "Commuter Twin Rush Waves",
    "category": "MULTI_WAVE",
    "description": "Concentrated bursts during 8am-9am morning commute and 5pm-7pm evening transit.",
    "durationHours": 24,
    "velocityType": "Commute Synchronized",
    "recommendedFor": "News & Lifestyle Content",
    "safetyRating": 100,
    "dataPoints": [
      0,
      40,
      48,
      55,
      88,
      95,
      100
    ],
    "svgPath": "M 0,95 Q 20,32 35,50 T 60,55 T 80,12 T 100,5"
  },
  {
    "id": "staircase_re_up",
    "name": "Stepwise Re-Activation Waves",
    "category": "MULTI_WAVE",
    "description": "Step-up curve with sudden injections every 8 hours reviving engagement momentum.",
    "durationHours": 32,
    "velocityType": "Staircase Pulse",
    "recommendedFor": "Algorithmic Re-Indexing",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      30,
      32,
      62,
      65,
      92,
      95,
      100
    ],
    "svgPath": "M 0,95 L 25,55 L 45,55 L 65,25 L 85,25 L 100,5"
  },
  {
    "id": "viral_aftershock_series",
    "name": "Primary Spike with 3 Aftershocks",
    "category": "MULTI_WAVE",
    "description": "Replicates a major viral hit that spawns stitch and remix reactions in subsequent days.",
    "durationHours": 40,
    "velocityType": "Aftershock Series",
    "recommendedFor": "Trending Stitches & Duets",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      55,
      62,
      78,
      84,
      94,
      100
    ],
    "svgPath": "M 0,95 Q 12,20 22,40 T 45,22 T 70,18 T 100,5"
  },
  {
    "id": "intermittent_burst_flow",
    "name": "Stochastic Chaotic Bursts",
    "category": "MULTI_WAVE",
    "description": "Randomized unpredictable delivery intervals. Impossible for AI filters to profile as a script.",
    "durationHours": 24,
    "velocityType": "Chaotic Organic",
    "recommendedFor": "Maximum Security Accounts",
    "safetyRating": 100,
    "dataPoints": [
      0,
      14,
      32,
      45,
      68,
      82,
      100
    ],
    "svgPath": "M 0,95 Q 20,70 38,55 T 65,30 T 100,5"
  },
  {
    "id": "algorithm_test_pulse",
    "name": "Algorithm Gatekeeper Trigger",
    "category": "ALGORITHM_TRIGGER",
    "description": "Injects 10% test pulse in hour 1 to gauge platform response, then delivers full 90% boost.",
    "durationHours": 12,
    "velocityType": "Probe & Blast",
    "recommendedFor": "Passing Initial Algorithmic Gates",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      10,
      12,
      45,
      75,
      92,
      100
    ],
    "svgPath": "M 0,95 L 20,82 L 35,82 Q 55,25 75,12 T 100,5"
  },
  {
    "id": "step_ladder_climber",
    "name": "Step-Ladder Tier Progression",
    "category": "ALGORITHM_TRIGGER",
    "description": "5 discrete flat plateaus simulating content unlocking higher tier audience pools.",
    "durationHours": 24,
    "velocityType": "5-Tier Ladder",
    "recommendedFor": "TikTok & Shorts Tier Escalation",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      20,
      20,
      45,
      45,
      75,
      75,
      100
    ],
    "svgPath": "M 0,95 L 20,75 L 35,75 L 50,50 L 65,50 L 80,25 L 90,25 L 100,5"
  },
  {
    "id": "retention_multiplier",
    "name": "High-Retention Pacing Lock",
    "category": "ALGORITHM_TRIGGER",
    "description": "Paces views strictly matched to watch time duration to maximize YouTube average percentage viewed.",
    "durationHours": 18,
    "velocityType": "Retention Optimized",
    "recommendedFor": "YouTube Monetization & Watch Time",
    "safetyRating": 100,
    "dataPoints": [
      0,
      15,
      32,
      54,
      72,
      88,
      100
    ],
    "svgPath": "M 0,95 Q 35,65 60,35 T 100,5"
  },
  {
    "id": "hook_3sec_burst",
    "name": "Critical 3-Second Hook Surge",
    "category": "ALGORITHM_TRIGGER",
    "description": "Front-loads instantaneous engagement in first 30 minutes to fool initial retention score.",
    "durationHours": 8,
    "velocityType": "Hook Maximizer",
    "recommendedFor": "Short-Form Video Hooks",
    "safetyRating": 99.4,
    "dataPoints": [
      0,
      65,
      78,
      86,
      92,
      98,
      100
    ],
    "svgPath": "M 0,95 Q 12,18 35,12 T 75,8 T 100,5"
  },
  {
    "id": "shadow_test_drip",
    "name": "Silent Algorithmic Probe",
    "category": "ALGORITHM_TRIGGER",
    "description": "Ultra-quiet drip verifying impression health before opening the delivery floodgates.",
    "durationHours": 16,
    "velocityType": "Verification Drip",
    "recommendedFor": "High-Risk Niche Topics",
    "safetyRating": 100,
    "dataPoints": [
      0,
      5,
      8,
      12,
      50,
      82,
      100
    ],
    "svgPath": "M 0,98 L 30,90 L 45,90 Q 65,30 85,12 T 100,5"
  },
  {
    "id": "velocity_threshold_breaker",
    "name": "Velocity Threshold Breaker",
    "category": "ALGORITHM_TRIGGER",
    "description": "Ramps speed upward until reaching maximum safe velocity threshold, then locks in cruising speed.",
    "durationHours": 20,
    "velocityType": "Threshold Cruise",
    "recommendedFor": "Fast Safe Delivery",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      22,
      50,
      75,
      88,
      96,
      100
    ],
    "svgPath": "M 0,95 Q 25,48 50,25 T 85,10 T 100,5"
  },
  {
    "id": "engagement_ratio_sync",
    "name": "Engagement Ratio Lock Curve",
    "category": "ALGORITHM_TRIGGER",
    "description": "Synchronizes delivery cadence with typical organic ratio curves (10 views : 1 like : 0.1 comment).",
    "durationHours": 24,
    "velocityType": "Ratio Harmonized",
    "recommendedFor": "Balanced Views + Likes Combos",
    "safetyRating": 100,
    "dataPoints": [
      0,
      16,
      34,
      55,
      74,
      90,
      100
    ],
    "svgPath": "M 0,95 Q 35,62 65,32 T 100,5"
  },
  {
    "id": "ladder_boost_7step",
    "name": "7-Step Escalator Protocol",
    "category": "ALGORITHM_TRIGGER",
    "description": "7 progressive increments delivering 14% each, perfectly masking automated delivery patterns.",
    "durationHours": 28,
    "velocityType": "7-Tier Escalation",
    "recommendedFor": "Guaranteed Safe Ranking",
    "safetyRating": 100,
    "dataPoints": [
      0,
      14,
      28,
      42,
      57,
      71,
      85,
      100
    ],
    "svgPath": "M 0,95 L 15,80 L 30,68 L 45,55 L 60,42 L 75,28 L 90,15 L 100,5"
  },
  {
    "id": "exponential_staircase",
    "name": "Exponential Stepped Climber",
    "category": "ALGORITHM_TRIGGER",
    "description": "Each step doubles the previous step's delivery rate, creating massive late-stage momentum.",
    "durationHours": 24,
    "velocityType": "Exponential Stairs",
    "recommendedFor": "Competitor Overtakes",
    "safetyRating": 99.7,
    "dataPoints": [
      0,
      6,
      14,
      28,
      55,
      82,
      100
    ],
    "svgPath": "M 0,98 L 25,90 L 45,80 L 65,55 L 85,20 L 100,5"
  },
  {
    "id": "algorithm_reseed_burst",
    "name": "Mid-Campaign Reseed Pulse",
    "category": "ALGORITHM_TRIGGER",
    "description": "Injects a heavy mid-campaign pulse at hour 12 to revive posts dropping off the feed.",
    "durationHours": 24,
    "velocityType": "Mid-Flight Revival",
    "recommendedFor": "Stagnating Video Revival",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      20,
      30,
      70,
      82,
      92,
      100
    ],
    "svgPath": "M 0,95 Q 25,70 45,68 T 65,22 T 85,12 T 100,5"
  },
  {
    "id": "smart_stealth_randomizer",
    "name": "Chaos Theory Smart Stealth",
    "category": "ALGORITHM_TRIGGER",
    "description": "Uses pseudo-random non-linear mathematics to generate authentic human impression fluctuations.",
    "durationHours": 24,
    "velocityType": "Stochastic Chaos",
    "recommendedFor": "Enterprise & Brand Accounts",
    "safetyRating": 100,
    "dataPoints": [
      0,
      15,
      30,
      48,
      65,
      84,
      100
    ],
    "svgPath": "M 0,95 Q 20,72 40,58 T 70,28 T 100,5"
  },
  {
    "id": "completion_rate_maximizer",
    "name": "Algorithmic Watch-Time Optimizer",
    "category": "ALGORITHM_TRIGGER",
    "description": "Controls concurrent stream limits to ensure high completion rate signals are registered by platforms.",
    "durationHours": 20,
    "velocityType": "Watch-Time Preserver",
    "recommendedFor": "YouTube & Long Video Ranking",
    "safetyRating": 100,
    "dataPoints": [
      0,
      18,
      38,
      60,
      78,
      92,
      100
    ],
    "svgPath": "M 0,95 Q 30,60 55,38 T 85,12 T 100,5"
  },
  {
    "id": "lunchbreak_rush_spike",
    "name": "Lunchbreak 12pm-2pm Rush",
    "category": "TIME_TARGETED",
    "description": "Concentrates 65% of volume during lunchtime hours when mobile phone scrolling spikes.",
    "durationHours": 8,
    "velocityType": "Lunch Hour Concentration",
    "recommendedFor": "Food, Memes & Entertainment",
    "safetyRating": 100,
    "dataPoints": [
      0,
      15,
      65,
      82,
      92,
      98,
      100
    ],
    "svgPath": "M 0,95 Q 20,80 35,28 T 65,15 T 100,5"
  },
  {
    "id": "evening_prime_hyper",
    "name": "Evening Prime Hyper-Focus (7pm-11pm)",
    "category": "TIME_TARGETED",
    "description": "Concentrated 4-hour evening blitz matching global peak social media app usage.",
    "durationHours": 10,
    "velocityType": "Evening Blitz",
    "recommendedFor": "Top Performing Posts",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      10,
      30,
      78,
      92,
      98,
      100
    ],
    "svgPath": "M 0,95 Q 30,85 50,22 T 80,10 T 100,5"
  },
  {
    "id": "midnight_owl_stream",
    "name": "Night Owl Midnight Stream (12am-4am)",
    "category": "TIME_TARGETED",
    "description": "Paces delivery during late-night hours targeting gaming, crypto, and music night owls.",
    "durationHours": 8,
    "velocityType": "Nocturnal Push",
    "recommendedFor": "Gaming, Music & Crypto",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      25,
      60,
      85,
      94,
      100
    ],
    "svgPath": "M 0,95 Q 20,55 45,25 T 80,10 T 100,5"
  },
  {
    "id": "flash_sale_countdown",
    "name": "Flash Sale Front-Loaded Countdown",
    "category": "TIME_TARGETED",
    "description": "Dumps 75% engagement in the first 2 hours to create urgent FOMO and social proof.",
    "durationHours": 6,
    "velocityType": "Flash Front-Load",
    "recommendedFor": "E-Commerce & Product Drops",
    "safetyRating": 99.5,
    "dataPoints": [
      0,
      75,
      88,
      94,
      98,
      100
    ],
    "svgPath": "M 0,95 Q 12,15 35,10 T 70,8 T 100,5"
  },
  {
    "id": "product_launch_hump",
    "name": "Product Launch Bell Distribution",
    "category": "TIME_TARGETED",
    "description": "Builds anticipation with slow warmup, peaks during keynote announcement, then sustains.",
    "durationHours": 18,
    "velocityType": "Launch Event Bell",
    "recommendedFor": "Brand Announcements",
    "safetyRating": 100,
    "dataPoints": [
      0,
      10,
      32,
      75,
      88,
      96,
      100
    ],
    "svgPath": "M 0,98 Q 30,80 50,25 T 80,12 T 100,5"
  },
  {
    "id": "livestream_countdown",
    "name": "Live Stream Pre-Broadcast Surge",
    "category": "TIME_TARGETED",
    "description": "Accelerating upward curve building excitement in the 3 hours preceding a live broadcast.",
    "durationHours": 6,
    "velocityType": "Pre-Broadcast Ramp",
    "recommendedFor": "Live Streams & Premieres",
    "safetyRating": 99.8,
    "dataPoints": [
      0,
      8,
      22,
      48,
      80,
      100
    ],
    "svgPath": "M 0,98 Q 35,88 65,48 T 100,5"
  },
  {
    "id": "weekend_club_night",
    "name": "Friday Night Viral Blitz (9pm-2am)",
    "category": "TIME_TARGETED",
    "description": "Fast-moving party curve designed for nightlife, DJ sets, music videos, and nightlife hype.",
    "durationHours": 8,
    "velocityType": "Nightlife Blitz",
    "recommendedFor": "Music Releases & Nightlife",
    "safetyRating": 99.7,
    "dataPoints": [
      0,
      20,
      68,
      88,
      96,
      100
    ],
    "svgPath": "M 0,95 Q 20,55 40,20 T 75,10 T 100,5"
  },
  {
    "id": "morning_coffee_kick",
    "name": "Morning 7am-10am Kickoff",
    "category": "TIME_TARGETED",
    "description": "High velocity during morning wake-up hours when users check overnight updates.",
    "durationHours": 6,
    "velocityType": "Morning Spike",
    "recommendedFor": "Daily News & Motivational Posts",
    "safetyRating": 100,
    "dataPoints": [
      0,
      45,
      75,
      88,
      95,
      100
    ],
    "svgPath": "M 0,95 Q 18,35 40,20 T 75,10 T 100,5"
  },
  {
    "id": "sunday_lazy_drip",
    "name": "Sunday Leisure All-Day Drip",
    "category": "TIME_TARGETED",
    "description": "Relaxed continuous flow matching weekend casual consumption with gentle afternoon peak.",
    "durationHours": 18,
    "velocityType": "Leisure Pacing",
    "recommendedFor": "Vlogs & Long Form Content",
    "safetyRating": 100,
    "dataPoints": [
      0,
      15,
      35,
      60,
      80,
      94,
      100
    ],
    "svgPath": "M 0,95 Q 35,60 60,35 T 100,5"
  },
  {
    "id": "payday_weekend_burst",
    "name": "Payday Weekend 48-Hour Blitz",
    "category": "TIME_TARGETED",
    "description": "Designed for 1st and 15th of the month promotions when audience purchase power is at peak.",
    "durationHours": 48,
    "velocityType": "Payday Surge",
    "recommendedFor": "High-Ticket Offers & Sales",
    "safetyRating": 99.9,
    "dataPoints": [
      0,
      22,
      45,
      68,
      85,
      96,
      100
    ],
    "svgPath": "M 0,95 Q 30,55 55,30 T 100,5"
  },
  {
    "id": "holiday_season_marathon",
    "name": "72-Hour Festive Holiday Curve",
    "category": "TIME_TARGETED",
    "description": "Multi-day festive campaign curve delivering steady engagement across festive periods.",
    "durationHours": 72,
    "velocityType": "Multi-Day Festive",
    "recommendedFor": "Festive Campaigns & Contests",
    "safetyRating": 100,
    "dataPoints": [
      0,
      15,
      30,
      48,
      65,
      82,
      94,
      100
    ],
    "svgPath": "M 0,95 Q 40,65 70,30 T 100,5"
  },
  {
    "id": "super_bowl_halftime",
    "name": "Extreme 30-Min Halftime Flash",
    "category": "TIME_TARGETED",
    "description": "Extreme velocity blitz delivering the entire quota within 30 minutes for live event synchronization.",
    "durationHours": 1,
    "velocityType": "Hyper-Flash Instant",
    "recommendedFor": "Live Event Synchronization",
    "safetyRating": 98.9,
    "dataPoints": [
      0,
      85,
      95,
      98,
      100
    ],
    "svgPath": "M 0,95 Q 8,10 25,8 T 60,6 T 100,5"
  }
];

export function getDeliveryGraphById(id: string): DeliveryCurve {
  return DELIVERY_GRAPHS.find(g => g.id === id) || DELIVERY_GRAPHS[0];
}

export interface JitterBatch {
  batchNumber: number;
  timeOffsetMinutes: number;
  timeFormatted: string;
  views: number;
  likes: number;
  shares: number;
  saves: number;
  comments: number;
  batchPercent: number;
}

export function generateJitterSchedule(params: {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalSaves: number;
  totalComments: number;
  durationHours: number;
  batchesCount?: number;
}): JitterBatch[] {
  const {
    totalViews = 0,
    totalLikes = 0,
    totalShares = 0,
    totalSaves = 0,
    totalComments = 0,
    durationHours = 24,
  } = params;

  // Choose batch count between 8 and 14 based on duration
  const numBatches = params.batchesCount || Math.min(14, Math.max(8, Math.round(durationHours * 0.75)));
  const totalMinutes = durationHours * 60;
  
  // Weights array with natural organic bell/growth curve + random pseudo-jitter
  const rawWeights: number[] = [];
  for (let i = 0; i < numBatches; i++) {
    const x = (i + 1) / numBatches;
    // Base organic shape (Gaussian + slight exponential)
    const baseWeight = Math.sin(x * Math.PI) * 0.7 + Math.pow(x, 1.4) * 0.5 + 0.3;
    // Jitter: random factor between 0.75 and 1.25
    const pseudoRandom = 0.78 + ((Math.sin(i * 3.7 + 1.2) + 1) / 2) * 0.44;
    rawWeights.push(baseWeight * pseudoRandom);
  }

  const sumWeights = rawWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = rawWeights.map(w => w / sumWeights);

  const batches: JitterBatch[] = [];
  let allocatedViews = 0;
  let allocatedLikes = 0;
  let allocatedShares = 0;
  let allocatedSaves = 0;
  let allocatedComments = 0;

  let currentMinutes = 0;
  const avgInterval = totalMinutes / numBatches;

  for (let i = 0; i < numBatches; i++) {
    const isLast = i === numBatches - 1;
    const w = normalizedWeights[i];

    // Calculate quantities with non-linear realistic numbers (e.g. 72, 63, 99, 101)
    const v = isLast ? Math.max(0, totalViews - allocatedViews) : Math.max(1, Math.round(totalViews * w));
    const l = isLast ? Math.max(0, totalLikes - allocatedLikes) : (totalLikes > 0 ? Math.max(0, Math.round(totalLikes * w)) : 0);
    const s = isLast ? Math.max(0, totalShares - allocatedShares) : (totalShares > 0 ? Math.max(0, Math.round(totalShares * w)) : 0);
    const sv = isLast ? Math.max(0, totalSaves - allocatedSaves) : (totalSaves > 0 ? Math.max(0, Math.round(totalSaves * w)) : 0);
    const c = isLast ? Math.max(0, totalComments - allocatedComments) : (totalComments > 0 ? Math.max(0, Math.round(totalComments * w)) : 0);

    allocatedViews += v;
    allocatedLikes += l;
    allocatedShares += s;
    allocatedSaves += sv;
    allocatedComments += c;

    // Time jitter: interval * (0.65 to 1.35)
    const intervalJitter = 0.7 + ((Math.cos(i * 4.3 + 2.1) + 1) / 2) * 0.6;
    const stepInterval = Math.max(4, Math.round(avgInterval * intervalJitter));
    currentMinutes += (i === 0 ? Math.max(4, Math.round(stepInterval * 0.45)) : stepInterval);
    if (isLast && currentMinutes > totalMinutes) currentMinutes = totalMinutes;

    const hrs = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const timeFormatted = hrs > 0 ? `+${hrs}h ${mins.toString().padStart(2, "0")}m` : `+${mins}m`;

    batches.push({
      batchNumber: i + 1,
      timeOffsetMinutes: currentMinutes,
      timeFormatted,
      views: v,
      likes: l,
      shares: s,
      saves: sv,
      comments: c,
      batchPercent: Math.round(w * 100),
    });
  }

  return batches;
}

export interface OrganicJitterBatch {
  batchNumber: number;
  views: number;
  timeOffsetMinutes: number;
  timeFormatted: string;
  scheduledAt?: string;
  status: "PENDING" | "DISPATCHED" | "COMPLETED";
  upstreamOrderId?: string;
  dispatchedAt?: string;
}

export function generateOrganicPacedBatches(params: {
  goal: number;
  minQty: number;
  maxQty: number;
  avgIntervalMinutes: number;
  startTime?: Date;
}): OrganicJitterBatch[] {
  const {
    goal,
    minQty,
    maxQty,
    avgIntervalMinutes = 20,
    startTime = new Date(),
  } = params;

  const cleanGoal = Math.max(1, Math.floor(goal));
  const cleanMin = Math.max(10, Math.min(minQty, cleanGoal));
  const cleanMax = Math.max(cleanMin, Math.min(maxQty, cleanGoal));
  const avgBatch = (cleanMin + cleanMax) / 2;

  // Approximate number of batches
  const estBatches = Math.max(1, Math.round(cleanGoal / avgBatch));

  // Generate non-linear weights using Poisson/Gaussian perturbation
  const rawWeights: number[] = [];
  for (let i = 0; i < estBatches; i++) {
    const x = (i + 1) / (estBatches + 1);
    // Parabolic viral bell curve with asymmetric right skew
    const curve = Math.sin(x * Math.PI) * 0.85 + Math.pow(x, 1.2) * 0.45 + 0.25;
    // Multiplicative pseudo-random jitter between 0.72 and 1.28
    const jitter = 0.72 + ((Math.sin(i * 5.17 + 2.31) + 1) / 2) * 0.56;
    rawWeights.push(curve * jitter);
  }

  const sumWeights = rawWeights.reduce((a, b) => a + b, 0);
  const normalizedWeights = rawWeights.map(w => w / sumWeights);

  const batches: OrganicJitterBatch[] = [];
  let allocated = 0;
  let currentMinutes = 0;

  for (let i = 0; i < estBatches; i++) {
    const isLast = i === estBatches - 1;
    let qty = 0;

    if (isLast) {
      qty = cleanGoal - allocated;
      if (qty <= 0) qty = Math.max(1, cleanGoal - allocated);
    } else {
      const target = Math.round(cleanGoal * normalizedWeights[i]);
      qty = Math.max(cleanMin, Math.min(cleanMax, target));
      if (allocated + qty >= cleanGoal) {
        qty = Math.max(cleanMin, cleanGoal - allocated);
      }
    }

    allocated += qty;

    // Time jitter: interval * (0.68 to 1.32)
    const intervalJitter = 0.68 + ((Math.cos(i * 3.89 + 1.45) + 1) / 2) * 0.64;
    const stepInterval = Math.max(3, Math.round(avgIntervalMinutes * intervalJitter));
    if (i > 0) {
      currentMinutes += stepInterval;
    }

    const hrs = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const timeFormatted = currentMinutes === 0 ? "Immediate (+0m)" : (hrs > 0 ? `+${hrs}h ${mins.toString().padStart(2, "0")}m` : `+${mins}m`);
    const scheduledAt = new Date(startTime.getTime() + currentMinutes * 60 * 1000).toISOString();

    batches.push({
      batchNumber: i + 1,
      views: qty,
      timeOffsetMinutes: currentMinutes,
      timeFormatted,
      scheduledAt,
      status: "PENDING",
    });

    if (allocated >= cleanGoal) break;
  }

  // Ensure total sum equals exact goal
  const totalAllocated = batches.reduce((sum, b) => sum + b.views, 0);
  if (totalAllocated !== cleanGoal && batches.length > 0) {
    batches[batches.length - 1].views += (cleanGoal - totalAllocated);
  }

  return batches;
}

