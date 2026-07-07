export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'accent',
  preparing: 'accent',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'destructive',
}

export const CUISINE_TYPES = [
  'Italian', 'Chinese', 'Indian', 'Japanese', 'Mexican',
  'Thai', 'American', 'French', 'Mediterranean', 'Korean',
  'Fast Food', 'Dessert', 'Beverages',
]

export const DELIVERY_FEE = 50

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
}
