function StatCard({ title, value, icon: Icon, change, loading }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-2xl font-bold mt-1 text-slate-800">{value}</p>
          )}
          {change && (
            <p className={`text-sm mt-1 font-medium ${change.type === 'increase' ? 'text-success' : 'text-destructive'}`}>
              {change.type === 'increase' ? '\u2191' : '\u2193'} {change.value}% from last month
            </p>
          )}
        </div>
        <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  )
}

export default StatCard
