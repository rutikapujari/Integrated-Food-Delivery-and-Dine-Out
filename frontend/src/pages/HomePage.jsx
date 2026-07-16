import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../utils/motion'
import { fetchRestaurants } from '../redux/restaurantSlice'
import RestaurantList from '../components/restaurant/RestaurantList'
import Button from '../components/common/Button'
import AISuggestions from '../components/menu/AISuggestions'
import { Storefront, ArrowRight, Truck, Clock, CreditCard, MapPin, Motorcycle, Star, CaretRight } from '../utils/icons'

const quickCuisines = ['Biryani', 'Pizza', 'Burgers', 'Chinese', 'Desserts']

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
      className="text-center p-8 bg-white border border-border rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
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
      <section className="relative isolate min-h-[760px] overflow-hidden bg-primary-dark py-16 md:min-h-[680px] md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-orange-400" />
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=85')] bg-cover bg-center opacity-80 lg:block" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,.22),transparent_28%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-[1.1fr_.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-lime-300" /> Delivering near you
            </span>
            <h1 className="font-display mb-5 text-5xl leading-[0.92] text-white md:text-7xl">
              Your cravings,<br />at your door.
            </h1>
            <p className="mb-7 max-w-lg text-lg text-white/85 md:text-xl">
              Fresh meals from local favourites, delivered fast with live order updates at every step.
            </p>

            <div className="max-w-xl rounded-2xl bg-white p-2 shadow-2xl shadow-primary-dark/30">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" weight="fill" />
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Delivery location</p>
                    <p className="truncate font-semibold text-slate-700">Find food near you</p>
                  </div>
                </div>
                <Button size="lg" icon={Storefront} className="shrink-0" onClick={() => navigate('/restaurants')}>
                  Find food
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" weight="bold" /> 30 min average</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-300 text-amber-300" weight="fill" /> 4.8 rated service</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-sm lg:justify-self-end"
          >
            <div className="rounded-[28px] border border-white/30 bg-white/95 p-5 shadow-2xl backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Live delivery</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">Your order is moving</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-light">
                  <Motorcycle className="h-6 w-6 text-primary" weight="fill" />
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">Spice Garden</span>
                  <span className="rounded-full bg-success-light px-2.5 py-1 text-xs font-bold text-success">On the way</span>
                </div>
                <div className="my-5 flex items-center">
                  <span className="h-3 w-3 rounded-full border-[3px] border-primary bg-white" />
                  <span className="h-0.5 flex-1 bg-primary" />
                  <Motorcycle className="h-7 w-7 rounded-full bg-primary p-1 text-white" weight="fill" />
                  <span className="h-0.5 flex-1 bg-slate-200" />
                  <MapPin className="h-5 w-5 text-slate-400" weight="fill" />
                </div>
                <div className="flex items-end justify-between">
                  <div><p className="text-xs text-slate-400">Arriving in</p><p className="text-2xl font-bold text-slate-800">12 min</p></div>
                  <span className="text-xs font-medium text-slate-500">Order #FD-2048</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 -mt-8 px-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white p-3 shadow-lg shadow-orange-950/5">
          <span className="mr-2 text-sm font-bold text-slate-600">Craving something?</span>
          {quickCuisines.map((cuisine) => (
            <button key={cuisine} type="button" onClick={() => navigate(`/restaurants?search=${encodeURIComponent(cuisine)}`)} className="rounded-xl bg-surface-muted px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-primary-light hover:text-primary">
              {cuisine}
            </button>
          ))}
          <button type="button" onClick={() => navigate('/restaurants')} className="flex items-center gap-1 px-2 text-sm font-bold text-primary hover:underline">See all <CaretRight className="h-4 w-4" weight="bold" /></button>
        </div>
      </section>

      <section className="bg-white py-20">
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
