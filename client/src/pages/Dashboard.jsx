import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import InviteBanner from '../components/InviteBanner';
import StreakCards from '../components/StreakCards';
import MotivationBanner from '../components/MotivationBanner';
import HeroSection from '../components/HeroSection';
import TodayLogPanel from '../components/TodayLogPanel';
import StatCard from '../components/StatCard';
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

  const handleSave = async (cigarettes) => {
    await api.saveTodayLog(cigarettes);
    await loadStats();
  };

  if (loading) {
    return <div className="animate-pulse text-slate-500 py-8 text-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const currentUser = stats?.users?.find((u) => u.isCurrentUser);

  return (
    <div>
      <div className="hidden lg:block">
        <PageHeader subtitle="Track your progress and compete with your friend." />
      </div>

      {!stats?.pairComplete && stats?.inviteCode && (
        <InviteBanner inviteCode={stats.inviteCode} />
      )}

      <div className="lg:hidden">
        <StreakCards users={stats?.users || []} />
      </div>

      <div className="hidden lg:block mb-4">
        <StreakCards users={stats?.users || []} />
      </div>

      <HeroSection users={stats?.users || []} compact />

      <div className="lg:hidden">
        <TodayLogPanel
          users={stats?.users || []}
          currentUser={currentUser}
          onSave={handleSave}
          lastUpdatedAt={currentUser?.lastUpdatedAt}
        />
        <MotivationBanner />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <StatCard title="Log Smoking" className="hidden lg:block">
          <TodayLogPanel
            users={stats?.users || []}
            currentUser={currentUser}
            onSave={handleSave}
            lastUpdatedAt={currentUser?.lastUpdatedAt}
            showViewAllLink={false}
            embedded
          />
        </StatCard>

        <StatCard title="This Week">
          <WeekChart weekChart={stats?.weekChart} />
        </StatCard>

        <StatCard title="Total Smoked (This Month)">
          <div className="flex justify-around items-center py-2 sm:py-4">
            {stats?.users?.map((user) => (
              <div key={user.id} className="text-center">
                <p
                  className="text-3xl sm:text-4xl font-extrabold tabular-nums"
                  style={{ color: user.accentColor }}
                >
                  {user.monthTotal}
                </p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{user.displayName}</p>
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard title="Longest Streak">
          <div className="space-y-3">
            {stats?.users?.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3 min-w-0">
                  <Trophy className="w-5 h-5 text-amber-500 shrink-0" />
                  <span className="font-semibold text-slate-700 truncate">{user.displayName}</span>
                </div>
                <span
                  className="text-xl sm:text-2xl font-extrabold tabular-nums shrink-0 ml-2"
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
