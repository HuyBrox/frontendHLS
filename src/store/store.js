import { configureStore } from '@reduxjs/toolkit';
import profileReducer from './features/profile/profileSlice';
import newPostReducer from './features/NewPost/newPostSlice';
import commentsReducer from './features/Comment/Comment';
import uploadModalReducer from "./features/uploadModal/uploadModalSlice";
import messengerReducer from "./features/Messenger/messagerSlice";
import followReducer from './features/FollowUnfollow/followSlice';
import storyReducer from './features/story/storySlice';
import postsReducer from './features/PostHome/postsReducer';
import viewsReducer from './features/views/views';
export const store = configureStore({
  reducer: {
    profile: profileReducer,
    newPost: newPostReducer,
    posts: postsReducer,
    comments: commentsReducer,
    uploadModal: uploadModalReducer,
    messenger: messengerReducer,
    follow: followReducer,
    story: storyReducer,
    views: viewsReducer
  },
});

export default store;