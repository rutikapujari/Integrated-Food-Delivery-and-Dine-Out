import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { fetchOrders } from '../../redux/orderSlice'
import { restaurantService } from '../../services/restaurantService'
import { fetchMenuItems } from '../../redux/menuSlice'
import Loader from '../../components/common/Loader'
import { Storefront, ClipboardText, List, CurrencyDollar, CheckCircle } from '../../utils/icons'

function PartnerDashboardPage() {
  const dispatch = useDispatch()
  const { list: orders, loading: ordersLoading } = useSelector((state) => state.order)
  const { items: menuItems, loading: menuLoading } = useSelector((state) => state.menu)
  const [restaurant, setRestaurant] = useState(null)

  useEffect(() => {
    dispatch(fetchOrders())
    dispatch(fetchMenuItems())
    restaurantService.getMine().then(({ data }) => setRestaurant(data.restaurants?.[0] || null)).catch(() => {})
  }, [dispatch])

  const pending = orders.filter((o) => ['pending', 'confirmed', 'preparing'].includes(o.status)).length
  const completed = orders.filter((o) => o.status === 'delivered').length
  const revenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + (Number(o.totalAmount) || 0), 0)
  const availableItems = menuItems.filter((i) => i.isAvailable).length

  const stats = [
    { label: 'Active Orders', value: pending, icon: ClipboardText, tone: 'primary' },
    { label: 'Completed', value: completed, icon: CheckCircle, tone: 'success' },
    { label: 'Revenue', value: `₹${revenue}`, icon: CurrencyDollar, tone: 'accent' },
    { label: 'Menu Items', value: `${availableItems}/${menuItems.length}`, icon: List, tone: 'warning' },
  ]
  const toneClass = {
    primary: 'from-primary/15 to-primary/5 text-primary border-primary/20',
    success: 'from-success/15 to-success/5 text-success border-success/20',
    accent: 'from-accent/15 to-accent/5 text-accent border-accent/20',
    warning: 'from-warning/15 to-warning/5 text-warning border-warning/20',
  }

  if (ordersLoading || menuLoading) return <Loader variant="page" />

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Storefront className="h-8 w-8" weight="duotone" />
          </span>
          <div>
            <h1 className="font-display text-3xl">{restaurant?.name || 'Partner Dashboard'}</h1>
            <p className="text-muted-foreground text-sm">Manage your restaurant, menu and orders</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className={`rounded-2xl border bg-gradient-to-br p-5 ${toneClass[s.tone]}`}>
                <Icon className="h-5 w-5" weight="duotone" />
                <p className="mt-2 font-display text-2xl font-bold">{s.value}</p>
                <p className="text-sm font-medium opacity-80">{s.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Recent Orders</h2>
              <Link to="/partner/orders" className="text-sm text-primary font-semibold hover:underline">View all</Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((o) => (
                  <div key={o._id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">Order #{o._id?.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground capitalize">{o.status.replace('_', ' ')}</p>
                    </div>
                    <span className="text-sm font-semibold">₹{o.totalAmount}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Menu</h2>
              <Link to="/partner/menu" className="text-sm text-primary font-semibold hover:underline">Manage</Link>
            </div>
            {menuItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No menu items yet. Add your first dish.</p>
            ) : (
              <div className="space-y-3">
                {menuItems.slice(0, 5).map((i) => (
                  <div key={i._id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.category}</p>
                    </div>
                    <span className={`text-xs font-semibold ${i.isAvailable ? 'text-success' : 'text-warning'}`}>
                      {i.isAvailable ? 'Available' : 'Hidden'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default PartnerDashboardPage
