import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reservationService } from '../services/reservationService'

export const createReservation = createAsyncThunk('reservation/create', async (data, { rejectWithValue }) => {
  try {
    const { data: res } = await reservationService.create(data)
    return res
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create reservation')
  }
})

export const fetchReservations = createAsyncThunk('reservation/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await reservationService.getAll()
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch reservations')
  }
})

export const fetchReservationById = createAsyncThunk('reservation/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await reservationService.getById(id)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch reservation')
  }
})

export const cancelReservation = createAsyncThunk('reservation/cancel', async (id, { rejectWithValue }) => {
  try {
    const { data } = await reservationService.cancel(id)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to cancel reservation')
  }
})

const reservationSlice = createSlice({
  name: 'reservation',
  initialState: {
    list: [],
    selected: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearReservationError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createReservation.pending, (state) => { state.loading = true; state.error = null })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false
        state.list.unshift(action.payload.reservation)
      })
      .addCase(createReservation.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchReservations.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.reservations || []
      })
      .addCase(fetchReservations.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchReservationById.pending, (state) => { state.loading = true })
      .addCase(fetchReservationById.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload.reservation })
      .addCase(fetchReservationById.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(cancelReservation.fulfilled, (state, action) => {
        const idx = state.list.findIndex((r) => r._id === action.payload.reservation?._id)
        if (idx >= 0) state.list[idx].status = 'cancelled'
        if (state.selected?._id === action.payload.reservation?._id) state.selected.status = 'cancelled'
      })
  },
})

export const { clearReservationError } = reservationSlice.actions
export default reservationSlice.reducer
