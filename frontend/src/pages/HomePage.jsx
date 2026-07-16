import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../utils/motion'
import { fetchRestaurants } from '../redux/restaurantSlice'
import RestaurantList from '../components/restaurant/RestaurantList'
import Button from '../components/common/Button'
import AISuggestions from '../components/menu/AISuggestions'
import { Storefront, ArrowRight, Clock, MapPin, Motorcycle, Star, CaretRight } from '../utils/icons'

const quickCuisines = ['Biryani', 'Pizza', 'Burgers', 'Chinese', 'Desserts']

const foodCategories = [
  {
    title: 'Biryani',
    search: 'Biryani',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=700&q=85',
  },
  {
    title: 'Pizza',
    search: 'Pizza',
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=700&q=85',
  },
  {
    title: 'Burgers',
    search: 'Burger',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=700&q=85',
  },
  {
    title: 'Desserts',
    search: 'Dessert',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=85',
  },
  {
    title: 'Healthy',
    search: 'Salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=85',
  },
]

function FoodCategoryCard({ title, image, onClick }) {
  return (
    <motion.div
      variants={fadeInUp}
      onClick={onClick}
      className="group relative h-44 cursor-pointer overflow-hidden rounded-2xl bg-slate-200 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 text-white">
        <h3 className="text-lg font-bold">{title}</h3>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur"><CaretRight className="h-4 w-4" weight="bold" /></span>
      </div>
    </motion.div>
  )
}

function LiveDeliveryPanel({ onBrowse }) {
  return (
    <section className="bg-slate-950 py-14 text-white md:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-8 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-orange-300">No more delivery guesswork</p>
          <h2 className="font-display text-4xl leading-none md:text-5xl">Live tracking,<br />from kitchen to doorstep.</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Once an order is placed, FoodHub keeps every status in sync—confirmed, preparing, on the way and delivered.</p>
          <button type="button" onClick={onBrowse} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white transition-colors hover:bg-primary-hover">
            Order food now <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mx-auto w-full max-w-md rounded-[28px] border border-white/10 bg-white p-5 text-slate-800 shadow-2xl shadow-black/30">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Live order status</p>
              <p className="mt-1 text-lg font-bold">Spice Garden</p>
            </div>
            <span className="rounded-full bg-success-light px-3 py-1.5 text-xs font-bold text-success">On the way</span>
          </div>
          <div className="rounded-2xl bg-[#fff5ed] p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400"><span>RESTAURANT</span><span>YOUR HOME</span></div>
            <div className="relative my-6 h-12">
              <div className="absolute left-3 right-3 top-5 h-1 rounded-full bg-orange-200" />
              <div className="absolute left-3 top-5 h-1 w-[58%] rounded-full bg-primary" />
              <span className="absolute left-0 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white"><Storefront className="h-4 w-4" weight="fill" /></span>
              <span className="absolute left-[55%] top-0 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-lg"><Motorcycle className="h-5 w-5" weight="fill" /></span>
              <span className="absolute right-0 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-slate-600"><MapPin className="h-4 w-4" weight="fill" /></span>
            </div>
            <div className="flex items-center justify-between"><div><p className="text-xs text-slate-400">Estimated arrival</p><p className="text-2xl font-bold">12 min</p></div><div className="text-right"><p className="text-xs text-slate-400">Delivery partner</p><p className="font-bold">Rahul is nearby</p></div></div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-100 p-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-success-light text-success"><Clock className="h-4 w-4" weight="bold" /></span><p className="text-sm font-semibold">Your food is packed and headed your way.</p></div>
        </div>
      </div>
    </section>
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

      <section className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-primary">Food for every mood</p>
              <h2 className="font-display text-3xl md:text-4xl">Eat what makes you happy</h2>
            </div>
            <button type="button" onClick={() => navigate('/menu')} className="hidden items-center gap-1 text-sm font-bold text-primary hover:underline sm:flex">View all menu <ArrowRight className="h-4 w-4" /></button>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5"
          >
            {foodCategories.map((category) => (
              <FoodCategoryCard key={category.title} {...category} onClick={() => navigate(`/menu?search=${encodeURIComponent(category.search)}`)} />
            ))}
          </motion.div>
        </div>
      </section>

      <LiveDeliveryPanel onBrowse={() => navigate('/restaurants')} />

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

      <section className="relative flex min-h-[calc(100vh-80px)] items-center overflow-hidden bg-slate-950">
        <div className="relative w-full overflow-hidden bg-slate-950">
          <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=85')] bg-cover bg-center opacity-75 lg:block" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/20" />
          <div className="relative mx-auto w-full max-w-7xl px-6 py-20 text-white md:px-12 md:py-28 lg:px-16">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange-200"><span className="h-2 w-2 rounded-full bg-orange-300" />Your next meal is ready</span>
            <h2 className="font-display mt-5 text-4xl leading-none md:text-6xl">Restaurant food.<br />Delivered your way.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">Choose from fresh dishes near you, pay securely and watch your order arrive in real time.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate('/restaurants')}>Browse restaurants</Button>
              <button type="button" onClick={() => navigate('/menu')} className="rounded-xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">Explore menu</button>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300"><span><b className="text-white">30 min</b> average delivery</span><span><b className="text-white">4.8/5</b> customer rating</span></div>
          </div>
        </div>
      </section>
    </motion.div>
  )
}

export default HomePage
