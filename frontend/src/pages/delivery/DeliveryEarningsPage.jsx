import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { formatCurrency } from '../../utils/formatCurrency'
import { notify } from '../../utils/toast'
import { fetchMyDeliveries } from '../../redux/deliverySlice'
import Loader from '../../components/common/Loader'
import {
  CurrencyDollar, Package, CheckCircle, Clock, Calendar,
  Storefront, ArrowRight, ChartBar,
} from '../../utils/icons'

const RANGES = [
  { key: '7d', label: '7 Days' },
  { key: '30d', label: '30 Days' },
  { key: 'all', label: 'All Time' },
]

function DeliveryEarningsPage() {
  const dispatch = useDispatch()
  const { myDeliveries, loading } = useSelector((state) => state.delivery)
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
    return completed.filter((o) => new Date(o.createdAt).getTime() >= now - cutoff)
  }, [completed, range, now])

  const totalEarnings = filtered.reduce((sum, o) => sum + Math.round((Number(o.totalAmount) || 0) * 0.1), 0)
  const totalOrders = filtered.length
  const codPending = filtered.filter((o) => o.paymentMethod === 'Cash on Delivery' && o.paymentStatus !== 'Paid').length
  const avgEarnings = totalOrders > 0 ? Math.round(totalEarnings / totalOrders) : 0

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach((o) => {
      const date = new Date(o.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
      if (!groups[date]) groups[date] = []
      groups[date].push(o)
    })
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b) - new Date(a)
    )
  }, [filtered])

  const weeklyBars = useMemo(() => {
    const bars = []
    const now = Date.now()
    for (let w = 3; w >= 0; w--) {
      const start = now - (w + 1) * 7 * 86400000
      const end = now - w * 7 * 86400000
      const weekEarnings = completed
        .filter((o) => {
          const t = new Date(o.createdAt).getTime()
          return t >= start && t < end
        })
        .reduce((sum, o) => sum + Math.round((Number(o.totalAmount) || 0) * 0.1), 0)
      bars.push({
        label: `W${4 - w}`,
        value: weekEarnings,
      })
    }
    return bars
  }, [completed])

  const maxBar = Math.max(...weeklyBars.map((b) => b.value), 1)

  if (loading) return <Loader variant="page" />

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B2838] via-[#1E3A5F] to-[#0F172A]">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#4CAF50]/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#FC8019]/10 blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-8 text-white">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#4CAF50] flex items-center justify-center">
                  <CurrencyDollar className="h-5 w-5" weight="fill" />
                </div>
                <span className="text-[#4CAF50] text-sm font-bold tracking-wider uppercase">FoodHub Earnings</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{formatCurrency(totalEarnings)}</h1>
              <p className="text-white/50 text-sm md:text-base">Total earnings from {totalOrders} deliveries</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-[11px] text-white/40">Orders</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(avgEarnings)}</p>
                <p className="text-[11px] text-white/40">Avg/Order</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{codPending}</p>
                <p className="text-[11px] text-white/40">COD Due</p>
              </div>
            </div>
          </div>

          {/* Mini bar chart */}
          <div className="mt-6 flex items-end gap-2 h-16">
            {weeklyBars.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-white/10 rounded-md overflow-hidden" style={{ height: '40px' }}>
                  <div
                    className="w-full bg-[#FC8019] rounded-md transition-all"
                    style={{ height: `${(bar.value / maxBar) * 100}%`, minHeight: bar.value > 0 ? '4px' : '0' }}
                  />
                </div>
                <span className="text-[9px] text-white/30 font-medium">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6">
        {/* Range selector */}
        <div className="mb-5">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition-all ${
                  range === r.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction history */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Transaction History</p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Package className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No earnings yet</h3>
            <p className="text-sm text-gray-500">Complete deliveries to see your earnings here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([date, orders]) => {
              const dayTotal = orders.reduce((sum, o) => sum + Math.round((Number(o.totalAmount) || 0) * 0.1), 0)
              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-700">{date}</p>
                    <p className="text-xs font-bold text-green-600">+{formatCurrency(dayTotal)}</p>
                  </div>
                  <div className="space-y-2">
                    {orders.map((o) => {
                      const earning = Math.round((Number(o.totalAmount) || 0) * 0.1)
                      return (
                        <motion.div
                          key={o._id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="bg-white rounded-xl p-4 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {o.restaurantId?.name || o.restaurant?.name || 'Restaurant'}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                #{o._id?.slice(-6).toUpperCase()} · {new Date(o.createdAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-sm font-bold text-green-600">+{formatCurrency(earning)}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              {o.paymentMethod === 'Cash on Delivery'
                                ? (o.paymentStatus === 'Paid' ? 'collected' : 'COD pending')
                                : 'online pay'}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryEarningsPage
