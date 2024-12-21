import { X, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { RiSendPlane2Fill } from "react-icons/ri";
import { MdOutlineMoreHoriz } from "react-icons/md";
import { formatTime } from './../../Layout/Page/Profile/AllPostProfile/PreviewProfilePost/formatTime';
import { useEffect, useState } from 'react';
import haha from "../../assets/images/svg-haha.svg";
import sad from "../../assets/images/svg-sad.svg";
import angry from "../../assets/images/svg-angry.svg";
import like from "../../assets/images/like-icon-a.webp";
import love from "../../assets/images/svg-heart.svg";
import ViewerDetailsModal from './ViewerDetailsModal';

const defaultStyle = {
  transition: 'opacity 300ms ease-in-out, transform 300ms ease-in-out',
  opacity: 0,
  transform: 'scale(0.9)',
};

const transitionStyles = {
  entering: {
    opacity: 0,
    transform: 'scale(0.9)'
  },
  entered: {
    opacity: 1,
    transform: 'scale(1)'
  },
  exiting: {
    opacity: 0,
    transform: 'scale(0.9)'
  },
  exited: {
    opacity: 0,
    transform: 'scale(0.9)'
  }
};

export function LayoutStoryModal({
  state,
  handleClose,
  currentStoryIndex,
  goToPrevStory,
  goToNextStory,
  stories,
  StoryUserList,
  groupedStoryArray,
  videoRef,
  isMuted,
  toggleMute,
  isOwnStory,
  replyText,
  setReplyText,
  setIsOptionsModalOpen,
  onDeleteStory,
  isOptionsModalOpen,
  story,
  renderPlayPauseButton,
  handleGoToProfile,
  progress,
  audioRef,
  sound,
  handleReaction,
  isHovering,
  setIsHovering,
  isViewerDetailsOpen,
  setIsViewerDetailsOpen,
  effectIcon,
  onCreateStory,
  onViewStory
}) {
  const [fallingEmojis, setFallingEmojis] = useState([]);
  // console.log(onViewStory)
  // Handle mute toggle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const createFallingEmoji = (emoji) => {
    const newEmojis = Array.from({ length: 25 }, () => ({
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emoji,
      left: Math.random() * 100,
      startDelay: Math.random() * 500,
      duration: 1500 + Math.random() * 1000,
      rotation: Math.random() * 720 - 360,
      scale: 0.8 + Math.random() * 0.4,
      horizontalMovement: Math.random() * 100 - 50,
    }));

    setFallingEmojis(prev => [...prev, ...newEmojis]);

    setTimeout(() => {
      setFallingEmojis(prev => prev.filter(e => !newEmojis.includes(e)));
    }, 3000);
  };

  const handleReactionWithAnimation = (type, emoji) => {
    handleReaction(type);
    createFallingEmoji(emoji);
  };
  useEffect(() => {
    if (isOwnStory && effectIcon && effectIcon.length > 0) {
      effectIcon.forEach(type => {
        if (reactionIcons[type]) {
          createFallingEmoji(reactionIcons[type]);
        }
      });
    }
  }, [effectIcon, isOwnStory]);
  const reactionIcons = {
    like: <img src={like} alt="like" className="w-10 h-10" />,
    love: <img src={love} alt="love" className="w-10 h-10" />,
    haha: <img src={haha} alt="haha" className="w-10 h-10" />,
    sad: <img src={sad} alt="sad" className="w-10 h-10" />,
    angry: <img src={angry} alt="angry" className="w-10 h-10" />,
  };

  return (
    <div
      className="fixed inset-0 bg-black flex z-50"
      style={{
        ...defaultStyle,
        ...transitionStyles[state],
        zIndex: 999
      }}
    >
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-[#242526] hover:bg-[#303031] transition-colors justify-center items-center flex"
      >
        <X size={20} />
      </button>

      <StoryUserList
        isViewerDetailsModalOpen={isViewerDetailsOpen}
        onStoryListMouseEnter={() => {
          // Chỉ set hover khi ViewerDetailsModal không mở
          if (!isViewerDetailsOpen) {
            setIsHovering(true);
          }
        }}
        onStoryListMouseLeave={() => {
          // Chỉ bỏ hover khi ViewerDetailsModal không mở
          if (!isViewerDetailsOpen) {
            setIsHovering(false);
          }
        }}
        onCreateStory={onCreateStory}
      />





      <div className="flex-1 relative flex items-center justify-center center-Storymodal" style={{ overflow: 'hidden' }}>
        {currentStoryIndex > 0 && (
          <button
            onClick={goToPrevStory}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#242526] hover:bg-[#303031] transition-colors flex items-center justify-center"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {currentStoryIndex < stories.length - 1 && (
          <button
            onClick={goToNextStory}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-[#242526] hover:bg-[#303031] transition-colors flex items-center justify-center"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div className="w-full h-full max-w-[400px] relative" style={{ overflow: 'hidden' }} >
          <div className="w-full h-full max-w-[420px] p-2" >
            <div className="absolute top-0 left-0 right-0 h-2 flex space-x-1 p-4 px-6 z-20">
              {(() => {
                const currentGroup = groupedStoryArray.find((group) =>
                  group.stories.some((s) => s._id === story._id)
                );

                return currentGroup.stories.map((s, index) => (
                  <div
                    key={index}
                    className="h-1 flex-1 rounded-full bg-[#303031] overflow-hidden"
                  >
                    <div
                      className="h-full transition-all duration-200 ease-linear rounded-full bg-white"
                      style={{
                        width:
                          index < currentGroup.stories.findIndex((s) => s._id === story._id)
                            ? '100%'
                            : index === currentGroup.stories.findIndex((s) => s._id === story._id)
                              ? `${progress}%`
                              : '0%',
                      }}
                    />
                  </div>
                ));
              })()}
            </div>
            <style>
              {`
          @keyframes fall {
            0% {
              transform: translateY(-20px) translateX(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) translateX(var(--horizontal-movement)) rotate(var(--rotation));
              opacity: 0;
            }
          }
          .falling-emoji {
            position: absolute;
            pointer-events: none;
            font-size: 2rem;
            animation: fall var(--duration) linear forwards;
            animation-delay: var(--delay);
          }
        `}
            </style>
            {fallingEmojis.map(({ id, emoji, left, horizontalMovement, startDelay, duration, rotation, scale }) => (
              <div
                key={id}
                className="falling-emoji"
                style={{
                  left: `${left}%`,
                  '--horizontal-movement': `${horizontalMovement}px`,
                  '--delay': `${startDelay}ms`,
                  '--duration': `${duration}ms`,
                  '--rotation': `${rotation}deg`,
                  transform: `scale(${scale})`
                }}
              >
                {emoji}
              </div>
            ))}
            {['.mp4', '.mov', '.avi', '.webm'].some(ext =>
              story.content.toLowerCase().endsWith(ext)
            ) ? (
              <video
                ref={videoRef}
                src={story.content}
                className="w-full h-full object-contain rounded-xl edge:object-cover"
                playsInline
                muted={story.contentType === 'video_audio'} // Mute video if it has custom audio
              />
            ) : (
              <img
                src={story.content}
                alt="Story"
                className="w-full h-full object-cover rounded-xl"
                style={{
                  userSelect: 'none'
                }}
                draggable="false"
              />
            )}
            {sound?.url && (
              <div className="absolute bottom-20 right-4 flex items-center space-x-2 bg-black/50 p-2 rounded"
                style={{ display: "none" }}
              >
                <button onClick={toggleMute} className="text-white">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <div className="flex flex-col w-48">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1 bg-gray-600 rounded overflow-hidden">
                      <div
                        className="h-full bg-white transition-all duration-200"
                        style={{
                          width: `${progress}%`
                        }}
                      />
                    </div>
                    <span className="text-white text-xs">
                      {sound.timeAction} / {sound.timeEnd}
                    </span>
                  </div>
                  <span className="text-white text-sm mt-1">
                    {sound.name || 'Nhạc không tên'}
                  </span>
                </div>
                <audio
                  ref={audioRef}
                  src={sound.url}
                  autoPlay
                  muted={isMuted}
                  name="media"
                />
              </div>
            )}
            <ViewerDetailsModal
              isOpen={isViewerDetailsOpen}
              onClose={() => setIsViewerDetailsOpen(false)}
              stories={stories}
              currentStoryIndex={currentStoryIndex}
              goToPrevStory={goToPrevStory}
              goToNextStory={goToNextStory}
              handleClose={handleClose}
              isHovering={isHovering}
              setIsHovering={setIsHovering}
              onCreateStory={onCreateStory}
              story={story}
            />
            <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center space-x-3 " style={{ marginTop: "10px" }}>
                <img
                  onClick={handleGoToProfile}
                  style={{ cursor: 'pointer' }}
                  src={story.userId.profilePicture}
                  alt=""
                  className="w-10 h-10 rounded-full  object-cover image-story-list"
                />
                <div>
                  <p className="font-semibold text-sm text-white">{story.userId.fullname}</p>
                  <p className="text-xs text-white">{formatTime(new Date(story.createdAt).getTime())}</p>
                </div>
              </div>
            </div>

            {/* Đoạn text "0 người đang xem" ở góc trái dưới */}
            {isOwnStory && (
              <div
                className="absolute bottom-6 left-6 text-white text-sm view-toggle"
                style={{ userSelect: 'none' }}
                onClick={() => setIsViewerDetailsOpen(true)}
              >
                <span className="view">{story.views.length} người đang xem</span>
              </div>
            )}
          </div>

          <div className="absolute top-[35px] right-4 flex items-center gap-2 z-20">
            {/* Nút Pause/Play */}
            {renderPlayPauseButton()}

            {/* Nút Mute/Unmute */}
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full transition-colors flex items-center justify-center"
            >
              {isMuted ? <VolumeX size={25} /> : <Volume2 size={25} />}
            </button>
            <button
              onClick={() => setIsOptionsModalOpen(prevState => !prevState)}
              className="w-10 h-10 rounded-full transition-colors flex items-center justify-center"
            >
              <MdOutlineMoreHoriz size={25} />
            </button>
          </div>
          {isOptionsModalOpen && (
            <div className="absolute top-[80px] right-4 bg-[#212121] text-white rounded-md shadow-lg p-4 z-30 w-[200px] tamgiacStory">
              <ul className="space-y-2">
                {isOwnStory ? (
                  <li>
                    <button
                      className="w-full text-left hover:text-gray-400"
                      onClick={() => {
                        onDeleteStory(story._id);
                        setIsOptionsModalOpen(false);
                      }}
                    >
                      Xóa story
                    </button>
                  </li>
                ) : (
                  <li>
                    <button
                      className="w-full text-left hover:text-gray-400"
                      onClick={() => {
                        // Xử lý báo cáo story
                        setIsOptionsModalOpen(false);
                      }}
                    >
                      Báo cáo
                    </button>
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

          {!isOwnStory && (
            <div className="flex space-x-4 absolute bottom-20 left-4 z-20">
              {[
                { emoji: <img src={like} alt="like" className="w-10 h-10" />, type: 'like' },
                { emoji: <img src={love} alt="love" className="w-10 h-10" />, type: 'love' },
                { emoji: <img src={haha} alt="haha" className="w-10 h-10" />, type: 'haha' },
                { emoji: <img src={sad} alt="sad" className="w-10 h-10" />, type: 'sad' },
                { emoji: <img src={angry} alt="angry" className="w-10 h-10" />, type: 'angry' },
              ].map(({ emoji, type }) => (
                <button
                  key={type}
                  onClick={() => handleReactionWithAnimation(type, emoji)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-camxuc"
                >
                  <span role="img" aria-label={type} className="text-2xl">
                    {emoji}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!isOwnStory && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-3 z-20">
              <div className="relative flex items-center flex-1">
                <textarea
                  placeholder="Trả lời..."
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
                  className={`absolute right-2 bottom-0 transform -translate-y-1/2 font-medium text-sm`}
                >
                  <RiSendPlane2Fill size={22} className='text-blue-500' />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}