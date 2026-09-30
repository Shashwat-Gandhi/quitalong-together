import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LogCounter from '../components/LogCounter';

function formatTime(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function LogToday() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [today, setToday] = useState('');
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const loadToday = () => {
    api.getTodayLogs()
      .then((data) => {
        setToday(data.today);
        const myLog = data.logs.find((l) => l.isCurrentUser);
        setTodayTotal(myLog?.cigarettes ?? 0);
        setTodayEvents(myLog?.events ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadToday();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const result = await api.saveTodayLog(count);
      setTodayEvents((prev) => [
        ...prev,
        {
          id: result.event.id,
          cigarettes: result.event.cigarettes,
          createdAt: result.event.createdAt,
        },
      ]);
      setTodayTotal((prev) => prev + count);
      setCount(0);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-slate-500 py-8 text-center">Loading...</div>;
  }

  const formattedDate = today
    ? new Date(today + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : 'Today';

  return (
    <div className="lg:max-w-lg lg:mx-auto">
      <div className="hidden lg:block">
        <PageHeader subtitle="Log each time you smoke. Every entry gets its own timestamp." />
      </div>

      <div className="lg:hidden mb-4">
        <h2 className="text-xl font-bold text-slate-900">Log Today</h2>
        <p className="text-sm text-slate-500">{formattedDate}</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <StatCard title={formattedDate} className="lg:shadow-card">
        <div className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-slate-500">Today&apos;s total</p>
          <p className="text-3xl font-extrabold text-slate-800 tabular-nums">{todayTotal}</p>
        </div>

        <div className="py-4">
          <LogCounter
            label={`${user?.displayName || 'You'} — log now`}
            value={count}
            onChange={setCount}
            accentColor={user?.accentColor || '#22c55e'}
            large
          />
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-userGreen text-white font-bold rounded-2xl active:bg-green-600 transition-colors disabled:opacity-50 text-lg shadow-md min-h-touch"
          >
            {saving ? 'Saving...' : saved ? 'Logged!' : 'Log Cigarettes'}
          </button>

          <button
            type="button"
            onClick={() => setCount(0)}
            className="w-full py-3 bg-userGreen/10 text-userGreen font-semibold rounded-2xl active:bg-userGreen/20 min-h-touch"
          >
            Set counter to 0 — Smoke-free check-in
          </button>
        </div>

        {todayEvents.length > 0 && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-2">Today&apos;s entries</p>
            <div className="space-y-2">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm text-slate-600">{formatTime(event.createdAt)}</span>
                  <span className="font-bold text-slate-800 tabular-nums">
                    {event.cigarettes === 0 ? 'Smoke-free' : event.cigarettes}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayTotal === 0 && todayEvents.length > 0 && (
          <p className="text-center text-sm text-userGreen mt-3 font-semibold">
            Smoke-free day so far!
          </p>
        )}
      </StatCard>
    </div>
  );
}
