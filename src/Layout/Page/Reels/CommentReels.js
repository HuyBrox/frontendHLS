import { useState, useEffect } from "react"; import { LayoutComment } from "./LayoutComment";

export function CommentReels({ reel, handleCloseComments, onUpdateTotalComments }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [totalComments, setTotalComments] = useState(0);
  const [expandedComments, setExpandedComments] = useState({});
  const [activeCommentOptions, setActiveCommentOptions] = useState(null);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const id = localStorage.getItem('_id');


  useEffect(() => {
    const fetchComments = async () => {
      if (!reel || !reel._id) {
        console.error("Reel ID is undefined or null");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/comment/reel/${reel._id}?sortType=intelligent`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch comments");
        }

        const data = await response.json();
        setComments(data.comments || []);
        setTotalComments(data.totalComments);

        if (onUpdateTotalComments) {
          onUpdateTotalComments(data.totalComments);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [reel]);

  // bình luận reels
  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/comment/reel/${reel._id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: newCommentText.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể thêm bình luận");
      }

      const data = await response.json();

      if (data && data.comment) {
        setComments((prevComments) => [data.comment, ...prevComments]);
        setTotalComments((prevTotal) => {
          const newTotal = prevTotal + 1;
          if (onUpdateTotalComments) {
            onUpdateTotalComments(newTotal);
          }
          return newTotal;
        });
        setNewCommentText("");
        const textarea = document.querySelector(".textarea-css");
        if (textarea) {
          textarea.style.height = "40px";
        }
      }
    } catch (err) {
      console.error("Lỗi khi thêm bình luận:", err);
    }
  };
  // trả lời bình luận reels
  const handleReplyComment = async (commentId, replyText) => {
    if (!replyText.trim()) return;

    try {
      // Fix: Update URL to match backend route structure '/reel/reply/:reelsId/:commentId'
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/comment/reel/reply/${reel._id}/${commentId}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: replyText.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Không thể trả lời bình luận");
      }

      if (data && data.reply) {
        setComments((prevComments) =>
          prevComments.map((comment) => {
            if (comment._id === commentId) {
              // Ensure replies array exists before spreading
              const currentReplies = Array.isArray(comment.replies) ? comment.replies : [];
              return {
                ...comment,
                replies: [...currentReplies, data.reply],
              };
            }
            return comment;
          })
        );

        // Update total comments
        setTotalComments((prevTotal) => {
          const newTotal = prevTotal + 1;
          onUpdateTotalComments?.(newTotal);
          return newTotal;
        });

        // Expand replies for the comment
        setExpandedComments((prev) => ({
          ...prev,
          [commentId]: true,
        }));

        // Reset reply state
        setReplyingTo(null);

        return data.reply; // Return the new reply for potential further use
      }
    } catch (err) {
      console.error("Lỗi khi trả lời bình luận:", err);
      // You might want to show this error to the user through a toast or alert
      throw new Error(err.message || "Có lỗi xảy ra khi trả lời bình luận");
    }
  };

  // xóa comment reels
  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/comment/reel/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa bình luận");
      }

      const data = await response.json();

      if (data.success) {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment._id !== commentId)
        );
        setTotalComments((prevTotal) => {
          const newTotal = prevTotal - 1;
          if (onUpdateTotalComments) {
            onUpdateTotalComments(newTotal);
          }
          return newTotal;
        });
        setActiveCommentOptions(null);
      }
    } catch (err) {
      console.error("Lỗi khi xóa bình luận:", err);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const toggleExpandReplies = (commentId) => {
    setExpandedComments((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  return (
    <>
      <LayoutComment
        currentUserId={id}
        reel={reel}
        comments={comments}
        totalComments={totalComments}
        handleCloseComments={handleCloseComments}
        loading={loading}
        error={error}
        newCommentText={newCommentText}
        setNewCommentText={setNewCommentText}
        expandedComments={expandedComments}
        deletingCommentId={deletingCommentId}
        handleAddComment={handleAddComment}
        toggleExpandReplies={toggleExpandReplies}
        activeCommentOptions={activeCommentOptions}
        setActiveCommentOptions={setActiveCommentOptions}
        handleDeleteComment={handleDeleteComment}
        handleReplyComment={handleReplyComment}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
      />
    </>
  );
}