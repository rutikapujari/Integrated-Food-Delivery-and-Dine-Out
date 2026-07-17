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

export const generateUpiQr = createAsyncThunk(
  'payment/generateUpiQr',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await paymentService.generateUpiQr({ orderId })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate UPI QR')
    }
  }
)

export const confirmUpiPayment = createAsyncThunk(
  'payment/confirmUpiPayment',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await paymentService.confirmUpiPayment(payload)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to confirm UPI payment')
    }
  }
)

export const markCodPaid = createAsyncThunk(
  'payment/markCodPaid',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await paymentService.markCodPaid({ orderId })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark COD as paid')
    }
  }
)

export const updateOrderPaymentStatus = createAsyncThunk(
  'payment/updateOrderPaymentStatus',
  async ({ orderId, paymentStatus }, { rejectWithValue }) => {
    try {
      const { data } = await paymentService.updateOrderPayment({ orderId, paymentStatus })
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order payment status')
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
    upiQr: null,
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
      state.upiQr = null
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
      .addCase(generateUpiQr.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateUpiQr.fulfilled, (state, action) => {
        state.loading = false
        state.upiQr = action.payload
      })
      .addCase(generateUpiQr.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(confirmUpiPayment.pending, (state) => {
        state.verifying = true
        state.error = null
      })
      .addCase(confirmUpiPayment.fulfilled, (state, action) => {
        state.verifying = false
        state.lastPayment = action.payload.payment
        state.success = true
      })
      .addCase(confirmUpiPayment.rejected, (state, action) => {
        state.verifying = false
        state.error = action.payload
      })
      .addCase(markCodPaid.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(markCodPaid.fulfilled, (state, action) => {
        state.loading = false
        state.lastPayment = action.payload.payment
        state.success = true
      })
      .addCase(markCodPaid.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments = action.payload.payments || []
      })
  },
})

export const { clearPaymentState, clearPaymentError } = paymentSlice.actions
export default paymentSlice.reducer
