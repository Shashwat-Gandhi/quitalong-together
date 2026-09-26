import { NavLink } from 'react-router-dom';
import { Home, History, BarChart3, Target, MoreHorizontal } from 'lucide-react';

const items = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/history', icon: History, label: 'History' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/settings', icon: MoreHorizontal, label: 'More' },
];

export default function BottomNav({ currentPath }) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map(({ to, icon: Icon, label, end }) => {
          const isActive = end ? currentPath === '/' : currentPath.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium transition-colors ${
                isActive ? 'text-userGreen' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
