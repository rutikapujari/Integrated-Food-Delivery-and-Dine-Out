import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { formatCurrency } from '../../utils/formatCurrency'
import { notify } from '../../utils/toast'
import { ORDER_STATUS_LABELS } from '../../utils/constants'
import {
  fetchMyDeliveries,
  updateDeliveryStatus,
  updateDeliveryPayment,
} from '../../redux/deliverySlice'
import Loader from '../../components/common/Loader'
import { Truck, MapPin, CurrencyDollar, Storefront, Phone } from '../../utils/icons'

const STEPS = ['confirmed', 'preparing', 'out_for_delivery', 'delivered']

function ActiveDeliveryPage() {
  const dispatch = useDispatch()
  const { myDeliveries, loading, actionLoading, error } = useSelector((state) => state.delivery)

  useEffect(() => {
    dispatch(fetchMyDeliveries()).unwrap().catch((e) => notify.error(e || 'Failed to load'))
  }, [dispatch])

  const active = myDeliveries.filter((o) => !['delivered', 'cancelled'].includes(o.status))

  const nextAction = (status) => {
    if (status === 'confirmed' || status === 'preparing') return 'out_for_delivery'
    if (status === 'out_for_delivery') return 'delivered'
    return null
  }

  const handleStatus = async (id, status) => {
    const result = await dispatch(updateDeliveryStatus({ orderId: id, status }))
    if (updateDeliveryStatus.fulfilled.match(result)) {
      notify.success(`Marked as ${ORDER_STATUS_LABELS[status]}`)
    } else {
      notify.error(result.payload || 'Failed to update status')
    }
  }

  const handleCollect = async (id) => {
    const result = await dispatch(updateDeliveryPayment({ orderId: id, paymentStatus: 'Paid' }))
    if (updateDeliveryPayment.fulfilled.match(result)) {
      notify.success('Cash on Delivery collected')
    } else {
      notify.error(result.payload || 'Failed to collect payment')
    }
  }

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 md:px-8 py-8 text-white">
        <div className="relative mx-auto max-w-5xl">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-primary">
              <Truck className="h-8 w-8" weight="duotone" />
            </span>
            <div>
              <h1 className="font-display text-3xl">Active Deliveries</h1>
              <p className="text-slate-300 text-sm">{active.length} in progress</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-destructive">{error}</div>
        )}

        {loading ? (
          <Loader variant="card" count={2} />
        ) : !active.length ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-white/60 px-5 py-12 text-center">
            <div>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Truck className="h-8 w-8" weight="duotone" />
              </span>
              <h3 className="mt-5 text-xl font-bold">No active deliveries</h3>
              <p className="mt-2 text-muted-foreground">Claim an order from the Available list to get started.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {active.map((o) => {
              const stepIndex = STEPS.indexOf(o.status)
              const next = nextAction(o.status)
              return (
                <div key={o._id} className="rounded-2xl border border-border bg-white p-6 shadow-[var(--shadow-card)]">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Storefront className="h-5 w-5 text-primary" />
                        {o.restaurantId?.name || o.restaurant?.name || 'Restaurant'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Order #{o._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                      {ORDER_STATUS_LABELS[o.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-xl bg-surface-bg p-4">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><MapPin className="h-4 w-4" /> Drop-off</p>
                      <p className="text-sm">{o.deliveryAddress}</p>
                    </div>
                    <div className="rounded-xl bg-surface-bg p-4">
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><CurrencyDollar className="h-4 w-4" /> Earnings</p>
                      <p className="text-sm font-semibold">{formatCurrency(o.totalAmount)}</p>
                      {o.paymentMethod === 'Cash on Delivery' && (
                        <p className={`text-xs font-semibold mt-1 ${o.paymentStatus === 'Paid' ? 'text-success' : 'text-warning'}`}>
                          COD · {o.paymentStatus}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Customer: {o.customerId?.phone || o.phone || 'N/A'}</span>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center">
                      {STEPS.map((s, i) => (
                        <div key={s} className="flex flex-1 items-center">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            i <= stepIndex ? 'bg-primary text-white' : 'bg-surface-muted text-muted-foreground'
                          }`}>
                            {i + 1}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`h-1 flex-1 ${i < stepIndex ? 'bg-primary' : 'bg-surface-muted'}`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                      {STEPS.map((s) => (
                        <span key={s} className="w-8 text-center">{ORDER_STATUS_LABELS[s].split(' ')[0]}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {next && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleStatus(o._id, next)}
                        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                      >
                        <Truck className="h-5 w-5" />
                        {next === 'out_for_delivery' ? 'Start Delivery' : 'Mark Delivered'}
                      </button>
                    )}
                    {o.paymentMethod === 'Cash on Delivery' && o.paymentStatus !== 'Paid' && o.status === 'delivered' && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleCollect(o._id)}
                        className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-surface-muted disabled:opacity-50"
                      >
                        <CurrencyDollar className="h-5 w-5" /> Collect Cash
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ActiveDeliveryPage
