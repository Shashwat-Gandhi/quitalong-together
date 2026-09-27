import StreakBadge from './StreakBadge';

function MountainSilhouette() {
  return (
    <svg
      className="absolute bottom-0 left-0 right-0 w-full h-[45%] text-emerald-900/30"
      viewBox="0 0 400 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0,120 L0,80 L60,50 L120,75 L200,30 L280,65 L340,40 L400,70 L400,120 Z"
      />
      <path
        fill="currentColor"
        opacity="0.6"
        d="M0,120 L0,95 L80,70 L160,90 L240,60 L320,85 L400,75 L400,120 Z"
      />
    </svg>
  );
}

function CompetitorCard({ user }) {
  return (
    <div className="flex-1 flex flex-col items-center text-center min-w-0">
      <div
        className="rounded-xl px-3 py-2 mb-2 flex items-center gap-2 shadow-plaque w-full max-w-[140px] justify-center"
        style={{
          background: 'linear-gradient(180deg, #5c4a32 0%, #3d2f1f 100%)',
        }}
      >
        <StreakBadge days={user.currentStreak} className="text-orange-400 shrink-0" />
        <div className="text-left min-w-0">
          <p className="text-[10px] text-amber-200/80 leading-none">Streak</p>
          <p className="font-bold text-white text-sm leading-tight">{user.currentStreak} days</p>
        </div>
      </div>

      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg mb-2 ring-4 ring-white/30"
        style={{ backgroundColor: user.accentColor }}
      >
        {user.displayName.charAt(0).toUpperCase()}
      </div>

      <p className="font-semibold text-white text-sm sm:text-base drop-shadow truncate max-w-full px-1">
        {user.displayName}
      </p>

      <div className="mt-1.5 bg-white/95 rounded-full px-3 py-1 text-[11px] sm:text-xs text-slate-700 shadow max-w-full truncate">
        {user.statusMessage}
      </div>
    </div>
  );
}

export default function HeroSection({ users, compact = false }) {
  if (!users || users.length === 0) return null;

  const displayUsers = users.length === 1 ? [users[0], null] : users.slice(0, 2);

  return (
    <section
      className={`relative rounded-3xl overflow-hidden mb-4 flex items-end justify-center ${
        compact ? 'min-h-[200px] p-4' : 'min-h-[240px] lg:min-h-[300px] p-5 lg:p-6'
      }`}
      style={{
        background: 'linear-gradient(180deg, #7dd3fc 0%, #fcd34d 35%, #86efac 70%, #34d399 100%)',
      }}
    >
      <div className="absolute inset-0">
        <div className="absolute top-[15%] left-[20%] w-24 h-10 bg-white/25 rounded-full blur-2xl" />
        <div className="absolute top-[20%] right-[15%] w-32 h-12 bg-orange-200/40 rounded-full blur-2xl" />
        <MountainSilhouette />
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-emerald-800/25 to-transparent" />
      </div>

      <div className="relative z-10 flex gap-3 sm:gap-8 w-full max-w-md justify-center">
        {displayUsers.map((user, i) =>
          user ? (
            <CompetitorCard key={user.id} user={user} />
          ) : (
            <div key={i} className="flex-1 flex flex-col items-center justify-center opacity-50 min-w-0">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/60 flex items-center justify-center">
                <span className="text-white text-[10px] text-center px-1">Friend</span>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
