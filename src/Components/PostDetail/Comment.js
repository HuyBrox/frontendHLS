import { useState } from "react";
import { RiSendPlane2Fill } from "react-icons/ri";
import { formatTime } from './../../Layout/Page/Profile/AllPostProfile/PreviewProfilePost/formatTime';

export const Comment = ({
  comment,
  handleReply,
  replyingTo,
  replyText,
  handleReplyComment,
  replyInputRef,
  replyType,
  replyId
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const hasMultipleReplies = comment.replies && comment.replies.length >= 2;

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const renderReplyInput = (replyType, replyId, author) => (
    <div className="ml-10 mt-2 relative flex items-center max-w-full">
      <textarea
        ref={replyInputRef}
        value={replyText}
        onChange={(e) => handleReply.onChange(e)}
        placeholder={`Trả lời ${author.fullname}...`}
        className="bg-white text-black rounded-lg px-4 py-2 text-sm pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
        rows={1}
        maxLength="1500"
        style={{
          height: 'auto',
          minHeight: '40px',
          maxHeight: '300px',
          borderRadius: '20px',
          resize: 'none',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleReplyComment();
          }
        }}
        onInput={(e) => {
          if (e.target.value.trim() !== '') {
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 350)}px`;
          } else {
            e.target.style.height = '40px';
          }
        }}
      />
      <button
        onClick={handleReplyComment}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-400"
      >
        <RiSendPlane2Fill size={22} />
      </button>
    </div>
  );

  return (
    <div className="flex items-start space-x-3 mb-4">
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={comment.author.profilePicture}
          alt={comment.author.fullname}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="inline-block max-w-full">
          <div className="bg-[#333334] rounded-2xl p-2 md:p-3 inline-block max-w-full">
            <div className="font-medium text-white">{comment.author.fullname}</div>
            <span className="text-white text-sm md:text-base break-words whitespace-pre-wrap">{comment.text}</span>
          </div>
        </div>
        <div className="flex items-center mt-1 text-sm text-gray-400 space-x-3">
          <button className="hover:text-white">Like</button>
          <button
            onClick={() => handleReply.toggleReply('comment', comment._id)}
            className="hover:text-white"
          >
            {replyingTo.type === 'comment' && replyingTo.id === comment._id ? 'Hủy' : 'Trả lời'}
          </button>
          <span>{formatTime(comment.createdAt)}</span>
        </div>

        {replyingTo.type === 'comment' && replyingTo.id === comment._id &&
          renderReplyInput('comment', comment._id, comment.author)
        }

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {!hasMultipleReplies && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={comment.replies[0].author.profilePicture}
                    alt={comment.replies[0].author.fullname}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="inline-block max-w-full">
                    <div className="bg-[#333334] rounded-2xl p-2 inline-block max-w-full">
                      <div className="font-medium text-white text-sm">{comment.replies[0].author.fullname}</div>
                      <div className="text-white break-words whitespace-pre-wrap" style={{ fontSize: "15px" }}>{comment.replies[0].text}</div>
                    </div>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-gray-400 space-x-2">
                    <button className="hover:text-white">Like</button>
                    <button
                      onClick={() => handleReply.toggleReply('reply', comment.replies[0]._id, comment._id)}
                      className="hover:text-white"
                    >
                      {replyingTo.type === 'reply' && replyingTo.id === comment.replies[0]._id ? 'Hủy' : 'Trả lời'}
                    </button>
                    <span>{formatTime(comment.replies[0].createdAt)}</span>
                  </div>

                  {replyingTo.type === 'reply' && replyingTo.id === comment.replies[0]._id &&
                    renderReplyInput('reply', comment.replies[0]._id, comment.replies[0].author)
                  }
                </div>
              </div>
            )}

            {hasMultipleReplies && (
              <>
                {!showReplies ? (
                  <button
                    onClick={toggleReplies}
                    className="ml-11 mt-2 text-blue-500 hover:text-blue-400 flex items-center"
                  >
                    Xem thêm {comment.replies.length} phản hồi
                  </button>
                ) : (
                  <>
                    {comment.replies.map((reply) => (
                      <div key={reply._id} className="mt-4 flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            src={reply.author.profilePicture}
                            alt={reply.author.fullname}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="inline-block max-w-full">
                            <div className="bg-[#333334] rounded-2xl p-2 inline-block max-w-full">
                              <div className="font-medium text-white text-sm">{reply.author.fullname}</div>
                              <div className="text-white break-words whitespace-pre-wrap" style={{ fontSize: "15px" }}>{reply.text}</div>
                            </div>
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-400 space-x-2">
                            <button className="hover:text-white">Like</button>
                            <button
                              onClick={() => handleReply.toggleReply('reply', reply._id, comment._id)}
                              className="hover:text-white"
                            >
                              {replyingTo.type === 'reply' && replyingTo.id === reply._id ? 'Hủy' : 'Trả lời'}
                            </button>
                            <span>{formatTime(reply.createdAt)}</span>
                          </div>

                          {replyingTo.type === 'reply' && replyingTo.id === reply._id &&
                            renderReplyInput('reply', reply._id, reply.author)
                          }
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={toggleReplies}
                      className="ml-11 mt-2 text-blue-500 hover:text-blue-400 flex items-center"
                    >
                      Thu gọn
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};