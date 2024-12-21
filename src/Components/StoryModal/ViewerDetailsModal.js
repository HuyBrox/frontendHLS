import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const ViewerDetailsModal = ({
  isOpen,
  onClose,
  stories,
  currentStoryIndex,
  goToPrevStory,
  goToNextStory,
  isHovering,
  setIsHovering,
  onCreateStory,
  story
}) => {
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [userStories, setUserStories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setIsHovering(true);
    } else {
      setIsHovering(false);
    }
  }, [isOpen, setIsHovering]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimatingOut(false);
      setIsHovering(true);
      const loggedInUserId = localStorage.getItem('_id');
      const filteredStories = stories?.filter(story =>
        story.userId._id === loggedInUserId
      ) || [];
      setUserStories(filteredStories);
    } else if (shouldRender) {
      setIsAnimatingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, stories]);

  if (!shouldRender) return null;

  const handleStoryClick = (targetIndex) => {
    // Calculate difference between current and target index
    const difference = targetIndex - currentStoryIndex;

    if (difference > 0) {
      goToNextStory();
    } else if (difference < 0) {
      goToPrevStory();
    }
  };

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(onClose, 300);
  };


  return (
    <div className="absolute inset-0 z-[60] flex items-end justify-center pb-[7px]"
    >
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isAnimatingOut ? 'opacity-0' : 'opacity-100'
          } bg-black/80`}
        onClick={handleClose}
      />
      <div
        className={`bg-[#242526] w-full rounded-t-lg overflow-hidden relative z-10 ${isAnimatingOut ? 'animate-slide-down' : 'animate-slide-up view-deltai'
          }`}
        style={{
          maxWidth: '385px',
          height: '85%',
          maxHeight: '85%',
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-medium">Chi tiết về tin</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="story-previews-container">
            <div className="flex space-x-0 overflow-x-auto pb-4 item-StoryPreviews story-previews-inner">
              {userStories.map((story, index) => {
                const isCurrentStory = index === currentStoryIndex;
                const isFirstStory = index === 0;

                return (
                  <div
                    key={story._id}
                    className={`story-item ${isCurrentStory ? 'current' : 'normal'} flex-none cursor-pointer transition-all duration-300`}
                    onClick={() => handleStoryClick(index)}
                    style={{
                      // margin-left: Không áp dụng cho mục đầu tiên
                      marginLeft: isFirstStory ? '0' : isCurrentStory ? '10px' : '0',
                      // margin-right: 10px cho mục đầu tiên hoặc các mục khác nếu không được chọn
                      marginRight: isFirstStory || !isCurrentStory ? '10px' : '0',
                      // Chuyển động mượt mà
                      transform: `translateX(-${currentStoryIndex * 40}%)`,
                    }}
                  >
                    <div className="relative">
                      <div className={`story-image ${isCurrentStory ? 'current' : 'normal'}`}>
                        {(story.contentType === 'video' || story.contentType === 'video_audio') ? (
                          <video
                            src={story.content}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            autoPlay={false}
                          />
                        ) : (story.contentType === 'image' || story.contentType === 'image_audio') ? (
                          <video
                            src={story.content}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            autoPlay={false}
                          />
                        ) : (
                          <div className="error-message">
                            <p>Unsupported content type.</p>
                          </div>
                        )}
                      </div>
                      {isCurrentStory && <div className="selection-indicator" />}
                    </div>
                  </div>
                );
              })}

              {/* Add Story Button */}
              <div className="flex-none w-24">
                <button
                  onClick={onCreateStory}
                  className="w-24 h-[8.5rem] normal rounded-lg bg-[#243A52] flex flex-col items-center justify-center space-y-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <Plus size={24} className="text-white" />
                  </div>
                  <span className="text-blue-500 text-sm text-center px-2">Thêm vào tin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Viewers Section */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">
                {story.views.length} người xem tin
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Thông tin chi tiết về những người xem tin của bạn sẽ hiển thị ở đây.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }

        .animate-slide-up {
          animation: slideUp 0.3s ease-out forwards;
        }

        .animate-slide-down {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ViewerDetailsModal;