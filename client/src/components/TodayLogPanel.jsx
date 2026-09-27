import { useState, useEffect } from 'react';
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
  const [counts, setCounts] = useState(() => {
    const map = {};
    users?.forEach((u) => {
      map[u.id] = u.todayCigarettes ?? 0;
    });
    return map;
  });

  useEffect(() => {
    const map = {};
    users?.forEach((u) => {
      map[u.id] = u.todayCigarettes ?? 0;
    });
    setCounts(map);
  }, [users]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const myUser = users?.find((u) => u.isCurrentUser);
  const myCount = myUser ? counts[myUser.id] ?? 0 : 0;

  const handleSave = async () => {
    if (!myUser) return;
    setSaving(true);
    setError('');
    try {
      await onSave(myCount);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (userId, value) => {
    setCounts((prev) => ({ ...prev, [userId]: value }));
  };

  const content = (
    <>
      <div className="space-y-4">
        {users?.map((user) => (
          <LogCounter
            key={user.id}
            label={user.displayName + (user.isCurrentUser ? ' (you)' : '')}
            value={counts[user.id] ?? 0}
            accentColor={user.accentColor}
            readOnly={!user.isCurrentUser}
            large
            onChange={
              user.isCurrentUser
                ? (v) => handleChange(user.id, v)
                : undefined
            }
          />
        ))}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !myUser}
        className="w-full mt-5 py-4 bg-userGreen text-white font-bold rounded-2xl active:bg-green-600 transition-colors disabled:opacity-50 text-base shadow-md min-h-touch"
      >
        {saving ? 'Saving...' : saved ? 'Saved!' : "Save Today's Log"}
      </button>

      {lastUpdatedAt && (
        <p className="text-center text-xs text-slate-500 mt-2">
          Last saved at {formatTime(lastUpdatedAt)}
        </p>
      )}

      {myCount === 0 && myUser && (
        <p className="text-center text-sm text-userGreen mt-2 font-semibold">
          Smoke-free day!
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
