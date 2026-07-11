function StatCard({ title, value, icon: Icon, change, loading }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-white/80 bg-white/90 p-6 shadow-card backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
          {loading ? (
            <div className="mt-3 h-8 w-24 animate-pulse rounded bg-slate-100" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          )}
          {change && (
            <p className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${change.type === 'increase' ? 'bg-success-light text-success' : 'bg-destructive/10 text-destructive'}`}>
              {change.type === 'increase' ? '\u2191' : '\u2193'} {change.value}% from last month
            </p>
          )}
        </div>
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/25 transition group-hover:scale-105">
          <Icon className="h-6 w-6" weight="duotone" />
        </div>
      </div>
    </div>
  )
}

export default StatCard
