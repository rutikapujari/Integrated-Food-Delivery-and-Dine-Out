import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import cartReducer from './cartSlice'
import restaurantReducer from './restaurantSlice'
import menuReducer from './menuSlice'
import orderReducer from './orderSlice'
import notificationReducer from './notificationSlice'
import reviewReducer from './reviewSlice'
import reservationReducer from './reservationSlice'
import paymentReducer from './paymentSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    restaurant: restaurantReducer,
    menu: menuReducer,
    order: orderReducer,
    notification: notificationReducer,
    review: reviewReducer,
    reservation: reservationReducer,
    payment: paymentReducer,
  },
})
