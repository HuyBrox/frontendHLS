import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk cho việc follow/unfollow
export const toggleFollowUser = createAsyncThunk(
  'follow/toggleFollow',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/user/followorunfollow/${userId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Không thể thay đổi trạng thái theo dõi');
      }

      const data = await response.json();

      if (data.success) {
        return {
          userId,
          isFollowing: data.isFollowing
        };
      }

      return rejectWithValue('Lỗi không xác định');
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice quản lý trạng thái follow
const followSlice = createSlice({
  name: 'follow',
  initialState: {
    followingUsers: [], // Danh sách những người đang được follow
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(toggleFollowUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFollowUser.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, isFollowing } = action.payload;

        if (isFollowing) {
          // Nếu đang follow, thêm vào danh sách
          if (!state.followingUsers.includes(userId)) {
            state.followingUsers.push(userId);
          }
        } else {
          // Nếu bỏ follow, xóa khỏi danh sách
          state.followingUsers = state.followingUsers.filter(id => id !== userId);
        }
      })
      .addCase(toggleFollowUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default followSlice.reducer;