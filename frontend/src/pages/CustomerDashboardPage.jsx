import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { useAuth } from '../hooks/useAuth'
import {
  Calendar,
  CaretRight,
  ClipboardText,
  Heart,
  ShoppingCart,
  Storefront,
  User,
} from '../utils/icons'

function CustomerDashboardPage() {
  const { user } = useAuth()
  const { items } = useSelector((state) => state.cart)

  const quickLinks = [
    {
      to: '/orders',
      label: 'My Orders',
      description: 'Track active orders and view order history.',
      icon: ClipboardText,
    },
    {
      to: '/reservations',
      label: 'Reservations',
      description: 'Manage your upcoming dine-out bookings.',
      icon: Calendar,
    },
    {
      to: '/cart',
      label: 'Cart',
      description: `${items.length} item${items.length === 1 ? '' : 's'} ready for checkout.`,
      icon: ShoppingCart,
    },
    {
      to: '/profile',
      label: 'Profile',
      description: 'Update your account details and preferences.',
      icon: User,
    },
  ]

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <p className="text-sm font-semibold text-primary mb-2">Customer Panel</p>
        <h1 className="font-display text-3xl md:text-4xl mb-2">
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Jump back into your orders, reservations, cart, and account from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_0.8fr] gap-6">
        <section className="grid sm:grid-cols-2 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon

            return (
              <Link
                key={item.to}
                to={item.to}
                className="group bg-white border border-border rounded-[var(--radius-lg)] p-5 hover:border-primary/40 hover:shadow-[var(--shadow-card)] transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="w-11 h-11 rounded-[var(--radius-md)] bg-primary-light text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" weight="duotone" />
                  </span>
                  <CaretRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h2 className="text-lg font-semibold mt-4 mb-1">{item.label}</h2>
                <p className="text-sm text-muted-foreground leading-6">{item.description}</p>
              </Link>
            )
          })}
        </section>

        <aside className="bg-surface-muted rounded-[var(--radius-lg)] p-6">
          <Heart className="w-10 h-10 text-primary mb-4" weight="duotone" />
          <h2 className="text-xl font-semibold mb-2">Hungry for something new?</h2>
          <p className="text-sm text-muted-foreground leading-6 mb-5">
            Explore nearby restaurants, discover popular dishes, and reserve a table when you want to dine out.
          </p>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            <Storefront className="w-4 h-4" />
            Browse Restaurants
          </Link>
        </aside>
      </div>
    </motion.div>
  )
}

export default CustomerDashboardPage
