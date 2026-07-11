import { useSelector } from 'react-redux'
import CartItem from './CartItem'
import Loader from '../common/Loader'

function CartList() {
  const { items, loading } = useSelector((state) => state.cart)

  if (loading) return <Loader variant="card" count={3} />

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item) => (
        <CartItem key={item.menuItemId} item={item} />
      ))}
    </div>
  )
}

export default CartList
