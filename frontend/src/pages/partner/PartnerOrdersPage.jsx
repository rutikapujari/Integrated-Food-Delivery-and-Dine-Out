import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { fetchOrders, updateOrderStatusThunk } from '../../redux/orderSlice'
import { notify } from '../../utils/toast'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { ORDER_STATUS_LABELS } from '../../utils/constants'
import { ClipboardText, CheckCircle, CookingPot, Truck, Clock } from '../../utils/icons'

const NEXT_ACTION = {
  confirmed: { status: 'preparing', label: 'Start Preparing', icon: CookingPot },
  preparing: { status: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  out_for_delivery: { status: 'delivered', label: 'Mark Delivered', icon: CheckCircle },
}

function PartnerOrdersPage() {
  const dispatch = useDispatch()
  const { list: orders, loading } = useSelector((state) => state.order)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  const handleStatus = async (id, status) => {
    const result = await dispatch(updateOrderStatusThunk({ orderId: id, status }))
    if (updateOrderStatusThunk.fulfilled.match(result)) {
      notify.success(`Order ${ORDER_STATUS_LABELS[status]}`)
    } else {
      notify.error(result.payload || 'Failed to update')
    }
  }

  if (loading) return <Loader variant="page" />

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <ClipboardText className="h-8 w-8" weight="duotone" />
          </span>
          <div>
            <h1 className="font-display text-3xl">Orders</h1>
            <p className="text-muted-foreground text-sm">{orders.length} total orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-white/60 px-5 py-12 text-center">
            <div>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Clock className="h-8 w-8" weight="duotone" />
              </span>
              <h3 className="mt-5 text-xl font-bold">No orders yet</h3>
              <p className="mt-2 text-muted-foreground">New orders will appear here in real time.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => {
              const next = NEXT_ACTION[o.status]
              return (
                <div key={o._id} className="rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-card)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">Order #{o._id?.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground capitalize">{ORDER_STATUS_LABELS[o.status] || o.status}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                        {o.items?.map((i) => `${i.name || i.menuItemId?.name} x${i.quantity}`).join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">₹{o.totalAmount}</p>
                      <p className="text-xs text-muted-foreground">{o.paymentMethod}</p>
                    </div>
                  </div>
                  {next && (
                    <div className="mt-4">
                      <Button size="sm" onClick={() => handleStatus(o._id, next.status)}>
                        <next.icon className="h-4 w-4" /> {next.label}
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default PartnerOrdersPage
