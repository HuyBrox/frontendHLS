import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stories: [], // Danh sách stories
  currentStoryIndex: 0, // Chỉ số story hiện tại
  isViewerDetailsOpen: false, // Trạng thái mở ViewerDetailsModal
  isHovering: false, // Trạng thái hover
};

const views = createSlice({
  name: 'story',
  initialState,
  reducers: {
    setStories: (state, action) => {
      state.stories = action.payload;
    },
    setCurrentStoryIndex: (state, action) => {
      state.currentStoryIndex = action.payload;
    },
    toggleViewerDetails: (state, action) => {
      state.isViewerDetailsOpen = action.payload;
    },
    setIsHovering: (state, action) => {
      state.isHovering = action.payload;
    },
  },
});

export const {
  setStories,
  setCurrentStoryIndex,
  toggleViewerDetails,
  setIsHovering,
} = views.actions;

export default views.reducer;
