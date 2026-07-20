import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { getSocket } from '../../socket/socket'
import { fetchMyDeliveries, fetchAvailableDeliveries } from '../../redux/deliverySlice'
import { notify } from '../../utils/toast'
import {
  List, MapPin, ChartBar, User, ArrowLeft, Truck, Bell, CheckCircle,
} from '../../utils/icons'

const NAV = [
  { to: '/delivery/active', label: 'Active', icon: List },
  { to: '/delivery/available', label: 'Orders', icon: MapPin },
  { to: '/delivery/earnings', label: 'Earnings', icon: ChartBar },
  { to: '/delivery/profile', label: 'Profile', icon: User },
]

function DeliveryLayout() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { user } = useSelector((state) => state.courierAuth)
  const { myDeliveries } = useSelector((state) => state.delivery)
  const [isOnline, setIsOnline] = useState(true)
  const activeCount = myDeliveries.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length

  useEffect(() => {
    dispatch(fetchMyDeliveries())
    dispatch(fetchAvailableDeliveries())
  }, [dispatch])

  useEffect(() => {
    const socket = getSocket()
    const handleOrderUpdate = () => {
      dispatch(fetchMyDeliveries())
      dispatch(fetchAvailableDeliveries())
    }
    socket.on('order:update', handleOrderUpdate)
    socket.on('order:assigned', handleOrderUpdate)
    return () => {
      socket.off('order:update', handleOrderUpdate)
      socket.off('order:assigned', handleOrderUpdate)
    }
  }, [dispatch])

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[72px] bg-[#1B2838] flex-col items-center py-5 z-50">
        <Link to="/" className="mb-6">
          <div className="h-10 w-10 rounded-xl bg-[#EA580C] flex items-center justify-center shadow-lg">
            <Truck className="h-5 w-5 text-white" weight="fill" />
          </div>
        </Link>

        <nav className="flex flex-col items-center gap-1 flex-1">
          {NAV.map((n) => {
            const Icon = n.icon
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `relative flex flex-col items-center gap-1 w-14 py-2.5 rounded-2xl text-[10px] font-semibold transition-all ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/40 hover:text-white/70'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 bg-white/10 rounded-2xl"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon className="w-5 h-5 relative z-10" weight={isActive ? 'fill' : 'bold'} />
                    <span className="relative z-10">{n.label}</span>
                    {n.to === '/delivery/active' && activeCount > 0 && (
                      <span className="absolute top-1.5 right-3 h-4 min-w-4 px-1 rounded-full bg-[#EA580C] text-[9px] font-bold flex items-center justify-center text-white relative z-10">
                        {activeCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto">
          <Link to="/" className="flex flex-col items-center gap-1 w-14 py-2.5 rounded-2xl text-[10px] font-medium text-white/30 hover:text-white/60 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 bg-[#1B2838] text-white md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#EA580C] flex items-center justify-center shadow-lg">
                <Truck className="h-4 w-4 text-white" weight="fill" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none tracking-wide">FOODHUB</p>
                <p className="text-[10px] text-white/40 leading-none mt-0.5">delivery partner</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="relative text-white/50 hover:text-white transition-colors p-1">
              <Bell className="w-5 h-5" />
              {activeCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-[#EA580C] text-[9px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsOnline(!isOnline)}
              className="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all"
            >
              <span className="relative flex h-2.5 w-2.5">
                {isOnline && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4CAF50] opacity-75" />
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isOnline ? 'bg-[#4CAF50]' : 'bg-white/20'}`} />
              </span>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile online banner */}
      <div className="md:hidden">
        <div
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
            isOnline
              ? 'bg-[#4CAF50]/10 text-[#4CAF50]'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isOnline && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4CAF50] opacity-60" />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${isOnline ? 'bg-[#4CAF50]' : 'bg-gray-400'}`} />
          </span>
          {isOnline ? 'You are online — accepting deliveries' : 'You are offline — tap to go online'}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 md:ml-[72px]">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 md:hidden safe-bottom">
        <div className="flex items-center justify-around h-16">
          {NAV.map((n) => {
            const Icon = n.icon
            return (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 py-1 px-4 relative transition-colors ${
                    isActive ? 'text-[#EA580C]' : 'text-gray-400'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute -top-px left-2 right-2 h-0.5 bg-[#EA580C] rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <div className="relative">
                      <Icon className="w-6 h-6" weight={isActive ? 'fill' : 'bold'} />
                      {n.to === '/delivery/active' && activeCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-[#EA580C] text-[9px] font-bold flex items-center justify-center text-white">
                          {activeCount}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold">{n.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default DeliveryLayout
