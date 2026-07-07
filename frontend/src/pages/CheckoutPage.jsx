import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import { clearCart } from '../redux/cartSlice'
import { createOrder } from '../redux/orderSlice'
import { formatCurrency } from '../utils/formatCurrency'
import { notify } from '../utils/toast'
import DeliveryAddress from '../components/cart/DeliveryAddress'
import CartSummary from '../components/cart/CartSummary'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'

function CheckoutPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const cart = useSelector((state) => state.cart)
  const { loading: orderLoading } = useSelector((state) => state.order)

  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [paymentError, setPaymentError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const addresses = user?.addresses || []

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      notify.error('Please select a delivery address')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      if (paymentMethod === 'online') {
        const { paymentService } = await import('../services/paymentService')
        const { data } = await paymentService.createCheckout({
          items: cart.items,
          addressId: selectedAddress._id,
          total: cart.total,
        })
        if (data.url) {
          window.location.href = data.url
          return
        }
      }

      const result = await dispatch(createOrder({
        items: cart.items.map((i) => ({
          menuItemId: i.menuItemId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        restaurantId: cart.restaurantId,
        address: selectedAddress,
        paymentMethod,
        totalAmount: cart.total,
      }))

      if (createOrder.fulfilled.match(result)) {
        dispatch(clearCart())
        notify.success('Order placed successfully!')
        navigate(`/orders/${result.payload.order._id}`)
      } else {
        notify.error(result.payload || 'Failed to place order')
      }
    } catch (err) {
      setPaymentError(err.message || 'Payment failed')
      notify.error('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!cart.items.length) {
    navigate('/cart', { replace: true })
    return null
  }

  return (
    <motion.div {...pageTransition} className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl md:text-4xl mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <DeliveryAddress
              selectedAddress={selectedAddress}
              addresses={addresses}
              onSelect={setSelectedAddress}
            />
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <div className="p-6 border border-border rounded-[var(--radius-lg)] space-y-4">
              {[
                { value: 'cod', label: 'Cash on Delivery' },
                { value: 'online', label: 'Pay Online (UPI/Card/NetBanking)' },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex items-center gap-3 p-3 border border-border rounded-[var(--radius-md)] cursor-pointer hover:border-primary transition-colors"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                    className="accent-primary"
                  />
                  <span className="font-medium text-sm">{method.label}</span>
                </label>
              ))}
              {paymentError && (
                <p className="text-destructive text-sm mt-2">{paymentError}</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <CartSummary />
          <Button
            size="lg"
            className="w-full"
            loading={isProcessing}
            onClick={handlePlaceOrder}
          >
            Place Order &mdash; {formatCurrency(cart.total)}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default CheckoutPage
