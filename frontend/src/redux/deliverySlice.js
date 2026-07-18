import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { deliveryService } from '../services/deliveryService'

export const fetchMyDeliveries = createAsyncThunk(
  'delivery/fetchMyDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await deliveryService.getMyDeliveries()
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch deliveries')
    }
  }
)

export const fetchAvailableDeliveries = createAsyncThunk(
  'delivery/fetchAvailableDeliveries',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await deliveryService.getAvailable()
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch available orders')
    }
  }
)

export const claimDelivery = createAsyncThunk(
  'delivery/claimDelivery',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await deliveryService.claimDelivery(orderId)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to claim delivery')
    }
  }
)

export const updateDeliveryStatus = createAsyncThunk(
  'delivery/updateDeliveryStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const { data } = await deliveryService.updateStatus(orderId, status)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status')
    }
  }
)

export const updateDeliveryPayment = createAsyncThunk(
  'delivery/updateDeliveryPayment',
  async ({ orderId, paymentStatus }, { rejectWithValue }) => {
    try {
      const { data } = await deliveryService.updatePayment(orderId, paymentStatus)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update payment')
    }
  }
)

const initialState = {
  myDeliveries: [],
  available: [],
  loading: false,
  actionLoading: false,
  error: null,
}

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    clearDeliveryError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyDeliveries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchMyDeliveries.fulfilled, (state, action) => {
        state.loading = false
        state.myDeliveries = action.payload.orders || []
      })
      .addCase(fetchMyDeliveries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchAvailableDeliveries.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAvailableDeliveries.fulfilled, (state, action) => {
        state.loading = false
        state.available = action.payload.orders || []
      })
      .addCase(fetchAvailableDeliveries.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(claimDelivery.pending, (state) => {
        state.actionLoading = true
        state.error = null
      })
      .addCase(claimDelivery.fulfilled, (state, action) => {
        state.actionLoading = false
        const claimed = action.payload.order
        state.available = state.available.filter((o) => o._id !== claimed._id)
        if (!state.myDeliveries.find((o) => o._id === claimed._id)) {
          state.myDeliveries.unshift(claimed)
        }
      })
      .addCase(claimDelivery.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        const updated = action.payload.order
        const idx = state.myDeliveries.findIndex((o) => o._id === updated._id)
        if (idx !== -1) state.myDeliveries[idx] = updated
      })
      .addCase(updateDeliveryPayment.fulfilled, (state, action) => {
        const updated = action.payload.order
        const idx = state.myDeliveries.findIndex((o) => o._id === updated._id)
        if (idx !== -1) state.myDeliveries[idx] = updated
      })
  },
})

export const { clearDeliveryError } = deliverySlice.actions
export default deliverySlice.reducer
