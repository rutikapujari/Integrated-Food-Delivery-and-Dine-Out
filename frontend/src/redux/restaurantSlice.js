import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { restaurantService } from '../services/restaurantService'

export const fetchRestaurants = createAsyncThunk('restaurant/fetchRestaurants', async (params, { rejectWithValue }) => {
  try {
    const { data } = await restaurantService.getAll(params)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch restaurants')
  }
})

export const fetchRestaurantById = createAsyncThunk('restaurant/fetchRestaurantById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await restaurantService.getById(id)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch restaurant')
  }
})

export const fetchNearbyRestaurants = createAsyncThunk('restaurant/fetchNearby', async (params, { rejectWithValue }) => {
  try {
    const { data } = await restaurantService.getNearby(params)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch nearby restaurants')
  }
})

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState: {
    list: [],
    selected: null,
    filters: { cuisine: null, rating: null, deliveryTime: null },
    search: '',
    pagination: { page: 1, limit: 12, total: 0, pages: 0 },
    loading: false,
    error: null,
  },
  reducers: {
    setSearch(state, action) { state.search = action.payload },
    setFilters(state, action) { state.filters = { ...state.filters, ...action.payload } },
    clearFilters(state) { state.filters = { cuisine: null, rating: null, deliveryTime: null } },
    setPage(state, action) { state.pagination.page = action.payload },
    clearError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.restaurants || []
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 12,
          total: action.payload.total || 0,
          pages: action.payload.pages || 0,
        }
      })
      .addCase(fetchRestaurants.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchRestaurantById.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchRestaurantById.fulfilled, (state, action) => { state.loading = false; state.selected = action.payload.restaurant })
      .addCase(fetchRestaurantById.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchNearbyRestaurants.pending, (state) => { state.loading = true })
      .addCase(fetchNearbyRestaurants.fulfilled, (state, action) => { state.loading = false; state.list = action.payload.restaurants || [] })
      .addCase(fetchNearbyRestaurants.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { setSearch, setFilters, clearFilters, setPage, clearError: clearRestaurantError } = restaurantSlice.actions
export default restaurantSlice.reducer
