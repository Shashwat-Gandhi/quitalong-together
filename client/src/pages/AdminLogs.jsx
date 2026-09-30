import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function todayKey() {
  return new Date().toLocaleDateString('en-CA');
}

export default function AdminLogs() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayKey());
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [newUserId, setNewUserId] = useState('');
  const [newCigarettes, setNewCigarettes] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminLogs(date);
      setMembers(data.members || []);
      setEvents(data.events || []);
      if (!newUserId && data.members?.length) {
        setNewUserId(data.members[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      loadLogs();
    }
  }, [user?.isAdmin, date]);

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await api.createLogEvent({
        userId: newUserId,
        logDate: date,
        cigarettes: Number(newCigarettes),
      });
      setNewCigarettes(0);
      setMessage('Log added.');
      await loadLogs();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (eventId, cigarettes) => {
    setError('');
    try {
      await api.updateLogEvent(eventId, { cigarettes: Number(cigarettes) });
      await loadLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMoveDate = async (eventId, newDate) => {
    if (!newDate) return;
    setError('');
    try {
      await api.updateLogEvent(eventId, { logDate: newDate });
      await loadLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (eventId) => {
    setError('');
    try {
      await api.deleteLogEvent(eventId);
      await loadLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const totals = members.map((member) => ({
    ...member,
    total: events
      .filter((event) => event.userId === member.id)
      .reduce((sum, event) => sum + event.cigarettes, 0),
  }));

  return (
    <div className="max-w-3xl">
      <div className="hidden lg:block">
        <PageHeader subtitle="Add, edit, or delete logs for any user on any date." />
      </div>

      <div className="lg:hidden mb-4">
        <h2 className="text-xl font-bold text-slate-900">Manage Logs</h2>
        <p className="text-sm text-slate-500">Admin tools for your pair</p>
      </div>

      <div className="mb-4">
        <Link to="/history" className="text-sm text-userGreen font-medium hover:underline">
          ← Back to history
        </Link>
      </div>

      <StatCard title="Pick a date">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-userGreen/50"
        />
      </StatCard>

      {error && (
        <div className="my-4 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
      )}
      {message && (
        <div className="my-4 bg-green-50 text-userGreen text-sm px-4 py-3 rounded-xl">{message}</div>
      )}

      {loading ? (
        <div className="animate-pulse text-slate-500 py-8 text-center">Loading logs...</div>
      ) : (
        <>
          <StatCard title="Daily totals" className="mt-4">
            <div className="space-y-2">
              {totals.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2">
                  <span className="font-semibold text-slate-700">{member.displayName}</span>
                  <span className="font-bold tabular-nums" style={{ color: member.accentColor }}>
                    {member.total}
                  </span>
                </div>
              ))}
            </div>
          </StatCard>

          <StatCard title="Add log" className="mt-4">
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">User</label>
                <select
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.displayName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cigarettes</label>
                <input
                  type="number"
                  min="0"
                  value={newCigarettes}
                  onChange={(e) => setNewCigarettes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !newUserId}
                className="w-full py-3 bg-userGreen text-white font-semibold rounded-xl disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add log for this date'}
              </button>
            </form>
          </StatCard>

          <StatCard title="Entries on this date" className="mt-4">
            {events.length === 0 ? (
              <p className="text-sm text-slate-500">No logs on this date.</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl border border-slate-100 p-3 space-y-3"
                    style={{ borderLeftWidth: 3, borderLeftColor: event.accentColor }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800">{event.displayName}</p>
                        <p className="text-xs text-slate-500">Logged at {formatTime(event.createdAt)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(event.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        aria-label="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Cigarettes</label>
                        <input
                          type="number"
                          min="0"
                          defaultValue={event.cigarettes}
                          onBlur={(e) => {
                            if (Number(e.target.value) !== event.cigarettes) {
                              handleUpdate(event.id, e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Move to date</label>
                        <input
                          type="date"
                          value={event.logDate}
                          onChange={(e) => handleMoveDate(event.id, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </StatCard>
        </>
      )}
    </div>
  );
}
