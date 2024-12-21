import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import "../Reels/tets.scss";
import { LayoutReels } from './LayoutReels';
import { ToggleRight } from './ToggleRight';

const Reel = () => {
  const navigate = useNavigate();
  const { _id: initialReelId } = useParams();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [muteStates, setMuteStates] = useState({});
  const videoRefs = useRef([]);
  const [playStates, setPlayStates] = useState({});
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [videoStyles, setVideoStyles] = useState({});
  const urlUpdateTimeoutRef = useRef(null);
  const [isFetching, setIsFetching] = useState(false);
  const [likedStates, setLikedStates] = useState({});
  const limit = 10;
  const loggedInUserId = localStorage.getItem('_id');
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);


  const handleWheel = (e) => {
    if (e.deltaY > 0) {
      handleNextReel();
    } else {
      handlePreviousReel();
    }
  };

  // Xử lý touch events cho mobile
  const touchStartY = useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;

    // Vuốt lên
    if (diff > 50) {
      handleNextReel();
    }
    // Vuốt xuống
    else if (diff < -50) {
      handlePreviousReel();
    }

    touchStartY.current = null;
  };

  // Memoized URL update function
  const updateURL = useCallback((reelId) => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }
    urlUpdateTimeoutRef.current = setTimeout(() => {
      navigate(`/reels/${reelId}`, { replace: true });
    }, 300);
  }, [navigate]);

  // Initial reel setup
  useEffect(() => {
    if (reels.length > 0 && initialReelId) {
      const initialIndex = reels.findIndex(reel => reel._id === initialReelId);
      if (initialIndex !== -1) {
        setCurrentReelIndex(initialIndex);
      }
    }
  }, [initialReelId, reels.length]);

  // Fetch reels data
  const fetchReels = useCallback(async () => {
    if (isFetching) return; // Không fetch nếu đã đang fetch
    try {
      setLoading(true); // Bật loading trước khi fetch
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/reels/getReels?limit=${limit}&page=${currentPage}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }
      );
      const data = await response.json();
      if (data.success) {
        if (data.reels.length > 0) {
          setReels(prev => [...prev, ...data.reels]);

          // Setup trạng thái tắt/bật âm thanh, phát/dừng video, và videoStyles mới
          const newMuteStates = {};
          const newPlayStates = {};
          const newVideoStyles = {};
          const newLikedStates = {};

          const loggedInUserId = localStorage.getItem('_id'); // ID của người dùng đang login

          data.reels.forEach((reel) => {
            newMuteStates[reel._id] = false;
            newPlayStates[reel._id] = false;
            newVideoStyles[reel._id] = "object-cover";

            // Kiểm tra nếu ID của người dùng hiện tại có trong mảng likes
            const isLiked = reel.likes.some(like => like._id === loggedInUserId);
            newLikedStates[reel._id] = isLiked; // Đánh dấu trạng thái đã like
            // console.log(reel.caption)
            // console.log(reel.createdAt)
          });

          setMuteStates(prev => ({ ...prev, ...newMuteStates }));
          setPlayStates(prev => ({ ...prev, ...newPlayStates }));
          setVideoStyles(prev => ({ ...prev, ...newVideoStyles }));

          // Cập nhật trạng thái liked
          setLikedStates(prev => ({ ...prev, ...newLikedStates }));

          // Tăng currentPage nếu đủ số lượng reel
          if (data.reels.length === limit) {
            setCurrentPage(prev => prev + 1);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false); // Tắt loading sau khi fetch xong
    }
  }, [currentPage, limit, isFetching]);

  const handleLikeReel = useCallback(async (reelId) => {
    // Nếu đang trong quá trình like, bỏ qua
    if (isLiking) return;

    try {
      // Khóa việc like
      setIsLiking(true);

      // Kiểm tra trạng thái like hiện tại
      const isCurrentlyLiked = likedStates[reelId];

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/reels/likeReel/${reelId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }
      );
      const data = await response.json();

      if (data.success) {
        setLikedStates(prev => ({
          ...prev,
          [reelId]: !isCurrentlyLiked
        }));

        // Cập nhật mảng likes chỉ khi trạng thái thực sự thay đổi
        setReels(prevReels =>
          prevReels.map(reel =>
            reel._id === reelId
              ? {
                ...reel,
                likes: !isCurrentlyLiked
                  ? [...reel.likes, { _id: loggedInUserId }]
                  : reel.likes.filter(like => like._id !== loggedInUserId)
              }
              : reel
          )
        );
      } else {
        console.error("Error liking reel:", data.message);
      }
    } catch (error) {
      console.error('Error liking reel:', error);
    } finally {
      // Mở khóa like sau 500ms
      setTimeout(() => {
        setIsLiking(false);
      }, 300);
    }
  }, [loggedInUserId, likedStates, isLiking]);

  // fecth delete reels
  const handleDeleteReel = useCallback(async (reelId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/reels/deleteReel/${reelId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (data.success) {
        // Cập nhật danh sách reels, loại bỏ reel đã xóa
        setReels((prevReels) => prevReels.filter((reel) => reel._id !== reelId));
        // Cập nhật chỉ số reel hiện tại
        setCurrentReelIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : 0
        );
      }
    } catch (error) {
      console.error('Error deleting reel:', error);
      alert('Lỗi khi xóa reels');
    }
  }, []);

  const handleCommentClick = useCallback((e) => {
    e.stopPropagation();
    setShowComments(true);
  }, []);

  const handleCloseComments = useCallback((e) => {
    e.stopPropagation();
    setShowComments(false);
  }, []);


  useEffect(() => {
    return () => {
      setShowComments(false);
      setIsFetching(false);
    };
  }, [currentReelIndex]);

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  // URL update on reel change
  useEffect(() => {
    if (reels.length > 0) {
      const currentReel = reels[currentReelIndex];
      if (currentReel) {
        updateURL(currentReel._id);
      }
    }
  }, [currentReelIndex, reels, updateURL]);

  // Video playback management
  useEffect(() => {
    if (reels.length > 0 && hasUserInteracted) {
      const currentReel = reels[currentReelIndex];
      const video = videoRefs.current[currentReelIndex];

      if (video && currentReel) {
        try {
          setPlayStates(prev => ({ ...prev, [currentReel._id]: true }));
          video.play().catch(error => {
            console.warn('Autoplay was prevented:', error);
            setPlayStates(prev => ({
              ...prev,
              [currentReel._id]: false
            }));
          });
        } catch (error) {
          console.error('Error attempting to play video:', error);
        }
      }
    }
  }, [currentReelIndex, hasUserInteracted, reels]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, []);

  // User interaction handlers
  const handleFirstInteraction = useCallback(() => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      if (reels.length > 0) {
        const currentReel = reels[currentReelIndex];
        const video = videoRefs.current[currentReelIndex];
        if (video && currentReel) {
          try {
            video.play().catch(error => {
              console.warn('Autoplay was prevented:', error);
              setPlayStates(prev => ({
                ...prev,
                [currentReel._id]: false
              }));
            });
          } catch (error) {
            console.error('Error attempting to play video:', error);
          }
        }
      }
    }
  }, [currentReelIndex, hasUserInteracted, reels]);

  useEffect(() => {
    const interactionEvents = ['click', 'touchstart', 'keydown'];
    const handleInteraction = () => {
      handleFirstInteraction();
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };

    interactionEvents.forEach(event => {
      document.addEventListener(event, handleInteraction);
    });

    return () => {
      interactionEvents.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [handleFirstInteraction]);

  const toggleMute = useCallback(reelId => {
    setMuteStates(prev => {
      const newMuteStates = { ...prev, [reelId]: !prev[reelId] };
      const videoIndex = reels.findIndex(reel => reel._id === reelId);
      const video = videoRefs.current[videoIndex];
      if (video) {
        video.muted = newMuteStates[reelId];
      }
      return newMuteStates;
    });
  }, [reels]);

  const togglePlayPause = useCallback(reelId => {
    const videoIndex = reels.findIndex(reel => reel._id === reelId);
    const video = videoRefs.current[videoIndex];

    setPlayStates(prev => {
      const currentPlayState = prev[reelId];
      const newPlayStates = { ...prev, [reelId]: !currentPlayState };

      if (video) {
        if (!currentPlayState) {
          video.play();
        } else {
          video.pause();
        }
      }

      return newPlayStates;
    });
  }, [reels]);

  const handleVideoClick = useCallback((event) => {
    const currentTime = new Date().getTime();
    const timeSinceLastTap = currentTime - lastTapTime;
    const video = videoRefs.current[currentReelIndex];
    const reelId = reels[currentReelIndex]?._id;

    if (timeSinceLastTap < 300) {
      // Double tap - Like
      handleLikeReel(reelId);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    } else {
      // Single tap - Play/Pause
      if (video && reelId) {
        setPlayStates(prev => {
          const currentPlayState = prev[reelId];
          const newPlayState = !currentPlayState;

          try {
            newPlayState ? video.play() : video.pause();
          } catch (error) {
            console.warn('Video play/pause failed:', error);
          }

          return { ...prev, [reelId]: newPlayState };
        });
      }
    }

    setLastTapTime(currentTime);
  }, [currentReelIndex, reels, handleLikeReel, lastTapTime]);

  const handleNextReel = useCallback(async () => {
    if (currentReelIndex < reels.length - 1) {
      const nextIndex = currentReelIndex + 1;
      setCurrentReelIndex(nextIndex);

      // Nếu chuyển đến reel thứ 11 (hoặc reel chia hết cho limit + 1), thì fetch tiếp
      if (nextIndex % limit === 0 && nextIndex >= reels.length - 1) {
        setLoading(true); // Hiện loading
        setIsFetching(true); // Đánh dấu là đang fetch
        await fetchReels(); // Gọi fetch dữ liệu mới
        setIsFetching(false); // Tắt trạng thái đang fetch
        setShowComments(false);
      }
    }
  }, [currentReelIndex, reels.length, fetchReels, limit]);


  const handlePreviousReel = useCallback(() => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
    }
  }, [currentReelIndex, reels, handleLikeReel, videoRefs, setPlayStates, setHasUserInteracted]);

  return (
    <div className="flex items-center justify-center h-screen bg-black relative"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >

      <LayoutReels
        reels={reels}
        currentReelIndex={currentReelIndex}
        videoRefs={videoRefs}
        setVideoStyles={setVideoStyles}
        muteStates={muteStates}
        hasUserInteracted={hasUserInteracted}
        videoStyles={videoStyles}
        handleVideoClick={handleVideoClick}
        toggleMute={toggleMute}
        togglePlayPause={togglePlayPause}
        playStates={playStates}
        loading={loading}
        handleNextReel={handleNextReel}
        handleLikeReel={handleLikeReel}
        likedStates={likedStates}
        lastTapTime={lastTapTime}
        setLastTapTime={setLastTapTime}
        showLikeAnimation={showLikeAnimation}
        isLiking={isLiking}
        handleDeleteReel={handleDeleteReel}
        setReels={setReels}
        setCurrentReelIndex={setCurrentReelIndex}
        handleCloseComments={handleCloseComments}
        handleCommentClick={handleCommentClick}
        showComments={showComments}
      />
      {/* Loading indicator khi phân trang */}
      {loading && (
        <div className="absolute bottom-0 left-0 right-0 flex justify-center z-50" style={{ zIndex: 9999, background: "red !important" }}>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <ToggleRight
        handlePreviousReel={handlePreviousReel}
        handleNextReel={handleNextReel}
      />
    </div>
  );
};

export default Reel;
