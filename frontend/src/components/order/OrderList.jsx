import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchOrders } from '../../redux/orderSlice'
import OrderCard from './OrderCard'
import Loader from '../common/Loader'
import Button from '../common/Button'
import { ClipboardText } from '../../utils/icons'

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
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <ClipboardText className="w-16 h-16 text-border mb-4" weight="duotone" />
        <h3 className="text-lg font-semibold mb-1">No orders yet</h3>
        <p className="text-muted-foreground max-w-sm mb-6">Start ordering from your favourite restaurants.</p>
        <Button onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {list.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  )
}

export default OrderList
