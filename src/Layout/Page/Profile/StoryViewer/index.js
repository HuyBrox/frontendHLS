import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { formatTime } from "./../AllPostProfile/PreviewProfilePost/formatTime";
import "./StoryViewer.scss";
const StoryViewer = ({ stories, onClose, onComplete }) => {
  const { userId } = useParams(); // Lấy id từ URL
  const [currentIndex, setCurrentIndex] = useState(0); // Chỉ số hiện tại của story
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const progressInterval = useRef(null);
  const IMAGE_DURATION = 7000;
  const [videoAspectRatio, setVideoAspectRatio] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 521);

  // Hàm chuyển đổi thời gian từ format 'mm:ss' sang giây
  const parseTimeToSeconds = (timeString) => {
    if (!timeString) return 0;
    const [minutes, seconds] = timeString.split(":").map(Number);
    return minutes * 60 + seconds; // Trả về thời gian dưới dạng giây
  };

  // Theo dõi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 521);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Tìm story dựa trên id từ URL
  useEffect(() => {
    const storyIndex = stories.findIndex((story) => story._id === userId);
    if (storyIndex !== -1) {
      setCurrentIndex(storyIndex);
    }
  }, [userId, stories]);

  const currentStory = stories[currentIndex];

  // Logic cho story loại hình ảnh
  useEffect(() => {
    if (currentStory?.contentType === "image" && isPlaying) {
      const startTime = Date.now();
      progressInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const currentProgress = (elapsed / IMAGE_DURATION) * 100;

        if (currentProgress >= 100) {
          clearInterval(progressInterval.current);
          handleNext();
        } else {
          setProgress(currentProgress);
        }
      }, 100);

      return () => clearInterval(progressInterval.current);
    }
  }, [currentStory, isPlaying]);

  // Logic cho image_audio
  useEffect(() => {
    if (currentStory?.contentType === "image_audio" && audioRef.current && isPlaying) {
      const audio = audioRef.current;

      // Lấy thời gian bắt đầu và kết thúc
      const startTime = parseTimeToSeconds(
        currentStory.soundDetails?.timeAction || "0:00"
      );
      const endTime = parseTimeToSeconds(
        currentStory.soundDetails?.timeEnd || `${audio.duration || "0:30"}`
      );
      const duration = endTime - startTime; // Tổng thời gian chạy audio

      // Cập nhật tiến trình
      const interval = setInterval(() => {
        const elapsed = audio.currentTime - startTime; // Thời gian đã trôi qua
        const currentProgress = (elapsed / duration) * 100;

        // Nếu đã hết thời gian hoặc tiến trình đạt 100%, chuyển story tiếp theo
        if (audio.currentTime >= endTime || currentProgress >= 100) {
          clearInterval(interval);
          handleNext();
        } else {
          setProgress(currentProgress); // Cập nhật thanh tiến trình
        }
      }, 100); // Cập nhật mỗi 100ms

      // Đặt thời gian bắt đầu và phát âm thanh
      audio.currentTime = startTime;
      audio.play().catch((err) => console.log("Audio play error:", err));

      // Dọn dẹp
      return () => {
        clearInterval(interval);
        audio.pause();
      };
    }
  }, [currentStory, isPlaying]);


  // Logic cho video và video_audio
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    // Xử lý video đơn thuần
    if (currentStory?.contentType === "video" && video) {
      const handlePlay = () => setIsPlaying(true);
      const handlePause = () => setIsPlaying(false);
      const handleEnded = () => handleNext();
      const updateVideoProgress = () => {
        const currentProgress = (video.currentTime / video.duration) * 100;
        setProgress(currentProgress);
      };

      const handleMetadataLoaded = () => {
        const aspectRatio = video.videoWidth / video.videoHeight;
        setVideoAspectRatio(aspectRatio);

        // Cập nhật kiểu hiển thị dựa trên tỷ lệ khung hình
        if (aspectRatio >= 1) {
          video.style.objectFit = "contain"; // Video ngang
        } else {
          video.style.objectFit = "cover"; // Video dọc
        }
      };

      video.addEventListener("play", handlePlay);
      video.addEventListener("pause", handlePause);
      video.addEventListener("ended", handleEnded);
      video.addEventListener("timeupdate", updateVideoProgress);
      video.addEventListener("loadedmetadata", handleMetadataLoaded);

      video.muted = isMuted;

      return () => {
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("timeupdate", updateVideoProgress);
        video.removeEventListener("loadedmetadata", handleMetadataLoaded);
      };
    }

    // Logic cho video_audio
    if (currentStory?.contentType === "video_audio" && video && audio) {
      const startTime = parseTimeToSeconds(
        currentStory.soundDetails?.timeAction || "0:00"
      );
      const endTime = parseTimeToSeconds(
        currentStory.soundDetails?.timeEnd || `${audio.duration || "0:30"}`
      );
      const duration = endTime - startTime;

      const handleTimeUpdate = () => {
        const currentTime = video.currentTime;
        const elapsed = Math.max(currentTime - startTime, 0);
        const currentProgress = (elapsed / duration) * 100;

        setProgress(currentProgress);

        // Đồng bộ audio với video
        if (audio.currentTime < startTime) {
          audio.currentTime = startTime;
        }
        if (audio.currentTime >= endTime) {
          audio.pause();
          audio.currentTime = startTime;
        }
      };

      const handleEnded = () => {
        setIsPlaying(false);
        if (audio) {
          audio.pause();
          audio.currentTime = startTime;
        }
        handleNext();
      };

      const handleMetadataLoaded = () => {
        const aspectRatio = video.videoWidth / video.videoHeight;
        setVideoAspectRatio(aspectRatio);

        // Cập nhật kiểu hiển thị dựa trên tỷ lệ khung hình
        if (aspectRatio >= 1) {
          video.style.objectFit = "contain"; // Video ngang
        } else {
          video.style.objectFit = "cover"; // Video dọc
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("ended", handleEnded);
      video.addEventListener("loadedmetadata", handleMetadataLoaded);

      if (isPlaying) {
        video.currentTime = startTime;
        video.play().catch((err) => console.log("Video play error:", err));
        audio.currentTime = startTime;
        audio.play().catch((err) => console.log("Audio play error:", err));
      }

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleEnded);
        video.removeEventListener("loadedmetadata", handleMetadataLoaded);
        audio.pause();
      };
    }
  }, [currentStory, isMuted, isPlaying]);


  // Chuyển story về phía trước
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
      setIsPlaying(true);
    }
  };

  // Chuyển story về phía sau
  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
      setIsPlaying(true);
    } else {
      onComplete && onComplete();
      onClose();
    }
  };

  // Chức năng play/pause
  const togglePlayPause = () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (isPlaying) {
      video?.pause();
      audio?.pause();
    } else {
      if (currentStory?.contentType === "video_audio") {
        video?.play().catch((err) => console.log("Video play error:", err));
        audio?.play().catch((err) => console.log("Audio play error:", err));
      } else if (currentStory?.contentType === "image_audio") {
        audio?.play().catch((err) => console.log("Audio play error:", err));
      } else if (currentStory?.contentType === "video") {
        video?.play().catch((err) => console.log("Video play error:", err));
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Chức năng mute/unmute
  const toggleMute = () => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video) video.muted = !isMuted;
    if (audio) audio.muted = !isMuted;

    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 bg-black flex z-50" style={{ zIndex: 666 }}>
      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-[#242526] hover:bg-[#303031] transition-colors justify-center items-center flex"
      >
        <X size={20} />
      </button>

      {/* Khung chứa story */}
      <div className="flex-1 relative flex items-center justify-center">
        <div
          className="w-full flex h-[95vh] max-w-[400px] relative"
          style={{ overflow: "hidden", borderRadius: "15px" }}
        >
          {/* Nút điều hướng */}
          <div className="absolute inset-0 pointer-events-none">
            {currentIndex > 0 && !isMobile && (
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#242526] bg-opacity-70 hover:bg-opacity-80 transition-colors flex items-center justify-center pointer-events-auto"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {!isMobile && (
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#242526] bg-opacity-70 hover:bg-opacity-80 transition-colors flex items-center justify-center pointer-events-auto"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Khung nội dung story */}
          <div className="w-full h-full max-w-[400px]">
            {/* Thanh tiến trình */}
            <div
              className="absolute top-0 left-0 right-0 h-2 flex space-x-1 p-2 z-20"
              style={{
                paddingTop: "8px",
                paddingLeft: "15px",
                paddingRight: "15px",
              }}
            >
              {stories.map((_, idx) => (
                <div
                  key={idx}
                  className="h-1 flex-1 rounded-full bg-[#303031] overflow-hidden"
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

            {/* Nội dung story */}
            {['.mp4', '.mov', '.avi', '.webm'].some(ext =>
              currentStory?.content.toLowerCase().endsWith(ext)
            ) ? (
              <video
                ref={videoRef}
                src={currentStory.content}
                className="w-full h-full"
                style={{
                  objectFit: videoAspectRatio < 1 ? "cover" : "contain",
                }}
                playsInline
                autoPlay
                onClick={isMobile ? handleNext : null}
              />
            ) : (
              <img
                src={currentStory.content}
                alt="Story"
                className="w-full h-full object-cover"
                style={{ objectFit: "cover" }}
                onClick={isMobile ? handleNext : null}
              />
            )}

            {/* Audio element for image_audio and video_audio */}
            {(currentStory?.contentType === "video_audio" ||
              currentStory?.contentType === "image_audio") && (
                <audio ref={audioRef} src={currentStory.sound?.url} muted={isMuted} />
              )}
            {/* Thông tin người đăng story */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
              <div
                className="flex items-center space-x-3"
                style={{ marginTop: "10px" }}
              >
                <img
                  src={currentStory?.userId?.profilePicture}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-sm text-white">
                    {currentStory?.userId?.fullname}
                  </p>
                  <p className="text-xs text-white">
                    {formatTime(new Date(currentStory.createdAt).getTime())}
                  </p>
                </div>
              </div>
            </div>
            <div
              className="absolute bottom-6 left-6 text-white text-sm view-toggle"
              style={{ userSelect: 'none' }}
            // onClick={() => setIsViewerDetailsOpen(true)}
            >
              <span className="view">
                {currentStory?.views?.length || 0} người đang xem
              </span>
            </div>
            {/* Nút điều khiển */}
            <div className="absolute top-[25px] right-4 flex items-center gap-2 z-20">
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full transition-colors flex items-center justify-center"
              >
                {isPlaying ? <Pause size={25} /> : <Play size={25} />}
              </button>

              <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-full transition-colors flex items-center justify-center"
              >
                {isMuted ? <VolumeX size={25} /> : <Volume2 size={25} />}
              </button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default StoryViewer;
