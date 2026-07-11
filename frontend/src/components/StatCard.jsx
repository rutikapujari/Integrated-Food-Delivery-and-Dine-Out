export default function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="rounded-[24px] bg-white p-6 shadow-sm shadow-slate-200/40">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">{value}</h3>
          <p className="mt-2 text-xs text-emerald-600 font-semibold">{subtitle}</p>
        </div>
        <div className={`${color} rounded-full w-14 h-14 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
