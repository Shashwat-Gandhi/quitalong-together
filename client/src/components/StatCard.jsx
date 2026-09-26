export default function StatCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}
