import { Link } from 'react-router-dom';
import { Leaf, Settings } from 'lucide-react';
import { getGreeting } from '../../utils/greeting';

export default function MobileHeader() {
  return (
    <header className="lg:hidden flex items-center justify-between mb-4 -mt-1">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-navy flex items-center justify-center shrink-0">
          <Leaf className="w-5 h-5 text-userGreen" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-slate-500 leading-none">{getGreeting()}</p>
          <h1 className="text-lg font-bold text-slate-900 truncate">QuitTogether</h1>
        </div>
      </div>
      <Link
        to="/settings"
        className="w-11 h-11 min-touch flex items-center justify-center rounded-xl bg-white shadow-card border border-slate-100 active:bg-slate-50"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-slate-600" />
      </Link>
    </header>
  );
}
