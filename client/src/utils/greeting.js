export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function formatDate(date = new Date()) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getStreakTier(days) {
  if (days >= 60) return { label: '60+ days', size: 'lg', color: 'text-purple-500' };
  if (days >= 30) return { label: '30 days', size: 'md', color: 'text-orange-500' };
  if (days >= 14) return { label: '14 days', size: 'md', color: 'text-orange-400' };
  if (days >= 7) return { label: '7 days', size: 'sm', color: 'text-amber-500' };
  if (days >= 3) return { label: '3 days', size: 'sm', color: 'text-amber-400' };
  if (days >= 1) return { label: '1 day', size: 'xs', color: 'text-yellow-500' };
  return { label: '0 days', size: 'xs', color: 'text-slate-400' };
}
