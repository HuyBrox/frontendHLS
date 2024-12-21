import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Music2, Video, Image as ImageIcon } from 'lucide-react';
import { ArchiveViewer } from './archiveViewer';
import "./archive.scss"
export default function Archive() {
  const navigate = useNavigate();
  const { storyId } = useParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(null);

  useEffect(() => {
    if (selectedStoryIndex !== null) {
      document.body.style.overflow = 'hidden';
      const currentStory = stories[selectedStoryIndex];
      navigate(`/archive/stories/${currentStory._id}`, { replace: true });
    } else {
      document.body.style.overflow = 'auto';
      navigate('/archive/stories', { replace: true });
    }

    // Cleanup
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedStoryIndex, navigate, stories]);

  const handleViewerClose = () => {
    setSelectedStoryIndex(null);
  };

  const handleStoryChange = (newIndex) => {
    setSelectedStoryIndex(newIndex);
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/story/my-stories`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message);
        }

        setStories(data.stories);

        // If there's a storyId in the URL, find and select that story
        if (storyId) {
          const storyIndex = data.stories.findIndex(story => story._id === storyId);
          if (storyIndex !== -1) {
            setSelectedStoryIndex(storyIndex);
          }
        }
      } catch (err) {
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [storyId]);

  const getStoriesFromSameDay = (stories, selectedStory) => {
    const selectedDate = new Date(selectedStory.createdAt);

    return stories.filter(story => {
      const storyDate = new Date(story.createdAt);
      return (
        storyDate.getDate() === selectedDate.getDate() &&
        storyDate.getMonth() === selectedDate.getMonth() &&
        storyDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  const getInitialIndex = (allStories, selectedStory) => {
    const sameStories = getStoriesFromSameDay(allStories, selectedStory);
    return sameStories.findIndex(story => story._id === selectedStory._id);
  };

  // Hàm xử lý hiển thị media dựa vào contentType
  const renderMedia = (story) => {
    const { content, contentType, sound } = story;

    switch (contentType) {
      case 'video_audio':
        return (
          <div className="relative w-full h-full  cursor-pointer">
            <video
              className="w-full h-full object-cover"
              muted
            >
              <source src={content} type="video/mp4" />
            </video>
            <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full">
              <Video size={16} className="text-white" />
            </div>
          </div>
        );

      case 'image_audio':
        return (
          <div className="relative w-full h-full  cursor-pointer">
            <video
              className="w-full h-full object-cover"
              poster={content}
              muted
            >
              {sound && <source src={sound.url} type="audio/mp3" />}
            </video>
            <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full">
              <Video size={16} className="text-white" />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="relative w-full h-full  cursor-pointer">
            <img
              src={content}
              alt="Story content"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full">
              <ImageIcon size={16} className="text-white" />
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <ImageIcon size={24} className="text-gray-400" />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center archive-container">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white archive-container">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-medium">Kho lưu trữ</h1>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-4 text-gray-400 text-sm">
          Tin đã lưu trữ chỉ hiện thị với mình bạn, trừ khi bạn chọn chia sẻ.
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        {/* Grid of stories */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {stories.map((story, index) => (
            <div
              key={story._id}
              onClick={() => setSelectedStoryIndex(index)}
              className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-800 group"
            >
              {/* Media content */}
              {renderMedia(story)}

              {/* Date overlay */}
              <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 text-xs">
                <div className="font-bold">
                  {new Date(story.createdAt).getDate()}
                </div>
                <div>
                  Tháng {new Date(story.createdAt).getMonth() + 1}
                </div>
                <div>
                  {new Date(story.createdAt).getFullYear()}
                </div>
              </div>

              {/* User info and sound overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                  {story.userId.profilePicture && (
                    <img
                      src={story.userId.profilePicture}
                      alt={story.userId.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium">
                    {story.userId.fullname || story.userId.username}
                  </span>
                </div>
                {/* Sound info */}
                {story.sound && (
                  <div className="flex items-center gap-1 text-xs text-gray-300 mt-1">
                    <Music2 size={12} />
                    {story.sound.name}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {selectedStoryIndex !== null && (
          <div className="fixed inset-0 z-[100] w-full max-w-[inherit]" style={{ height: '100vh' }}>
            <ArchiveViewer
              stories={getStoriesFromSameDay(stories, stories[selectedStoryIndex])}
              initialIndex={getInitialIndex(stories, stories[selectedStoryIndex])}
              onClose={handleViewerClose}
              onStoryChange={handleStoryChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}