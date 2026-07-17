import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { paymentService } from '../services/paymentService'

export const createRazorpayOrder = createAsyncThunk(
  'payment/createRazorpayOrder',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await paymentService.createRazorpayOrder({ orderId })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create payment order')
    }
  }
)

export const verifyRazorpayPayment = createAsyncThunk(
  'payment/verify',
  async (paymentData, { rejectWithValue }) => {
    try {
      const { data } = await paymentService.verifyPayment(paymentData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Payment verification failed')
    }
  }
)

export const fetchPayments = createAsyncThunk(
  'payment/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await paymentService.getPayments()
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch payments')
    }
  }
)

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    razorpayOrder: null,
    lastPayment: null,
    payments: [],
    loading: false,
    verifying: false,
    error: null,
    success: false,
  },
  reducers: {
    clearPaymentState(state) {
      state.razorpayOrder = null
      state.lastPayment = null
      state.error = null
      state.success = false
    },
    clearPaymentError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false
        state.razorpayOrder = action.payload
      })
      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.verifying = true
        state.error = null
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.verifying = false
        state.lastPayment = action.payload.payment
        state.success = true
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.verifying = false
        state.error = action.payload
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload.payments || []
      })
  },
})

export const { clearPaymentState, clearPaymentError } = paymentSlice.actions
export default paymentSlice.reducer
