import { useState } from 'react';
import { Link } from 'react-router-dom';
import LogCounter from './LogCounter';
import StatCard from './StatCard';

function formatTime(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function TodayLogPanel({
  users,
  currentUser,
  onSave,
  lastUpdatedAt,
  showViewAllLink = true,
  embedded = false,
}) {
  const [count, setCount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const myUser = users?.find((u) => u.isCurrentUser);
  const myTotal = myUser?.todayCigarettes ?? 0;

  const handleSave = async () => {
    if (!myUser) return;
    setSaving(true);
    setError('');
    try {
      await onSave(count);
      setCount(0);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const content = (
    <>
      <div className="space-y-4">
        {users?.map((user) => (
          <div key={user.id} className="rounded-xl bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">
                {user.displayName}
                {user.isCurrentUser ? ' (you)' : ''}
              </span>
              <span className="text-2xl font-extrabold tabular-nums" style={{ color: user.accentColor }}>
                {user.todayCigarettes ?? 0}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Today&apos;s total</p>
          </div>
        ))}
      </div>

      {myUser && (
        <div className="mt-4">
          <LogCounter
            label="Log now"
            value={count}
            accentColor={myUser.accentColor}
            large
            onChange={setCount}
          />
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !myUser}
        className="w-full mt-5 py-4 bg-userGreen text-white font-bold rounded-2xl active:bg-green-600 transition-colors disabled:opacity-50 text-base shadow-md min-h-touch"
      >
        {saving ? 'Saving...' : saved ? 'Logged!' : 'Log Cigarettes'}
      </button>

      {lastUpdatedAt && (
        <p className="text-center text-xs text-slate-500 mt-2">
          Last logged at {formatTime(lastUpdatedAt)}
        </p>
      )}

      {myTotal === 0 && myUser?.hasLoggedToday && (
        <p className="text-center text-sm text-userGreen mt-2 font-semibold">
          Smoke-free day so far!
        </p>
      )}

      {showViewAllLink && (
        <Link
          to="/log"
          className="block text-center text-sm text-userBlue font-medium mt-3 py-2"
        >
          Open full log page →
        </Link>
      )}
    </>
  );

  if (embedded) {
    return <div className="mb-4">{content}</div>;
  }

  return (
    <StatCard title="Log Today" className="mb-4">
      {content}
    </StatCard>
  );
}
