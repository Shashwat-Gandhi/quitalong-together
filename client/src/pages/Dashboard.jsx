import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import InviteBanner from '../components/InviteBanner';
import HeroSection from '../components/HeroSection';
import StatCard from '../components/StatCard';
import LogCounter from '../components/LogCounter';
import WeekChart from '../components/WeekChart';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSaveCount = async (cigarettes) => {
    await api.saveTodayLog(cigarettes);
    await loadStats();
  };

  if (loading) {
    return <div className="animate-pulse text-slate-500">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const currentUser = stats?.users?.find((u) => u.isCurrentUser);

  return (
    <div>
      <PageHeader subtitle="Track your progress and compete with your friend." />

      {!stats?.pairComplete && stats?.inviteCode && (
        <InviteBanner inviteCode={stats.inviteCode} />
      )}

      <HeroSection users={stats?.users || []} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <StatCard title="Log Smoking">
          <div className="space-y-4">
            {stats?.users?.map((user) => (
              <LogCounter
                key={user.id}
                label={user.displayName}
                value={user.todayCigarettes ?? 0}
                accentColor={user.accentColor}
                readOnly={!user.isCurrentUser}
                onChange={user.isCurrentUser ? handleSaveCount : undefined}
              />
            ))}
            {currentUser && (
              <p className="text-xs text-slate-400 text-center">
                Changes save automatically
              </p>
            )}
          </div>
        </StatCard>

        <StatCard title="This Week">
          <WeekChart weekChart={stats?.weekChart} />
        </StatCard>

        <StatCard title="Total Smoked (This Month)">
          <div className="flex justify-around items-center py-4">
            {stats?.users?.map((user) => (
              <div key={user.id} className="text-center">
                <p
                  className="text-4xl font-bold"
                  style={{ color: user.accentColor }}
                >
                  {user.monthTotal}
                </p>
                <p className="text-sm text-slate-500 mt-1">{user.displayName}</p>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard title="Longest Streak">
          <div className="space-y-4">
            {stats?.users?.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span className="font-medium text-slate-700">{user.displayName}</span>
                </div>
                <span
                  className="text-2xl font-bold"
                  style={{ color: user.accentColor }}
                >
                  {user.longestStreak} days
                </span>
              </div>
            ))}
          </div>
        </StatCard>
      </div>
    </div>
  );
}
