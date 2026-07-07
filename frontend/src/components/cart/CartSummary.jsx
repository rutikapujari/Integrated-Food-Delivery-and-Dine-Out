import { useSelector } from 'react-redux'
import { formatCurrency } from '../../utils/formatCurrency'

function CartSummary() {
  const { subtotal, deliveryFee, tax, discount, coupon, total } = useSelector((state) => state.cart)

  return (
    <div className="bg-white border border-border rounded-[var(--radius-lg)] p-6">
      <h3 className="font-semibold text-lg mb-4">Bill Details</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Item Total</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Fee</span>
          <span>{formatCurrency(deliveryFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (5%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount ({coupon?.code})</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        <hr className="border-border" />
        <div className="flex justify-between text-lg font-bold">
          <span>To Pay</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

export default CartSummary
