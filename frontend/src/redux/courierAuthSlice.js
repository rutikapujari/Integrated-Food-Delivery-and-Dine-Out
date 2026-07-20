import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { courierAuthService } from '../services/courierAuthService'

export const courierLogin = createAsyncThunk('courierAuth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await courierAuthService.login(credentials)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed')
  }
})

export const courierRegister = createAsyncThunk('courierAuth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await courierAuthService.register(userData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed')
  }
})

export const courierVerifyOTP = createAsyncThunk('courierAuth/verifyOTP', async (otpData, { rejectWithValue }) => {
  try {
    const { data } = await courierAuthService.verifyOTP(otpData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'OTP verification failed')
  }
})

export const courierFetchMe = createAsyncThunk('courierAuth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await courierAuthService.getMe()
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch user')
  }
})

export const courierLogout = createAsyncThunk('courierAuth/logout', async () => {
  try {
    await courierAuthService.logout()
  } catch {
    // ignore network errors; always clear local delivery session
  } finally {
    localStorage.removeItem('deliveryToken')
    localStorage.removeItem('deliveryRefreshToken')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  }
})

const courierAuthSlice = createSlice({
  name: 'courierAuth',
  initialState: {
    user: null,
    token: localStorage.getItem('deliveryToken') || null,
    refreshToken: localStorage.getItem('deliveryRefreshToken') || null,
    isAuthenticated: !!localStorage.getItem('deliveryToken'),
    loading: false,
    error: null,
  },
  reducers: {
    clearCourierError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(courierLogin.pending, (state) => { state.loading = true; state.error = null })
      .addCase(courierLogin.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        state.isAuthenticated = true
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.setItem('deliveryToken', action.payload.token)
        localStorage.setItem('deliveryRefreshToken', action.payload.refreshToken)
      })
      .addCase(courierLogin.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(courierRegister.pending, (state) => { state.loading = true; state.error = null })
      .addCase(courierRegister.fulfilled, (state) => { state.loading = false })
      .addCase(courierRegister.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(courierVerifyOTP.pending, (state) => { state.loading = true; state.error = null })
      .addCase(courierVerifyOTP.fulfilled, (state) => { state.loading = false })
      .addCase(courierVerifyOTP.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(courierFetchMe.pending, (state) => { state.loading = true })
      .addCase(courierFetchMe.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(courierFetchMe.rejected, (state) => { state.loading = false; state.isAuthenticated = false })
      .addCase(courierLogout.fulfilled, (state) => {
        state.user = null; state.token = null; state.refreshToken = null; state.isAuthenticated = false
      })
  },
})

export const { clearCourierError } = courierAuthSlice.actions
export default courierAuthSlice.reducer
