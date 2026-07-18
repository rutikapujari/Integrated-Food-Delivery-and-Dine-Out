import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { orderService } from '../services/orderService'

export const createOrder = createAsyncThunk('order/createOrder', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await orderService.create(orderData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create order')
  }
})

export const fetchOrders = createAsyncThunk('order/fetchOrders', async (_, { rejectWithValue }) => {
  try {
    const { data } = await orderService.getAll()
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch orders')
  }
})

export const fetchOrderById = createAsyncThunk('order/fetchOrderById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await orderService.getById(id)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch order')
  }
})

export const cancelOrder = createAsyncThunk('order/cancelOrder', async (id, { rejectWithValue }) => {
  try {
    const { data } = await orderService.cancel(id)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel order')
  }
})

export const updateOrderStatusThunk = createAsyncThunk(
  'order/updateOrderStatusThunk',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const { data } = await orderService.updateStatus(orderId, status)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status')
    }
  }
)

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    list: [],
    activeOrder: null,
    loading: false,
    error: null,
  },
  reducers: {
    updateOrderStatus(state, action) {
      const { orderId, status } = action.payload
      const order = state.list.find((o) => o._id === orderId)
      if (order) order.status = status
      if (state.activeOrder?._id === orderId) state.activeOrder.status = status
    },
    setActiveOrder(state, action) { state.activeOrder = action.payload },
    clearOrderError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false
        state.list.unshift(action.payload.order)
        state.activeOrder = action.payload.order
      })
      .addCase(createOrder.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchOrders.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchOrders.fulfilled, (state, action) => { state.loading = false; state.list = action.payload.orders || [] })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchOrderById.pending, (state) => { state.loading = true })
      .addCase(fetchOrderById.fulfilled, (state, action) => { state.loading = false; state.activeOrder = action.payload.order })
      .addCase(fetchOrderById.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        const order = state.list.find((o) => o._id === action.payload.order?._id)
        if (order) order.status = 'cancelled'
        if (state.activeOrder?._id === action.payload.order?._id) state.activeOrder.status = 'cancelled'
      })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload.order
        const order = state.list.find((o) => o._id === updated._id)
        if (order) order.status = updated.status
        if (state.activeOrder?._id === updated._id) state.activeOrder.status = updated.status
      })
  },
})

export const { updateOrderStatus, setActiveOrder, clearOrderError } = orderSlice.actions
export default orderSlice.reducer
