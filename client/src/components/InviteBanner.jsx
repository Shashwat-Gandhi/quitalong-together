import { useState } from 'react';
import { Copy, Check, Users } from 'lucide-react';

export default function InviteBanner({ inviteCode }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-userGreen/10 to-userBlue/10 border border-userGreen/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 rounded-full bg-userGreen/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-userGreen" />
        </div>
        <div>
          <p className="font-semibold text-slate-800">Invite your friend to compete!</p>
          <p className="text-sm text-slate-600">
            Share this code when they sign up:{' '}
            <span className="font-mono font-bold text-navy">{inviteCode}</span>
          </p>
        </div>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy-light transition-colors"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied!' : 'Copy Code'}
      </button>
    </div>
  );
}
