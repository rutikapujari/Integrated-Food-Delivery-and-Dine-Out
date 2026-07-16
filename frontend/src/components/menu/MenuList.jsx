import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMenuItems } from '../../redux/menuSlice'
import MenuCard from './MenuCard'
import MenuCategory from './MenuCategory'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import { ForkKnife } from '../../utils/icons'



function MenuList({ restaurantId, category, showCategories = false }) {
  const dispatch = useDispatch()
  const { items, categories, loading, error } = useSelector((state) => state.menu)

  useEffect(() => {
    if (restaurantId) dispatch(fetchMenuItems({ restaurantId }))
  }, [dispatch, restaurantId])

  if (loading) return <Loader variant="card" count={6} />
  if (error) return <ErrorState message={error} onRetry={() => dispatch(fetchMenuItems({ restaurantId }))} />

  const filtered = category ? items.filter((i) => i.category === category) : items

  if (!filtered.length) {
    return (
      <EmptyState
        icon={ForkKnife}
        title="No menu items found"
        description="Check back later for updated menu offerings."
      />
    )
  }

  if (showCategories && categories.length > 0) {
    return (
      <div className="space-y-10">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat)
          if (!catItems.length) return null
          return <MenuCategory key={cat} category={cat} items={catItems} />
        })}
        {categories.length === 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map((item) => (
        <MenuCard key={item._id} item={item} />
      ))}
    </div>
  )
}

export default MenuList
