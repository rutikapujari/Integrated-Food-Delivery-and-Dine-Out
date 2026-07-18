import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { eventService } from '../services/eventService'

export const fetchEvents = createAsyncThunk(
  'event/fetchEvents',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await eventService.getAll(params)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch events')
    }
  }
)

export const fetchEventById = createAsyncThunk(
  'event/fetchEventById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await eventService.getById(id)
      return data.event
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch event')
    }
  }
)

export const rsvpEvent = createAsyncThunk(
  'event/rsvpEvent',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await eventService.rsvp(id)
      return data.event
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to RSVP')
    }
  }
)

const initialState = {
  list: [],
  event: null,
  loading: false,
  actionLoading: false,
  error: null,
  total: 0,
}

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    clearEventError(state) {
      state.error = null
    },
    clearCurrentEvent(state) {
      state.event = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.events || []
        state.total = action.payload.total || 0
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false
        state.event = action.payload
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(rsvpEvent.pending, (state) => {
        state.actionLoading = true
      })
      .addCase(rsvpEvent.fulfilled, (state, action) => {
        state.actionLoading = false
        state.event = action.payload
      })
      .addCase(rsvpEvent.rejected, (state, action) => {
        state.actionLoading = false
        state.error = action.payload
      })
  },
})

export const { clearEventError, clearCurrentEvent } = eventSlice.actions
export default eventSlice.reducer
