import { IoCloseOutline } from "react-icons/io5";
import heart from "../../../assets/images/heart.png";
import "./CommentReels.scss";
import { RiSendPlane2Fill } from "react-icons/ri";
import { formatTime } from "../../Page/Profile/AllPostProfile/PreviewProfilePost/formatTime";
import { PiMicrophoneStageThin } from "react-icons/pi";
import { IoIosMore } from "react-icons/io";
import React, { useState } from "react";

export function LayoutComment(
  {
    toggleExpandReplies,
    totalComments,
    handleCloseComments,
    loading,
    error,
    comments,
    reel,
    activeCommentOptions,
    setActiveCommentOptions,
    handleDeleteComment,
    handleAddComment,
    newCommentText,
    expandedComments,
    deletingCommentId,
    setNewCommentText,
    currentUserId,
    handleReplyComment,
  }
) {
  const [replyingToComment, setReplyingToComment] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyingToReply, setReplyingToReply] = useState(null);
  const [replyToReplyText, setReplyToReplyText] = useState("");

  // Function to handle opening reply input
  const handleOpenReplyInput = (commentId) => {
    setReplyingToComment(commentId);
  };

  // Function to handle closing reply input
  const handleCloseReplyInput = () => {
    setReplyingToComment(null);
    setReplyText("");
  };

  const handleSendReply = async (commentId, replyText) => {
    if (!replyText.trim()) return;

    try {
      await handleReplyComment(commentId, replyText);
      // Clear the reply text and close the reply input after successful reply
      setReplyText("");
      setReplyingToComment(null);
    } catch (error) {
      console.error("Error sending reply:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 header-commentReels">
        <h3 className="text-white font-semibold">
          Bình luận ({totalComments})
        </h3>
        <button
          onClick={handleCloseComments}
          className="text-white hover:text-gray-300"
        >
          <IoCloseOutline className="w-6 h-6" />
        </button>
      </div>

      {/* Danh sách bình luận */}
      <div className="h-[calc(100%-120px)] overflow-y-auto p-4 conent-commentReels">
        {loading && <p className="text-gray-300">Đang tải bình luận...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading &&
          comments.map((comment) => (
            <div key={comment._id} className="flex flex-col mb-6">
              {/* Bình luận chính */}
              <div className="flex items-start gap-3 relative">
                <img
                  src={comment.author.profilePicture || "https://via.placeholder.com/40"}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full"
                  style={{ marginTop: "5px" }}
                />
                <div className="flex-1 gap-2" style={{ overflowWrap: "break-word", wordBreak: "break-word" }}>
                  <div className="relative">
                    {comment.author._id === reel.author._id && (
                      <span className="text-white rounded-full text-start text-sm flex items-center gap-1" style={{ fontSize: "12px" }}>
                        <PiMicrophoneStageThin /> Tác giả
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">
                        {comment.author.fullname}
                      </span>
                      <span className="text-gray-400 text-sm" style={{ overflowWrap: "break-word", wordBreak: "break-word", fontSize: "12px" }}>
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <button
                      className="absolute top-0 right-0 text-gray-400 text-sm"
                      style={{ fontSize: "20px" }}
                      onClick={() => setActiveCommentOptions(
                        activeCommentOptions === comment._id ? null : comment._id
                      )}
                    >
                      <IoIosMore />
                    </button>

                    {activeCommentOptions === comment._id && (
                      <div
                        className="absolute top-[25px] right-0 mt-1 w-40 bg-gray-700 rounded-lg shadow-lg z-10 tamgiacEdit"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {comment.author._id === currentUserId ? (
                          // Hiển thị nút "Xóa" nếu ID khớp
                          <>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm flex items-center justify-between"
                              onClick={() => handleDeleteComment(comment._id)}
                              disabled={deletingCommentId === comment._id}
                            >
                              Xóa
                              {deletingCommentId === comment._id && (
                                <span className="text-xs text-gray-400">Đang xóa...</span>
                              )}
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm"
                            >
                              Chỉnh sửa
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm"
                              onClick={() => setActiveCommentOptions(null)}
                            >
                              Hủy
                            </button>
                          </>
                        ) : (
                          // Nếu không phải chủ sở hữu bình luận, hiển thị "Báo cáo"
                          <>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm"
                              onClick={() => setActiveCommentOptions(null)}
                            >
                              Báo cáo
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm"
                              onClick={() => setActiveCommentOptions(null)}
                            >
                              Hủy
                            </button>
                          </>
                        )}
                      </div>
                    )}

                  </div>
                  <div
                    className="text-gray-300 text-sm mt-1"
                    style={{
                      overflowWrap: "break-word",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                    }}
                  >
                    {comment.text}
                  </div>

                  {/* Heart và Trả lời */}
                  <div className="flex items-center gap-4 mt-2 justify-end text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <img className="w-5 h-5" src={heart} alt="like" />{" "}
                      {comment.likes?.length || 0}
                    </span>
                    {replyingToComment === comment._id ? (
                      <button
                        className="hover:text-gray-200"
                        onClick={handleCloseReplyInput} // Hủy trả lời
                      >
                        Hủy
                      </button>
                    ) : (
                      <button
                        className="hover:text-gray-200"
                        onClick={() => handleOpenReplyInput(comment._id)} // Mở trả lời
                      >
                        Trả lời
                      </button>
                    )}
                  </div>


                  {/* Phần nhập trả lời */}
                  {replyingToComment === comment._id && (
                    <div className="mt-3">
                      <div className="flex flex-col space-y-2">
                        <div className="relative">
                          <textarea
                            placeholder="Nhập trả lời..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 textarea-css pr-10"
                            rows={1}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (replyText.trim()) {
                                  handleSendReply(comment._id, replyText);
                                }
                              }
                            }}
                            maxLength="600"
                            style={{
                              height: "auto",
                              minHeight: "30px",
                              maxHeight: "300px",
                              borderRadius: "20px",
                            }}
                            onInput={(e) => {
                              if (e.target.value.trim() !== "") {
                                e.target.style.borderRadius = "20px";
                                e.target.style.height = "auto";
                                e.target.style.height = `${Math.min(
                                  e.target.scrollHeight,
                                  350
                                )}px`;
                              } else {
                                e.target.style.borderRadius = "20px";
                                e.target.style.height = "40px";
                              }
                            }}
                          />
                          <button
                            onClick={() => handleSendReply(comment._id, replyText)}
                            disabled={!replyText.trim()}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 font-medium text-sm ${replyText.trim()
                              ? "text-blue-500 cursor-pointer"
                              : "text-gray-500 cursor-not-allowed"
                              }`}
                            style={{ paddingBottom: "5px" }}
                          >
                            <RiSendPlane2Fill size={22} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="relative mt-4">
                  {/* Đường dẫn border */}
                  <div className="absolute left-5 top-0 w-[1.3px] bg-[#303030]  border-Replies"
                  ></div>
                  {!expandedComments[comment._id] ? (
                    <div className="pl-8" style={{ marginLeft: "20px" }}>
                      <button
                        className="text-blue-500 text-sm hover:underline"
                        onClick={() => toggleExpandReplies(comment._id)}
                      >
                        Xem thêm {comment.replies.length} trả lời
                      </button>
                    </div>
                  ) : (
                    <div className="pl-8" style={{ marginLeft: "20px" }}>
                      {comment.replies.map((reply) => (
                        <div
                          key={reply._id}
                          className="flex items-start gap-3 mb-4"
                        >
                          <img
                            src={reply.author.profilePicture || "https://via.placeholder.com/40"}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full"
                          />
                          <div className="flex-1">
                            {reply.author._id === reel.author._id && (
                              <span className="text-white text-xs rounded-full flex items-center gap-1">
                                <PiMicrophoneStageThin /> Tác giả
                              </span>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-gray-300 text-sm font-medium">
                                {reply.author.fullname}
                              </span>
                              <span className="text-gray-400 text-xs"
                                style={{ overflowWrap: "break-word", wordBreak: "break-word", fontSize: "12px" }}
                              >
                                {formatTime(reply.createdAt)}
                              </span>
                            </div>
                            <div
                              className="text-gray-300 text-sm mt-1"
                              style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
                            >
                              {reply.text}
                            </div>
                            {/* Heart và Trả lời */}
                            <div className="flex items-center gap-4 mt-2 justify-end text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <img className="w-5 h-5" src={heart} alt="like" />{" "}
                                {reply.likes?.length || 0}
                              </span>
                              {replyingToReply === reply._id ? (
                                <button
                                  className="hover:text-gray-200"
                                  onClick={() => {
                                    setReplyingToReply(null);
                                    setReplyToReplyText("");
                                  }}
                                >
                                  Hủy
                                </button>
                              ) : (
                                <button
                                  className="hover:text-gray-200"
                                  onClick={() => setReplyingToReply(reply._id)}
                                >
                                  Trả lời
                                </button>
                              )}
                            </div>
                            {/* Ô nhập trả lời reply */}
                            {replyingToReply === reply._id && (
                              <div className="mt-3">
                                <div className="flex flex-col space-y-2">
                                  <div className="relative">
                                    <textarea
                                      placeholder="Nhập trả lời..."
                                      value={replyToReplyText}
                                      onChange={(e) => setReplyToReplyText(e.target.value)}
                                      className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 textarea-css pr-10"
                                      rows={1}
                                      maxLength="600"
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          if (replyToReplyText.trim()) {
                                            handleSendReply(comment._id, replyToReplyText);
                                            setReplyingToReply(null);
                                            setReplyToReplyText("");
                                          }
                                        }
                                      }}
                                      style={{
                                        height: "auto",
                                        minHeight: "30px",
                                        maxHeight: "300px",
                                        borderRadius: "20px",
                                      }}
                                      onInput={(e) => {
                                        if (e.target.value.trim() !== "") {
                                          e.target.style.borderRadius = "20px";
                                          e.target.style.height = "auto";
                                          e.target.style.height = `${Math.min(
                                            e.target.scrollHeight,
                                            350
                                          )}px`;
                                        } else {
                                          e.target.style.borderRadius = "20px";
                                          e.target.style.height = "40px";
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => {
                                        handleSendReply(comment._id, replyToReplyText);
                                        setReplyingToReply(null);
                                        setReplyToReplyText("");
                                      }}
                                      disabled={!replyToReplyText.trim()}
                                      className={`absolute right-2 top-1/2 transform -translate-y-1/2 font-medium text-sm ${replyToReplyText.trim()
                                        ? "text-blue-500 cursor-pointer"
                                        : "text-gray-500 cursor-not-allowed"
                                        }`}
                                      style={{ paddingBottom: "5px" }}
                                    >
                                      <RiSendPlane2Fill size={22} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        className="text-blue-500 text-sm hover:underline"
                        onClick={() => toggleExpandReplies(comment._id)}
                      >
                        Ẩn xem thêm
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

        {/* Hiển thị comment mẫu nếu không có bình luận */}
        {!loading && comments.length === 0 && (
          <p className="text-gray-400 text-sm text-center">
            Chưa có bình luận nào.
          </p>
        )}
      </div>

      {/* Phần thêm bình luận */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bottom-commentReels">
        <div className="relative flex items-center">
          <textarea
            placeholder="Thêm bình luận..."
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 text-sm pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 textarea-css"
            rows={1}
            maxLength="600"
            style={{
              height: "auto",
              minHeight: "40px",
              maxHeight: "300px",
              borderRadius: "20px",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (newCommentText.trim()) {
                  handleAddComment();
                }
              }
            }}
            onInput={(e) => {
              if (e.target.value.trim() !== "") {
                e.target.style.borderRadius = "20px";
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(
                  e.target.scrollHeight,
                  350
                )}px`;
              } else {
                e.target.style.borderRadius = "20px";
                e.target.style.height = "40px";
              }
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={!newCommentText.trim()}
            className={`absolute right-2 bottom-0 transform -translate-y-1/2 font-medium text-sm ${newCommentText.trim()
              ? "text-blue-500 cursor-pointer"
              : "text-gray-500 cursor-not-allowed"
              }`}
          >
            <RiSendPlane2Fill size={22} />
          </button>
        </div>
      </div>
    </>
  )
}