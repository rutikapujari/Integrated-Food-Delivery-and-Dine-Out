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

export const createMenuItem = createAsyncThunk('menu/createMenuItem', async (itemData, { rejectWithValue }) => {
  try {
    const { data } = await menuService.create(itemData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create menu item')
  }
})

export const updateMenuItem = createAsyncThunk('menu/updateMenuItem', async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const { data } = await menuService.update(id, updates)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update menu item')
  }
})

export const deleteMenuItem = createAsyncThunk('menu/deleteMenuItem', async (id, { rejectWithValue }) => {
  try {
    const { data } = await menuService.remove(id)
    return { ...data, id }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete menu item')
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
      .addCase(createMenuItem.fulfilled, (state, action) => {
        const item = action.payload.menuItem
        if (item) {
          state.items.unshift(item)
          if (item.category && !state.categories.includes(item.category)) {
            state.categories.push(item.category)
          }
        }
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const updated = action.payload.menuItem
        if (updated) {
          const idx = state.items.findIndex((i) => i._id === updated._id)
          if (idx >= 0) state.items[idx] = updated
          const cats = new Set(state.items.map((i) => i.category).filter(Boolean))
          state.categories = [...cats]
        }
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i._id !== action.payload.id)
        const cats = new Set(state.items.map((i) => i.category).filter(Boolean))
        state.categories = [...cats]
      })
  },
})

export const { setMenuSearch, clearMenuError } = menuSlice.actions
export default menuSlice.reducer
