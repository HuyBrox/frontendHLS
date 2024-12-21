import { useState, useEffect } from 'react';
import { formatTime } from '../Profile/AllPostProfile/PreviewProfilePost/formatTime';
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { GoHeart } from "react-icons/go";
import { FaRegBookmark } from "react-icons/fa6";
import { PreviewPostHome } from './PostPreview';

export function Posts({
  loading,
  posts = [],
  userId
}) {
  const [isFullContent, setIsFullContent] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPost]);

  const handlePostClick = (post) => {
    // Update URL without navigation
    const newUrl = `/post/${post.id}`;
    window.history.pushState({ postId: post.id }, '', newUrl);
    setSelectedPost(post);
  };

  const handleClosePreview = () => {
    const fullUrl = window.location.href;
    const baseUrl = fullUrl.split('/post')[0]; // Lấy phần trước '/post'
    console.log('Base URL:', baseUrl);
    window.history.pushState({}, '', baseUrl); // Thay đổi URL
    setSelectedPost(null);
  };



  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClosePreview();
    }
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        handleClosePreview();
      }
    };

    if (selectedPost) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [selectedPost]);

  return (
    <>
      <div className="max-w-[500px] mx-auto">
        {loading ? (
          Array(5).fill(0).map((_, index) => (
            <div
              key={index}
              className="mb-3 border border-gray-800"
            >
              <div className="p-3 flex items-center">
                <div className="w-8 h-8 bg-gray-700 rounded-full mr-3 animate-pulse"></div>
                <div>
                  <div className="h-4 w-32 bg-gray-700 rounded mb-1 animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-full h-[470px] bg-gray-700 animate-pulse"></div>
            </div>
          ))
        ) : (
          posts.map((post) => (
            <div key={post.id} className="mb-3">
              {/* Header */}
              <div className="py-2 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden mr-2">
                    <img
                      src={post.authorProfilePicture}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-semibold mr-1">{post.author}</span>
                    {post.isVerified && (
                      <span className="text-blue-500">
                        <svg className="w-4 h-4 inline-block" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <button className="text-lg">•••</button>
              </div>

              {/* Images */}
              {post.images && post.images.length > 0 && (
                <div
                  className="relative w-full p-2 border border-[#262626] cursor-pointer"
                  style={{ borderRadius: '10px' }}
                  onClick={() => handlePostClick(post)}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={post.images[0]}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ borderRadius: '5px' }}
                    />
                  </div>
                  {post.images.length > 1 && (
                    <div className="absolute top-4 right-4 text-white">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs">
                        {post.images.length}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-3 px-0">
                <div className="flex justify-between mb-2">
                  <div className="flex space-x-4">
                    <button className="hover:opacity-60">
                      <GoHeart size={24} />
                    </button>
                    <button className="hover:opacity-60" onClick={() => handlePostClick(post)}>
                      <HiOutlineChatBubbleOvalLeft size={24} />
                    </button>
                  </div>
                  <button className="hover:opacity-60">
                    <FaRegBookmark size={22} />
                  </button>
                </div>

                {/* Likes */}
                <div className="mb-2">
                  <span className="font-semibold text-sm">
                    {post.likes.length.toLocaleString()} lượt thích
                  </span>
                </div>

                {/* Caption */}
                {post.content && (
                  <div className="mb-2">
                    <div className="break-words whitespace-pre-line text-sm">
                      <span className="font-semibold mr-2">{post.author}</span>
                      <span className={`inline ${post.content.length > 100 && !isFullContent ? 'line-clamp-2' : ''}`}>
                        {post.content}
                      </span>
                    </div>
                    {post.content.length > 100 && (
                      <button
                        onClick={() => setIsFullContent(!isFullContent)}
                        className="text-gray-500 text-sm hover:text-gray-300"
                      >
                        {isFullContent ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                )}

                {/* Comments */}
                {post.comments.length > 0 && (
                  <button
                    onClick={() => handlePostClick(post)}
                    className="text-gray-400 text-sm block mb-1"
                  >
                    Xem tất cả {post.comments.length} bình luận
                  </button>
                )}

                {/* Timestamp */}
                <div className="text-gray-400 text-xs uppercase">
                  {formatTime(post.createdAt)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Preview Modal */}
      {selectedPost && (
        <PreviewPostHome
          post={selectedPost}
          onClose={handleClosePreview}
          onBackdropClick={handleBackdropClick}
          selectedPost={{
            ...selectedPost,
            userId: userId
          }}
        />
      )}
    </>
  );
}