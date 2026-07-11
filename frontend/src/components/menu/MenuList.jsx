import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchMenuItems } from '../../redux/menuSlice'
import MenuCard from './MenuCard'
import MenuCategory from './MenuCategory'
import Loader from '../common/Loader'
import Button from '../common/Button'
import { ForkKnife } from '../../utils/icons'

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon className="w-16 h-16 text-border mb-4" weight="duotone" />
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold mb-1">Something went wrong</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{message}</p>
      <Button variant="outline" onClick={onRetry}>Try Again</Button>
    </div>
  )
}

function MenuList({ restaurantId, category, showCategories = false }) {
  const dispatch = useDispatch()
  const { items, categories, loading, error } = useSelector((state) => state.menu)

  useEffect(() => {
    dispatch(fetchMenuItems({ restaurantId }))
  }, [dispatch, restaurantId])

  if (loading) return <Loader variant="card" count={9} />
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <MenuCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {filtered.map((item) => (
        <MenuCard key={item._id} item={item} />
      ))}
    </div>
  )
}

export default MenuList
