import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatTime } from '../../Layout/Page/Profile/AllPostProfile/PreviewProfilePost/formatTime';
import { fetchPosts, resetPosts } from '../../store/features/PostHome/postsReducer';
import { fetchComments, addComment, replyComment } from '../../store/features/Comment/Comment';
import { IoCloseOutline } from "react-icons/io5";
import { RiSendPlane2Fill } from "react-icons/ri";
import SocialButtons from './../../Layout/Page/Home/SocialButtons';
import "./PostDetail.scss";
import { Comment } from './Comment';

export function PostDetail() {
  const dispatch = useDispatch();
  const { postId } = useParams();
  const navigate = useNavigate();
  const commentInputRef = useRef(null);
  const [isFullCaption, setIsFullCaption] = useState(false);

  const { posts, loading, error } = useSelector((state) => state.posts);
  const post = posts.find((p) => p._id === postId);
  const { comments, loading: commentsLoading, error: commentsError } = useSelector((state) => state.comments);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [commentAdded, setCommentAdded] = useState(false);
  const replyInputRef = useRef(null);

  const [replyingTo, setReplyingTo] = useState({
    type: null,
    id: null,
    parentCommentId: null
  });

  useEffect(() => {
    dispatch(resetPosts());
    dispatch(fetchPosts(1));
    dispatch(fetchComments({ postId }));
  }, [dispatch, postId]);

  useEffect(() => {
    if (commentAdded) {
      dispatch(fetchComments({ postId }));
      setCommentAdded(false);
    }
  }, [commentAdded, dispatch, postId]);

  const focusCommentInput = () => {
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };
  const handleSubmitComment = () => {
    if (commentText.trim()) {
      dispatch(addComment({ postId, text: commentText }))
        .then(() => {
          setCommentText('');
          setCommentAdded(true);
          commentInputRef.current.style.height = '40px';
          commentInputRef.current.style.borderRadius = '20px';
        });
    }
  };

  const handleReplyComment = () => {
    if (replyText.trim() && replyingTo.parentCommentId) {
      dispatch(replyComment({
        postId,
        commentId: replyingTo.parentCommentId,
        text: replyText
      }))
        .then(() => {
          setReplyText('');
          setReplyingTo({ type: null, id: null, parentCommentId: null });
          setCommentAdded(true);
        });
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-[#242526] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#242526] flex items-center justify-center">
        <div className="text-white">Error: {error}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#242526] flex items-center justify-center">
        <div className="text-white">Post not found</div>
      </div>
    );
  }

  return (
    <div className="overlay bg-post">
      <button
        className="close absolute top-2 lg:left-4 right-2 lg:right-auto z-50 bg-black-600 rounded-full p-2"
        onClick={() => navigate(-1)}
      >
        <IoCloseOutline size={30} color="#000" />
      </button>
      <div className="min-h-screen bg-post grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Mobile Header - Profile and Caption (Visible only on mobile) */}
        <div className="lg:hidden col-span-1 bg-res bg-[#18181D]">
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img
                  src={post.author.profilePicture}
                  alt={post.author.fullname}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-white">{post.author.fullname}</div>
                <div className="text-gray-400 text-sm">{formatTime(post.createdAt)}</div>
              </div>
            </div>
          </div>

          {post.caption && (
            <div className="p-4 border-b border-gray-700 flex-shrink-0">
              <p
                className={`whitespace-pre-line text-white text-sm md:text-base whitespace-pre-wrap break-words overflow-hidden text-white ${post.caption.length > 100 && !isFullCaption ? 'line-clamp-8' : ''}`}
                style={{
                  wordWrap: 'break-word',
                  WebkitLineClamp: post.caption.length > 100 && !isFullCaption ? 8 : 'unset',
                  display: post.caption.length > 100 ? '-webkit-box' : 'block',
                  WebkitBoxOrient: 'vertical',
                  overflow: post.caption.length > 100 && !isFullCaption ? 'hidden' : 'visible',
                }}
              >
                {post.caption}
              </p>
              {post.caption.length > 100 && (
                <button
                  onClick={() => setIsFullCaption(!isFullCaption)}
                  className="text-blue-500 text-sm mt-2 hover:underline"
                >
                  {isFullCaption ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Left Side - Image Section */}
        <div className="bg-post lg:col-span-6 flex items-center justify-center lg:h-screen">
          <div className="relative w-full h-auto">
            {post.img && (
              <img
                src={Array.isArray(post.img) ? post.img[0] : post.img}
                alt="Post content"
                className="w-full h-auto lg:max-h-screen object-cover"
                style={{ borderRadius: '10px' }}
              />
            )}
          </div>
        </div>

        {/* Right Side - Content Section */}
        <div className="flex flex-1 flex-col lg:col-span-6 lg:h-screen overflow-y-auto right-side">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden lg:block p-4 border-b border-[#262626] flex-shrink-0">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                <img
                  src={post.author.profilePicture}
                  alt={post.author.fullname}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-white">{post.author.fullname}</div>
                <div className="text-gray-400 text-sm">{formatTime(post.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Desktop Caption - Hidden on mobile */}
          {post.caption && (
            <div className="hidden lg:block p-4 border-b border-[#262626] flex-shrink-0">
              <p
                className={`whitespace-pre-line text-white text-sm md:text-base whitespace-pre-wrap break-words overflow-hidden text-white ${post.caption.length > 100 && !isFullCaption ? 'line-clamp-8' : ''}`}
                style={{
                  wordWrap: 'break-word',
                  WebkitLineClamp: post.caption.length > 100 && !isFullCaption ? 8 : 'unset',
                  display: post.caption.length > 100 ? '-webkit-box' : 'block',
                  WebkitBoxOrient: 'vertical',
                  overflow: post.caption.length > 100 && !isFullCaption ? 'hidden' : 'visible',
                }}
              >
                {post.caption}
              </p>
              {post.caption.length > 100 && (
                <button
                  onClick={() => setIsFullCaption(!isFullCaption)}
                  className="text-blue-500 text-sm mt-2 hover:underline"
                >
                  {isFullCaption ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="border-b border-[#262626] flex-shrink-0">
            <SocialButtons post={post} handleCommentClick={focusCommentInput} />
          </div>

          {/* Comments */}
          <div className="flex-1 p-4">
            {comments.map((comment) => (
              <Comment
                className="comment-text"
                key={comment._id}
                comment={comment}
                handleReply={{
                  toggleReply: (type, id, parentCommentId) => {
                    if (replyingTo.type === type && replyingTo.id === id) {
                      setReplyingTo({ type: null, id: null, parentCommentId: null });
                    } else {
                      setReplyingTo({ type, id, parentCommentId: parentCommentId || id });
                    }
                    setReplyText('');
                  },
                  onChange: (e) => setReplyText(e.target.value)
                }}
                replyingTo={replyingTo}
                replyText={replyText}
                handleReplyComment={handleReplyComment}
                replyInputRef={replyInputRef}
                replyType={replyingTo.type}
                replyId={replyingTo.id}
              />
            ))}
          </div>

          {/* Comment Input */}
          <div className="flex items-center p-4 relative flex-shrink-0 border-t border-[#262626]">
            <textarea
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Thêm bình luận..."
              className="w-full text-white rounded-lg px-4 py-2 text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 textarea-css"
              rows={1}
              maxLength="1500"
              style={{
                height: 'auto',
                minHeight: '40px',
                maxHeight: '300px',
                borderRadius: '20px',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
              onInput={(e) => {
                if (e.target.value.trim() !== '') {
                  e.target.style.borderRadius = '20px';
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 350)}px`;
                } else {
                  e.target.style.borderRadius = '20px';
                  e.target.style.height = '40px';
                }
              }}
            />
            <button className="absolute right-4 bottom-[17px] flex items-center justify-center p-2 bg-transparent rounded-full transition" onClick={handleSubmitComment}>
              <RiSendPlane2Fill size={22} className="text-blue-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetail;