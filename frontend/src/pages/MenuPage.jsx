import { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { setMenuSearch, fetchMenuItems } from '../redux/menuSlice'
import MenuSearch from '../components/menu/MenuSearch'
import MenuList from '../components/menu/MenuList'

function MenuPage() {
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const search = searchParams.get('search') || ''

  useEffect(() => {
    dispatch(setMenuSearch(search))
    dispatch(fetchMenuItems({ search: search || undefined }))
  }, [dispatch, search])

  const handleSearch = useCallback((value) => {
    setSearchParams(value ? { search: value } : {}, { replace: true })
  }, [setSearchParams])

  return (
    <motion.div {...pageTransition} className="mx-auto w-full max-w-7xl px-4 py-7 md:px-8 md:py-9">
      <div className="mb-7 border-b border-border pb-6">
        <p className="mb-1 text-sm font-semibold text-primary">FoodHub delivery</p>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">Order your favourites</h1>
        <p className="mt-2 text-muted-foreground">Fresh dishes from restaurants around you, ready to add to your cart.</p>
      </div>
      <MenuSearch value={search} onChange={handleSearch} />
      <MenuList showCategories />
    </motion.div>
  )
}

export default MenuPage
