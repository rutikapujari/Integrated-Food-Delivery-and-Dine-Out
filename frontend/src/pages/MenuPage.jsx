import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { setMenuSearch, fetchMenuItems } from '../redux/menuSlice'
import MenuSearch from '../components/menu/MenuSearch'
import MenuList from '../components/menu/MenuList'
import { ForkKnife, Hamburger, Pizza, Coffee, Cake, Wine, Receipt, CreditCard, Timer, Star } from '../utils/icons'

const quickCategories = [
  { label: 'Burger', icon: Hamburger },
  { label: 'Pizza', icon: Pizza },
  { label: 'Coffee', icon: Coffee },
  { label: 'Dessert', icon: Cake },
  { label: 'Drinks', icon: Wine },
]

function MenuPage() {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')

  const handleSearch = useCallback((value) => {
    setSearch(value)
    dispatch(setMenuSearch(value))
    dispatch(fetchMenuItems({ search: value || undefined }))
  }, [dispatch])

  return (
    <motion.div {...pageTransition} className="bg-slate-50">
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-primary-light via-white to-emerald-50" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 md:px-8 lg:grid-cols-[1fr_360px] lg:py-16">
          <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-card md:p-8">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-primary">
              <ForkKnife className="h-4 w-4" /> Food ordering dashboard
            </p>
            <h1 className="font-display text-5xl leading-none text-slate-950 md:text-7xl">Explore menu, add food, checkout fast.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
              Browse dishes by category, search your cravings, and build a perfect order from fresh restaurant menus.
            </p>

            <div className="mt-8">
              <MenuSearch value={search} onChange={handleSearch} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {quickCategories.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => handleSearch(label)}
                  className="group rounded-lg border border-slate-100 bg-slate-50 p-4 text-left transition hover:-translate-y-1 hover:border-primary/30 hover:bg-primary-light"
                >
                  <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-white text-primary shadow-sm">
                    <Icon className="h-5 w-5" weight="duotone" />
                  </span>
                  <span className="text-sm font-bold text-slate-900">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-xl border border-slate-100 bg-slate-950 p-6 text-white shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-300">Order summary</p>
                <h2 className="mt-1 text-2xl font-bold">Today&apos;s picks</h2>
              </div>
              <Receipt className="h-8 w-8 text-primary-300" weight="duotone" />
            </div>
            <div className="mt-6 space-y-4">
              {[
                { icon: Star, label: 'Most loved dishes', value: '4.8 rating' },
                { icon: Timer, label: 'Average prep time', value: '18 minutes' },
                { icon: CreditCard, label: 'Secure checkout', value: 'UPI, Card, COD' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 rounded-lg bg-white/10 p-4">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-primary-300">
                    <Icon className="h-5 w-5" weight="duotone" />
                  </span>
                  <div>
                    <p className="font-bold">{label}</p>
                    <p className="text-sm text-white/55">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Menu catalogue</p>
          <h2 className="mt-2 font-display text-4xl text-slate-950 md:text-5xl">Fresh dishes for every craving</h2>
        </div>
        <MenuList />
      </section>
    </motion.div>
  )
}

export default MenuPage
