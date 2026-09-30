import { useState } from 'react';
import { LogOut, Copy, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const data = await api.updateProfile(displayName);
      updateUser(data.user);
      setMessage('Profile updated!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCopyInvite = async () => {
    if (user?.inviteCode) {
      await navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div className="hidden lg:block">
        <PageHeader subtitle="Manage your profile and account." />
      </div>
      <div className="lg:hidden mb-4">
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500">Profile and account</p>
      </div>

      <div className="space-y-4 max-w-lg">
        <StatCard title="Profile">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-userGreen/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>
            {message && (
              <p className={`text-sm ${message.includes('updated') ? 'text-userGreen' : 'text-red-500'}`}>
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-navy text-white rounded-xl font-medium hover:bg-navy-light transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </StatCard>

        {user?.isAdmin && (
          <StatCard title="Admin">
            <p className="text-sm text-slate-600 mb-3">
              Add, edit, or delete logs for any user on any date.
            </p>
            <Link
              to="/admin/logs"
              className="inline-flex items-center rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white"
            >
              Manage logs
            </Link>
          </StatCard>
        )}

        {user?.inviteCode && !user?.pairComplete && (
          <StatCard title="Invite Code">
            <p className="text-sm text-slate-600 mb-3">
              Share this code with your friend so they can join your pair.
            </p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold text-navy">{user.inviteCode}</span>
              <button
                onClick={handleCopyInvite}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </StatCard>
        )}

        <StatCard title="Account">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </StatCard>
      </div>
    </div>
  );
}
