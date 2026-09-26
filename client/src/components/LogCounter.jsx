import { Minus, Plus } from 'lucide-react';

export default function LogCounter({
  label,
  value,
  onChange,
  accentColor = '#22c55e',
  readOnly = false,
}) {
  const displayValue = value ?? 0;

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-medium text-slate-700 truncate">{label}</span>
      <div className="flex items-center gap-2">
        {!readOnly && (
          <button
            type="button"
            onClick={() => onChange(Math.max(0, displayValue - 1))}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label={`Decrease ${label}`}
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
        <span
          className="w-10 text-center text-xl font-bold"
          style={{ color: accentColor }}
        >
          {displayValue}
        </span>
        {!readOnly && (
          <button
            type="button"
            onClick={() => onChange(displayValue + 1)}
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label={`Increase ${label}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
