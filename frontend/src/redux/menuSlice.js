import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { menuService } from '../services/menuService'

export const fetchMenuItems = createAsyncThunk('menu/fetchMenuItems', async (params, { rejectWithValue }) => {
  try {
    const { data } = await menuService.getAll(params)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch menu')
  }
})

export const fetchMenuItemById = createAsyncThunk('menu/fetchMenuItemById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await menuService.getById(id)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch menu item')
  }
})

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    categories: [],
    selectedItem: null,
    search: '',
    loading: false,
    error: null,
  },
  reducers: {
    setMenuSearch(state, action) { state.search = action.payload },
    clearMenuError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenuItems.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.menuItems || []
        const cats = new Set(state.items.map((i) => i.category).filter(Boolean))
        state.categories = [...cats]
      })
      .addCase(fetchMenuItems.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchMenuItemById.pending, (state) => { state.loading = true })
      .addCase(fetchMenuItemById.fulfilled, (state, action) => { state.loading = false; state.selectedItem = action.payload.menuItem })
      .addCase(fetchMenuItemById.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { setMenuSearch, clearMenuError } = menuSlice.actions
export default menuSlice.reducer
