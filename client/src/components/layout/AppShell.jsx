import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  PenLine,
  History,
  BarChart3,
  Target,
  Settings,
  Leaf,
} from 'lucide-react';
import BottomNav from './BottomNav';
import MobileHeader from './MobileHeader';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log', icon: PenLine, label: 'Log Today' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-navy text-white">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-white/10">
          <Leaf className="w-7 h-7 text-userGreen" />
          <span className="text-xl font-bold">QuitTogether</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 lg:ml-64 pb-nav-safe lg:pb-0">
        <main className="max-w-6xl mx-auto px-4 py-4 lg:px-8 lg:py-8">
          <MobileHeader />
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
