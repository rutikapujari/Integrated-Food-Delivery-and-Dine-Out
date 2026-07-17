import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { markCodPaid } from '../../redux/paymentSlice'
import { fetchOrderById } from '../../redux/orderSlice'
import { notify } from '../../utils/toast'
import { formatCurrency } from '../../utils/formatCurrency'
import { CheckCircle, CurrencyDollar } from '../../utils/icons'
import Button from '../common/Button'

function CodPaymentAction({ order }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(false)

  if (!order) return null
  if (order.paymentMethod !== 'Cash on Delivery') return null
  if (order.paymentStatus === 'Paid') return null

  const canCollect =
    user?.role === 'admin' ||
    user?.role === 'courier' ||
    user?.role === 'restaurant'

  if (!canCollect) return null

  const handleCollect = async () => {
    setLoading(true)
    try {
      const result = await dispatch(markCodPaid(order._id))
      if (markCodPaid.fulfilled.match(result)) {
        notify.success('Cash on Delivery payment collected')
        dispatch(fetchOrderById(order._id))
      } else {
        notify.error(result.payload || 'Failed to collect payment')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-[var(--radius-lg)] p-4 mb-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-sm flex items-center gap-2">
            <CurrencyDollar className="h-4 w-4 text-amber-600" />
            Cash on Delivery — Collect {formatCurrency(order.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Mark this order as paid after collecting cash on delivery.
          </p>
        </div>
        <Button variant="outline" loading={loading} onClick={handleCollect} className="shrink-0">
          <CheckCircle className="h-4 w-4" /> Mark Paid
        </Button>
      </div>
    </div>
  )
}

export default CodPaymentAction
