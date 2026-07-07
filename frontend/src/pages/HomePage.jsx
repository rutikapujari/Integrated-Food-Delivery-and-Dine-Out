import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../utils/motion'
import { fetchRestaurants } from '../redux/restaurantSlice'
import RestaurantList from '../components/restaurant/RestaurantList'
import Button from '../components/common/Button'
import AISuggestions from '../components/menu/AISuggestions'
import { Storefront, ArrowRight, Truck, Clock, CreditCard } from '../utils/icons'

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Get your food delivered hot and fresh in under 30 minutes by our dedicated delivery partners.',
  },
  {
    icon: Clock,
    title: 'Live Tracking',
    description: 'Track your order in real-time from restaurant to doorstep with live GPS updates.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple payment options including UPI, cards, and cash on delivery with secure checkout.',
  },
]

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="text-center p-8 bg-white border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-card)]"
    >
      <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </motion.div>
  )
}

function HomePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchRestaurants({ page: 1, limit: 8 }))
  }, [dispatch])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section className="relative min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary/80 to-primary-light/60" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center mix-blend-overlay opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-4 uppercase tracking-wider">
              Fine Dining &bull; Fast Delivery
            </span>
            <h1 className="font-display text-5xl md:text-7xl text-white leading-[0.95] mb-4">
              Delicious food,<br />delivered to your door
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-8 max-w-lg">
              Order from the best local restaurants with easy online ordering and live tracking.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button size="lg" icon={Storefront} onClick={() => navigate('/restaurants')}>
                Browse Restaurants
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate('/menu')}
              >
                Explore Menu
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h2 className="font-display text-3xl md:text-4xl text-center mb-4">Why FoodHub?</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            We make food ordering simple, fast, and delightful.
          </p>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </motion.div>
        </div>
      </section>

      <AISuggestions />

      <section className="py-20 bg-surface-bg">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl">Popular Restaurants</h2>
              <p className="text-muted-foreground mt-1">Top-rated places near you</p>
            </div>
            <Link
              to="/restaurants"
              className="text-primary font-semibold hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <RestaurantList limit={8} showPagination={false} />
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <h2 className="font-display text-3xl md:text-4xl text-white mb-4">Ready to order?</h2>
          <p className="text-white/80 mb-8 max-w-md mx-auto">
            Hungry? We&apos;ve got you covered. Browse restaurants and get food delivered in minutes.
          </p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/restaurants')}>
            Get Started
          </Button>
        </div>
      </section>
    </motion.div>
  )
}

export default HomePage
