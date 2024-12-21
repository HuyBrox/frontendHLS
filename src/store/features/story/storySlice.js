import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Fetch my stories
export const fetchMyStories = createAsyncThunk(
  'story/fetchMyStories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/story/my-stories`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        return data.stories;
      } else {
        throw new Error(data.message || 'Failed to fetch my stories');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch current user stories
export const fetchCurrentUserStories = createAsyncThunk(
  'story/fetchCurrentUserStories',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/story/getAllStory`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        const userStories = data.stories.filter(
          (story) => story.userId?._id === userId
        );
        return userStories;
      } else {
        throw new Error(data.message || 'Failed to fetch stories');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const storySlice = createSlice({
  name: 'story',
  initialState: {
    userStories: [],
    myStories: [],
    selectedStoryGroup: null,
    currentStoryIndex: 0,
    isStoryModalOpen: false,
    isUploadModalOpen: false,
    loading: false,
    error: null,
    routerParams: {
      storyId: null,
      openStoryOnLoad: false,
    },
    // Audio handling state
    currentAudio: null,
    audioPlaying: false,
  },
  reducers: {
    setSelectedStoryGroup: (state, action) => {
      state.selectedStoryGroup = action.payload;
    },
    setCurrentStoryIndex: (state, action) => {
      state.currentStoryIndex = action.payload;
    },
    openStoryModal: (state) => {
      state.isStoryModalOpen = true;
    },
    closeStoryModal: (state) => {
      state.isStoryModalOpen = false;
      state.selectedStoryGroup = null;
      state.currentStoryIndex = 0;
    },
    openUploadModal: (state) => {
      state.isUploadModalOpen = true;
    },
    closeUploadModal: (state) => {
      state.isUploadModalOpen = false;
    },
    updateStoryStatus: (state, action) => {
      const storyId = action.payload;
      const story = state.userStories.find((s) => s._id === storyId);
      if (story) {
        story.isViewed = true;
      }
    },
    setRouterParams: (state, action) => {
      state.routerParams = {
        ...state.routerParams,
        ...action.payload,
      };
    },
    openStoryByIdOnLoad: (state, action) => {
      state.routerParams = {
        storyId: action.payload,
        openStoryOnLoad: true,
      };
    },
    clearRouterParams: (state) => {
      state.routerParams = {
        storyId: null,
        openStoryOnLoad: false,
      };
    },
    // Audio control reducers
    setCurrentAudio: (state, action) => {
      state.currentAudio = action.payload;
    },
    setAudioPlaying: (state, action) => {
      state.audioPlaying = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchCurrentUserStories
      .addCase(fetchCurrentUserStories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUserStories.fulfilled, (state, action) => {
        state.loading = false;
        state.userStories = action.payload.map(story => ({
          ...story,
          hasAudio: story.contentType === 'image_audio' || story.contentType === 'video_audio',
          audioUrl: story.sound,
          timeAction: story.timeAction || "0:00",
          timeEnd: story.timeEnd || "0:30"
        }));
        state.error = null;
      })
      .addCase(fetchCurrentUserStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetchMyStories
      .addCase(fetchMyStories.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyStories.fulfilled, (state, action) => {
        state.loading = false;
        state.myStories = action.payload.map(story => ({
          ...story,
          hasAudio: story.contentType === 'image_audio' || story.contentType === 'video_audio',
          audioUrl: story.sound,
          timeAction: story.timeAction || "0:00",
          timeEnd: story.timeEnd || "0:30"
        }));
        state.error = null;
      })
      .addCase(fetchMyStories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedStoryGroup,
  setCurrentStoryIndex,
  openStoryModal,
  closeStoryModal,
  openUploadModal,
  closeUploadModal,
  updateStoryStatus,
  setRouterParams,
  openStoryByIdOnLoad,
  clearRouterParams,
  setCurrentAudio,
  setAudioPlaying,
} = storySlice.actions;

export default storySlice.reducer;