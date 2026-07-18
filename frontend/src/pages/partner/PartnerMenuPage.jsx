import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../../utils/motion'
import { fetchMenuItems } from '../../redux/menuSlice'
import { restaurantService } from '../../services/restaurantService'
import { menuService } from '../../services/menuService'
import { notify } from '../../utils/toast'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { List, Plus, PencilSimple, Trash, Eye, EyeSlash, Storefront } from '../../utils/icons'

function PartnerMenuPage() {
  const dispatch = useDispatch()
  const { items: menuItems, loading } = useSelector((state) => state.menu)
  const [restaurant, setRestaurant] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', image: '' })

  useEffect(() => {
    dispatch(fetchMenuItems())
    restaurantService.getMine().then(({ data }) => setRestaurant(data.restaurants?.[0] || null)).catch(() => {})
  }, [dispatch])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', description: '', category: '', price: '', image: '' })
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      name: item.name, description: item.description || '', category: item.category || '',
      price: String(item.price), image: item.image || '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!restaurant) {
      notify.error('Create your restaurant first.')
      return
    }
    const payload = {
      ...form,
      price: Number(form.price),
      restaurantId: restaurant._id,
    }
    try {
      if (editing) {
        await menuService.update(editing._id, payload)
        notify.success('Menu item updated')
      } else {
        await menuService.create(payload)
        notify.success('Menu item added')
      }
      setShowForm(false)
      dispatch(fetchMenuItems())
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to save')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return
    try {
      await menuService.remove(id)
      notify.success('Deleted')
      dispatch(fetchMenuItems())
  } catch {
    notify.error('Failed to delete')
  }
  }

  const toggleAvailability = async (item) => {
    try {
      await menuService.update(item._id, { isAvailable: !item.isAvailable })
      dispatch(fetchMenuItems())
    } catch {
      notify.error('Failed to update')
    }
  }

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-surface-bg">
      <div className="mx-auto max-w-5xl px-4 md:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <List className="h-8 w-8" weight="duotone" />
            </span>
            <div>
              <h1 className="font-display text-3xl">Menu Management</h1>
              <p className="text-muted-foreground text-sm">{menuItems.length} items · {restaurant?.name || 'No restaurant linked'}</p>
            </div>
          </div>
          <Button onClick={openAdd}><Plus className="h-5 w-5" /> Add Item</Button>
        </div>

        {loading ? <Loader variant="card" count={4} /> : !menuItems.length ? (
          <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-border bg-white/60 px-5 py-12 text-center">
            <div>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Storefront className="h-8 w-8" weight="duotone" />
              </span>
              <h3 className="mt-5 text-xl font-bold">No menu items</h3>
              <p className="mt-2 text-muted-foreground">Add dishes so customers can order from you.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {menuItems.map((item) => (
              <div key={item._id} className="rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-muted">
                    {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : <Storefront className="h-7 w-7 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <span className="font-bold text-primary">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleAvailability(item)}>
                        {item.isAvailable ? <><EyeSlash className="h-4 w-4" /> Hide</> : <><Eye className="h-4 w-4" /> Show</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEdit(item)}><PencilSimple className="h-4 w-4" /> Edit</Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(item._id)}><Trash className="h-4 w-4" /> Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <h2 className="font-display text-2xl mb-4">{editing ? 'Edit Item' : 'Add Item'}</h2>
              <div className="space-y-3">
                <input className="w-full h-11 rounded-lg border border-border px-3 text-sm focus:border-primary focus:outline-none" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className="w-full h-11 rounded-lg border border-border px-3 text-sm focus:border-primary focus:outline-none" placeholder="Category (e.g. Starter)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
                <input type="number" min="0" className="w-full h-11 rounded-lg border border-border px-3 text-sm focus:border-primary focus:outline-none" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                <input className="w-full h-11 rounded-lg border border-border px-3 text-sm focus:border-primary focus:outline-none" placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                <textarea className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="mt-5 flex gap-3">
                <Button type="submit" className="flex-1">{editing ? 'Save Changes' : 'Add Item'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default PartnerMenuPage
