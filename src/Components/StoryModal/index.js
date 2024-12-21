import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Transition } from 'react-transition-group';
import "./StoryModal.scss";
import { LayoutStoryModal } from './LayoutStoryModal';
import { StoryUserList } from './ListUserStory';
import { Volume2, VolumeX } from 'lucide-react';
const StoryModal = ({ story, stories, onClose, currentStoryIndex, setCurrentStoryIndex, userId, onUpdateStory, onCreateStory, onDeleteStory, currentStoryData, onLikeStory, onViewStory }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const [replyText, setReplyText] = useState('');
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();
  const id = localStorage.getItem('_id');
  const isOwnStory = id === story.userId._id;
  const [isOpen, setIsOpen] = useState(true);
  const { _id } = useParams();
  const elapsedTimeRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const IMAGE_DURATION = 7000;
  const audioRef = useRef(null);
  const [isViewerDetailsOpen, setIsViewerDetailsOpen] = useState(false);

  const parseTimeToSeconds = (timeString) => {
    if (!timeString) return 0;
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
  };
  // eslint-disable-next-line no-unused-vars
  const handleReaction = (reactionType) => {
    // Lấy danh sách likes của user hiện tại từ story
    const currentUserLikes = story.likes?.find((like) => like.userId === id);

    if (currentUserLikes) {
      if (currentUserLikes.reactionTypes.includes(reactionType)) {
        return;
      }

      if (currentUserLikes.reactionTypes.length >= 5) {
        currentUserLikes.reactionTypes.shift();
      }

      currentUserLikes.reactionTypes.push(reactionType);
    } else {
      story.likes = story.likes || [];
      story.likes.push({
        userId: id,
        reactionTypes: [reactionType],
      });
    }

    onLikeStory(story._id, reactionType);
  };

  useEffect(() => {
    if (story?._id) {
      onViewStory(story._id);
    }
  }, [story?._id]);


  useEffect(() => {
    setProgress(0);
    elapsedTimeRef.current = 0;

    // Thời gian bắt đầu và kết thúc từ API
    const startTime = parseTimeToSeconds(currentStoryData?.soundDetails?.timeAction || '0:00');
    const endTime = parseTimeToSeconds(currentStoryData?.soundDetails?.timeEnd || '0:30');
    const duration = endTime - startTime;

    // Đặt audio nếu là `image_audio`
    if (story.contentType === 'image_audio') {
      const interval = setInterval(() => {
        if (isPlaying && !isHovering) {
          elapsedTimeRef.current += 0.1; // Cập nhật mỗi 100ms
          const currentProgress = (elapsedTimeRef.current / duration) * 100;

          if (currentProgress >= 100) {
            clearInterval(interval);
            goToNextStory();
          } else {
            setProgress(currentProgress);
          }
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [story, isPlaying, isHovering, currentStoryData]);

  useEffect(() => {
    if (_id && stories.length > 0) {
      const storyIndex = stories.findIndex(s => s._id === _id);
      if (storyIndex !== -1) {
        setCurrentStoryIndex(storyIndex);
      } else {
        navigate('/');
      }
    }
  }, [_id, stories, navigate, setCurrentStoryIndex]);

  // Modify onClose to handle transition
  const handleClose = () => {
    navigate('/');
    setIsOpen(false);
    setTimeout(onClose, 300);
  };
  const handleGoToProfile = () => {
    navigate(`/profile/${userId}`);
  };

  const goToNextStory = () => {
    // Reset audio if exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Tìm group của story hiện tại
    const currentGroupIndex = groupedStoryArray.findIndex(group =>
      group.stories.some(s => s._id === story._id)
    );

    // Logic chuyển story tiếp theo
    const currentGroup = groupedStoryArray[currentGroupIndex];
    const currentStoryIndexInGroup = currentGroup.stories.findIndex(s => s._id === story._id);

    if (currentStoryIndexInGroup < currentGroup.stories.length - 1) {
      const nextStoryIndex = stories.findIndex(s => s._id === currentGroup.stories[currentStoryIndexInGroup + 1]._id);
      setCurrentStoryIndex(nextStoryIndex);
      setProgress(0);
      setIsPlaying(true);
      navigate(`/story/${stories[nextStoryIndex]._id}`);
      if (onUpdateStory) {
        onUpdateStory(stories[nextStoryIndex]._id);
      }
    } else {
      if (currentGroupIndex < groupedStoryArray.length - 1) {
        const nextGroup = groupedStoryArray[currentGroupIndex + 1];
        const nextStoryIndex = stories.findIndex(s => s._id === nextGroup.stories[0]._id);
        setCurrentStoryIndex(nextStoryIndex);
        setProgress(0);
        setIsPlaying(true);
        navigate(`/story/${stories[nextStoryIndex]._id}`);
        if (onUpdateStory) {
          onUpdateStory(stories[nextStoryIndex]._id);
        }
      } else {
        onClose();
      }
    }
  };

  const goToPrevStory = () => {
    // Tìm group của story hiện tại
    const currentGroupIndex = groupedStoryArray.findIndex(group =>
      group.stories.some(s => s._id === story._id)
    );

    // Kiểm tra nếu chưa phải story đầu tiên trong group
    const currentGroup = groupedStoryArray[currentGroupIndex];
    const currentStoryIndexInGroup = currentGroup.stories.findIndex(s => s._id === story._id);

    if (currentStoryIndexInGroup > 0) {
      // Nếu còn story trong group, chuyển đến story trước đó
      const prevStoryIndex = stories.findIndex(s => s._id === currentGroup.stories[currentStoryIndexInGroup - 1]._id);
      setCurrentStoryIndex(prevStoryIndex);
      setProgress(0);
      setIsPlaying(true);

      // Update URL with new story ID
      navigate(`/story/${stories[prevStoryIndex]._id}`);
    } else {
      // Nếu là story đầu tiên của group, chuyển sang group trước đó
      if (currentGroupIndex > 0) {
        const prevGroup = groupedStoryArray[currentGroupIndex - 1];
        const prevStoryIndex = stories.findIndex(s => s._id === prevGroup.stories[prevGroup.stories.length - 1]._id);
        setCurrentStoryIndex(prevStoryIndex);
        setProgress(0);
        setIsPlaying(true);

        // Update URL with new story ID
        navigate(`/story/${stories[prevStoryIndex]._id}`);
      }
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPrevStory();
      else if (e.key === 'ArrowRight') goToNextStory();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStoryIndex]);

  useEffect(() => {
    if (story?.contentType === 'image' && isPlaying && !isHovering) {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      const startTime = Date.now();
      lastTimeRef.current = startTime;

      progressInterval.current = setInterval(() => {
        if (isPlaying) {
          const currentTime = Date.now();
          const deltaTime = currentTime - lastTimeRef.current;
          lastTimeRef.current = currentTime;

          elapsedTimeRef.current += deltaTime;
          const currentProgress = (elapsedTimeRef.current / IMAGE_DURATION) * 100;

          if (currentProgress >= 100) {
            clearInterval(progressInterval.current);
            elapsedTimeRef.current = 0;
            goToNextStory();
          } else {
            setProgress(currentProgress);
          }
        }
      }, 100);

      return () => {
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };
    }
  }, [story, isPlaying, isHovering]);


  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (story?.contentType === 'video_audio' && video && audio && currentStoryData?.soundDetails?.url) {
      const startTime = parseTimeToSeconds(currentStoryData.soundDetails.timeAction);
      const endTime = parseTimeToSeconds(currentStoryData.soundDetails.timeEnd);
      const duration = endTime - startTime;

      const handleTimeUpdate = () => {
        const currentTime = video.currentTime;
        const currentProgress = (currentTime / video.duration) * 100;
        setProgress(currentProgress);

        // Sync audio with video
        if (audio.currentTime < startTime) {
          audio.currentTime = startTime;
        }
        if (audio.currentTime >= endTime) {
          audio.currentTime = startTime;
          audio.pause();
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        if (audio) {
          audio.pause();
          audio.currentTime = startTime;
        }
        goToNextStory();
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      if (isHovering) {
        video.pause();
        if (audio) audio.pause();
      } else if (isPlaying) {
        video.play().catch(err => console.log('Video play error:', err));
        if (audio) {
          audio.currentTime = startTime;
          audio.play().catch(err => console.log('Audio play error:', err));
        }
      }

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    } else if (story?.contentType === 'video' && video) {
      // Keep existing video-only logic
      const handleTimeUpdate = () => {
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        goToNextStory();
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);

      if (isHovering) {
        video.pause();
      } else if (isPlaying) {
        video.play().catch(err => console.log('Video play error:', err));
      }

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [story, isPlaying, isHovering, currentStoryData]);

  useEffect(() => {
    const audio = audioRef.current;

    if (audio && currentStoryData?.soundDetails?.url) {
      const startTime = parseTimeToSeconds(currentStoryData.soundDetails.timeAction);

      const handleTimeUpdate = () => {
        const endTime = parseTimeToSeconds(currentStoryData.soundDetails.timeEnd);
        if (audio.currentTime >= endTime) {
          audio.pause();
          audio.currentTime = startTime;
        }
      };

      // Lắng nghe sự kiện `timeupdate`
      audio.addEventListener('timeupdate', handleTimeUpdate);

      // Điều chỉnh audio khi hover
      if (isHovering) {
        audio.pause();
      } else {
        audio.currentTime = startTime;
        audio.play().catch(err => console.log('Audio play error:', err));
      }

      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [currentStoryData, isHovering]); // Theo dõi `isHovering` để cập nhật trạng thái


  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);

    if ((story.contentType === 'video' || story.contentType === 'video_audio') && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (story.contentType === 'video_audio' && audioRef.current) {
          audioRef.current.pause();
        }
      } else {
        videoRef.current.play().catch(err => console.log('Video play error:', err));
        if (story.contentType === 'video_audio' && audioRef.current) {
          const startTime = parseTimeToSeconds(currentStoryData?.soundDetails?.timeAction);
          audioRef.current.currentTime = startTime;
          audioRef.current.play().catch(err => console.log('Audio play error:', err));
        }
      }
    }

    lastTimeRef.current = Date.now();
  };

  // Update toggleMute to handle video_audio
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    if (audioRef.current && story.contentType === 'video_audio') {
      audioRef.current.muted = !isMuted;
    }
  };

  const renderPlayPauseButton = () => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        togglePlayPause();
      }}
      className="w-10 h-10 rounded-full transition-colors flex items-center justify-center"
      style={{ zIndex: 9999 }}
    >
      {isPlaying ? <Pause size={25} /> : <Play size={25} />}
    </button>
  );

  const groupedStories = stories.reduce((acc, story) => {
    const userId = story.userId._id;
    if (!acc[userId]) {
      acc[userId] = {
        user: story.userId,
        stories: [],
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {});

  const groupedStoryArray = Object.values(groupedStories);

  useEffect(() => {
    elapsedTimeRef.current = 0;
    setProgress(0);
    lastTimeRef.current = Date.now();
    setIsPlaying(true); // Auto-play new story
  }, [story]);

  const handleUserSelect = (index) => {
    const selectedGroup = groupedStoryArray[index];
    const firstStoryIndex = stories.findIndex(story => story._id === selectedGroup.stories[0]._id);

    setCurrentStoryIndex(firstStoryIndex);
    setProgress(0);
    setIsPlaying(true);
  };


  return (
    <Transition in={isOpen} timeout={300}>
      {(state) => (
        <LayoutStoryModal
          state={state}
          handleClose={handleClose}
          currentStoryIndex={currentStoryIndex}
          goToNextStory={goToNextStory}
          goToPrevStory={goToPrevStory}
          stories={stories}
          StoryUserList={() => (
            <StoryUserList
              groupedStoryArray={groupedStoryArray || []}
              story={story}
              onCreateStory={onCreateStory}
              handleUserSelect={handleUserSelect}
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
            />
          )}
          groupedStoryArray={groupedStoryArray}
          videoRef={videoRef}
          audioRef={audioRef}
          sound={currentStoryData?.soundDetails}
          isMuted={isMuted}
          toggleMute={toggleMute}
          isOwnStory={isOwnStory}
          replyText={replyText}
          setReplyText={setReplyText}
          setIsOptionsModalOpen={setIsOptionsModalOpen}
          onDeleteStory={onDeleteStory}
          isOptionsModalOpen={isOptionsModalOpen}
          story={story}
          renderPlayPauseButton={renderPlayPauseButton}
          handleGoToProfile={handleGoToProfile}
          progress={progress}
          isHovering={isHovering}
          handleReaction={(reactionType) => onLikeStory(story._id, reactionType)}
          setIsHovering={setIsHovering}
          isViewerDetailsOpen={isViewerDetailsOpen}
          setIsViewerDetailsOpen={setIsViewerDetailsOpen}
          effectIcon={currentStoryData?.story?.effectIcon}
          onCreateStory={onCreateStory}
          onViewStory={onViewStory}
        >

          {currentStoryData?.soundDetails?.url && (
            <div className="absolute bottom-20 right-4 flex items-center space-x-2 bg-black/50 p-2 rounded">
              <button onClick={toggleMute} className="text-white">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <span className="text-white text-sm">{currentStoryData.soundDetails.name}</span>
            </div>
          )}
        </LayoutStoryModal>
      )}
    </Transition>
  );
};

export default StoryModal;

