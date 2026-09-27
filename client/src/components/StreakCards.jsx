import StreakBadge from './StreakBadge';

function StreakCard({ user }) {
  const isWinning = user.isLeading;
  const borderColor = user.accentColor;

  return (
    <div
      className={`flex-1 rounded-2xl bg-white p-4 shadow-card border-2 transition-transform ${
        isWinning ? 'scale-[1.02]' : ''
      }`}
      style={{ borderColor: isWinning ? borderColor : '#e2e8f0' }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-semibold uppercase tracking-wide truncate max-w-[70%]"
          style={{ color: borderColor }}
        >
          {user.displayName}
        </span>
        <StreakBadge days={user.currentStreak} />
      </div>
      <p className="text-3xl font-extrabold text-slate-900 leading-none">
        {user.currentStreak}
        <span className="text-base font-semibold text-slate-500 ml-1">days</span>
      </p>
      <p className="text-xs text-slate-500 mt-1.5">No smoking streak</p>
      {user.hasLoggedToday && (
        <p className="text-xs font-medium mt-2" style={{ color: borderColor }}>
          Today: {user.todayCigarettes === 0 ? 'Smoke-free' : `${user.todayCigarettes} smoked`}
        </p>
      )}
    </div>
  );
}

export default function StreakCards({ users }) {
  if (!users?.length) return null;

  const maxStreak = Math.max(...users.map((u) => u.currentStreak));
  const enriched = users.map((u) => ({
    ...u,
    isLeading: users.length > 1 && u.currentStreak === maxStreak && maxStreak > 0,
  }));

  const displayUsers = enriched.length === 1 ? [enriched[0], null] : enriched.slice(0, 2);

  return (
    <div className="flex gap-3 mb-4">
      {displayUsers.map((user, i) =>
        user ? (
          <StreakCard key={user.id} user={user} />
        ) : (
          <div
            key={i}
            className="flex-1 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-4 flex items-center justify-center min-h-[100px]"
          >
            <p className="text-xs text-slate-400 text-center">Waiting for friend</p>
          </div>
        )
      )}
    </div>
  );
}
