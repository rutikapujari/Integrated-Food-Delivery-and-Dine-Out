import { useState } from 'react'
import { menuService } from '../../services/menuService'
import { notify } from '../../utils/toast'
import { formatCurrency } from '../../utils/formatCurrency'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { Plus, Trash, Pencil, ForkKnife, X } from '../../utils/icons'

const EMPTY_FORM = { name: '', description: '', category: '', price: '', image: '' }

function RestaurantMenuManager({ restaurantId, items, onRefresh }) {
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const categories = [...new Set(items.map((i) => i.category).filter(Boolean))]

  const handleAdd = async () => {
    if (!form.name || !form.category || !form.price) {
      notify.error('Name, category and price are required')
      return
    }
    setSubmitting(true)
    try {
      await menuService.create({
        ...form,
        price: Number(form.price),
        restaurantId,
      })
      notify.success('Menu item added!')
      setForm(EMPTY_FORM)
      setShowForm(false)
      onRefresh?.()
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
      onRefresh?.()
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
      onRefresh?.()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <ForkKnife className="w-5 h-5 text-primary" weight="duotone" /> Manage Menu
        </h3>
        <Button size="sm" icon={Plus} onClick={() => { setForm(EMPTY_FORM); setShowForm(!showForm) }}>
          Add Item
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-border rounded-[var(--radius-lg)] p-5 mb-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sm">New Menu Item</h4>
            <button onClick={() => setShowForm(false)} className="p-1 hover:bg-surface-muted rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
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
                list="category-suggestions-mgr"
              />
              <datalist id="category-suggestions-mgr">
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
              <label className="text-xs font-semibold text-muted-foreground">Image URL</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
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

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-3 bg-white border border-border rounded-lg p-3">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
                  <ForkKnife className="w-4 h-4 text-primary" weight="duotone" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.category} &bull; {formatCurrency(item.price)}</p>
              </div>
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${item.isAvailable !== false ? 'text-success bg-success-light' : 'text-destructive bg-destructive/10'}`}>
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

      {!items.length && !showForm && (
        <div className="text-center py-8 bg-white border border-border rounded-[var(--radius-lg)]">
          <ForkKnife className="w-8 h-8 text-muted-foreground mx-auto mb-2" weight="duotone" />
          <p className="text-sm text-muted-foreground mb-3">No menu items yet. Add your first item!</p>
          <Button size="sm" icon={Plus} onClick={() => setShowForm(true)}>Add Item</Button>
        </div>
      )}

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
                list="category-suggestions-edit"
              />
              <datalist id="category-suggestions-edit">
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
              <label className="text-sm font-semibold">Image URL</label>
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
        <p className="text-muted-foreground">Are you sure you want to delete this menu item?</p>
      </Modal>
    </div>
  )
}

export default RestaurantMenuManager
