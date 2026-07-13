import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../utils/motion'
import { fetchRestaurants } from '../redux/restaurantSlice'
import RestaurantList from '../components/restaurant/RestaurantList'
import Button from '../components/common/Button'
import AISuggestions from '../components/menu/AISuggestions'
import {
  Storefront, ArrowRight, Truck, Clock, CreditCard, Star, MapPin,
  ForkKnife, CheckCircle, Timer, Calendar,
} from '../utils/icons'

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    label: '30 min average',
    description: 'Get your food delivered hot and fresh in under 30 minutes by our dedicated delivery partners.',
  },
  {
    icon: Clock,
    title: 'Live Tracking',
    label: 'Realtime GPS',
    description: 'Track your order in real-time from restaurant to doorstep with live GPS updates.',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    label: 'UPI, cards, COD',
    description: 'Multiple payment options including UPI, cards, and cash on delivery with secure checkout.',
  },
]

const dishes = [
  {
    name: 'Pasta Bowl',
    price: '₹249',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=500&q=80',
    accent: 'bg-orange-50',
  },
  {
    name: 'Garden Salad',
    price: '₹189',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80',
    accent: 'bg-emerald-50',
  },
  {
    name: 'Spicy Biryani',
    price: '₹299',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=500&q=80',
    accent: 'bg-amber-50',
  },
  {
    name: 'Cafe Burger',
    price: '₹219',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
    accent: 'bg-sky-50',
  },
]

function FeatureCard({ icon: Icon, title, label, description, index }) {
  return (
    <motion.div
      variants={fadeInUp}
      className="group relative overflow-hidden rounded-xl border border-white/80 bg-white p-6 text-left shadow-card transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-card-hover"
    >
      <div className="absolute right-4 top-4 font-display text-6xl leading-none text-slate-100 transition group-hover:text-primary-light">
        0{index + 1}
      </div>
      <div className="relative">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-primary-light text-primary ring-8 ring-primary-light/45">
          <Icon className="h-7 w-7" weight="duotone" />
        </div>
        <span className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </span>
        <h3 className="mb-3 text-xl font-bold text-slate-950">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
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
      className="overflow-hidden bg-white"
    >
      <section className="relative flex min-h-[86vh] items-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543353071-10c8ba85a904?auto=format&fit=crop&w=2200&q=85')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.96)_0%,rgba(15,23,42,0.78)_43%,rgba(234,88,12,0.26)_100%)]" />
        <div className="absolute left-[58%] top-24 hidden h-72 w-72 rounded-full bg-primary/30 blur-3xl lg:block" />
        <div className="absolute bottom-16 right-12 hidden h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl lg:block" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-16 md:px-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-white backdrop-blur">
              <ForkKnife className="h-4 w-4 text-primary-300" /> Delivery + Dine-Out
            </span>
            <h1 className="mb-5 max-w-3xl font-display text-6xl leading-[0.9] text-white sm:text-7xl lg:text-8xl">
              Order your favourite food beautifully.
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-8 text-white/78 md:text-xl">
              Discover nearby restaurants, reserve tables, order dishes, track deliveries, and pay securely from one premium food platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" icon={Storefront} onClick={() => navigate('/restaurants')} className="shadow-xl shadow-primary/30">
                Browse Restaurants
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20"
                onClick={() => navigate('/menu')}
              >
                Explore Menu
              </Button>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ['30 min', 'Avg delivery'],
                ['4.8', 'Food rating'],
                ['24/7', 'Support'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                  <p className="text-2xl font-bold text-white">{value}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden min-h-[560px] lg:block"
            aria-hidden="true"
          >
            <div className="absolute right-0 top-4 h-[520px] w-[390px] overflow-hidden rounded-xl border border-white/20 bg-white p-4 shadow-2xl shadow-black/35">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=85"
                alt=""
                className="h-64 w-full rounded-lg object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Top pick</p>
                    <h3 className="mt-1 text-2xl font-bold text-slate-950">The Urban Platter</h3>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-success-light px-3 py-1 text-sm font-bold text-success">
                    <Star className="h-4 w-4" weight="fill" /> 4.9
                  </span>
                </div>
                <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <MapPin className="h-4 w-4 text-primary" /> 1.2 km away
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-primary-light p-4">
                    <Timer className="mb-2 h-5 w-5 text-primary" weight="duotone" />
                    <p className="font-bold text-slate-900">25 min</p>
                    <p className="text-xs text-slate-500">Delivery</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-4">
                    <Calendar className="mb-2 h-5 w-5 text-success" weight="duotone" />
                    <p className="font-bold text-slate-900">Reserve</p>
                    <p className="text-xs text-slate-500">Dine-out</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute left-8 top-24 w-60 rounded-xl border border-white/70 bg-white p-4 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80"
                  alt=""
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900">Margherita</p>
                  <p className="text-sm font-semibold text-primary">₹299</p>
                </div>
              </div>
              <button className="mt-4 h-10 w-full rounded-full bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25">
                Add to Cart
              </button>
            </div>

            <div className="absolute bottom-20 left-0 w-72 rounded-xl border border-white/70 bg-white p-5 shadow-2xl shadow-black/20">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-success-light text-success">
                  <CheckCircle className="h-6 w-6" weight="fill" />
                </span>
                <div>
                  <p className="font-bold text-slate-900">Order confirmed</p>
                  <p className="text-sm text-slate-500">Preparing your meal now</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-9 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Popular dishes</p>
              <h2 className="mt-2 font-display text-4xl text-slate-950 md:text-5xl">Serve the taste you love</h2>
            </div>
            <Link to="/menu" className="inline-flex items-center gap-2 font-bold text-primary hover:underline">
              See full menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dishes.map((dish) => (
              <motion.div
                key={dish.name}
                whileHover={{ y: -6 }}
                className={`overflow-hidden rounded-xl border border-slate-100 ${dish.accent} p-4 shadow-card transition`}
              >
                <img src={dish.image} alt={dish.name} className="h-44 w-full rounded-lg object-cover shadow-lg shadow-slate-200/70" />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">{dish.name}</h3>
                    <p className="text-sm text-slate-500">Freshly prepared</p>
                  </div>
                  <p className="rounded-full bg-white px-3 py-1 text-sm font-bold text-primary shadow-sm">{dish.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-50 py-16 md:py-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-br from-primary-light via-white/40 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-10 grid items-end gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary">Why choose us</p>
              <h2 className="font-display text-5xl leading-none text-slate-950 md:text-6xl">Why FoodHub?</h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              A complete food delivery and dine-out experience designed for speed, comfort, and trust, from restaurant discovery to secure checkout.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-1"
            >
              {features.map((f, index) => (
                <FeatureCard key={f.title} {...f} index={index} />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45 }}
              className="relative min-h-[420px] overflow-hidden rounded-xl bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/80 md:p-8"
            >
              <img
                src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=1000&q=85"
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.5)_0%,rgba(15,23,42,0.96)_78%)]" />
              <div className="relative flex h-full min-h-[360px] flex-col justify-between">
                <div className="flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                  <CheckCircle className="h-5 w-5 text-primary-300" weight="fill" />
                  Trusted food experience
                </div>
                <div>
                  <h3 className="font-display text-5xl leading-none md:text-6xl">Fresh food, clear updates, easy payment.</h3>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[
                      ['8K+', 'Orders'],
                      ['120+', 'Partners'],
                      ['4.8', 'Rating'],
                    ].map(([value, label]) => (
                      <div key={label} className="rounded-lg border border-white/10 bg-white/10 p-4 backdrop-blur">
                        <p className="text-2xl font-bold">{value}</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/55">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AISuggestions />

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Restaurants</p>
              <h2 className="mt-2 font-display text-4xl text-slate-950 md:text-5xl">Popular Restaurants</h2>
              <p className="mt-2 text-muted-foreground">Top-rated places near you</p>
            </div>
            <Link
              to="/restaurants"
              className="flex items-center gap-1 font-bold text-primary hover:underline"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <RestaurantList limit={8} showPagination={false} />
        </div>
      </section>

      <section className="bg-slate-950 py-18 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-8 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary-300">Dine-out ready</p>
            <h2 className="mt-3 font-display text-5xl leading-none md:text-6xl">Reserve tables. Order faster. Eat better.</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
              From casual meals to special dinners, FoodHub keeps restaurants, menus, reservations, payments, and order tracking in one smooth experience.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            {['Online ordering', 'Table reservations', 'Secure payments', 'Live delivery tracking'].map((item) => (
              <div key={item} className="flex items-center gap-3 border-b border-white/10 py-4 last:border-b-0">
                <CheckCircle className="h-6 w-6 text-primary-300" weight="fill" />
                <span className="font-bold">{item}</span>
              </div>
            ))}
            <Button size="lg" className="mt-5 w-full" onClick={() => navigate('/restaurants')}>
              Get Started
            </Button>
          </div>
        </div>
      </section>
    </motion.div>
  )
}

export default HomePage
