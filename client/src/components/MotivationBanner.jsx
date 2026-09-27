import { useMemo } from 'react';

const BANNERS = [
  { title: 'Small steps', subtitle: 'Big changes' },
  { title: 'Better days', subtitle: 'Ahead' },
  { title: 'One day', subtitle: 'At a time' },
  { title: 'You got this', subtitle: 'Keep going' },
];

const GRADIENTS = [
  'from-sky-400 via-amber-300 to-emerald-400',
  'from-violet-400 via-pink-300 to-orange-300',
  'from-teal-400 via-cyan-300 to-blue-400',
  'from-green-400 via-lime-300 to-yellow-300',
];

export default function MotivationBanner() {
  const index = useMemo(() => new Date().getDate() % BANNERS.length, []);
  const banner = BANNERS[index];
  const gradient = GRADIENTS[index];

  return (
    <div
      className={`rounded-2xl bg-gradient-to-r ${gradient} p-4 text-white shadow-card mb-4 overflow-hidden relative`}
    >
      <div className="absolute inset-0 bg-black/5" />
      <div className="relative z-10">
        <p className="text-lg font-bold leading-tight">{banner.title}</p>
        <p className="text-sm opacity-90">{banner.subtitle}</p>
      </div>
    </div>
  );
}
