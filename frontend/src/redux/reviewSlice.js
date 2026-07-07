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
  },
})

export const { clearReviewError } = reviewSlice.actions
export default reviewSlice.reducer
