import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRestaurants } from '../../redux/restaurantSlice'
import RestaurantCard from './RestaurantCard'
import Pagination from '../common/Pagination'
import Loader from '../common/Loader'
import Button from '../common/Button'
import { Storefront } from '../../utils/icons'

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon className="w-16 h-16 text-border mb-4" weight="duotone" />
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
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

function RestaurantList({ limit, showPagination = true }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { list, loading, error, pagination } = useSelector((state) => state.restaurant)
  const { search, filters } = useSelector((state) => state.restaurant)

  useEffect(() => {
    dispatch(fetchRestaurants({
      page: pagination.page,
      limit: limit || pagination.limit,
      search: search || undefined,
      cuisine: filters.cuisine || undefined,
      rating: filters.rating || undefined,
      deliveryTime: filters.deliveryTime || undefined,
    }))
  }, [dispatch, pagination.page, limit])

  if (loading) return <Loader variant="card" count={limit || 8} />
  if (error) return <ErrorState message={error} onRetry={() => dispatch(fetchRestaurants())} />
  if (!list.length) {
    return (
      <EmptyState
        icon={Storefront}
        title="No restaurants found"
        description="Try adjusting your filters or search terms."
        action={{ label: 'Clear Filters', onClick: () => dispatch(fetchRestaurants()) }}
      />
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {list.map((r) => (
          <RestaurantCard key={r._id} restaurant={r} />
        ))}
      </div>
      {showPagination && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(page) => dispatch({ type: 'restaurant/setPage', payload: page })}
        />
      )}
    </div>
  )
}

export default RestaurantList
