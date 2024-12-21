import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, X, Loader2, Check } from 'lucide-react';
import { fetchMyStories } from '../../store/features/story/storySlice';
import "./PreviewFeaturedNews.scss";

export default function PreviewCollectionModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { myStories, loading, error } = useSelector((state) => state.story);
  const [selectedStories, setSelectedStories] = useState({});

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchMyStories());
    }
  }, [dispatch, isOpen]);

  if (!isOpen) return null;

  const toggleSelection = (storyId) => {
    setSelectedStories(prev => ({
      ...prev,
      [storyId]: !prev[storyId]
    }));
  };

  const formatDate = (createdAt) => {
    const date = new Date(createdAt);
    return {
      day: date.getDate(),
      month: `Tháng ${date.getMonth() + 1}`,
      year: date.getFullYear()
    };
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  const getMediaSource = (story) => {
    if (story.contentType === 'video') {
      return story.thumbnail || story.mediaUrl || story.content;
    }
    return story.mediaUrl || story.content;
  };

  const renderMedia = (story) => {
    const mediaSource = getMediaSource(story);
    const storyId = story.id || story._id;

    if (story.contentType === 'video') {
      return (
        <div className="relative w-full h-full">
          <video className="w-full h-full object-cover">
            <source src={mediaSource} type="video/mp4" />
          </video>
        </div>
      );
    }

    return (
      <img
        src={mediaSource}
        alt={`Story ${storyId}`}
        className="w-full h-full object-cover"
      />
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-[#262626] w-full h-[95vh] max-h-screen md:max-w-2xl flex flex-col rounded-xl" onClick={handleModalClick}>
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-[#363636]">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="hover:bg-[#363636] rounded-full p-2 transition-colors" type="button">
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <h2 className="text-xl font-medium text-white">Tin</h2>
          </div>
          <button onClick={onClose} className="hover:bg-[#363636] rounded-full p-2 transition-colors" type="button">
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 Content overflow-y-auto h-[calc(100vh-8rem)] bg-[#1a1a1a]">
          {error && (
            <p className="text-red-500 mb-4">Lỗi: {error}</p>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-[#0095f6]" />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1 p-2">
              {myStories.map((story) => {
                const date = formatDate(story.createdAt);
                const storyId = story.id || story._id;

                return (
                  <div
                    key={storyId}
                    className="relative aspect-square cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => toggleSelection(storyId)}
                  >
                    {renderMedia(story)}
                    {story.contentType === 'video' && (
                      <div className="absolute inset-0 bg-black/20">
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          Video
                        </div>
                      </div>
                    )}
                    {/* Date Badge */}
                    <div className="absolute top-2 left-2 bg-white text-black text-xs font-medium rounded-lg overflow-hidden">
                      <div className="px-3 py-1 text-center">
                        <div className="font-bold text-sm">{date.day}</div>
                        <div className="text-xs">{date.month}</div>
                        <div className="text-xs">{date.year}</div>
                      </div>
                    </div>
                    {/* Selection Circle with Checkmark */}
                    <div className="absolute bottom-2 right-2">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                          ${selectedStories[storyId]
                            ? 'bg-[#0095f6] border-[#0095f6]'
                            : 'bg-black/30 border-white'}`}
                      >
                        {selectedStories[storyId] && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-none p-4 border-t border-[#363636] bg-[#262626]">
          <button
            type="button"
            className="w-full bg-[#0095f6] text-white py-3 rounded-lg text-sm font-medium hover:bg-[#1877f2] disabled:opacity-50 transition-colors"
            disabled={loading || Object.keys(selectedStories).length === 0}
          >
            Tiếp
          </button>
        </div>
      </div>
    </div>
  );
}