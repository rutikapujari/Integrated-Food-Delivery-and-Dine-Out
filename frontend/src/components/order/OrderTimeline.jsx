import { CheckCircle, Circle, Truck, Package, Timer } from '@phosphor-icons/react'
import { ORDER_STATUS } from '../../utils/constants'

const steps = [
  { key: ORDER_STATUS.PENDING, label: 'Order Placed', icon: Timer },
  { key: ORDER_STATUS.CONFIRMED, label: 'Confirmed', icon: CheckCircle },
  { key: ORDER_STATUS.PREPARING, label: 'Preparing', icon: Package },
  { key: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: Truck },
  { key: ORDER_STATUS.DELIVERED, label: 'Delivered', icon: CheckCircle },
]

const orderHierarchy = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.DELIVERED,
]

function OrderTimeline({ status }) {
  if (status === ORDER_STATUS.CANCELLED) {
    return (
      <div className="py-4 text-center">
        <p className="text-destructive font-semibold">This order has been cancelled</p>
      </div>
    )
  }

  const currentIndex = orderHierarchy.indexOf(status)

  return (
    <div className="py-2">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex && currentIndex >= 0
        const isCurrent = index === currentIndex
        const Icon = step.icon

        return (
          <div key={step.key} className="flex items-start gap-3 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-success text-white'
                    : 'bg-border text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-success/20' : ''}`}
              >
                <Icon className="w-4 h-4" weight={isCompleted ? 'fill' : 'regular'} />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-10 mt-1 ${isCompleted ? 'bg-success' : 'bg-border'}`} />
              )}
            </div>
            <div className="pt-1">
              <p className={`font-semibold text-sm ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-success mt-0.5 animate-pulse">In progress...</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OrderTimeline
