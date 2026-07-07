import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import OrderList from '../components/order/OrderList'

function OrdersPage() {
  return (
    <motion.div {...pageTransition} className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-3xl md:text-4xl mb-8">My Orders</h1>
      <OrderList />
    </motion.div>
  )
}

export default OrdersPage
