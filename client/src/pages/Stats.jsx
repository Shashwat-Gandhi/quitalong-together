import { useEffect, useState } from 'react';
import { Flame, Trophy, Cigarette } from 'lucide-react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

export default function Stats() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSummaryStats()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse text-slate-500">Loading stats...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const users = summary?.users || [];

  const winner = users.length === 2
    ? users.reduce((best, u) =>
        u.currentStreak > best.currentStreak ? u : best
      , users[0])
    : null;

  return (
    <div>
      <div className="hidden lg:block">
        <PageHeader subtitle="Head-to-head comparison with your friend." />
      </div>

      <div className="lg:hidden mb-4">
        <h2 className="text-xl font-bold text-slate-900">Stats</h2>
        <p className="text-sm text-slate-500">Head-to-head with your friend</p>
      </div>

      {users.length < 2 && (
        <div className="mb-4 bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl">
          Invite your friend to see full head-to-head stats.
        </div>
      )}

      {winner && users.length === 2 && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 text-center">
          <Trophy className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="font-semibold text-slate-800">
            {winner.displayName} leads with a {winner.currentStreak}-day streak!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map((user) => (
          <StatCard key={user.id} title={user.displayName + (user.isCurrentUser ? ' (You)' : '')}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Flame className="w-4 h-4" />
                  <span>Current Streak</span>
                </div>
                <span className="font-bold text-lg" style={{ color: user.accentColor }}>
                  {user.currentStreak} days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Trophy className="w-4 h-4" />
                  <span>Longest Streak</span>
                </div>
                <span className="font-bold" style={{ color: user.accentColor }}>
                  {user.longestStreak} days
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600">
                  <Cigarette className="w-4 h-4" />
                  <span>This Month</span>
                </div>
                <span className="font-bold" style={{ color: user.accentColor }}>
                  {user.monthTotal}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Total cigarettes (all time)</span>
                  <span className="font-medium">{user.totalCigarettes}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Smoke-free days logged</span>
                  <span className="font-medium text-userGreen">{user.smokeFreeDays}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Avg per logged day</span>
                  <span className="font-medium">{user.avgPerDay}</span>
                </div>
              </div>
            </div>
          </StatCard>
        ))}
      </div>
    </div>
  );
}
