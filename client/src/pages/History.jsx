import { useEffect, useState } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

export default function History() {
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
    return <div className="animate-pulse text-slate-500">Loading history...</div>;
  }

  return (
    <div>
      <PageHeader subtitle="Review your daily smoking logs." />

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {dates.length === 0 ? (
        <StatCard title="No logs yet">
          <p className="text-slate-500 text-sm">Start logging on the Log Today page.</p>
        </StatCard>
      ) : (
        <div className="space-y-4">
          {dates.map((date) => (
            <StatCard key={date} title={new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}>
              <div className="space-y-2">
                {grouped[date].map((log) => (
                  <div
                    key={`${log.userId}-${date}`}
                    className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: log.accentColor }}
                      />
                      <span className="font-medium text-slate-700">
                        {log.displayName}
                        {log.isCurrentUser && ' (you)'}
                      </span>
                    </div>
                    <span
                      className={`font-semibold ${
                        log.cigarettes === 0 ? 'text-userGreen' : 'text-slate-700'
                      }`}
                    >
                      {log.cigarettes === 0 ? 'Smoke-free' : `${log.cigarettes} cigarettes`}
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
