import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants'

const statusColorClass = {
  warning: 'text-warning bg-warning-light',
  accent: 'text-accent bg-accent-50',
  primary: 'text-primary bg-primary-light',
  success: 'text-success bg-success-light',
  destructive: 'text-destructive bg-destructive/10',
}

function RecentOrdersTable({ orders, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 rounded-lg bg-slate-50 p-3">
            <div className="h-9 w-9 rounded-full bg-slate-100" />
            <div className="h-4 w-24 flex-1 rounded bg-slate-100" />
            <div className="h-4 w-16 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-slate-700">No recent orders</p>
        <p className="mt-1 text-sm text-muted-foreground">New orders will appear here as they arrive.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em]">
            <th className="pb-3 text-left font-bold text-slate-500">Order ID</th>
            <th className="pb-3 text-left font-bold text-slate-500">Customer</th>
            <th className="hidden pb-3 text-left font-bold text-slate-500 sm:table-cell">Total</th>
            <th className="pb-3 text-left font-bold text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => {
            const colorKey = ORDER_STATUS_COLORS[order.status] || 'accent'
            return (
              <tr key={order._id} className="transition hover:bg-primary-light/60">
                <td className="py-3 pr-3">
                  <Link to="/admin/orders" className="font-mono text-xs font-bold text-primary hover:underline">
                    #{order._id?.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {(order.user?.name || 'N').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="font-semibold text-slate-800">{order.user?.name || 'N/A'}</span>
                  </div>
                </td>
                <td className="hidden py-3 pr-3 font-bold text-slate-900 sm:table-cell">{formatCurrency(order.totalAmount)}</td>
                <td className="py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColorClass[colorKey]}`}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default RecentOrdersTable
