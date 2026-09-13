export type PlatformType = 
  | 'INSTAGRAM' 
  | 'YOUTUBE' 
  | 'TIKTOK' 
  | 'TELEGRAM' 
  | 'TWITTER' 
  | 'FACEBOOK' 
  | 'SPOTIFY' 
  | 'OTHER';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  platform: PlatformType;
  rate: number; // per 1000 in INR/default currency
  min: number;
  max: number;
  dripfeed?: boolean;
  refill?: boolean;
  cancel?: boolean;
  description?: string;
}

export interface OrderItem {
  id: string;
  serviceId: string;
  serviceName: string;
  platform: PlatformType;
  link: string;
  quantity: number;
  charge: number;
  status: 'Completed' | 'Processing' | 'In Progress' | 'Pending' | 'Cancelled' | 'Refunded' | 'Failed';
  date: string;
  remains?: number;
  startCount?: number;
}

export interface UserStats {
  totalOrders: number;
  totalOrdersGrowth: number;
  servicesUsed: number;
  servicesUsedGrowth: number;
  activeOrders: number;
  rating: number;
  ratingGrowth: number;
  walletBalance: number;
}
