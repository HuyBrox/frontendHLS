import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Pause,
  Play,
} from "lucide-react";

export const ArchiveViewer = ({ stories, initialIndex = 0, onClose, onStoryChange }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [storyStates, setStoryStates] = useState(
    stories.map(() => ({
      isMuted: false,
      isPlaying: true
    }))
  );
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const progressInterval = useRef(null);
  const IMAGE_DURATION = 7000;
  const [objectFit, setObjectFit] = useState("cover");

  const currentStory = stories[currentIndex];
  const currentStoryState = storyStates[currentIndex];

  const getStoryDuration = () => {
    if (!currentStory) return IMAGE_DURATION;

    switch (currentStory.contentType) {
      case "image_audio":
      case "video_audio":
        const timeEnd = convertTimeToMs(currentStory.timeEnd);
        const timeAction = convertTimeToMs(currentStory.timeAction);
        return timeEnd - timeAction;
      case "image":
        return IMAGE_DURATION;
      case "video":
        return videoRef.current?.duration * 1000 || IMAGE_DURATION;
      default:
        return IMAGE_DURATION;
    }
  };

  const convertTimeToMs = (timeStr) => {
    if (!timeStr) return 0;

    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]);
      const seconds = parseFloat(parts[1]);
      return (minutes * 60 + seconds) * 1000;
    }

    return parseFloat(timeStr) * 1000;
  };

  useEffect(() => {
    document.documentElement.classList.add('no-scroll');
    return () => {
      document.documentElement.classList.remove('no-scroll');
    };
  }, []);

  // Synchronize media state with story state
  const syncMediaState = () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) {
      video.currentTime = convertTimeToMs(currentStory.timeAction) / 1000;
      video.muted = currentStoryState.isMuted;
      if (currentStoryState.isPlaying) {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.log("Video play error:", err));
        }
      } else {
        video.pause();
      }
    }

    if (audio) {
      audio.currentTime = convertTimeToMs(currentStory.timeAction) / 1000;
      audio.muted = currentStoryState.isMuted;
      if (currentStoryState.isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => console.log("Audio play error:", err));
        }
      } else {
        audio.pause();
      }
    }
  };

  useEffect(() => {
    syncMediaState();
  }, [currentIndex, currentStory, currentStoryState]);

  useEffect(() => {
    if (!currentStoryState.isPlaying) return;

    const duration = getStoryDuration();
    const startTime = Date.now();

    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = (elapsed / duration) * 100;

      if (currentProgress >= 100) {
        clearInterval(progressInterval.current);
        handleNext();
      } else {
        setProgress(currentProgress);
      }
    }, 100);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [currentStory, currentStoryState.isPlaying]);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setProgress(0);
      // Call the parent's onStoryChange with the new story's index
      onStoryChange(stories[newIndex]._id);
    } else {
      onClose();
    }
  };


  const handlePrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setProgress(0);
      // Call the parent's onStoryChange with the new story's index
      onStoryChange(stories[newIndex]._id);
    }
  };

  const togglePlayPause = () => {
    setStoryStates(prevStates => {
      const newStates = [...prevStates];
      newStates[currentIndex] = {
        ...prevStates[currentIndex],
        isPlaying: !prevStates[currentIndex].isPlaying
      };
      return newStates;
    });
  };

  const toggleMute = () => {
    setStoryStates(prevStates => {
      const newStates = [...prevStates];
      newStates[currentIndex] = {
        ...prevStates[currentIndex],
        isMuted: !prevStates[currentIndex].isMuted
      };
      return newStates;
    });
  };

  // Add event listeners for video/audio ended
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    const handleMediaEnded = () => {
      handleNext();
    };

    if (video) {
      video.addEventListener('ended', handleMediaEnded);
    }
    if (audio) {
      audio.addEventListener('ended', handleMediaEnded);
    }

    return () => {
      if (video) {
        video.removeEventListener('ended', handleMediaEnded);
      }
      if (audio) {
        audio.removeEventListener('ended', handleMediaEnded);
      }
    };
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 bg-black z-50 h-screen overflow-hidden flex flex-col" style={{ zIndex: 666 }}>
      <div className="absolute inset-0 flex z-10">
        <div
          className="w-1/2 h-full cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
        />
        <div
          className="w-1/2 h-full cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-[#242526] hover:bg-[#303031] transition-colors justify-center items-center flex"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <div
          className="viewer-container w-full flex left-[35px] h-[95vh] max-w-[410px] relative"
          style={{ overflow: "hidden", borderRadius: "15px" }}
        >
          <div className="absolute top-0 left-0 right-0 z-20">
            <div
              className="absolute inset-0 h-16 bg-gradient-to-b from-black/60 to-transparent"
              style={{ transform: 'translateY(-2px)' }}
            />
            <div className="h-2 flex space-x-1 p-2 relative">
              {stories.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full bg-white/40 overflow-hidden"
                >
                  <div
                    className="h-full transition-all duration-200 ease-linear rounded-full bg-white"
                    style={{
                      width:
                        idx < currentIndex
                          ? "100%"
                          : idx === currentIndex
                            ? `${progress}%`
                            : "0%",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-center pointer-events-auto"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          {currentIndex < stories.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-black/20 hover:bg-black/30 transition-colors flex items-center justify-center pointer-events-auto"
            >
              <ChevronRight size={24} />
            </button>
          )}

          <div className="w-full h-full">
            {currentStory.contentType === "video" ||
              currentStory.contentType === "video_audio" ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  src={currentStory.content}
                  className={`w-full h-full ${objectFit === "contain" ? "object-contain" : "object-cover"}`}
                  autoPlay
                  playsInline
                  muted={currentStoryState.isMuted}
                  onClick={(e) => e.stopPropagation()}
                  onLoadedMetadata={() => {
                    const video = videoRef.current;
                    if (video.videoWidth > video.videoHeight) {
                      setObjectFit("contain");
                    } else {
                      setObjectFit("cover");
                    }
                  }}
                />
                <div
                  className="absolute top-0 left-0 right-0 h-28 z-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
                  }}
                />

                <div className="absolute top-2 left-0 right-0 p-4 z-40">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentStory?.userId?.profilePicture}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="font-semibold text-sm text-white">
                        {currentStory?.userId?.fullname}
                      </p>
                      <p className="text-xs text-white/90">
                        {new Date(currentStory.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-[25px] right-4 flex items-center gap-2 z-40">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayPause();
                    }}
                    className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors flex items-center justify-center"
                  >
                    {currentStoryState.isPlaying ? <Pause size={25} /> : <Play size={25} />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors flex items-center justify-center"
                  >
                    {currentStoryState.isMuted ? <VolumeX size={25} /> : <Volume2 size={25} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <img
                  src={currentStory.content}
                  alt="Story"
                  className="w-full h-full object-cover"
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  className="absolute top-0 left-0 right-0 h-28 z-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)'
                  }}
                />

                <div className="absolute top-2 left-0 right-0 p-4 z-40">
                  <div className="flex items-center space-x-3">
                    <img
                      src={currentStory?.userId?.profilePicture}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div>
                      <p className="font-semibold text-sm text-white">
                        {currentStory?.userId?.fullname}
                      </p>
                      <p className="text-xs text-white/90">
                        {new Date(currentStory.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute top-[25px] right-4 flex items-center gap-2 z-40">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlayPause();
                    }}
                    className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors flex items-center justify-center"
                  >
                    {currentStoryState.isPlaying ? <Pause size={25} /> : <Play size={25} />}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                    }}
                    className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors flex items-center justify-center"
                  >
                    {currentStoryState.isMuted ? <VolumeX size={25} /> : <Volume2 size={25} />}
                  </button>
                </div>
              </div>
            )}

            {(currentStory.contentType === "video_audio" ||
              currentStory.contentType === "image_audio") && (
                <audio
                  ref={audioRef}
                  src={currentStory.sound?.url}
                  muted={currentStoryState.isMuted}
                  autoPlay
                />
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveViewer;