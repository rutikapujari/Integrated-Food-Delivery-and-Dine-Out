import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { fetchOrderById } from '../../redux/orderSlice'
import { formatCurrency } from '../../utils/formatCurrency'
import { ORDER_STATUS_LABELS } from '../../utils/constants'
import { useSocket } from '../../hooks/useSocket'
import OrderTimeline from '../../components/order/OrderTimeline'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { Truck, MapPin, Clock } from '../../utils/icons'

function OrderTrackingPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { activeOrder, loading } = useSelector((state) => state.order)
  const { joinOrderRoom, leaveOrderRoom } = useSocket()

  useEffect(() => {
    dispatch(fetchOrderById(id))
  }, [dispatch, id])

  useEffect(() => {
    joinOrderRoom(id)
    return () => leaveOrderRoom(id)
  }, [id, joinOrderRoom, leaveOrderRoom])

  if (loading && !activeOrder) return <Loader variant="page" />
  if (!activeOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h3 className="text-lg font-semibold">Order not found</h3>
      </div>
    )
  }

  const statusLabel = ORDER_STATUS_LABELS[activeOrder.status] || activeOrder.status

  return (
    <motion.div {...pageTransition} className="max-w-3xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Truck className="w-8 h-8 text-primary" />
        <div>
          <h1 className="font-display text-3xl">Track Order</h1>
          <p className="text-muted-foreground text-sm">Order #{activeOrder._id?.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4 text-center">
          <p className="text-muted-foreground text-xs mb-1">Status</p>
          <p className="text-primary font-bold">{statusLabel}</p>
        </div>
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4 text-center">
          <p className="text-muted-foreground text-xs mb-1">Estimated Delivery</p>
          <p className="text-foreground font-semibold flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" /> {activeOrder.estimatedDelivery || '30-40 min'}
          </p>
        </div>
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-4 text-center">
          <p className="text-muted-foreground text-xs mb-1">Total Amount</p>
          <p className="text-primary font-bold">{formatCurrency(activeOrder.totalAmount)}</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6 mb-8">
        <h2 className="font-semibold text-lg mb-4">Order Timeline</h2>
        <OrderTimeline status={activeOrder.status} />
      </div>

      {activeOrder.address && (
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6 mb-8">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Delivery Address
          </h2>
          <p className="text-muted-foreground text-sm">
            {activeOrder.address.street}, {activeOrder.address.city}, {activeOrder.address.state} {activeOrder.address.zipCode}
          </p>
        </div>
      )}

      <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6">
        <h2 className="font-semibold text-lg mb-4">Order Items</h2>
        <div className="space-y-3">
          {activeOrder.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-muted-foreground">&times;{item.quantity}</p>
              </div>
              <span className="font-semibold text-sm">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <hr className="my-4" />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatCurrency(activeOrder.totalAmount)}</span>
        </div>
      </div>
    </motion.div>
  )
}

export default OrderTrackingPage
