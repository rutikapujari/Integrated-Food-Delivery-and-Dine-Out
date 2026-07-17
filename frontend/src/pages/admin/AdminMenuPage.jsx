import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { adminService } from '../../services/adminService'
import { menuService } from '../../services/menuService'
import { notify } from '../../utils/toast'
import { Plus, Trash, Pencil, ForkKnife } from '../../utils/icons'
import Pagination from '../../components/common/Pagination'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'

function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [restaurantFilter, setRestaurantFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', description: '', category: '', price: '', image: '', restaurantId: '' })

  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [editItem, setEditItem] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    adminService.getRestaurants({ limit: 100 })
      .then(({ data }) => setRestaurants(data.restaurants || []))
      .catch(() => {})
  }, [])

  const fetchMenu = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const params = { page, limit: 15 }
      if (restaurantFilter) params.restaurantId = restaurantFilter
      if (searchQuery) params.search = searchQuery
      const { data } = await menuService.getAll(params)
      setMenuItems(data.menuItems || [])
      setPagination({ page: data.page || 1, pages: data.pages || 1, total: data.count || 0 })
    } catch {
      notify.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }, [restaurantFilter, searchQuery])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  const handleAdd = async () => {
    if (!newItem.name || !newItem.category || !newItem.price || !newItem.restaurantId) {
      notify.error('Name, category, price and restaurant are required')
      return
    }
    setAddLoading(true)
    try {
      await menuService.create({ ...newItem, price: Number(newItem.price) })
      notify.success('Menu item added')
      setShowAddModal(false)
      setNewItem({ name: '', description: '', category: '', price: '', image: '', restaurantId: '' })
      fetchMenu(1)
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to add menu item')
    } finally {
      setAddLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await menuService.remove(deleteId)
      notify.success('Menu item deleted')
      setDeleteId(null)
      fetchMenu(pagination.page)
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditItem({
      _id: item._id,
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      image: item.image || '',
      isAvailable: item.isAvailable !== false,
    })
  }

  const handleEditSave = async () => {
    setEditLoading(true)
    try {
      await menuService.update(editItem._id, {
        name: editItem.name,
        description: editItem.description,
        category: editItem.category,
        price: Number(editItem.price),
        image: editItem.image,
        isAvailable: editItem.isAvailable,
      })
      notify.success('Menu item updated')
      setEditItem(null)
      fetchMenu(pagination.page)
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update')
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <motion.div {...pageTransition}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">Menu Items</h2>
          <p className="text-sm text-muted-foreground mt-1">{pagination.total} item{pagination.total === 1 ? '' : 's'} total</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAddModal(true)}>Add Menu Item</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={restaurantFilter}
          onChange={(e) => setRestaurantFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
        >
          <option value="">All Restaurants</option>
          {restaurants.map((r) => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none flex-1"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-semibold text-slate-600">Item</th>
                <th className="text-left p-4 font-semibold text-slate-600 hidden md:table-cell">Restaurant</th>
                <th className="text-left p-4 font-semibold text-slate-600">Category</th>
                <th className="text-left p-4 font-semibold text-slate-600">Price</th>
                <th className="text-left p-4 font-semibold text-slate-600 hidden sm:table-cell">Status</th>
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
              ) : !menuItems.length ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <ForkKnife className="w-10 h-10 text-slate-300 mx-auto mb-2" weight="duotone" />
                    <p className="text-muted-foreground">No menu items found</p>
                  </td>
                </tr>
              ) : (
                menuItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                            <ForkKnife className="w-5 h-5 text-primary" weight="duotone" />
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-slate-800 block">{item.name}</span>
                          {item.description && <span className="text-xs text-muted-foreground truncate block max-w-[200px]">{item.description}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground hidden md:table-cell">
                      {item.restaurantId?.name || '—'}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-primary">{item.category}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      ${item.price}
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.isAvailable !== false
                          ? 'text-success bg-success-light'
                          : 'text-destructive bg-destructive/10'
                      }`}>
                        {item.isAvailable !== false ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary-light"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(item._id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                          title="Delete"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={fetchMenu} />

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Menu Item"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button loading={addLoading} onClick={handleAdd}>Add Item</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Restaurant *</label>
            <select
              value={newItem.restaurantId}
              onChange={(e) => setNewItem({ ...newItem, restaurantId: e.target.value })}
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            >
              <option value="">Select restaurant</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Name *</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="e.g. Margherita Pizza"
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Description</label>
            <textarea
              rows={2}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Brief description..."
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Category *</label>
              <input
                type="text"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="e.g. Pizza, Burger"
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Price *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                placeholder="0.00"
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Image URL</label>
            <input
              type="text"
              value={newItem.image}
              onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
              placeholder="https://..."
              className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Menu Item"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" loading={deleteLoading} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-muted-foreground">Are you sure you want to delete this menu item? This action cannot be undone.</p>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
        title="Edit Menu Item"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button loading={editLoading} onClick={handleEditSave}>Save Changes</Button>
          </>
        }
      >
        {editItem && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Name</label>
              <input
                type="text"
                value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Description</label>
              <textarea
                rows={2}
                value={editItem.description}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Category</label>
                <input
                  type="text"
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                  className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold">Price</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={editItem.price}
                  onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                  className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Image URL</label>
              <input
                type="text"
                value={editItem.image}
                onChange={(e) => setEditItem({ ...editItem, image: e.target.value })}
                className="h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editItem.isAvailable}
                onChange={(e) => setEditItem({ ...editItem, isAvailable: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm font-semibold">Available</span>
            </label>
          </div>
        )}
      </Modal>
    </motion.div>
  )
}

export default AdminMenuPage
