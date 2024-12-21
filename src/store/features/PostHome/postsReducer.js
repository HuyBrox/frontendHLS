import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state for posts
const initialState = {
  posts: [],
  loading: false,
  error: null,
  page: 1,
  hasMorePosts: true,
};

// Async thunk to fetch posts from the API
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (page, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/home/getPostHome?page=${page}&limit=20`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        return data.posts;
      } else {
        throw new Error(data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMorePosts = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;

        // If the returned posts length is less than the limit, set `hasMorePosts` to false
        if (action.payload.length < 20) {
          state.hasMorePosts = false;
        }

        // Append the new posts to the existing ones
        state.posts = state.page === 1 ? action.payload : [...state.posts, ...action.payload];
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch posts';
      });
  },
});

export const { resetPosts } = postsSlice.actions;
export default postsSlice.reducer;
