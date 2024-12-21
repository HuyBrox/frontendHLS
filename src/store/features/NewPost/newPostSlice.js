import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch user posts thunk
export const fetchUserPosts = createAsyncThunk(
  'newPost/fetchUserPosts',
  async ({ userId }, { rejectWithValue }) => {
    const currentUserId = localStorage.getItem('_id');
    try {
      const targetUserId = userId || currentUserId;
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/post/getUserPost/${targetUserId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      if (data.success) {
        // Transform posts data with like status
        const postsWithLikeStatus = data.posts.map(post => ({
          ...post,
          isLiked: post.likes?.some(like => like._id === currentUserId),
          likesCount: post.likes?.length || 0,
          likesDetails: post.likes || [] // Store full likes array
        }));
        return { posts: postsWithLikeStatus };
      } else {
        return rejectWithValue(data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single post thunk
export const fetchGetPost = createAsyncThunk(
  'newPost/fetchGetPost',
  async ({ postId }, { rejectWithValue, getState }) => {
    const currentUserId = localStorage.getItem('_id');
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/post/getPost/${postId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post details');
      }

      const data = await response.json();

      if (data.success) {
        const { comments, totalComments } = getState().comments;

        // Make sure we include all author fields
        const postWithAuthor = {
          ...data.post,
          author: {
            ...data.post.author,
            fullname: data.post.author.fullname,  // Explicitly include fullname
            _id: data.post.author._id,
            username: data.post.author.username,
            profilePicture: data.post.author.profilePicture
          },
          comments,
          totalComments,
          isLiked: data.post.likes?.some(like => like._id === currentUserId),
          likesCount: data.post.likes?.length || 0,
          likesDetails: data.post.likes || []
        };

        return postWithAuthor;
      } else {
        return rejectWithValue(data.message || 'Failed to fetch post details');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Toggle like thunk
export const toggleLike = createAsyncThunk(
  'newPost/toggleLike',
  async ({ postId }, { rejectWithValue, dispatch, getState }) => {
    const currentUserId = localStorage.getItem('_id');
    const state = getState();
    const post = state.newPost.posts.find((p) => p._id === postId);
    const isCurrentlyLiked = post?.likesDetails.some((like) => like._id === currentUserId);

    // Ngay lập tức update UI
    dispatch(newPostSlice.actions.optimisticToggleLike({
      postId,
      isLiked: !isCurrentlyLiked,
      currentUserId
    }));

    try {
      const endpoint = isCurrentlyLiked
        ? `${process.env.REACT_APP_BACKEND_URL}/post/unLikePost/${postId}`
        : `${process.env.REACT_APP_BACKEND_URL}/post/likePost/${postId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        return {
          postId,
          likes: data.post.likes,
          isLiked: data.post.likes.some((like) => like._id === currentUserId),
          likesCount: data.post.likes.length,
          likesDetails: data.post.likes
        };
      } else {
        // Nếu API thất bại, revert lại trạng thái ban đầu
        dispatch(newPostSlice.actions.optimisticToggleLike({
          postId,
          isLiked: isCurrentlyLiked,
          currentUserId
        }));
        return rejectWithValue(data.message || 'Failed to update like');
      }
    } catch (error) {
      // Tương tự, nếu lỗi mạng thì revert
      dispatch(newPostSlice.actions.optimisticToggleLike({
        postId,
        isLiked: isCurrentlyLiked,
        currentUserId
      }));
      return rejectWithValue(error.message);
    }
  }
);
const newPostSlice = createSlice({
  name: 'newPost',
  initialState: {
    posts: [],
    selectedPost: null,
    showPreviewModal: false,
    loading: false,
    error: null,
  },
  reducers: {
    setShowPreviewModal(state, action) {
      state.showPreviewModal = action.payload;
    },
    setSelectedPost(state, action) {
      state.selectedPost = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    updatePostLikeStatus(state, action) {
      const { postId, isLiked, likesCount } = action.payload;
      state.posts = state.posts.map((post) =>
        post._id === postId ? { ...post, isLiked, likesCount } : post
      );
      if (state.selectedPost?._id === postId) {
        state.selectedPost = { ...state.selectedPost, isLiked, likesCount };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch posts';
      })
      .addCase(fetchGetPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGetPost.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPost = {
          ...action.payload,
          author: action.payload.author,
        };
        state.showPreviewModal = true;
        const existingPostIndex = state.posts.findIndex(p => p._id === action.payload._id);
        if (existingPostIndex === -1) {
          state.posts.push(action.payload);
        } else {
          state.posts[existingPostIndex] = action.payload;
        }
        state.showPreviewModal = true;
      })
      .addCase(fetchGetPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch post details';
        state.showPreviewModal = false;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, likes: likesDetails, isLiked, likesCount } = action.payload;

        // Cập nhật trạng thái trong danh sách bài viết
        state.posts = state.posts.map(post =>
          post._id === postId
            ? { ...post, likesDetails, isLiked, likesCount }
            : post
        );

        // Cập nhật trạng thái trong bài viết đang được chọn
        if (state.selectedPost?._id === postId) {
          state.selectedPost = {
            ...state.selectedPost,
            likesDetails,
            isLiked,
            likesCount
          };
        }
      });
  },
});

export const {
  setShowPreviewModal,
  setSelectedPost,
  clearError,
  updatePostLikeStatus
} = newPostSlice.actions;

export default newPostSlice.reducer;