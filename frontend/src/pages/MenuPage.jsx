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
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl md:text-4xl mb-6">Our Menu</h1>
      <MenuSearch value={search} onChange={handleSearch} />
      <MenuList showCategories />
    </motion.div>
  )
}

export default MenuPage
