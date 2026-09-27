import { Flame } from 'lucide-react';
import { getStreakTier } from '../utils/greeting';

const SIZE_MAP = {
  xs: 'w-4 h-4',
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const GLOW_MAP = {
  xs: '',
  sm: 'drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]',
  md: 'drop-shadow-[0_0_6px_rgba(249,115,22,0.6)]',
  lg: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]',
};

export default function StreakBadge({ days, className = '' }) {
  const tier = getStreakTier(days);
  const sizeClass = SIZE_MAP[tier.size];
  const glowClass = GLOW_MAP[tier.size];

  return (
    <Flame
      className={`${sizeClass} ${tier.color} ${glowClass} ${className}`}
      fill="currentColor"
      strokeWidth={1.5}
    />
  );
}
