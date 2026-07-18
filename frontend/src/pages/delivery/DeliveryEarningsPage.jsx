import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { formatCurrency } from '../../utils/formatCurrency'
import { notify } from '../../utils/toast'
import { fetchMyDeliveries } from '../../redux/deliverySlice'
import Loader from '../../components/common/Loader'
import { ChartBar, CurrencyDollar, Package, CheckCircle, Clock, Calendar } from '../../utils/icons'

function DeliveryEarningsPage() {
  const dispatch = useDispatch()
  const { myDeliveries, loading, error } = useSelector((state) => state.delivery)
  const [range, setRange] = useState('all')

  useEffect(() => {
    dispatch(fetchMyDeliveries()).unwrap().catch((e) => notify.error(e || 'Failed to load'))
  }, [dispatch])

  const completed = myDeliveries.filter((o) => o.status === 'delivered')
  const [now] = useState(() => Date.now())

  const filtered = useMemo(() => {
    if (range === 'all') return completed
    const day = 86400000
    const cutoff = range === '7d' ? 7 * day : 30 * day
    const threshold = now - cutoff
    return completed.filter((o) => new Date(o.createdAt).getTime() >= threshold)
  }, [completed, range, now])

  const total = filtered.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)
  const codCount = filtered.filter((o) => o.paymentMethod === 'Cash on Delivery' && o.paymentStatus !== 'Paid').length

  const RANGES = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: 'all', label: 'All time' },
  ]

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 md:px-8 py-8 text-white">
        <div className="relative mx-auto max-w-5xl">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-primary">
              <ChartBar className="h-8 w-8" weight="duotone" />
            </span>
            <div>
              <h1 className="font-display text-3xl">Earnings & History</h1>
              <p className="text-slate-300 text-sm">Track your delivered orders and payouts</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/15 to-primary/5 p-5">
            <p className="text-sm font-medium text-primary opacity-80 flex items-center gap-1"><CurrencyDollar className="h-4 w-4" /> Total Earnings</p>
            <p className="mt-2 font-display text-3xl font-bold text-primary">{formatCurrency(total)}</p>
          </div>
          <div className="rounded-2xl border border-success/20 bg-gradient-to-br from-success/15 to-success/5 p-5">
            <p className="text-sm font-medium text-success opacity-80 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Delivered</p>
            <p className="mt-2 font-display text-3xl font-bold text-success">{filtered.length}</p>
          </div>
          <div className="rounded-2xl border border-warning/20 bg-gradient-to-br from-warning/15 to-warning/5 p-5">
            <p className="text-sm font-medium text-warning opacity-80 flex items-center gap-1"><Clock className="h-4 w-4" /> Pending COD</p>
            <p className="mt-2 font-display text-3xl font-bold text-warning">{codCount}</p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                range === r.key ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader variant="card" count={3} />
        ) : !filtered.length ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-white/60 px-5 py-12 text-center">
            <div>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Package className="h-8 w-8" weight="duotone" />
              </span>
              <h3 className="mt-5 text-xl font-bold">No deliveries yet</h3>
              <p className="mt-2 text-muted-foreground">Completed deliveries will show your earnings here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((o) => (
              <div key={o._id} className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{o.restaurantId?.name || o.restaurant?.name || 'Restaurant'}</p>
                  <p className="text-xs text-muted-foreground">Order #{o._id?.slice(-8).toUpperCase()} · {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">{formatCurrency(o.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.paymentMethod === 'Cash on Delivery'
                      ? (o.paymentStatus === 'Paid' ? 'COD collected' : 'COD pending')
                      : 'Online'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default DeliveryEarningsPage
