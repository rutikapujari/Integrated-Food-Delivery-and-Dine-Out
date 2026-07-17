import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchOrders } from '../../redux/orderSlice'
import OrderCard from './OrderCard'
import Loader from '../common/Loader'
import Button from '../common/Button'
import { ClipboardText, ForkKnife, Storefront } from '../../utils/icons'

function OrderList() {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector((state) => state.order)

  useEffect(() => {
    dispatch(fetchOrders())
  }, [dispatch])

  if (loading) return <Loader variant="card" count={4} />
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h3 className="text-lg font-semibold mb-1">Failed to load orders</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button variant="outline" onClick={() => dispatch(fetchOrders())}>Try Again</Button>
      </div>
    )
  }
  if (!list.length) {
    return (
      <div className="grid min-h-80 place-items-center rounded-lg border border-border bg-white px-5 py-10 text-center shadow-[var(--shadow-card)]">
        <div>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary"><ClipboardText className="h-7 w-7" weight="duotone" /></span>
          <h3 className="mt-5 text-xl font-bold text-foreground">No orders yet</h3>
          <p className="mx-auto mt-2 max-w-sm text-muted-foreground">Choose a restaurant or dish to place your first order.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/restaurants" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"><Storefront className="h-4 w-4" weight="fill" /> Find restaurants</Link>
            <Link to="/menu" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 text-sm font-semibold text-foreground hover:border-primary hover:text-primary"><ForkKnife className="h-4 w-4" weight="bold" /> Browse menu</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {list.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  )
}

export default OrderList
