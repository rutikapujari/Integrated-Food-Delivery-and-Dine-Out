import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants'
import { CaretRight, Motorcycle, Package, Timer } from '../../utils/icons'

const statusColorClass = {
  warning: 'text-warning bg-warning-light',
  accent: 'text-accent bg-accent-50',
  primary: 'text-primary bg-primary-light',
  success: 'text-success bg-success-light',
  destructive: 'text-destructive bg-destructive/10',
}

const deliverySteps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

function getInitials(name = 'Guest') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function getOrderTime(createdAt) {
  if (!createdAt) return 'Just now'
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Just now'
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function DeliveryProgress({ status }) {
  if (status === 'cancelled') return null
  const currentStep = Math.max(deliverySteps.indexOf(status), 0)
  const progress = Math.max(8, (currentStep / (deliverySteps.length - 1)) * 100)

  return (
    <div className="mt-2 flex items-center gap-2" aria-label={`Delivery progress: ${ORDER_STATUS_LABELS[status] || status}`}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      {status === 'out_for_delivery' ? <Motorcycle className="h-4 w-4 text-primary" weight="fill" /> : <Timer className="h-4 w-4 text-slate-400" />}
    </div>
  )
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
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-light">
          <Package className="h-5 w-5 text-primary" weight="duotone" />
        </div>
        <p className="font-semibold text-slate-700">No orders yet</p>
        <p className="mt-1 text-sm text-muted-foreground">New orders will appear here in real time.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full min-w-[620px] text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] uppercase tracking-[0.12em] text-slate-400">
            <th className="pb-3 text-left font-semibold">Order</th>
            <th className="pb-3 text-left font-semibold">Customer</th>
            <th className="pb-3 text-left font-semibold">Amount</th>
            <th className="pb-3 text-left font-semibold">Live status</th>
            <th className="pb-3 text-right font-semibold">&nbsp;</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {orders.map((order) => {
            const colorKey = ORDER_STATUS_COLORS[order.status] || 'accent'
            const customerName = order.user?.name || order.userId?.name || 'Guest customer'
            const itemsCount = order.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0
            return (
              <tr key={order._id} className="group transition-colors hover:bg-orange-50/50">
                <td className="py-3.5 pr-4">
                  <Link to="/admin/orders" className="font-mono text-xs font-bold tracking-wide text-primary hover:underline">
                    #{order._id?.slice(-8).toUpperCase()}
                  </Link>
                  <p className="mt-1 text-xs text-slate-400">{getOrderTime(order.createdAt)}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-50 text-[10px] font-bold text-primary ring-1 ring-orange-100">
                      {getInitials(customerName)}
                    </span>
                    <div className="min-w-0">
                      <p className="max-w-32 truncate font-semibold text-slate-700">{customerName}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{itemsCount ? `${itemsCount} item${itemsCount === 1 ? '' : 's'}` : 'Order placed'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4 font-bold text-slate-800">{formatCurrency(order.totalAmount)}</td>
                <td className="min-w-44 py-3.5 pr-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusColorClass[colorKey]}`}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                  <DeliveryProgress status={order.status} />
                </td>
                <td className="py-3.5 text-right">
                  <Link to="/admin/orders" aria-label={`View order ${order._id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white hover:text-primary hover:shadow-sm">
                    <CaretRight className="h-4 w-4" weight="bold" />
                  </Link>
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
