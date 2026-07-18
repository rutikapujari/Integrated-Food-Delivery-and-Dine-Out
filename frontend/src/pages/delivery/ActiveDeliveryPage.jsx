import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '../../utils/formatCurrency'
import { notify } from '../../utils/toast'
import { ORDER_STATUS_LABELS } from '../../utils/constants'
import {
  fetchMyDeliveries,
  updateDeliveryStatus,
  updateDeliveryPayment,
} from '../../redux/deliverySlice'
import Loader from '../../components/common/Loader'
import {
  Truck, MapPin, CurrencyDollar, Storefront, Phone, Package,
  Clock, CheckCircle, ArrowRight, Crosshair, List,
} from '../../utils/icons'

const STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: Clock },
  { key: 'out_for_delivery', label: 'Picked Up', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package },
]

const STATUS_MAP = {
  confirmed: { color: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-50', label: 'Order Confirmed' },
  preparing: { color: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Being Prepared' },
  out_for_delivery: { color: 'bg-[#FC8019]', text: 'text-[#FC8019]', bg: 'bg-orange-50', label: 'Out for Delivery' },
  delivered: { color: 'bg-green-500', text: 'text-green-600', bg: 'bg-green-50', label: 'Delivered' },
}

function ActiveDeliveryPage() {
  const dispatch = useDispatch()
  const { myDeliveries, loading, actionLoading } = useSelector((state) => state.delivery)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    dispatch(fetchMyDeliveries()).unwrap().catch((e) => notify.error(e || 'Failed to load'))
  }, [dispatch])

  const active = myDeliveries.filter((o) => !['delivered', 'cancelled'].includes(o.status))
  const completed = myDeliveries.filter((o) => o.status === 'delivered')

  const nextAction = (status) => {
    if (status === 'confirmed' || status === 'preparing') return 'out_for_delivery'
    if (status === 'out_for_delivery') return 'delivered'
    return null
  }

  const handleStatus = async (id, status) => {
    const result = await dispatch(updateDeliveryStatus({ orderId: id, status }))
    if (updateDeliveryStatus.fulfilled.match(result)) {
      notify.success(`Order ${ORDER_STATUS_LABELS[status]?.toLowerCase()}`)
    } else {
      notify.error(result.payload || 'Failed to update')
    }
  }

  const handleCollect = async (id) => {
    const result = await dispatch(updateDeliveryPayment({ orderId: id, paymentStatus: 'Paid' }))
    if (updateDeliveryPayment.fulfilled.match(result)) {
      notify.success('Cash collected successfully')
    } else {
      notify.error(result.payload || 'Failed to collect')
    }
  }

  const openNavigation = (address) => {
    const encoded = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, '_blank')
  }

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
                <div className="h-10 w-10 rounded-xl bg-[#FC8019] flex items-center justify-center">
                  <Truck className="h-5 w-5" weight="fill" />
                </div>
                <span className="text-[#FC8019] text-sm font-bold tracking-wider uppercase">FoodHub Delivery</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Deliveries</h1>
              <p className="text-white/50 text-sm md:text-base">Track your active orders and completed deliveries</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{active.length}</p>
                <p className="text-[11px] text-white/40">Active</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold">{completed.length}</p>
                <p className="text-[11px] text-white/40">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6">
        {/* Active deliveries */}
        {active.length === 0 && completed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Truck className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No deliveries yet</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Head to Available orders and claim one to start earning!
            </p>
            <Link
              to="/delivery/available"
              className="mt-4 px-5 py-2.5 bg-[#EA580C] text-white rounded-xl text-sm font-bold active:scale-[0.98] transition-transform"
            >
              Browse Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {active.map((o, i) => {
                const stepIndex = STEPS.findIndex((s) => s.key === o.status)
                const next = nextAction(o.status)
                const earnings = Math.round((Number(o.totalAmount) || 0) * 0.1)
                const statusInfo = STATUS_MAP[o.status] || STATUS_MAP.confirmed
                const isExpanded = expandedId === o._id
                const customerPhone = o.customerId?.phone || o.phone

                return (
                  <motion.div
                    key={o._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all overflow-hidden"
                  >
                    {/* Status bar */}
                    <div className={`${statusInfo.color} h-1.5`} />

                    <div className="p-5">
                      {/* Restaurant + status header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-[#FFF3E0] flex items-center justify-center shrink-0">
                            <Storefront className="h-6 w-6 text-[#FC8019]" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {o.restaurantId?.name || o.restaurant?.name || 'Restaurant'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              #{o._id?.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${statusInfo.bg} ${statusInfo.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.color}`} />
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Progress steps */}
                      <div className="flex items-center gap-1 mb-5 px-1">
                        {STEPS.map((s, idx) => (
                          <div key={s.key} className="flex-1 flex flex-col items-center">
                            <div className="flex items-center w-full">
                              <div className={`h-2.5 flex-1 rounded-full transition-all ${
                                idx <= stepIndex ? statusInfo.color : 'bg-gray-200'
                              }`} />
                            </div>
                            <span className={`text-[10px] mt-1.5 font-medium ${
                              idx <= stepIndex ? 'text-gray-700 font-semibold' : 'text-gray-300'
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery address */}
                      <div
                        className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl mb-3 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => openNavigation(o.deliveryAddress)}
                      >
                        <div className="h-10 w-10 rounded-lg bg-[#FC8019]/10 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-[#FC8019]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-medium uppercase">Delivery Address</p>
                          <p className="text-xs text-gray-700 font-medium line-clamp-1 mt-0.5">{o.deliveryAddress}</p>
                        </div>
                        <Crosshair className="w-4 h-4 text-[#FC8019] shrink-0" />
                      </div>

                      {/* Items */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        {o.items?.slice(0, 4).map((item, idx) => (
                          <span key={idx} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                            {item.quantity}x {item.name || item.menuItemId?.name || 'Item'}
                          </span>
                        ))}
                        {o.items?.length > 4 && (
                          <span className="text-[11px] text-gray-400 font-medium">+{o.items.length - 4} more</span>
                        )}
                      </div>

                      {/* Customer + payment info row */}
                      <div className="flex items-center justify-between mb-4">
                        {customerPhone && (
                          <a
                            href={`tel:${customerPhone}`}
                            className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3.5 py-2.5 hover:bg-gray-100 transition-colors"
                          >
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                              <Phone className="w-4 h-4 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400">Customer</p>
                              <p className="text-xs font-semibold text-gray-700">{customerPhone}</p>
                            </div>
                          </a>
                        )}
                        <div className="flex items-center gap-2 ml-auto">
                          {o.paymentMethod === 'Cash on Delivery' && (
                            <span className="text-[11px] font-bold bg-amber-50 text-amber-600 px-3 py-2 rounded-xl border border-amber-100">
                              COD · {formatCurrency(o.totalAmount)}
                            </span>
                          )}
                          <div className="bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                            <p className="text-[10px] text-green-600 font-medium">You earn</p>
                            <p className="text-sm font-bold text-green-700">{formatCurrency(earnings)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2">
                        {next && (
                          <button
                            disabled={actionLoading}
                            onClick={() => handleStatus(o._id, next)}
                            className="flex-1 flex items-center justify-center gap-2 bg-[#FC8019] text-white py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform disabled:opacity-50 shadow-[0_2px_8px_rgba(252,128,25,0.3)]"
                          >
                            {actionLoading ? (
                              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                {next === 'out_for_delivery' ? (
                                  <>
                                    <ArrowRight className="w-4 h-4" />
                                    Pick Up Order
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Mark Delivered
                                  </>
                                )}
                              </>
                            )}
                          </button>
                        )}

                        {customerPhone && (
                          <a
                            href={`tel:${customerPhone}`}
                            className="flex items-center justify-center w-12 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-500 transition-colors shrink-0"
                          >
                            <Phone className="w-5 h-5" />
                          </a>
                        )}
                      </div>

                      {/* COD collect */}
                      {o.paymentMethod === 'Cash on Delivery' && o.paymentStatus !== 'Paid' && o.status === 'delivered' && (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleCollect(o._id)}
                          className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3.5 rounded-xl font-bold text-sm mt-2 active:scale-[0.98] transition-transform disabled:opacity-50 shadow-[0_2px_8px_rgba(34,197,94,0.3)]"
                        >
                          <CurrencyDollar className="w-4 h-4" />
                          Collect {formatCurrency(o.totalAmount)} Cash
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Completed section */}
        {completed.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Completed</p>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">{completed.length}</span>
            </div>
            <div className="space-y-2">
              {completed.slice(0, 8).map((o) => (
                <div
                  key={o._id}
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
                      <p className="text-[11px] text-gray-400">
                        #{o._id?.slice(-6).toUpperCase()} · {new Date(o.updatedAt || o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-bold text-green-600">+{formatCurrency(Math.round((Number(o.totalAmount) || 0) * 0.1))}</p>
                    <p className="text-[10px] text-gray-400">earned</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActiveDeliveryPage
