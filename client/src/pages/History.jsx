import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

function formatTime(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function History() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getLogs()
      .then((data) => setLogs(data.logs))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = logs.reduce((acc, log) => {
    const date = String(log.logDate).slice(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return <div className="animate-pulse text-slate-500 py-8 text-center">Loading history...</div>;
  }

  return (
    <div>
      <div className="hidden lg:block">
        <PageHeader subtitle="Every log entry with its own timestamp." />
      </div>

      <div className="lg:hidden mb-4">
        <h2 className="text-xl font-bold text-slate-900">History</h2>
        <p className="text-sm text-slate-500">Each log shows when it was saved</p>
      </div>

      {user?.isAdmin && (
        <div className="mb-4">
          <Link
            to="/admin/logs"
            className="inline-flex items-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white"
          >
            Manage logs (admin)
          </Link>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {dates.length === 0 ? (
        <StatCard title="No logs yet">
          <p className="text-slate-500 text-sm">Start logging on the Log Today page.</p>
        </StatCard>
      ) : (
        <div className="space-y-3">
          {dates.map((date) => (
            <StatCard
              key={date}
              title={new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            >
              <div className="space-y-2">
                {grouped[date].map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-3 pl-3 border-b border-slate-50 last:border-0 border-l-[3px]"
                    style={{ borderLeftColor: log.accentColor }}
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800 block truncate">
                        {log.displayName}
                        {log.isCurrentUser && ' (you)'}
                      </span>
                      {log.createdAt && (
                        <span className="text-xs text-slate-500">
                          Logged at {formatTime(log.createdAt)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-bold text-base shrink-0 ml-3 ${
                        log.cigarettes === 0 ? 'text-userGreen' : 'text-slate-700'
                      }`}
                    >
                      {log.cigarettes === 0 ? 'Smoke-free' : `${log.cigarettes}`}
                    </span>
                  </div>
                ))}
              </div>
            </StatCard>
          ))}
        </div>
      )}
    </div>
  );
}
