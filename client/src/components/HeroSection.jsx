import { Flame } from 'lucide-react';
import { getStreakTier } from '../utils/greeting';

function CompetitorCard({ user }) {
  const tier = getStreakTier(user.currentStreak);
  const flameSize = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  }[tier.size];

  return (
    <div className="flex-1 flex flex-col items-center text-center">
      <div className="bg-navy/80 backdrop-blur-sm text-white rounded-2xl px-4 py-2 mb-3 flex items-center gap-2 shadow-lg">
        <Flame className={`${flameSize} ${tier.color}`} />
        <div>
          <p className="text-xs text-slate-300">No smoking streak</p>
          <p className="font-bold text-lg">{user.currentStreak} days</p>
        </div>
      </div>

      <div
        className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-3xl lg:text-4xl font-bold text-white shadow-lg mb-3"
        style={{ backgroundColor: user.accentColor }}
      >
        {user.displayName.charAt(0).toUpperCase()}
      </div>

      <p className="font-semibold text-white text-lg drop-shadow">{user.displayName}</p>

      <div className="mt-2 bg-white/90 rounded-full px-4 py-1.5 text-sm text-slate-700 shadow">
        {user.statusMessage}
      </div>

      {user.hasLoggedToday && (
        <p className="mt-2 text-xs text-white/80">
          Today: {user.todayCigarettes === 0 ? 'Smoke-free!' : `${user.todayCigarettes} smoked`}
        </p>
      )}
    </div>
  );
}

export default function HeroSection({ users }) {
  if (!users || users.length === 0) return null;

  const displayUsers = users.length === 1 ? [users[0], null] : users.slice(0, 2);

  return (
    <section
      className="relative rounded-3xl overflow-hidden mb-6 min-h-[280px] lg:min-h-[320px] flex items-end justify-center p-6"
      style={{
        background: 'linear-gradient(180deg, #7dd3fc 0%, #fbbf24 40%, #34d399 100%)',
      }}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-emerald-800/40 to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-32 h-16 bg-white/20 rounded-full blur-xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-20 bg-orange-200/30 rounded-full blur-xl" />
      </div>

      <div className="relative z-10 flex gap-4 lg:gap-12 w-full max-w-2xl justify-center">
        {displayUsers.map((user, i) =>
          user ? (
            <CompetitorCard key={user.id} user={user} />
          ) : (
            <div key={i} className="flex-1 flex flex-col items-center justify-center opacity-60">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-white/50 flex items-center justify-center text-white text-sm">
                Waiting for friend
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
