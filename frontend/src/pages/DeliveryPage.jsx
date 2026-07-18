import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { formatCurrency } from '../utils/formatCurrency'
import { notify } from '../utils/toast'
import {
  fetchMyDeliveries,
  fetchAvailableDeliveries,
} from '../redux/deliverySlice'
import Loader from '../components/common/Loader'
import DeliveryCard from '../components/delivery/DeliveryCard'
import {
  Truck,
  List,
  Clock,
  CurrencyDollar,
  Motorcycle,
  MapPin,
  Package,
  CaretUp,
} from '../utils/icons'

const TABS = [
  { key: 'mine', label: 'My Deliveries', icon: List,
    desc: 'Orders assigned to you' },
  { key: 'available', label: 'Available', icon: Truck,
    desc: 'Open orders to claim' },
  { key: 'history', label: 'History', icon: Clock,
    desc: 'Completed deliveries' },
]

const STAT_ICONS = {
  active: Motorcycle,
  done: Package,
  earn: CurrencyDollar,
}

function DeliveryPage() {
  const dispatch = useDispatch()
  const { myDeliveries, available, loading, error } = useSelector((state) => state.delivery)
  const [tab, setTab] = useState('mine')

  useEffect(() => {
    if (tab === 'available') {
      dispatch(fetchAvailableDeliveries()).unwrap().catch((e) => notify.error(e || 'Failed to load'))
    } else {
      dispatch(fetchMyDeliveries()).unwrap().catch((e) => notify.error(e || 'Failed to load'))
    }
  }, [dispatch, tab])

  const activeOrders = myDeliveries.filter(
    (o) => !['delivered', 'cancelled'].includes(o.status)
  )
  const historyOrders = myDeliveries.filter((o) =>
    ['delivered', 'cancelled'].includes(o.status)
  )
  const earnings = historyOrders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0)

  const stats = [
    { key: 'active', label: 'Active Deliveries', value: activeOrders.length, tone: 'primary' },
    { key: 'done', label: 'Completed', value: historyOrders.length, tone: 'success' },
    { key: 'earn', label: 'Total Earnings', value: formatCurrency(earnings), tone: 'accent' },
  ]

  const toneClass = {
    primary: 'from-primary/15 to-primary/5 text-primary border-primary/20',
    success: 'from-success/15 to-success/5 text-success border-success/20',
    accent: 'from-accent/15 to-accent/5 text-accent border-accent/20',
  }

  const renderList = (orders, mode) => {
    if (loading) return <Loader variant="card" count={3} />
    if (!orders.length) {
      return (
        <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-white/60 px-5 py-12 text-center">
          <div>
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <Truck className="h-8 w-8" weight="duotone" />
            </span>
            <h3 className="mt-5 text-xl font-bold">No deliveries here</h3>
            <p className="mt-2 text-muted-foreground">
              {mode === 'available'
                ? 'No orders are available to claim right now.'
                : mode === 'history'
                ? 'Your completed deliveries will appear here.'
                : 'You have no active deliveries.'}
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {orders.map((o) => (
          <DeliveryCard key={o._id} order={o} mode={mode} />
        ))}
      </div>
    )
  }

  const activeTab = TABS.find((t) => t.key === tab)

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 md:px-8 py-10 text-white">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-primary">
                <Truck className="h-8 w-8" weight="duotone" />
              </span>
              <div>
                <h1 className="font-display text-3xl">Delivery Panel</h1>
                <p className="text-slate-300 text-sm">Manage, claim and track your deliveries</p>
              </div>
            </div>
            {available.length > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-primary">
                <MapPin className="h-4 w-4" />
                {available.length} order{available.length > 1 ? 's' : ''} ready to claim
              </div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => {
              const Icon = STAT_ICONS[s.key]
              return (
                <div
                  key={s.key}
                  className={`rounded-2xl border bg-gradient-to-br p-5 ${toneClass[s.tone]}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium opacity-80">{s.label}</p>
                    <Icon className="h-5 w-5" weight="duotone" />
                  </div>
                  <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-destructive">{error}</div>
        )}

        <div className="mb-6 grid grid-cols-3 gap-3">
          {TABS.map((t) => {
            const Icon = t.icon
            const isActive = tab === t.key
            const count = t.key === 'available' ? available.length : t.key === 'mine' ? activeOrders.length : historyOrders.length
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`group flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all ${
                  isActive
                    ? 'border-primary bg-primary-light shadow-sm'
                    : 'border-border bg-white hover:border-primary/40'
                }`}
              >
                <span className={`flex items-center gap-2 text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                  <Icon className="h-5 w-5" weight="duotone" />
                  {t.label}
                  {count > 0 && (
                    <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-primary text-white' : 'bg-surface-muted text-muted-foreground'}`}>
                      {count}
                    </span>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">{t.desc}</span>
              </button>
            )
          })}
        </div>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CaretUp className="h-4 w-4" weight="bold" />
          Showing <span className="font-semibold text-foreground">{activeTab?.label}</span>
        </div>

        {tab === 'mine' && renderList(activeOrders, 'mine')}
        {tab === 'available' && renderList(available, 'available')}
        {tab === 'history' && renderList(historyOrders, 'history')}
      </div>
    </motion.div>
  )
}

export default DeliveryPage
