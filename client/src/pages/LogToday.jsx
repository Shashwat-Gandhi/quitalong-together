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
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const loadToday = () => {
    api.getTodayLogs()
      .then((data) => {
        setToday(data.today);
        const myLog = data.logs.find((l) => l.isCurrentUser);
        setCount(myLog?.cigarettes ?? 0);
        setLastUpdatedAt(myLog?.updatedAt || null);
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
      setLastUpdatedAt(result.log?.updatedAt || new Date().toISOString());
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
        <PageHeader subtitle="Log how many cigarettes you smoked today." />
      </div>

      <div className="lg:hidden mb-4">
        <h2 className="text-xl font-bold text-slate-900">Log Today</h2>
        <p className="text-sm text-slate-500">{formattedDate}</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <StatCard title={formattedDate} className="lg:shadow-card">
        <div className="py-8">
          <LogCounter
            label={user?.displayName || 'You'}
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
            {saving ? 'Saving...' : saved ? 'Saved!' : "Save Today's Log"}
          </button>

          <button
            type="button"
            onClick={() => setCount(0)}
            className="w-full py-3 bg-userGreen/10 text-userGreen font-semibold rounded-2xl active:bg-userGreen/20 min-h-touch"
          >
            Set to 0 — Smoke-free
          </button>
        </div>

        {lastUpdatedAt && (
          <p className="text-center text-xs text-slate-500 mt-3">
            Last saved at {formatTime(lastUpdatedAt)}
          </p>
        )}

        {count === 0 && (
          <p className="text-center text-sm text-userGreen mt-3 font-semibold">
            Smoke-free day! Your streak continues.
          </p>
        )}
      </StatCard>
    </div>
  );
}
