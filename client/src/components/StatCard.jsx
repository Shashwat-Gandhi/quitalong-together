export default function StatCard({ title, children, className = '', noPadding = false }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-card border border-slate-100/80 ${
        noPadding ? '' : 'p-5'
      } ${className}`}
    >
      {title && (
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
