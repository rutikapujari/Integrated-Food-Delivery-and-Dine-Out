import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants'
import { CaretRight, CheckCircle, Package, Clock, Truck } from '../../utils/icons'

const statusStyles = {
  warning: { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  accent: { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
  primary: { text: 'text-[#EA580C]', bg: 'bg-orange-50', border: 'border-orange-100' },
  success: { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
  destructive: { text: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
}

const deliverySteps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered']

function getInitials(name = 'Guest') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
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
    <div className="mt-2 flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full bg-gradient-to-r from-[#EA580C] to-orange-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>
      {status === 'out_for_delivery' ? <Truck className="h-3.5 w-3.5 text-[#EA580C]" weight="fill" /> : <Clock className="h-3.5 w-3.5 text-gray-300" />}
    </div>
  )
}

function RecentOrdersTable({ orders, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-4 w-24 bg-gray-100 rounded flex-1" />
            <div className="h-4 w-16 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <Package className="h-6 w-6 text-gray-300" weight="duotone" />
        </div>
        <p className="font-bold text-gray-900">No orders yet</p>
        <p className="mt-1 text-sm text-gray-400">New orders will appear here in real time.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full min-w-[620px] text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-[11px] uppercase tracking-[0.12em] text-gray-400">
            <th className="pb-3 text-left font-semibold">Order</th>
            <th className="pb-3 text-left font-semibold">Customer</th>
            <th className="pb-3 text-left font-semibold">Amount</th>
            <th className="pb-3 text-left font-semibold">Status</th>
            <th className="pb-3 text-right font-semibold">&nbsp;</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => {
            const colorKey = ORDER_STATUS_COLORS[order.status] || 'accent'
            const style = statusStyles[colorKey] || statusStyles.accent
            const customerName = order.user?.name || order.userId?.name || 'Guest'
            const itemsCount = order.items?.reduce((t, item) => t + (item.quantity || 1), 0) || 0
            return (
              <tr key={order._id} className="group hover:bg-orange-50/30 transition-colors">
                <td className="py-3.5 pr-4">
                  <Link to="/admin/orders" className="font-mono text-xs font-bold tracking-wide text-[#EA580C] hover:underline">
                    #{order._id?.slice(-8).toUpperCase()}
                  </Link>
                  <p className="mt-1 text-xs text-gray-400">{getOrderTime(order.createdAt)}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-50 text-[10px] font-bold text-[#EA580C] ring-1 ring-orange-100">
                      {getInitials(customerName)}
                    </span>
                    <div className="min-w-0">
                      <p className="max-w-32 truncate font-semibold text-gray-800">{customerName}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{itemsCount} item{itemsCount === 1 ? '' : 's'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 pr-4 font-bold text-gray-800">{formatCurrency(order.totalAmount)}</td>
                <td className="min-w-44 py-3.5 pr-4">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${style.text} ${style.bg} border ${style.border}`}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                  <DeliveryProgress status={order.status} />
                </td>
                <td className="py-3.5 text-right">
                  <Link to="/admin/orders" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white hover:text-[#EA580C] hover:shadow-sm">
                    <CaretRight className="h-4 w-4" />
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
