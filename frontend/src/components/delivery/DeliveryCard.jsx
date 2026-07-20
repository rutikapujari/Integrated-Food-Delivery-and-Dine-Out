import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../../utils/constants'
import { Truck, MapPin, CurrencyDollar, CheckCircle } from '../../utils/icons'
import Button from '../common/Button'
import {
  updateDeliveryStatus,
  updateDeliveryPayment,
  claimDelivery,
} from '../../redux/deliverySlice'
import { notify } from '../../utils/toast'

const statusColorClass = {
  warning: 'text-warning bg-warning-light',
  accent: 'text-accent bg-accent-50',
  primary: 'text-primary bg-primary-light',
  success: 'text-success bg-success-light',
  destructive: 'text-destructive bg-destructive/10',
}

function DeliveryCard({ order, mode = 'mine' }) {
  const dispatch = useDispatch()
  const [loadingAction, setLoadingAction] = useState(null)

  const statusLabel = ORDER_STATUS_LABELS[order.status] || order.status
  const colorKey = ORDER_STATUS_COLORS[order.status] || 'accent'

  const handleStatus = async (status) => {
    setLoadingAction(status)
    try {
      const result = await dispatch(updateDeliveryStatus({ orderId: order._id, status }))
      if (updateDeliveryStatus.fulfilled.match(result)) {
        notify.success(`Marked as ${ORDER_STATUS_LABELS[status]}`)
      } else {
        notify.error(result.payload || 'Failed to update status')
      }
    } finally {
      setLoadingAction(null)
    }
  }

  const handleCollect = async () => {
    setLoadingAction('collect')
    try {
      const result = await dispatch(
        updateDeliveryPayment({ orderId: order._id, paymentStatus: 'Paid' })
      )
      if (updateDeliveryPayment.fulfilled.match(result)) {
        notify.success('Cash on Delivery collected')
      } else {
        notify.error(result.payload || 'Failed to collect payment')
      }
    } finally {
      setLoadingAction(null)
    }
  }

  const handleClaim = async () => {
    setLoadingAction('claim')
    try {
      await dispatch(claimDelivery(order._id))
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">
            {order.restaurantId?.name || order.restaurant?.name || 'Restaurant'}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Order #{order._id?.slice(-8).toUpperCase()}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColorClass[colorKey]}`}>
          {statusLabel}
        </span>
      </div>

      <div className="border-t border-border pt-3 mb-3 space-y-1">
        <p className="text-sm text-muted-foreground flex items-start gap-2">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          {order.deliveryAddress}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-1">
          {order.items?.map((i) => `${i.name || i.menuItemId?.name} x${i.quantity}`).join(', ')}
        </p>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className="text-primary font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
        {order.paymentMethod === 'Cash on Delivery' && (
          <span className={`text-xs font-semibold ${order.paymentStatus === 'Paid' ? 'text-success' : 'text-warning'}`}>
            COD · {order.paymentStatus}
          </span>
        )}
      </div>

      {mode === 'available' ? (
        <Button
          className="w-full"
          loading={loadingAction === 'claim'}
          onClick={handleClaim}
        >
          <Truck className="w-5 h-5" /> Claim Delivery
        </Button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {order.status === 'confirmed' || order.status === 'preparing' ? (
            <Button size="sm" loading={loadingAction === 'out_for_delivery'} onClick={() => handleStatus('out_for_delivery')}>
              <Truck className="w-4 h-4" /> Out for Delivery
            </Button>
          ) : null}
          {order.status === 'out_for_delivery' ? (
            <Button size="sm" loading={loadingAction === 'delivered'} onClick={() => handleStatus('delivered')}>
              <CheckCircle className="w-4 h-4" /> Mark Delivered
            </Button>
          ) : null}
          {order.paymentMethod === 'Cash on Delivery' && order.paymentStatus !== 'Paid' && order.status === 'delivered' ? (
            <Button size="sm" variant="outline" loading={loadingAction === 'collect'} onClick={handleCollect}>
              <CurrencyDollar className="w-4 h-4" /> Collect Cash
            </Button>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default DeliveryCard
