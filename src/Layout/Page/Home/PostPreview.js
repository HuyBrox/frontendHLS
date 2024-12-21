import { IoClose } from "react-icons/io5";
import { HiOutlineChatBubbleOvalLeft } from "react-icons/hi2";
import { GoHeart } from "react-icons/go";
import { FaRegBookmark } from "react-icons/fa6";
import { formatTime } from './../Profile/AllPostProfile/PreviewProfilePost/formatTime';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComments, addComment, replyComment } from '../../../store/features/Comment/Comment';

export function PreviewPostHome({
  handleBackdropClick,
  selectedPost,
  onClose,
}) {
  const dispatch = useDispatch();
  const [commentText, setCommentText] = useState('');
  const [replyToComment, setReplyToComment] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { comments, currentSortType } = useSelector(
    (state) => state.comments
  );
  const [commentsVersion, setCommentsVersion] = useState(0);

  useEffect(() => {
    if (selectedPost?.id) {
      dispatch(fetchComments({
        postId: selectedPost.id,
        sortType: currentSortType
      }));
    }
  }, [dispatch, selectedPost?.id, currentSortType, commentsVersion]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await dispatch(addComment({
        postId: selectedPost.id,
        text: commentText.trim()
      })).unwrap();

      if (result) {
        setCommentsVersion(prev => prev + 1); // This will trigger a refetch
        setCommentText('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Similarly in handleSubmitReply
  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyToComment || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await dispatch(replyComment({
        postId: selectedPost.id,
        commentId: replyToComment.id,
        text: replyText.trim()
      })).unwrap();

      if (result && result.reply) {
        setCommentsVersion(prev => prev + 1); // This will trigger a refetch
        setReplyText('');
        setReplyToComment(null);
      }
    } catch (err) {
      console.error('Failed to add reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedPost) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 bg-opacity-50 z-50 flex items-center justify-center"
      style={{ zIndex: 9999 }}
      onClick={handleBackdropClick}
    >
      <div className="relative bg-[#000000] h-[90vh] w-[90vw] max-w-screen-xl flex rounded-lg overflow-hidden background_PreviewPost">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white z-10 hover:opacity-70"
        >
          <IoClose size={24} />
        </button>

        <div className="w-[55%] bg-black flex items-center">
          {selectedPost.images?.[0] && (
            <img
              src={selectedPost.images[0]}
              alt={selectedPost.caption || "Post image"}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="w-[45%] flex flex-col">
          <div className="p-4 border-b border-[#262626]">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                <img
                  src={selectedPost.authorProfilePicture}
                  alt={selectedPost.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-sm">{selectedPost.author}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {comments.map((comment) => (
              <div key={comment.id} className="mb-6">
                <div className="flex mb-2">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img
                      src={comment.author.profilePicture}
                      alt={comment.author.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start">
                      <span className="font-semibold text-sm mr-2">
                        {comment.author.username}
                      </span>
                      <span
                        className="text-sm break-words whitespace-pre-wrap overflow-wrap-anywhere"
                      >
                        {comment.text}
                      </span>

                    </div>
                    <div className="flex items-center mt-2 text-sm text-gray-400">
                      <span className="mr-4">{formatTime(comment.createdAt)}</span>
                      <button
                        onClick={() => setReplyToComment(comment)}
                        className="mr-4 hover:text-white"
                      >
                        Reply
                      </button>
                      <span>{comment.likes?.length || 0} likes</span>
                    </div>
                  </div>
                </div>

                {comment.replies?.map((reply) => (
                  <div key={reply.id} className="ml-12 mb-2">
                    <div className="flex">
                      <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                        <img
                          src={reply.author.profilePicture}
                          alt={reply.author.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start">
                          <span className="font-semibold text-sm mr-2">
                            {reply.author.username}
                          </span>
                          <span className="text-sm">{reply.text}</span>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-gray-400">
                          <span className="mr-4">{formatTime(reply.createdAt)}</span>
                          <span>{reply.likes?.length || 0} likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {replyToComment?.id === comment.id && (
                  <form onSubmit={handleSubmitReply} className="ml-12 mt-2">
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Reply to comment..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                        disabled={isSubmitting}
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim() || isSubmitting}
                        className="ml-2 text-blue-500 font-semibold text-sm disabled:opacity-50"
                      >
                        {isSubmitting ? 'Posting...' : 'Post'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#262626]">
            <div className="flex justify-between mb-2">
              <div className="flex space-x-4">
                <button className="hover:opacity-60">
                  <GoHeart size={24} />
                </button>
                <button className="hover:opacity-60">
                  <HiOutlineChatBubbleOvalLeft size={24} />
                </button>
              </div>
              <button className="hover:opacity-60">
                <FaRegBookmark size={22} />
              </button>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-sm">
                {selectedPost.likes?.length?.toLocaleString() || 0} lượt thích
              </span>
            </div>
            <div className="text-gray-400 text-xs uppercase mb-3">
              {formatTime(selectedPost.createdAt)}
            </div>

            <form onSubmit={handleSubmitComment}>
              <div className="flex items-center">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting}
                  className="ml-2 text-blue-500 font-semibold text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}