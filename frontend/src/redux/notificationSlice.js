import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const fetchNotifications = createAsyncThunk('notification/fetchNotifications', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch notifications')
  }
})

export const markAsRead = createAsyncThunk('notification/markAsRead', async (id, { rejectWithValue }) => {
  try {
    await api.put(`/notifications/${id}/read`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark as read')
  }
})

export const markAllRead = createAsyncThunk('notification/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.put('/notifications/read-all')
    return null
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark all read')
  }
})

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    list: [],
    unread: 0,
    loading: false,
  },
  reducers: {
    addNotification(state, action) {
      state.list.unshift(action.payload)
      state.unread += 1
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.notifications || []
        state.unread = state.list.filter((n) => !n.read).length
      })
      .addCase(fetchNotifications.rejected, (state) => { state.loading = false })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.list.find((n) => n._id === action.payload)
        if (notif && !notif.read) {
          notif.read = true
          state.unread = Math.max(0, state.unread - 1)
        }
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.list.forEach((n) => { n.read = true })
        state.unread = 0
      })
  },
})

export const { addNotification } = notificationSlice.actions
export default notificationSlice.reducer
