import { NavLink } from 'react-router-dom';
import { Home, History, BarChart3, Target, MoreHorizontal } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/history', icon: History, label: 'History' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/settings', icon: MoreHorizontal, label: 'More' },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 bottom-nav-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex justify-around items-center h-[4.5rem] px-1">
        {items.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] min-h-touch transition-all ${
                isActive
                  ? 'text-userGreen bg-userGreen/10'
                  : 'text-slate-500 active:bg-slate-100'
              }`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-semibold">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
