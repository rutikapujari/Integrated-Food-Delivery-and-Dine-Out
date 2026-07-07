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
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded flex-1" />
            <div className="h-4 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return <p className="text-muted-foreground text-sm py-4">No recent orders</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left pb-3 font-semibold text-slate-500">Order ID</th>
            <th className="text-left pb-3 font-semibold text-slate-500">Customer</th>
            <th className="text-left pb-3 font-semibold text-slate-500 hidden sm:table-cell">Total</th>
            <th className="text-left pb-3 font-semibold text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => {
            const colorKey = ORDER_STATUS_COLORS[order.status] || 'accent'
            return (
              <tr key={order._id} className="hover:bg-slate-50">
                <td className="py-2.5 pr-3">
                  <Link to={`/admin/orders`} className="font-mono text-xs text-primary hover:underline">
                    #{order._id?.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="py-2.5 pr-3 text-slate-700">{order.user?.name || 'N/A'}</td>
                <td className="py-2.5 pr-3 font-semibold hidden sm:table-cell">{formatCurrency(order.totalAmount)}</td>
                <td className="py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColorClass[colorKey]}`}>
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
