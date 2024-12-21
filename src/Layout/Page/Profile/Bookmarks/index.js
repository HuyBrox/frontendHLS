import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PreviewProfilePost from "./../AllPostProfile/PreviewProfilePost/PreviewProfilePost";

const Bookmark = ({ userId }) => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const { postId } = useParams(); // Lấy `postId` từ URL
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      try {
        const myUserId = localStorage.getItem("_id");
        const youUserId = userId || myUserId;

        if (!youUserId) {
          throw new Error("User ID not found");
        }

        // Fetch bookmarked posts
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/post/getBookmarkedPost/${youUserId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Could not fetch bookmarked posts.");
        }

        const data = await response.json();

        if (data.success) {
          setBookmarkedPosts(data.posts || []);

          // Kiểm tra nếu URL có `postId`
          if (postId) {
            const targetPost = data.posts.find((post) => post._id === postId);
            if (targetPost) {
              setSelectedPost(targetPost);
              setShowPreviewModal(true);
            } else {
              navigate("/error404", { replace: true });
            }
          }
        } else {
          setError(data.message || "Failed to fetch bookmarked posts.");
        }
      } catch (err) {
        console.error("Error fetching bookmarked posts:", err);
        setError(err.message);
        navigate("/error404", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    if (userId || localStorage.getItem("_id")) {
      fetchBookmarks();
    }
  }, [userId, postId, navigate]);

  // Đóng modal và điều hướng trở lại danh sách bookmark
  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedPost(null);
    // navigate("/bookmarks", { replace: true });
  };

  if (loading) return <div className="profile-posts__loading"></div>;
  if (error) return <div className="profile-posts__error">Error: {error}</div>;

  return (
    <div className="profile-posts">
      {/* Thông báo chỉ mình bạn có thể xem */}
      {bookmarkedPosts.length === 0 ? (
        <div className="profile-posts__empty-container flex flex-col items-center justify-center p-8 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">
            Bạn chưa lưu bài viết nào!
          </h3>
          <p className="text-gray-200 mb-4">
            Các bài viết bạn muốn xem sau sẽ được lưu ở đây.
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-4">
            Chỉ mình bạn có thể xem mục mình đã lưu.
          </div>
          <div className="profile-posts__grid">
            {bookmarkedPosts.map(
              (post) =>
                post &&
                post.img && (
                  <div
                    key={post._id}
                    className="profile-posts__item"
                    onClick={() => {
                      setSelectedPost(post);
                      setShowPreviewModal(true);
                      navigate(`/profile/${userId || localStorage.getItem('_id')}/post/${post._id}`, { replace: true });
                    }}
                  >
                    <img
                      src={post.img}
                      alt={post.caption || "Post image"}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/300";
                      }}
                    />
                    <div className="profile-posts__overlay">
                      <div className="profile-posts__stats">
                        <span>❤️ {post.likes ? post.likes.length : 0}</span>
                        <span>💭 {post.comments ? post.comments.length : 0}</span>
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </>
      )}

      {/* Modal xem chi tiết bài viết */}
      {showPreviewModal && selectedPost && (
        <PreviewProfilePost
          isOpen={showPreviewModal}
          onClose={handleClosePreviewModal}
          post={selectedPost}
        />
      )}
    </div>
  );
};

export default Bookmark;
