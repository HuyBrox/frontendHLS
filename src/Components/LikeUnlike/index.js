import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { IoMdHeart } from "react-icons/io";
import { GoHeart } from "react-icons/go";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";
import { fetchBookmarks } from '../../store/features/profile/profileSlice';
import { fetchUserPosts, updatePostLikeStatus } from './../../store/features/NewPost/newPostSlice';

const LikeUnlike = ({
  postId,
  initialLikeStatus = false,
  initialLikeCount = 0,
  onLikeUpdate
}) => {
  const dispatch = useDispatch();

  // Lấy mảng bookmarks từ Redux store
  const bookmarks = useSelector((state) => state.profile.bookmarks);
  const { posts } = useSelector((state) => state.newPost);
  const currentUserId = localStorage.getItem('_id');
  const post = posts.find((p) => p._id === postId);

  const [isLiked, setIsLiked] = useState(initialLikeStatus);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  // Kiểm tra xem postId có trong bookmarks không
  useEffect(() => {
    setIsBookmarked(bookmarks.includes(postId));
  }, [bookmarks, postId]);

  // Cập nhật trạng thái ban đầu từ Redux
  useEffect(() => {
    if (post) {
      setIsLiked(post.isLiked);
      setLikeCount(post.likesCount);
    }
  }, [post, currentUserId]);

  useEffect(() => {
    setIsBookmarked(bookmarks.includes(postId));
  }, [bookmarks, postId]);

  // Gọi API để lấy bài viết khi component được mount
  useEffect(() => {
    dispatch(fetchUserPosts({})); // Lấy danh sách bài viết để lọc ra like của mình xem đã like chưa
  }, [dispatch]);

  // Xử lý sự kiện like/unlike
  const handleLikeUnlike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Gửi request like/unlike
      const endpoint = post.isLiked
        ? `${process.env.REACT_APP_BACKEND_URL}/post/unLikePost/${postId}`
        : `${process.env.REACT_APP_BACKEND_URL}/post/likePost/${postId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const updatedIsLiked = !post.isLiked;
        const updatedLikesCount = updatedIsLiked ? post.likesCount + 1 : post.likesCount - 1;

        // Cập nhật Redux store
        dispatch(updatePostLikeStatus({ postId, isLiked: updatedIsLiked, likesCount: updatedLikesCount }));
      } else {
        console.error('Error toggling like:', await response.json());
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleBookmark = async () => {
    if (isBookmarkLoading) return;

    try {
      setIsBookmarkLoading(true);

      // Dispatch action để cập nhật bookmarks
      await dispatch(fetchBookmarks({ postId }));

      // Sau khi dispatch, Redux store sẽ tự động cập nhật `bookmarks`
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  return (
    <div className="like-section">
      <div className="action-buttons">
        <button
          style={{ fontSize: '25px' }}
          onClick={handleLikeUnlike}
          disabled={isLoading}
          className="like-button"
        >
          {post?.isLiked ? (
            <IoMdHeart style={{ color: '#FF3040' }} />
          ) : (
            <GoHeart />
          )}
        </button>
        <button
          style={{ fontSize: '25px', marginLeft: '10px' }}
          className="comment-button"
        >
          <HiOutlineChatBubbleOvalLeft />
        </button>
        <button
          onClick={handleBookmark}
          disabled={isBookmarkLoading}
        >
          {isBookmarked ? (
            <FaBookmark style={{
              fontSize: '20px',
              marginLeft: '10px',
              display: 'flex',
              justifyContent: 'end',
              alignItems: 'center',
              width: '100%',
              color: '#efcc00'
            }} />
          ) : (
            <FaRegBookmark style={{
              fontSize: '20px',
              marginLeft: '10px',
              display: 'flex',
              justifyContent: 'end',
              alignItems: 'center',
              width: '100%'
            }} />
          )}
        </button>
      </div>
      <div className="coutLike">{likeCount} lượt thích</div>
    </div>
  );
};

export default LikeUnlike;
