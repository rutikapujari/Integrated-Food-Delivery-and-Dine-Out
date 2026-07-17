import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartService } from '../services/cartService'
import { DELIVERY_FEE } from '../utils/constants'

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await cartService.getCart()
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart')
  }
})

export const addToCart = createAsyncThunk('cart/addToCart', async (cartItem, { rejectWithValue }) => {
  try {
    const { data } = await cartService.addItem(cartItem)
    return data
  } catch (err) {
    if (err.response?.status === 409 && !cartItem.replaceCart) {
      try {
        const { data } = await cartService.addItem({ ...cartItem, replaceCart: true })
        return data
      } catch (retryErr) {
        return rejectWithValue(retryErr.response?.data?.message || 'Failed to add item')
      }
    }
    return rejectWithValue(err.response?.data?.message || 'Failed to add item')
  }
})

export const updateCartQuantity = createAsyncThunk('cart/updateQuantity', async ({ menuItemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await cartService.updateItem(menuItemId, { quantity })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update item')
  }
})

export const removeFromCart = createAsyncThunk('cart/removeFromCart', async (menuItemId, { rejectWithValue }) => {
  try {
    await cartService.removeItem(menuItemId)
    return menuItemId
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove item')
  }
})

export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    await cartService.clearCart()
    return null
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart')
  }
})

const computeTotals = (items, coupon = null) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryFee = subtotal > 0 ? DELIVERY_FEE : 0
  const tax = Math.round(subtotal * 0.05)
  let discount = 0
  if (coupon) {
    discount = coupon.discountAmount || Math.round(subtotal * (coupon.discountPercent || 0) / 100)
  }
  const total = subtotal + deliveryFee + tax - discount
  return { subtotal, deliveryFee, tax, discount, total }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    restaurantId: null,
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    discount: 0,
    coupon: null,
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {
    applyCoupon(state, action) {
      const coupon = action.payload
      const computed = computeTotals(state.items, coupon)
      state.coupon = coupon
      state.subtotal = computed.subtotal
      state.deliveryFee = computed.deliveryFee
      state.tax = computed.tax
      state.discount = computed.discount
      state.total = computed.total
    },
    removeCoupon(state) {
      state.coupon = null
      const computed = computeTotals(state.items, null)
      state.subtotal = computed.subtotal
      state.deliveryFee = computed.deliveryFee
      state.tax = computed.tax
      state.discount = 0
      state.total = computed.total
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.cart?.items || []
        state.restaurantId = action.payload.cart?.restaurantId || null
        const computed = computeTotals(state.items, state.coupon)
        Object.assign(state, computed)
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.restaurantId = null
      })
      .addCase(addToCart.pending, (state) => { state.loading = true; state.error = null })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.cart?.items || []
        state.restaurantId = action.payload.cart?.restaurantId || null
        const computed = computeTotals(state.items, state.coupon)
        Object.assign(state, computed)
      })
      .addCase(addToCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.restaurantId = null })
      .addCase(updateCartQuantity.pending, (state) => { state.loading = true })
      .addCase(updateCartQuantity.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.cart?.items || []
        const computed = computeTotals(state.items, state.coupon)
        Object.assign(state, computed)
      })
      .addCase(updateCartQuantity.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.menuItemId !== action.payload)
        if (state.items.length === 0) state.restaurantId = null
        const computed = computeTotals(state.items, state.coupon)
        Object.assign(state, computed)
      })
      .addCase(removeFromCart.rejected, (state, action) => { state.error = action.payload })
      .addCase(clearCart.fulfilled, (state) => {
        state.items = []
        state.restaurantId = null
        state.subtotal = 0
        state.deliveryFee = 0
        state.tax = 0
        state.discount = 0
        state.coupon = null
        state.total = 0
      })
  },
})

export const { applyCoupon, removeCoupon, clearError: clearCartError } = cartSlice.actions
export default cartSlice.reducer
