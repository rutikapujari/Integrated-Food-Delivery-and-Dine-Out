import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../../utils/formatCurrency'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-sm text-primary font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  )
}

function RevenueChart({ data, loading }) {
  if (loading) {
    return <div className="h-72 animate-pulse rounded-lg bg-slate-100" />
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg bg-slate-50 text-sm text-muted-foreground">
        No revenue data available
      </div>
    )
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" fill="#EA580C" radius={[8, 8, 0, 0]} barSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default RevenueChart
