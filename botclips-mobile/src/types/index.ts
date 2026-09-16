export type PlatformType = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'TELEGRAM' | 'FACEBOOK';

export type PlatformCurveType = 
  | 'TIKTOK_REELS_S_CURVE'
  | 'YOUTUBE_SHORTS_DRIP'
  | 'WHOP_PAYOUT_BLITZ'
  | 'STANDARD_ORGANIC_JITTER';

export interface ServiceItem {
  id: string;
  serviceId?: string;
  name: string;
  category: string;
  platform: PlatformType;
  rate: number;
  min: number;
  max: number;
  description: string;
}

export interface JitterBatch {
  batchNumber: number;
  quantity: number;
  likes: number;
  saves: number;
  shares: number;
  scheduledTime: string;
  delayMinutesFromStart: number;
  status: 'PENDING' | 'DISPATCHED' | 'FAILED';
  dispatchedAt?: string;
  subOrderIds?: {
    views?: string;
    likes?: string;
    saves?: string;
    shares?: string;
  };
}

export interface EngagementOrder {
  id: string;
  serviceId: string;
  serviceName: string;
  platform: PlatformType;
  link: string;
  totalQuantity: number;
  deliveredQuantity: number;
  charge: number;
  curveType: PlatformCurveType;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  batches: JitterBatch[];
  accumulatedLikes: number;
  accumulatedSaves: number;
  accumulatedShares: number;
  botIndexScore: number;
}

export interface UserWallet {
  balanceINR: number;
  currency: string;
  pendingDeposits: number;
  totalSpent: number;
}
