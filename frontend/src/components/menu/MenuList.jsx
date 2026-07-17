import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMenuItems } from '../../redux/menuSlice'
import MenuCard from './MenuCard'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import { ForkKnife } from '../../utils/icons'



function MenuList({ restaurantId, category, showCategories = false }) {
  const dispatch = useDispatch()
  const { items, categories, loading, error } = useSelector((state) => state.menu)
  const [selectedCategory, setSelectedCategory] = useState(category || 'All')

  useEffect(() => {
    if (restaurantId) dispatch(fetchMenuItems({ restaurantId }))
  }, [dispatch, restaurantId])

  if (loading) return <Loader variant="card" count={6} />
  if (error) return <ErrorState message={error} onRetry={() => dispatch(fetchMenuItems({ restaurantId }))} />

  const visibleCategories = categories.filter(Boolean)
  const filtered = selectedCategory === 'All'
    ? items
    : items.filter((item) => item.category === selectedCategory)

  if (!filtered.length) {
    return (
      <EmptyState
        icon={ForkKnife}
        title="No menu items found"
        description="Check back later for updated menu offerings."
      />
    )
  }

  return (
    <div>
      {showCategories && visibleCategories.length > 1 && (
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {['All', ...visibleCategories].map((itemCategory) => {
            const active = selectedCategory === itemCategory
            return (
              <button
                key={itemCategory}
                type="button"
                onClick={() => setSelectedCategory(itemCategory)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${active ? 'border-primary bg-primary text-white' : 'border-border bg-white text-foreground hover:border-primary hover:text-primary'}`}
              >
                {itemCategory}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item) => <MenuCard key={item._id} item={item} />)}
      </div>
    </div>
  )
}

export default MenuList
