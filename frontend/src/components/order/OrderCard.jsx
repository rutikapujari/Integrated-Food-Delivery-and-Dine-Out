import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants'
import { Clock, MapPin } from '../../utils/icons'

function OrderCard({ order }) {
  const navigate = useNavigate()
  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status
  const statusColorClass = {
    warning: 'text-warning bg-warning-light',
    accent: 'text-accent bg-accent-50',
    primary: 'text-primary bg-primary-light',
    success: 'text-success bg-success-light',
    destructive: 'text-destructive bg-destructive/10',
  }
  const colorKey = ORDER_STATUS_COLORS[order.status] || 'accent'

  return (
    <div
      onClick={() => navigate(`/orders/${order._id}`)}
      className="bg-white border border-border rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] p-5 cursor-pointer hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{order.restaurantName || order.restaurant?.name}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Order #{order._id?.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${statusColorClass[colorKey]}`}>
          {statusLabel}
        </span>
      </div>

      <div className="border-t border-border pt-3 mb-3">
        <p className="text-sm text-muted-foreground line-clamp-1">
          {order.items?.map((i) => `${i.name} x${i.quantity}`).join(', ')}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-primary font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {order.createdAt && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderCard
