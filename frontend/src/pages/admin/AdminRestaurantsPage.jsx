import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { adminService } from '../../services/adminService'
import { notify } from '../../utils/toast'
import { Star, Trash } from '../../utils/icons'
import Pagination from '../../components/common/Pagination'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'

function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchRestaurants = useCallback(async (page = 1) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await adminService.getRestaurants({ page, limit: 15 })
      setRestaurants(data.restaurants || [])
      setPagination({ page: data.page || 1, pages: data.pages || 1, total: data.total || 0 })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load restaurants')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRestaurants() }, [fetchRestaurants])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await adminService.deleteRestaurant(deleteId)
      notify.success('Restaurant deleted')
      setDeleteId(null)
      fetchRestaurants(pagination.page)
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <motion.div {...pageTransition}>
      <h2 className="text-2xl font-semibold text-slate-800 mb-6">Restaurants</h2>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-600">Restaurant</th>
                <th className="text-left p-4 font-semibold text-slate-600 hidden md:table-cell">Cuisine</th>
                <th className="text-left p-4 font-semibold text-slate-600">Rating</th>
                <th className="text-left p-4 font-semibold text-slate-600 hidden sm:table-cell">Delivery Time</th>
                <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                <th className="text-left p-4 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="p-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : !restaurants.length ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No restaurants found</td></tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr key={restaurant._id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <span className="font-medium text-slate-800">{restaurant.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-sm font-medium">
                        <Star className="w-4 h-4 text-warning" weight="fill" />
                        {restaurant.rating || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground hidden sm:table-cell">
                      {restaurant.deliveryTime ? `${restaurant.deliveryTime} min` : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        restaurant.isOpen !== false
                          ? 'text-success bg-success-light'
                          : 'text-destructive bg-destructive/10'
                      }`}>
                        {restaurant.isOpen !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setDeleteId(restaurant._id)}
                        className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                        title="Delete restaurant"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={fetchRestaurants} />

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Restaurant"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" loading={deleteLoading} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-muted-foreground">
          Are you sure you want to delete this restaurant? This action cannot be undone.
        </p>
      </Modal>
    </motion.div>
  )
}

export default AdminRestaurantsPage
