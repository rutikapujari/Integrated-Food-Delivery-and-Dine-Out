// Phase 2: Menu Page
// Dynamic menu display with search, filtering, and category organization

import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { setMenuSearch, fetchMenuItems, setMenuCategory } from '../redux/menuSlice'
import MenuSearch from '../components/menu/MenuSearch'
import MenuList from '../components/menu/MenuList'
import Loader from '../components/common/Loader'
import { ListFilter, ChefHat, X } from 'lucide-react'

function MenuPage() {
  const dispatch = useDispatch()
  const { items, loading, error, search, category } = useSelector((state) => state.menu)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  useEffect(() => {
    dispatch(fetchMenuItems({
      search,
      category,
      priceRange: priceRange.min || priceRange.max ? priceRange : undefined
    }))
  }, [dispatch, search, category, priceRange])

  const handleSearch = useCallback((value) => {
    dispatch(setMenuSearch(value))
    dispatch(fetchMenuItems({ search: value, category }))
  }, [dispatch, category])

  const handleCategoryChange = useCallback((cat) => {
    dispatch(setMenuCategory(cat))
    dispatch(fetchMenuItems({ search, category: cat, priceRange: priceRange.min || priceRange.max ? priceRange : undefined }))
  }, [dispatch, search, priceRange])

  const handlePriceChange = useCallback((type, value) => {
    setPriceRange(prev => ({ ...prev, [type]: value }))
  }, [])

  const applyPriceFilter = useCallback(() => {
    dispatch(fetchMenuItems({ search, category, priceRange: priceRange.min || priceRange.max ? priceRange : undefined }))
  }, [dispatch, search, category, priceRange])

  const clearFilters = useCallback(() => {
    dispatch(setMenuSearch(''))
    dispatch(setMenuCategory(null))
    setPriceRange({ min: '', max: '' })
    dispatch(fetchMenuItems({}))
  }, [dispatch])

  const categories = ['All', 'Starter', 'Main Course', 'Desserts', 'Beverages', 'Appetizers', 'Salads', 'Soups']

  const filteredItems = items.filter(item => {
    if (!item.price) return false
    if (priceRange.min && item.price < parseFloat(priceRange.min)) return false
    if (priceRange.max && item.price > parseFloat(priceRange.max)) return false
    return true
  })

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Our Menu
        </h1>
        <p className="text-xl text-muted-foreground">
          Delicious food prepared with love and served with care
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:w-64 flex-shrink-0"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-24">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-primary" />
              Categories
            </h3>

            <div className="space-y-2 mb-6">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => handleCategoryChange(cat === 'All' ? null : cat)}
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${category === (cat === 'All' ? null : cat)
                    ? 'bg-primary text-white shadow-md'
                    : 'text-foreground hover:bg-surface-bg dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>

            <div className="border-t border-border pt-6">
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <ListFilter className="w-5 h-5 text-primary" />
                Price Range
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Minimum</label>
                  <input
                    type="number"
                    placeholder="$0"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange('min', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground block mb-2">Maximum</label>
                  <input
                    type="number"
                    placeholder="$100"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange('max', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {(priceRange.min || priceRange.max) && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={applyPriceFilter}
                    className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Apply Price Filter
                  </motion.button>
                )}
              </div>
            </div>

            {(category || search || priceRange.min || priceRange.max) && (
              <div className="border-t border-border pt-6 mt-6">
                <h4 className="text-lg font-semibold mb-3">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {category && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      <span>{category}</span>
                      <X
                        className="w-4 h-4 cursor-pointer hover:text-red-500"
                        onClick={() => handleCategoryChange(null)}
                      />
                    </motion.div>
                  )}
                  {search && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      <span>Search: {search}</span>
                      <X
                        className="w-4 h-4 cursor-pointer hover:text-red-500"
                        onClick={() => handleSearch('')}
                      />
                    </motion.div>
                  )}
                  {(priceRange.min || priceRange.max) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      <span>Price: ${priceRange.min || '0'} - ${priceRange.max || '∞'}</span>
                      <X
                        className="w-4 h-4 cursor-pointer hover:text-red-500"
                        onClick={() => setPriceRange({ min: '', max: '' })}
                      />
                    </motion.div>
                  )}
                </div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="mt-4 w-full px-4 py-2 border border-border rounded-lg hover:bg-surface-bg dark:hover:bg-slate-700 transition-colors"
                >
                  Clear All Filters
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <MenuSearch value={search} onChange={handleSearch} />
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader variant="page" />
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-20 px-4 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
                <X className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Error Loading Menu</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button
                onClick={() => dispatch(fetchMenuItems({ search, category, priceRange: priceRange.min || priceRange.max ? priceRange : undefined }))
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">
                  {category ? `${category} Items` : 'All Menu Items'}
                </h2>
                <p className="text-muted-foreground">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
                </p>
              </div>

              <MenuList items={filteredItems} showCategories={false} />

              {filteredItems.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center py-20 px-4 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                    <ChefHat className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No items found</h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search or category filters
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default MenuPage