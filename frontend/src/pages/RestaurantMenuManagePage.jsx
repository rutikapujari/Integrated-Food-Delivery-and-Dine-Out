import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { menuService } from '../services/menuService'
import { uploadService } from '../services/uploadService'
import { notify } from '../utils/toast'
import { Plus, Trash, Pencil, ForkKnife, ArrowLeft } from '../utils/icons'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Loader from '../components/common/Loader'

const EMPTY_FORM = { name: '', description: '', category: '', price: '', image: '' }

function RestaurantMenuManagePage() {
  const { id } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)

  const handleImageFile = async (file, target) => {
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadService.uploadImage(file, 'menu')
      if (url) {
        if (target === 'new') setForm({ ...form, image: url })
        else setEditItem({ ...editItem, image: url })
        notify.success('Image uploaded')
      } else {
        notify.error('Upload failed')
      }
    } catch {
      notify.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))]

  const fetchItems = useCallback(async () => {
    try {
      const { data } = await menuService.getAll({ restaurantId: id, limit: 200 })
      setItems(data.menuItems || [])
    } catch {
      notify.error('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleAdd = async () => {
    if (!form.name || !form.category || !form.price) {
      notify.error('Name, category and price are required')
      return
    }
    setSubmitting(true)
    try {
      await menuService.create({ ...form, price: Number(form.price), restaurantId: id })
      notify.success('Menu item added!')
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchItems()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to add item')
    } finally {
      setSubmitting(false)
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
    if (!editItem.name || !editItem.category || !editItem.price) {
      notify.error('Name, category and price are required')
      return
    }
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
      notify.success('Menu item updated!')
      setEditItem(null)
      fetchItems()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update item')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await menuService.remove(deleteId)
      notify.success('Item deleted')
      setDeleteId(null)
      fetchItems()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <Loader variant="page" />

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-[#fffaf5]">
      <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <header className="mb-7 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to={`/restaurants/${id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to restaurant
            </Link>
            <p className="text-sm font-semibold text-primary">Restaurant management</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">Manage Menu</h1>
            <p className="mt-2 text-muted-foreground">{items.length} item{items.length === 1 ? '' : 's'}</p>
          </div>
          <Button icon={Plus} onClick={() => { setForm(EMPTY_FORM); setShowForm(true) }}>
            Add Menu Item
          </Button>
        </header>

        {/* Add Form */}
        {showForm && (
          <div className="bg-white border border-border rounded-[var(--radius-lg)] p-5 mb-6 shadow-[var(--shadow-card)]">
            <h4 className="font-semibold text-sm mb-4">New Menu Item</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Margherita Pizza"
                  className="h-10 px-3 rounded-lg border border-border text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category *</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="e.g. Pizza, Burger, Drinks"
                  className="h-10 px-3 rounded-lg border border-border text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  list="cat-add"
                />
                <datalist id="cat-add">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Price *</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  className="h-10 px-3 rounded-lg border border-border text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Image</label>
                {form.image ? (
                  <img src={form.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                ) : null}
                <input type="file" accept="image/*" onChange={(e) => handleImageFile(e.target.files?.[0], 'new')} disabled={uploading} className="text-sm" />
                {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="Or paste image URL"
                  className="h-10 px-3 rounded-lg border border-border text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description..."
                  className="px-3 py-2 rounded-lg border border-border text-sm bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" loading={submitting} onClick={handleAdd}>Add Item</Button>
            </div>
          </div>
        )}

        {/* Items List */}
        {!items.length ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-border rounded-[var(--radius-lg)]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light mb-4">
              <ForkKnife className="w-8 h-8 text-primary" weight="duotone" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No menu items yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">Add your first menu item to get started.</p>
            <Button icon={Plus} onClick={() => { setForm(EMPTY_FORM); setShowForm(true) }}>Add Menu Item</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-4 bg-white border border-border rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-all">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                    <ForkKnife className="w-6 h-6 text-primary" weight="duotone" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{item.name}</p>
                  {item.description && <p className="text-sm text-muted-foreground truncate">{item.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-primary">{item.category}</span>
                    <span className="text-sm font-semibold text-foreground">${item.price}</span>
                  </div>
                </div>
                <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${item.isAvailable !== false ? 'text-success bg-success-light' : 'text-destructive bg-destructive/10'}`}>
                  {item.isAvailable !== false ? 'Active' : 'Off'}
                </span>
                <button
                  onClick={() => handleEdit(item)}
                  className="shrink-0 p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary-light"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(item._id)}
                  className="shrink-0 p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                  title="Delete"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
              <label className="text-sm font-semibold">Name *</label>
              <input
                type="text"
                value={editItem.name}
                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                className="h-10 px-3 rounded-lg border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Category *</label>
              <input
                type="text"
                value={editItem.category}
                onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                className="h-10 px-3 rounded-lg border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                list="cat-edit"
              />
              <datalist id="cat-edit">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Price *</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={editItem.price}
                onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                className="h-10 px-3 rounded-lg border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Image</label>
              {editItem.image ? (
                <img src={editItem.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
              ) : null}
              <input type="file" accept="image/*" onChange={(e) => handleImageFile(e.target.files?.[0], 'edit')} disabled={uploading} className="text-sm" />
              {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
              <input
                type="text"
                value={editItem.image}
                onChange={(e) => setEditItem({ ...editItem, image: e.target.value })}
                className="h-10 px-3 rounded-lg border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold">Description</label>
              <textarea
                rows={2}
                value={editItem.description}
                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                className="px-3 py-2 rounded-lg border border-border text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
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

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Menu Item"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" loading={deleting} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-muted-foreground">Are you sure you want to delete this menu item? This action cannot be undone.</p>
      </Modal>
    </motion.div>
  )
}

export default RestaurantMenuManagePage
