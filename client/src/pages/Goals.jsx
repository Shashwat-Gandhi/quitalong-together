import { useEffect, useState } from 'react';
import { Target, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

const GOALS = [
  { id: 'streak-7', title: '7-Day Smoke-Free Streak', target: 7, type: 'streak' },
  { id: 'streak-14', title: '14-Day Smoke-Free Streak', target: 14, type: 'streak' },
  { id: 'streak-30', title: '30-Day Smoke-Free Streak', target: 30, type: 'streak' },
  { id: 'month-low', title: 'Under 10 Cigarettes This Month', target: 10, type: 'monthMax' },
];

function GoalProgress({ goal, users }) {
  return (
    <div className="space-y-3">
      {users.map((user) => {
        let current = 0;
        let achieved = false;

        if (goal.type === 'streak') {
          current = user.currentStreak;
          achieved = current >= goal.target;
        } else if (goal.type === 'monthMax') {
          current = user.monthTotal;
          achieved = current <= goal.target;
        }

        const progress = goal.type === 'streak'
          ? Math.min(100, (current / goal.target) * 100)
          : Math.min(100, goal.target > 0 ? Math.max(0, (goal.target - current) / goal.target) * 100 : 0);

        return (
          <div key={user.id}>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-slate-700">{user.displayName}</span>
              <span className="flex items-center gap-1">
                {achieved && <CheckCircle2 className="w-4 h-4 text-userGreen" />}
                <span style={{ color: user.accentColor }} className="font-semibold">
                  {goal.type === 'streak' ? `${current}/${goal.target} days` : `${current}/${goal.target} max`}
                </span>
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.max(achieved ? 100 : progress, achieved ? 100 : 0)}%`,
                  backgroundColor: user.accentColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Goals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSummaryStats()
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="animate-pulse text-slate-500">Loading goals...</div>;
  }

  return (
    <div>
      <div className="hidden lg:block">
        <PageHeader subtitle="Shared goals to keep you both motivated." />
      </div>
      <div className="lg:hidden mb-4">
        <h2 className="text-xl font-bold text-slate-900">Goals</h2>
        <p className="text-sm text-slate-500">Shared milestones to hit together</p>
      </div>

      <div className="space-y-4">
        {GOALS.map((goal) => (
          <StatCard key={goal.id} title="">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-userGreen" />
              <h3 className="font-semibold text-slate-800">{goal.title}</h3>
            </div>
            {users.length > 0 ? (
              <GoalProgress goal={goal} users={users} />
            ) : (
              <p className="text-sm text-slate-500">Log in and invite a friend to track goals.</p>
            )}
          </StatCard>
        ))}
      </div>
    </div>
  );
}
