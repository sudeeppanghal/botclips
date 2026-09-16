declare module 'lucide-react-native' {
  import { FC } from 'react';
  import { SvgProps } from 'react-native-svg';

  export interface IconProps extends SvgProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }

  export const Home: FC<IconProps>;
  export const Zap: FC<IconProps>;
  export const Clock: FC<IconProps>;
  export const Layers: FC<IconProps>;
  export const Wallet: FC<IconProps>;
  export const User: FC<IconProps>;
  export const Bell: FC<IconProps>;
  export const Sparkles: FC<IconProps>;
  export const ShieldCheck: FC<IconProps>;
  export const TrendingUp: FC<IconProps>;
  export const PlusCircle: FC<IconProps>;
  export const Link2: FC<IconProps>;
  export const ChevronRight: FC<IconProps>;
  export const QrCode: FC<IconProps>;
  export const Copy: FC<IconProps>;
  export const CheckCircle2: FC<IconProps>;
  export const Share2: FC<IconProps>;
  export const Send: FC<IconProps>;
  export const MessageCircle: FC<IconProps>;
  export const Eye: FC<IconProps>;
  export const Heart: FC<IconProps>;
  export const Bookmark: FC<IconProps>;
  export const ArrowLeft: FC<IconProps>;
  export const ArrowRight: FC<IconProps>;
  export const Search: FC<IconProps>;
  export const Mail: FC<IconProps>;
  export const Lock: FC<IconProps>;
  export const LogIn: FC<IconProps>;
  export const LogOut: FC<IconProps>;
  export const Chrome: FC<IconProps>;
  export const Award: FC<IconProps>;
  export const ArrowUpRight: FC<IconProps>;
  export const RefreshCw: FC<IconProps>;
}
