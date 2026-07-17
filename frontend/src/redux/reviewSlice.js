import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reviewService } from '../services/reviewService'

export const fetchReviews = createAsyncThunk('review/fetchReviews', async (restaurantId, { rejectWithValue }) => {
  try {
    const { data } = await reviewService.getByRestaurant(restaurantId)
    return { restaurantId, data }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch reviews')
  }
})

export const createReview = createAsyncThunk('review/createReview', async (reviewData, { rejectWithValue }) => {
  try {
    const { data } = await reviewService.create(reviewData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create review')
  }
})

export const updateReview = createAsyncThunk('review/updateReview', async ({ id, ...updates }, { rejectWithValue }) => {
  try {
    const { data } = await reviewService.update(id, updates)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update review')
  }
})

export const deleteReview = createAsyncThunk('review/deleteReview', async ({ id, restaurantId }, { rejectWithValue }) => {
  try {
    await reviewService.delete(id)
    return { id, restaurantId }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete review')
  }
})

const reviewSlice = createSlice({
  name: 'review',
  initialState: {
    restaurantReviews: {},
    userReviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearReviewError(state) { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false
        state.restaurantReviews[action.payload.restaurantId] = action.payload.data.reviews || []
      })
      .addCase(fetchReviews.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(createReview.pending, (state) => { state.loading = true })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false
        const review = action.payload.review
        const restaurantId = review.restaurantId || review.restaurant
        if (restaurantId) {
          if (!state.restaurantReviews[restaurantId]) state.restaurantReviews[restaurantId] = []
          state.restaurantReviews[restaurantId].unshift(review)
        }
        state.userReviews.unshift(review)
      })
      .addCase(createReview.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(updateReview.fulfilled, (state, action) => {
        const updated = action.payload.review
        const restaurantId = updated.restaurantId || updated.restaurant
        if (restaurantId && state.restaurantReviews[restaurantId]) {
          const idx = state.restaurantReviews[restaurantId].findIndex((r) => r._id === updated._id)
          if (idx >= 0) state.restaurantReviews[restaurantId][idx] = updated
        }
        const userIdx = state.userReviews.findIndex((r) => r._id === updated._id)
        if (userIdx >= 0) state.userReviews[userIdx] = updated
      })
      .addCase(updateReview.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(deleteReview.fulfilled, (state, action) => {
        const { id, restaurantId } = action.payload
        if (restaurantId && state.restaurantReviews[restaurantId]) {
          state.restaurantReviews[restaurantId] = state.restaurantReviews[restaurantId].filter((r) => r._id !== id)
        }
        state.userReviews = state.userReviews.filter((r) => r._id !== id)
      })
      .addCase(deleteReview.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export const { clearReviewError } = reviewSlice.actions
export default reviewSlice.reducer
