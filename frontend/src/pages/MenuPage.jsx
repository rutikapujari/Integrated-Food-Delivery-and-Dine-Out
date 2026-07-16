import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { setMenuSearch, fetchMenuItems } from '../redux/menuSlice'
import MenuSearch from '../components/menu/MenuSearch'
import MenuList from '../components/menu/MenuList'

function MenuPage() {
  const dispatch = useDispatch()
  const [search, setSearch] = useState('')

  const handleSearch = useCallback((value) => {
    setSearch(value)
    dispatch(setMenuSearch(value))
    dispatch(fetchMenuItems({ search: value || undefined }))
  }, [dispatch])

  return (
    <motion.div {...pageTransition} className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
      <div className="mb-7 rounded-3xl bg-gradient-to-r from-primary-dark via-primary to-orange-400 px-6 py-8 text-white shadow-lg shadow-orange-950/10 md:px-9">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-orange-100">FoodHub menu</p>
        <h1 className="font-display text-4xl leading-none md:text-5xl">What are you craving?</h1>
        <p className="mt-3 max-w-xl text-white/85">Discover freshly prepared dishes from restaurants around you. Add your favourites and track every order live.</p>
      </div>
      <MenuSearch value={search} onChange={handleSearch} />
      <MenuList showCategories />
    </motion.div>
  )
}

export default MenuPage
