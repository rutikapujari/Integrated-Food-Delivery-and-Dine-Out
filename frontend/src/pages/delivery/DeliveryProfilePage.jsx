import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatCurrency } from '../../utils/formatCurrency'
import { fetchMyDeliveries } from '../../redux/deliverySlice'
import { logoutUser } from '../../redux/authSlice'
import { courierLogout } from '../../redux/courierAuthSlice'
import { notify } from '../../utils/toast'
import {
  User, Motorcycle, Phone, Envelope, CheckCircle, Truck,
  SignOut, CaretRight, ShieldCheck, Star, Clock, Gear, Question,
  CreditCard, MapPin, Gift,
} from '../../utils/icons'

function DeliveryProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { myDeliveries } = useSelector((state) => state.delivery)

  useEffect(() => {
    dispatch(fetchMyDeliveries()).unwrap().catch(() => {})
  }, [dispatch])

  const completed = myDeliveries.filter((o) => o.status === 'delivered').length
  const totalEarnings = myDeliveries
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + Math.round((Number(o.totalAmount) || 0) * 0.1), 0)

  const handleLogout = async () => {
    await dispatch(courierLogout())
    notify.success('Signed out')
    navigate('/courier/login', { replace: true })
  }

  const accountItems = [
    { label: 'Vehicle Number', value: user?.vehicleNumber || 'Not added', icon: Motorcycle },
    { label: 'Phone', value: user?.phone || 'Not added', icon: Phone },
    { label: 'Email', value: user?.email, icon: Envelope },
  ]

  const settingsItems = [
    { label: 'Payment Settings', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Delivery Areas', icon: MapPin, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Refer & Earn', icon: Gift, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Help & Support', icon: Question, color: 'text-amber-500', bg: 'bg-amber-50' },
  ]

  return (
    <div className="min-h-full bg-[#F5F5F5] pb-24 md:pb-6">
      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B2838] via-[#1E3A5F] to-[#0F172A]">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#FC8019]/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#FF6B35]/10 blur-2xl" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-8 text-white">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-[#FC8019] flex items-center justify-center text-3xl font-bold shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full bg-green-500 border-2 border-[#1B2838] flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-white" weight="fill" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">{user?.name || 'Delivery Partner'}</h1>
                <p className="text-sm text-white/50">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full">
                    <Truck className="w-3 h-3 text-[#FC8019]" />
                    <span className="text-[11px] font-semibold">Courier Partner</span>
                  </div>
                  <div className="flex items-center gap-1 bg-green-500/20 px-2.5 py-1 rounded-full">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    <span className="text-[11px] font-semibold text-green-300">Active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{completed}</p>
                <p className="text-[11px] text-white/40">Delivered</p>
              </div>
              <div className="h-10 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                <p className="text-[11px] text-white/40">Earned</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 md:px-8 py-6">
        {/* Payout section */}
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] transition-all p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Available for Payout</p>
                <p className="text-xs text-gray-400">Weekly auto-transfer</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalEarnings)}</p>
              <button className="text-[11px] text-[#FC8019] font-bold mt-0.5">Withdraw</button>
            </div>
          </div>
        </div>

        {/* Account details */}
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden mb-4">
          <p className="px-5 pt-5 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Account Details
          </p>
          {accountItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className={`flex items-center justify-between px-5 py-4 ${
                  idx < accountItems.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Settings list */}
        <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden mb-4">
          <p className="px-5 pt-5 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Settings
          </p>
          {settingsItems.map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                idx < settingsItems.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
              </div>
              <CaretRight className="w-4 h-4 text-gray-300" />
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-white rounded-2xl py-4 text-red-500 font-bold text-sm shadow-[0_1px_4px_rgba(0,0,0,0.06)] active:scale-[0.98] transition-transform border border-red-100"
        >
          <SignOut className="w-5 h-5" />
          Sign Out
        </button>

        <p className="text-center text-[11px] text-gray-300 mt-6 mb-4">FoodHub Courier v1.0</p>
      </div>
    </div>
  )
}

export default DeliveryProfilePage
