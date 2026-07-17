import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { useAuth } from '../hooks/useAuth'
import { fetchOrders } from '../redux/orderSlice'
import { fetchRestaurants } from '../redux/restaurantSlice'
import { fetchMenuItems } from '../redux/menuSlice'
import { formatCurrency } from '../utils/formatCurrency'
import { ORDER_STATUS_LABELS } from '../utils/constants'
import RestaurantCard from '../components/restaurant/RestaurantCard'
import MenuCard from '../components/menu/MenuCard'
import { Calendar, CaretRight, ClipboardText, Clock, MapPin, Motorcycle, ShoppingCart, Storefront } from '../utils/icons'

const activeStatuses = new Set(['pending', 'confirmed', 'preparing', 'out_for_delivery'])

function CustomerDashboardPage() {
  const dispatch = useDispatch()
  const { user } = useAuth()
  const { items: cartItems, total: cartTotal } = useSelector((state) => state.cart)
  const { list: orders, loading: ordersLoading } = useSelector((state) => state.order)
  const { list: restaurants, loading: restaurantsLoading } = useSelector((state) => state.restaurant)
  const { items: menuItems, loading: menuLoading } = useSelector((state) => state.menu)

  useEffect(() => {
    dispatch(fetchOrders())
    dispatch(fetchRestaurants({ page: 1, limit: 4 }))
    dispatch(fetchMenuItems())
  }, [dispatch])

  const activeOrder = useMemo(() => orders.find((order) => activeStatuses.has(order.status)), [orders])
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'there'
  const orderItemCount = activeOrder?.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0
  const quickLinks = [
    { to: '/orders', label: 'Orders', description: 'Track and reorder', icon: ClipboardText },
    { to: '/reservations', label: 'Dine-out', description: 'Book a table', icon: Calendar },
    { to: '/cart', label: 'Cart', description: `${cartItems.length} item${cartItems.length === 1 ? '' : 's'} added`, icon: ShoppingCart },
  ]

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-[#fffaf5]">
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Good to see you</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">Hey, {firstName}</h1>
            <p className="mt-2 text-muted-foreground">Your food, orders, and table plans in one place.</p>
          </div>
          <Link to="/restaurants" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"><Storefront className="h-4 w-4" weight="fill" />Explore food</Link>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
          <div className="rounded-lg border border-border bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-semibold text-primary">{activeOrder ? 'Your live order' : 'Ready when you are'}</p><h2 className="mt-1 text-xl font-bold text-foreground">{activeOrder ? (activeOrder.restaurantId?.name || activeOrder.restaurantName || 'Your order is being prepared') : 'What would you like today?'}</h2></div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">{activeOrder ? <Motorcycle className="h-5 w-5" weight="fill" /> : <ShoppingCart className="h-5 w-5" weight="fill" />}</span>
            </div>
            {ordersLoading ? <div className="mt-6 h-16 animate-pulse rounded bg-surface-muted" /> : activeOrder ? (
              <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm text-muted-foreground"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-primary"><Clock className="h-4 w-4" /></span><span><strong className="block text-foreground">{ORDER_STATUS_LABELS[activeOrder.status] || activeOrder.status}</strong>{orderItemCount} item{orderItemCount === 1 ? '' : 's'} · {formatCurrency(activeOrder.totalAmount)}</span></div>
                <Link to={`/orders/${activeOrder._id}`} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:text-primary-hover">Track order <CaretRight className="h-4 w-4" weight="bold" /></Link>
              </div>
            ) : <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5"><Link to="/menu" className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover">Browse menu</Link><Link to="/orders" className="inline-flex h-10 items-center text-sm font-semibold text-foreground hover:text-primary">View past orders</Link></div>}
          </div>

          <Link to="/cart" className="group rounded-lg border border-border bg-surface-muted p-5 transition-colors hover:border-primary/30 hover:bg-primary-light sm:p-6">
            <div className="flex items-start justify-between"><ShoppingCart className="h-6 w-6 text-primary" weight="duotone" /><CaretRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" weight="bold" /></div>
            <p className="mt-6 text-sm font-semibold text-muted-foreground">Your cart</p><p className="mt-1 text-2xl font-bold text-foreground">{cartItems.length} item{cartItems.length === 1 ? '' : 's'}</p><p className="mt-1 text-sm text-muted-foreground">{cartItems.length ? formatCurrency(cartTotal) : 'Add something tasty'}</p>
          </Link>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Popular on FoodHub</p><h2 className="mt-1 text-2xl font-bold text-foreground">Order again, or try something new</h2></div><Link to="/menu" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">View menu <CaretRight className="h-4 w-4" weight="bold" /></Link></div>
          {menuLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-72 animate-pulse rounded-lg bg-slate-100" />)}</div> : menuItems.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{menuItems.slice(0, 4).map((item) => <MenuCard key={item._id} item={item} />)}</div> : null}
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Discover nearby</p><h2 className="mt-1 text-2xl font-bold text-foreground">Popular restaurants</h2></div><Link to="/restaurants" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary-hover">See all <CaretRight className="h-4 w-4" weight="bold" /></Link></div>
          {restaurantsLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((item) => <div key={item} className="h-72 animate-pulse rounded-lg bg-slate-100" />)}</div> : restaurants.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{restaurants.slice(0, 4).map((restaurant) => <RestaurantCard key={restaurant._id} restaurant={restaurant} />)}</div> : <div className="flex min-h-36 flex-col items-center justify-center border border-dashed border-border bg-white px-4 text-center"><MapPin className="h-6 w-6 text-primary" weight="duotone" /><p className="mt-2 font-semibold text-foreground">Restaurants will appear here</p><Link to="/restaurants" className="mt-1 text-sm font-semibold text-primary hover:underline">Browse all restaurants</Link></div>}
        </section>

        <section className="mt-8 flex flex-col gap-3 md:flex-row">
          {quickLinks.map((item) => {
            const Icon = item.icon
            return <Link key={item.to} to={item.to} className="group flex flex-1 items-center gap-4 rounded-lg border border-border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card)]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary"><Icon className="h-5 w-5" weight="duotone" /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-foreground">{item.label}</span><span className="block truncate text-sm text-muted-foreground">{item.description}</span></span><CaretRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" weight="bold" /></Link>
          })}
        </section>
      </div>
    </motion.div>
  )
}

export default CustomerDashboardPage
