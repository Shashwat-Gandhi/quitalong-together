import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LogCounter from '../components/LogCounter';

export default function LogToday() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [today, setToday] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTodayLogs()
      .then((data) => {
        setToday(data.today);
        const myLog = data.logs.find((l) => l.isCurrentUser);
        setCount(myLog?.cigarettes ?? 0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.saveTodayLog(count);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse text-slate-500">Loading...</div>;
  }

  return (
    <div>
      <PageHeader subtitle="Log how many cigarettes you smoked today." />

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <StatCard title={`Today's Log — ${today}`}>
        <div className="py-6">
          <LogCounter
            label={user?.displayName || 'You'}
            value={count}
            onChange={setCount}
            accentColor={user?.accentColor || '#22c55e'}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 bg-userGreen text-white font-semibold rounded-2xl hover:bg-green-600 transition-colors disabled:opacity-50 text-lg"
        >
          {saving ? 'Saving...' : saved ? 'Saved!' : "Save Today's Log"}
        </button>

        {count === 0 && (
          <p className="text-center text-sm text-userGreen mt-4 font-medium">
            Smoke-free day! Your streak continues.
          </p>
        )}
      </StatCard>
    </div>
  );
}
