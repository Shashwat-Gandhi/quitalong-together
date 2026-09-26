import { getGreeting, formatDate } from '../utils/greeting';

export default function PageHeader({ subtitle }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">{getGreeting()}!</h1>
      <p className="text-slate-500 mt-1">{formatDate()}</p>
      {subtitle && <p className="text-slate-600 mt-2">{subtitle}</p>}
    </header>
  );
}
