import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from '../../utils/icons'
import Button from '../common/Button'

function EmptyCart() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <ShoppingCart className="w-20 h-20 text-border mb-4" weight="duotone" />
      <h3 className="text-lg font-semibold mb-1">Your cart is empty</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        Looks like you haven&apos;t added anything to your cart yet. Browse restaurants and find something delicious!
      </p>
      <Button icon={ShoppingCart} onClick={() => navigate('/restaurants')}>
        Browse Restaurants
      </Button>
    </div>
  )
}

export default EmptyCart
