import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import CartList from '../components/cart/CartList'
import EmptyCart from '../components/cart/EmptyCart'
import CartSummary from '../components/cart/CartSummary'
import Coupon from '../components/cart/Coupon'
import Button from '../components/common/Button'
import { useCart } from '../hooks/useCart'

function CartPage() {
  const navigate = useNavigate()
  const { items, applyCoupon } = useCart()
  const isEmpty = items.length === 0

  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl md:text-4xl mb-8">Your Cart</h1>

      {isEmpty ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <CartList />
            <Coupon onApply={applyCoupon} />
          </div>

          <div className="space-y-6">
            <CartSummary />
            <Button size="lg" className="w-full" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default CartPage
