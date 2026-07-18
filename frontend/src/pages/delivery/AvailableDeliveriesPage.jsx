import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '../../utils/formatCurrency'
import { notify } from '../../utils/toast'
import {
  fetchAvailableDeliveries,
  claimDelivery,
} from '../../redux/deliverySlice'
import Loader from '../../components/common/Loader'
import {
  Truck, MapPin, CurrencyDollar, Storefront, Package, Clock,
  ArrowRight, Crosshair, Timer, Funnel,
} from '../../utils/icons'

const SORTS = [
  { key: 'newest', label: 'Latest', icon: Clock },
  { key: 'highest', label: 'High Pay', icon: CurrencyDollar },
  { key: 'nearest', label: 'Nearest', icon: MapPin },
]

function AvailableDeliveriesPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { available, loading, actionLoading } = useSelector((state) => state.delivery)
  const [sort, setSort] = useState('newest')
  const [claimingId, setClaimingId] = useState(null)

  useEffect(() => {
    dispatch(fetchAvailableDeliveries()).unwrap().catch((e) => notify.error(e || 'Failed to load'))
  }, [dispatch])

  const handleClaim = async (id) => {
    setClaimingId(id)
    const result = await dispatch(claimDelivery(id))
    if (claimDelivery.fulfilled.match(result)) {
      notify.success('Order claimed!')
      navigate('/delivery/active')
    } else {
      notify.error(result.payload || 'Failed to claim')
    }
    setClaimingId(null)
  }

  const sorted = [...available].sort((a, b) => {
    if (sort === 'highest') return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0)
    if (sort === 'nearest') return new Date(a.createdAt) - new Date(b.createdAt)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  if (loading) return <Loader variant="page" />

  return (
    <div className="min-h-full bg-[#F5F5F5]">
      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B2838] via-[#1E3A5F] to-[#0F172A]">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#FC8019]/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#FF6B35]/10 blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-8 text-white">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-10 w-10 rounded-xl bg-[#EA580C] flex items-center justify-center">
                  <Package className="h-5 w-5" weight="fill" />
                </div>
                <span className="text-[#EA580C] text-sm font-bold tracking-wider uppercase">FoodHub Delivery</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Available Orders</h1>
              <p className="text-white/50 text-sm md:text-base">Claim orders nearby and start earning</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{available.length}</p>
                <p className="text-[11px] text-white/40">Orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6">
        {/* Sort pills with icons */}
        <div className="mb-5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {SORTS.map((s) => {
              const Icon = s.icon
              return (
                <button
                  key={s.key}
                  onClick={() => setSort(s.key)}
                  className={`shrink-0 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all ${
                    sort === s.key
                      ? 'bg-[#1B2838] text-white shadow-lg'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900">
            {sort === 'newest' ? 'Latest' : sort === 'highest' ? 'High Pay' : 'Nearest'}
            <span className="text-gray-400 font-normal ml-1">({sorted.length})</span>
          </p>
          <button
            onClick={() => dispatch(fetchAvailableDeliveries())}
            className="flex items-center gap-1.5 text-xs font-bold text-[#EA580C] hover:text-[#C2410C] transition-colors"
          >
            <Funnel className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {/* Order cards */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No orders available</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              New orders appear here in real time. Stay online to receive them!
            </p>
            <button
              onClick={() => dispatch(fetchAvailableDeliveries())}
              className="mt-4 px-5 py-2.5 bg-[#EA580C] text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {sorted.map((o, i) => {
                const earnings = Math.round((Number(o.totalAmount) || 0) * 0.1)
                const timeAgo = getTimeAgo(o.createdAt)
                const isClaiming = claimingId === o._id
                const itemCount = o.items?.length || 0
                const itemNames = o.items?.slice(0, 2).map((item) => item.name || item.menuItemId?.name || 'Item').join(', ')
                const isCOD = o.paymentMethod === 'Cash on Delivery'

                return (
                  <motion.div
                    key={o._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                    className="h-full"
                  >
                    <div className="flex flex-col h-[420px] bg-white rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5">
                      {/* Header with gradient */}
                      <div className="bg-gradient-to-r from-[#1B2838] to-[#2A3F55] p-4 text-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                              <Storefront className="h-5.5 w-5.5 text-[#FC8019]" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">
                                {o.restaurantId?.name || o.restaurant?.name || 'Restaurant'}
                              </p>
                              <p className="text-[11px] text-white/40 mt-0.5">
                                #{o._id?.slice(-6).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isCOD && (
                              <span className="text-[11px] font-bold bg-amber-400/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30">
                                COD · {formatCurrency(o.totalAmount)}
                              </span>
                            )}
                            <span className="text-[11px] text-white/50">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-400/30">
                            <p className="text-[10px] text-green-300 font-medium">You earn</p>
                            <p className="text-base font-bold text-green-300">{formatCurrency(earnings)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col flex-1 p-4">
                        {/* Pickup → Drop flow */}
                        <div className="mb-4">
                          <div className="flex items-start gap-3">
                            <div className="flex flex-col items-center pt-0.5">
                              <div className="h-3 w-3 rounded-full border-2 border-[#EA580C] bg-white" />
                              <div className="w-0.5 h-8 bg-gray-200" />
                              <div className="h-3 w-3 rounded-full bg-[#EA580C]" />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Pickup</p>
                                <p className="text-xs text-gray-700 font-semibold mt-0.5">{o.restaurantId?.name || o.restaurant?.name || 'Restaurant'}</p>
                              </div>
                              <div className="border-t border-dashed border-gray-200" />
                              <div>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Drop</p>
                                <p className="text-xs text-gray-700 font-semibold mt-0.5 line-clamp-1">{o.deliveryAddress}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Info chips */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[11px] text-gray-600 font-medium">{timeAgo}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                            <Timer className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-[11px] text-gray-600 font-medium">~20 min</span>
                          </div>
                        </div>

                        {/* Item preview */}
                        {itemNames && (
                          <p className="text-[11px] text-gray-400 mb-3 line-clamp-1">
                            {itemNames}{itemCount > 2 ? ` +${itemCount - 2} more` : ''}
                          </p>
                        )}

                        {/* Accept button */}
                        <div className="mt-auto">
                          <button
                            disabled={actionLoading || isClaiming}
                            onClick={() => handleClaim(o._id)}
                            className="w-full flex items-center justify-center gap-2 bg-[#EA580C] text-white py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-[0_2px_8px_rgba(234,88,12,0.3)] hover:bg-[#C2410C]"
                          >
                            {isClaiming ? (
                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                Accept Order
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default AvailableDeliveriesPage
