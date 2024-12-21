import React, { useState, useMemo, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { MdOutlineMoreHoriz } from "react-icons/md";
import { CiBookmark } from "react-icons/ci";
import { PiShareFatThin } from "react-icons/pi";
import { useNavigate } from 'react-router-dom';
import svgComment from "../../../assets/images/comment-a.png";
import heart from "../../../assets/images/heart.png";
import heartRed from "../../../assets/images/heart-red.png";
import { formatTime } from "../../Page/Profile/AllPostProfile/PreviewProfilePost/formatTime";
import { CommentReels } from './CommentReels';

export function LayoutReels({
  reels,
  currentReelIndex,
  videoRefs,
  setVideoStyles,
  muteStates,
  hasUserInteracted,
  videoStyles,
  handleVideoClick,
  toggleMute,
  togglePlayPause,
  playStates,
  handleNextReel,
  handleLikeReel,
  likedStates,
  showLikeAnimation,
  handleDeleteReel,
  setReels,
  setCurrentReelIndex,
  handleCloseComments,
  handleCommentClick,
  showComments
}) {
  const navigate = useNavigate();
  const [videoLoadingStates, setVideoLoadingStates] = useState({});
  const [progress, setProgress] = useState(0);
  const [expandedCaptions, setExpandedCaptions] = useState({});
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalComments, setTotalComments] = useState(0); // State lưu tổng số bình luận

  const handleUpdateTotalComments = (newTotal) => {
    setTotalComments(newTotal); // Cập nhật giá trị từ con
  };

  // Memoized function to handle profile navigation
  const handleGoToProfile = useCallback(() => {
    navigate(`/profile/${reels[currentReelIndex].author._id}`);
  }, [navigate, reels, currentReelIndex]);

  // Memoized video loading handlers
  const handleVideoLoadStart = useCallback((reelId) => {
    setVideoLoadingStates((prev) => ({ ...prev, [reelId]: true }));
  }, []);

  const handleVideoLoaded = useCallback((reelId) => {
    setVideoLoadingStates((prev) => ({ ...prev, [reelId]: false }));
  }, []);

  // Memoized time update handler
  const handleTimeUpdate = useCallback(() => {
    const video = videoRefs.current[currentReelIndex];
    if (video) {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    }
  }, [videoRefs, currentReelIndex]);

  // Memoized caption toggle
  const toggleCaption = useCallback((reelId) => {
    setExpandedCaptions(prev => ({
      ...prev,
      [reelId]: !prev[reelId]
    }));
  }, []);

  // Memoize current reel
  const currentReel = useMemo(() => {
    return reels.length > 0 ? reels[currentReelIndex] : null;
  }, [reels, currentReelIndex]);

  // Memoize video loading state for current reel
  const isVideoLoading = useMemo(() => {
    return currentReel ? videoLoadingStates[currentReel._id] : false;
  }, [currentReel, videoLoadingStates]);

  // Memoize caption expansion state
  const isCaptionExpanded = useMemo(() => {
    return currentReel
      ? expandedCaptions[currentReel._id]
      : false;
  }, [currentReel, expandedCaptions]);

  return (
    <div className="relative w-full max-w-[400px] h-[95vh] max-h-[700px] bg-black snap-y snap-mandatory overflow-hidden rounded-lg shadow-lg sm:w-[90%] max-sm:w-screen max-sm:h-screen max-sm:max-h-screen max-sm:rounded-none">
      {currentReel && (
        <div key={currentReel._id} className="relative h-full w-full">
          <div className="relative h-full w-full">
            <div className="relative h-full w-full">
              <video
                ref={(el) => {
                  videoRefs.current[currentReelIndex] = el;
                  if (el) {
                    el.onloadedmetadata = () => {
                      const isWide = el.videoWidth > el.videoHeight;
                      setVideoStyles((prev) => ({
                        ...prev,
                        [currentReel._id]: isWide ? "object-contain" : "object-cover",
                      }));
                    };
                  }
                }}
                className={`reel-video w-full h-full ${videoStyles[currentReel._id] || "object-cover"} rounded-lg`}
                src={currentReel.urlVideo}
                loop={false}
                playsInline
                autoPlay={hasUserInteracted}
                muted={muteStates[currentReel._id]}
                onLoadStart={() => handleVideoLoadStart(currentReel._id)}
                onLoadedData={() => handleVideoLoaded(currentReel._id)}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleNextReel}
              />
              {/* Comments Section */}
              <div
                className={`container-commentReels absolute bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out rounded-t-2xl ${showComments ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ height: '80%' }}
                onWheel={(e) => {
                  const commentSection = e.currentTarget;
                  const isAtTop = commentSection.scrollTop === 0;
                  const isAtBottom =
                    commentSection.scrollTop + commentSection.clientHeight >=
                    commentSection.scrollHeight - 1;

                  // Nếu đang ở đầu và cuộn lên, hoặc ở cuối và cuộn xuống
                  if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                    e.stopPropagation(); // Ngăn chặn sự kiện cuộn lan sang video
                  }
                }}
              >
                <CommentReels
                  reel={currentReel}
                  handleCloseComments={handleCloseComments}
                  onUpdateTotalComments={handleUpdateTotalComments}
                />
              </div>

              {isVideoLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {showLikeAnimation && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className={`heart-animation w-24 h-24 ${likedStates[currentReel._id]
                      ? 'fill-red-500'
                      : 'fill-white'
                      }`}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              )}

              <div
                className="absolute inset-0 z-10"
                onClick={handleVideoClick}
              />

              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#757575]">
                <div
                  className="h-full go"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Volume and Play/Pause Controls */}
              <div className="absolute top-4 left-4 flex items-center space-x-2 z-20">
                <button
                  className="bg-black/50 rounded-full p-2"
                  onClick={() => toggleMute(currentReel._id)}
                >
                  {muteStates[currentReel._id] ? (
                    <VolumeX className="w-6 h-6 text-white" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white" />
                  )}
                </button>

                <button
                  className="bg-black/50 rounded-full p-2"
                  onClick={() => togglePlayPause(currentReel._id)}
                >
                  {playStates[currentReel._id] ? (
                    <Pause className="w-6 h-6 text-white" />
                  ) : (
                    <Play className="w-6 h-6 text-white" />
                  )}
                </button>

              </div>
              <div className='absolute top-4 right-4 flex items-center space-x-2 z-20'>
                <button
                  className="p-2"
                  onClick={() => setIsOptionsModalOpen((prev) => !prev)}
                >
                  <MdOutlineMoreHoriz size={30} className='text-white' />
                </button>
                {isOptionsModalOpen && (
                  <div className="absolute top-12 right-0 bg-black/80 text-white rounded-md shadow-lg p-4 z-30 w-[200px] tamgiac">
                    <ul className="space-y-2">
                      {currentReel.author._id === localStorage.getItem('_id') ? (
                        <li>
                          <button
                            className="w-full text-left hover:text-gray-400"
                            onClick={() => {
                              setIsDeleting(true); // Hiển thị trạng thái "Đang xóa..."
                              const video = videoRefs.current[currentReelIndex];
                              if (video) video.pause(); // Dừng video hiện tại

                              handleDeleteReel(currentReel._id)
                                .then(() => {
                                  // Nếu danh sách reels còn, chuyển sang video trước/sau
                                  if (reels.length > 1) {
                                    const newIndex = Math.max(
                                      Math.min(currentReelIndex, reels.length - 2),
                                      0
                                    );
                                    setReels((prevReels) =>
                                      prevReels.filter((reel) => reel._id !== currentReel._id)
                                    );
                                    setCurrentReelIndex(newIndex);
                                  } else {
                                    // Nếu không còn reels, điều hướng trang chính
                                    navigate('/');
                                  }
                                })
                                .catch((err) => {
                                  console.error('Lỗi khi xóa video:', err);
                                })
                                .finally(() => {
                                  setIsDeleting(false); // Tắt trạng thái "Đang xóa..."
                                  setIsOptionsModalOpen(false); // Đóng modal
                                });
                            }}
                          >
                            {isDeleting ? "Đang xóa..." : "Xóa video"}
                          </button>
                        </li>
                      ) : (
                        <li>
                          <button className="w-full text-left hover:text-gray-400">Báo cáo</button>
                        </li>
                      )}
                      <li>
                        <button
                          className="w-full text-left hover:text-gray-400"
                          onClick={() => setIsOptionsModalOpen(false)}
                        >
                          Hủy
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Right Side Interaction Buttons */}
              <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4 z-20">
                <button
                  className={`flex flex-col items-center ${likedStates[currentReel._id] ? "text-red-500" : "text-white"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikeReel(currentReel._id);
                  }}
                >
                  {likedStates[currentReel._id] ? (
                    <img src={heartRed} className="w-7 h-7" alt="" />
                  ) : (
                    <img src={heart} className="w-7 h-7" alt="" />
                  )}
                  <span className="text-sm mt-1 text-white">
                    {currentReel.likes?.length || 0}
                  </span>
                </button>

                {/* Các nút khác vẫn giữ nguyên */}
                <button
                  className="flex flex-col items-center text-white"
                  onClick={handleCommentClick}
                >
                  <img src={svgComment} className="w-7 h-7 text-white" alt="" />
                  <span className="text-sm mt-1">{totalComments}</span>
                </button>

                <button className="flex flex-col items-center text-white" onClick={(e) => e.stopPropagation()}>
                  <CiBookmark className="w-7 h-7" />
                </button>

                <button className="flex flex-col items-center text-white" onClick={(e) => e.stopPropagation()}>
                  <PiShareFatThin className="w-7 h-7" />
                  <span className="text-sm mt-1">Chia sẻ</span>
                </button>
              </div>


              {/* Bottom Caption and User Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg z-10">
                <div className="flex items-start gap-2 mb-2">
                  {currentReel.author.profilePicture && (
                    <img
                      src={currentReel.author.profilePicture}
                      alt={currentReel.author.username}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      onClick={handleGoToProfile}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex gap-2">
                      <p className="text-white font-semibold truncate">
                        {currentReel.author.fullname}
                      </p>
                      <p className="text-white/70 text-sm truncate">
                        {formatTime(currentReel.createdAt)}
                      </p>
                    </div>
                    <p className="text-white/70 text-sm truncate">
                      @{currentReel.author.username}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className={`text-white ${currentReel.author._id === localStorage.getItem('_id') ? 'w-[85%]' : 'pr-24'}`}>
                    <div className={`${isCaptionExpanded ? '' : 'line-clamp-2 w-[100%]'} break-words`}>
                      {currentReel.caption}
                    </div>
                    {currentReel.caption && currentReel.caption.length > 100 && (
                      <button
                        className="text-gray-300 text-sm mt-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCaption(currentReel._id);
                        }}
                      >
                        {isCaptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                    )}
                  </div>
                  {currentReel.author._id !== localStorage.getItem('_id') && (
                    <button className="bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm whitespace-nowrap h-8 absolute right-0 bottom-2">
                      Theo dõi
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}