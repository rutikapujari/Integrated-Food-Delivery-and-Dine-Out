import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { pageTransition } from '../utils/motion'
import OrderList from '../components/order/OrderList'
import { Storefront } from '../utils/icons'

function OrdersPage() {
  const { list, loading } = useSelector((state) => state.order)

  return (
    <motion.div {...pageTransition} className="min-h-screen bg-[#fffaf5]">
      <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <header className="mb-7 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">Your food history</p>
            <h1 className="mt-1 text-3xl font-bold text-foreground md:text-4xl">My orders</h1>
            {!loading && <p className="mt-2 text-muted-foreground">{list.length ? `${list.length} order${list.length === 1 ? '' : 's'} placed with FoodHub` : 'Your next favourite meal is waiting.'}</p>}
          </div>
          <Link to="/restaurants" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover">
            <Storefront className="h-4 w-4" weight="fill" /> Browse restaurants
          </Link>
        </header>
        <OrderList />
      </div>
    </motion.div>
  )
}

export default OrdersPage
