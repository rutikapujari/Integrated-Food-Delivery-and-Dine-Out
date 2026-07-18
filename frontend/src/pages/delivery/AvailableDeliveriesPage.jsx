import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { formatCurrency } from '../../utils/formatCurrency'
import { notify } from '../../utils/toast'
import {
  fetchAvailableDeliveries,
  claimDelivery,
} from '../../redux/deliverySlice'
import Loader from '../../components/common/Loader'
import { Truck, MapPin, CurrencyDollar, Storefront, Package, Funnel } from '../../utils/icons'

const SORTS = [
  { key: 'nearest', label: 'Nearest' },
  { key: 'highest', label: 'Highest Pay' },
  { key: 'newest', label: 'Newest' },
]

function AvailableDeliveriesPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { available, loading, actionLoading, error } = useSelector((state) => state.delivery)
  const [sort, setSort] = useState('nearest')

  useEffect(() => {
    dispatch(fetchAvailableDeliveries()).unwrap().catch((e) => notify.error(e || 'Failed to load'))
  }, [dispatch])

  const handleClaim = async (id) => {
    const result = await dispatch(claimDelivery(id))
    if (claimDelivery.fulfilled.match(result)) {
      notify.success('Delivery claimed! Head to your active list.')
      navigate('/delivery/active')
    } else {
      notify.error(result.payload || 'Failed to claim')
    }
  }

  const sorted = [...available].sort((a, b) => {
    if (sort === 'highest') return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0)
    if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    return new Date(a.createdAt) - new Date(b.createdAt)
  })

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 md:px-8 py-8 text-white">
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-primary">
                <Truck className="h-8 w-8" weight="duotone" />
              </span>
              <div>
                <h1 className="font-display text-3xl">Available Orders</h1>
                <p className="text-slate-300 text-sm">Claim open deliveries near you</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-primary">
              <Package className="h-4 w-4" />
              {available.length} open
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="mb-6 flex items-center gap-2">
          <Funnel className="h-4 w-4 text-muted-foreground" />
          {SORTS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSort(s.key)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                sort === s.key ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader variant="card" count={4} />
        ) : !sorted.length ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-white/60 px-5 py-12 text-center">
            <div>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Truck className="h-8 w-8" weight="duotone" />
              </span>
              <h3 className="mt-5 text-xl font-bold">No orders to claim</h3>
              <p className="mt-2 text-muted-foreground">Check back soon — new orders appear here in real time.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {sorted.map((o) => (
              <div key={o._id} className="rounded-2xl border border-border bg-white p-5 shadow-[var(--shadow-card)]">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Storefront className="h-4 w-4 text-primary" />
                      {o.restaurantId?.name || o.restaurant?.name || 'Restaurant'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Order #{o._id?.slice(-8).toUpperCase()}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
                    {formatCurrency(o.totalAmount)}
                  </span>
                </div>

                <div className="border-t border-border pt-3 mb-3 space-y-1">
                  <p className="text-sm text-muted-foreground flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    {o.deliveryAddress}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {o.items?.map((i) => `${i.name || i.menuItemId?.name} x${i.quantity}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground">Pay: {formatCurrency(Math.round((Number(o.totalAmount) || 0) * 0.1))}</span>
                  {o.paymentMethod === 'Cash on Delivery' && (
                    <span className="text-xs font-semibold text-warning">COD</span>
                  )}
                </div>

                <button
                  disabled={actionLoading}
                  onClick={() => handleClaim(o._id)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  <CurrencyDollar className="h-5 w-5" />
                  {actionLoading ? 'Claiming...' : 'Claim Delivery'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default AvailableDeliveriesPage
