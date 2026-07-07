import Button from '../common/Button'
import { Plus } from '../../utils/icons'

function DeliveryAddress({ selectedAddress, addresses, onSelect }) {
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
      <Button variant="outline" icon={Plus} onClick={() => {}}>
        Add New Address
      </Button>
    </div>
  )
}

export default DeliveryAddress
