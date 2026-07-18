import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../../services/adminService'
import { notify } from '../../utils/toast'
import { Star, Trash, Storefront } from '../../utils/icons'
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
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1B2838] via-[#1E3A5F] to-[#0F172A] rounded-2xl mb-6">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#EA580C]/15 blur-3xl" />
        <div className="relative px-6 md:px-8 pt-8 pb-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-xl bg-[#EA580C] flex items-center justify-center">
              <Storefront className="h-5 w-5" weight="fill" />
            </div>
            <span className="text-[#EA580C] text-sm font-bold tracking-wider uppercase">FoodHub Admin</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Restaurants</h2>
          <p className="text-white/50 text-sm">{pagination.total} restaurant{pagination.total === 1 ? '' : 's'} registered</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Restaurant</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider hidden md:table-cell">Cuisine</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Rating</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider hidden sm:table-cell">Delivery Time</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="text-left p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="p-4"><div className="h-4 bg-gray-100 animate-pulse rounded w-16" /></td>
                    ))}
                  </tr>
                ))
              ) : !restaurants.length ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">No restaurants found</td></tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr key={restaurant._id} className="hover:bg-orange-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {restaurant.image ? (
                          <img src={restaurant.image} alt={restaurant.name} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                            <Storefront className="w-5 h-5 text-[#EA580C]" />
                          </div>
                        )}
                        <span className="font-semibold text-gray-800">{restaurant.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 hidden md:table-cell">
                      {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(', ') : restaurant.cuisine}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 text-sm font-bold">
                        <Star className="w-4 h-4 text-amber-500" weight="fill" />
                        {restaurant.rating || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 hidden sm:table-cell">
                      {restaurant.deliveryTime ? `${restaurant.deliveryTime} min` : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        restaurant.isOpen !== false
                          ? 'text-green-600 bg-green-50 border border-green-100'
                          : 'text-red-500 bg-red-50 border border-red-100'
                      }`}>
                        {restaurant.isOpen !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setDeleteId(restaurant._id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
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
        <p className="text-gray-500">Are you sure you want to delete this restaurant? This action cannot be undone.</p>
      </Modal>
    </div>
  )
}

export default AdminRestaurantsPage
