import { useSelector, useDispatch } from 'react-redux'
import { setFilters, clearFilters, fetchRestaurants } from '../../redux/restaurantSlice'
import { CUISINE_TYPES } from '../../utils/constants'
import { Star, X } from '../../utils/icons'

function RestaurantFilters() {
  const dispatch = useDispatch()
  const { filters, pagination } = useSelector((state) => state.restaurant)
  const hasFilters = filters.cuisine || filters.rating || filters.deliveryTime

  const handleChange = (key, value) => {
    dispatch(setFilters({ [key]: value || null }))
    dispatch({ type: 'restaurant/setPage', payload: 1 })
    dispatch(fetchRestaurants({ page: 1, limit: pagination.limit }))
  }

  const handleClear = () => {
    dispatch(clearFilters())
    dispatch({ type: 'restaurant/setPage', payload: 1 })
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <select
        value={filters.cuisine || ''}
        onChange={(e) => handleChange('cuisine', e.target.value)}
        className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">All Cuisines</option>
        {CUISINE_TYPES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <div className="flex gap-1">
        {[4.5, 4.0, 3.5].map((r) => (
          <button
            key={r}
            onClick={() => handleChange('rating', filters.rating === String(r) ? null : String(r))}
            className={`flex h-11 items-center gap-1 rounded-lg border px-3 text-sm font-bold transition-colors ${
              filters.rating === String(r)
                ? 'bg-primary text-white border-primary'
                : 'border-slate-200 bg-white hover:bg-primary-light'
            }`}
          >
            {r}+ <Star className="w-3.5 h-3.5" weight="fill" />
          </button>
        ))}
      </div>

      <select
        value={filters.deliveryTime || ''}
        onChange={(e) => handleChange('deliveryTime', e.target.value)}
        className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="">Any Time</option>
        <option value="30">Under 30 min</option>
        <option value="45">Under 45 min</option>
        <option value="60">Under 60 min</option>
      </select>

      {hasFilters && (
        <button
          onClick={handleClear}
          className="flex h-11 items-center gap-1 rounded-lg px-4 text-sm font-bold text-destructive transition-colors hover:bg-destructive/10"
        >
          <X className="w-4 h-4" /> Clear
        </button>
      )}
    </div>
  )
}

export default RestaurantFilters
