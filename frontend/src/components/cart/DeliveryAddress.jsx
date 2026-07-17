import { useState } from 'react'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { Plus } from '../../utils/icons'

const EMPTY = { label: '', street: '', city: '', state: '', zipCode: '', phone: '' }

function DeliveryAddress({ selectedAddress, addresses, onSelect, onAddAddress }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    if (!form.street.trim() || !form.city.trim()) {
      setError('Street and city are required')
      return
    }
    const newAddress = {
      _id: `local-${Date.now()}`,
      label: form.label.trim() || 'New Address',
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      zipCode: form.zipCode.trim(),
      phone: form.phone.trim(),
    }
    onAddAddress?.(newAddress)
    setForm(EMPTY)
    setError(null)
    setShowForm(false)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Delivery Address</h3>
      {(addresses || []).map((addr) => (
        <label
          key={addr._id}
          className="flex items-start gap-3 p-4 border border-border rounded-[var(--radius-md)] cursor-pointer hover:border-primary transition-colors"
        >
          <input
            type="radio"
            name="address"
            checked={selectedAddress?._id === addr._id}
            onChange={() => onSelect(addr)}
            className="mt-1 accent-primary"
          />
          <div>
            <p className="font-semibold">{addr.label || addr.street}</p>
            <p className="text-muted-foreground text-sm">
              {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
            </p>
            {addr.phone && <p className="text-muted-foreground text-sm">{addr.phone}</p>}
          </div>
        </label>
      ))}

      <Button variant="outline" icon={Plus} onClick={() => setShowForm(true)}>
        Add New Address
      </Button>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setError(null) }}
        title="Add New Address"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Label (e.g. Home)</label>
            <input
              name="label"
              value={form.label}
              onChange={handleChange}
              placeholder="Home"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Street *</label>
            <input
              name="street"
              value={form.street}
              onChange={handleChange}
              placeholder="123 Main St"
              className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">City *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Zip Code</label>
              <input
                name="zipCode"
                value={form.zipCode}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => { setShowForm(false); setError(null) }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save Address</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DeliveryAddress
