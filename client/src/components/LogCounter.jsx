import { Minus, Plus } from 'lucide-react';

export default function LogCounter({
  label,
  value,
  onChange,
  accentColor = '#22c55e',
  readOnly = false,
  large = false,
}) {
  const displayValue = value ?? 0;
  const btnSize = large ? 'w-12 h-12 min-w-touch min-h-touch' : 'w-11 h-11 min-w-touch min-h-touch';
  const valueSize = large ? 'text-3xl w-14' : 'text-2xl w-12';

  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <span className="font-semibold text-slate-800 truncate text-base">{label}</span>
      <div className="flex items-center gap-3 shrink-0">
        {!readOnly && (
          <button
            type="button"
            onClick={() => onChange(Math.max(0, displayValue - 1))}
            className={`${btnSize} rounded-full border-2 border-slate-200 bg-white flex items-center justify-center active:bg-slate-100 active:scale-95 transition-all shadow-sm`}
            aria-label={`Decrease ${label}`}
          >
            <Minus className="w-5 h-5 text-slate-600" />
          </button>
        )}
        <span
          className={`${valueSize} text-center font-extrabold tabular-nums`}
          style={{ color: accentColor }}
        >
          {displayValue}
        </span>
        {!readOnly && (
          <button
            type="button"
            onClick={() => onChange(displayValue + 1)}
            className={`${btnSize} rounded-full border-2 flex items-center justify-center active:scale-95 transition-all shadow-sm`}
            style={{
              borderColor: accentColor,
              backgroundColor: `${accentColor}15`,
            }}
            aria-label={`Increase ${label}`}
          >
            <Plus className="w-5 h-5" style={{ color: accentColor }} />
          </button>
        )}
      </div>
    </div>
  );
}
