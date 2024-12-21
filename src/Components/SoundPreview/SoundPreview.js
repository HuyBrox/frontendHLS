import React, { useRef, useEffect, useState } from 'react';
import { Check, Pause, Play } from 'lucide-react';
import "./soundPreview.scss";

const SoundPreview = ({ sound, isSelected, onClick, currentSound, stopAudio }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (stopAudio) {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  }, [stopAudio]);

  useEffect(() => {
    const audioElement = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

    // Reset nhạc về đầu khi chọn lại
    if (isSelected) {
      audioElement.currentTime = 0;
      setIsPlaying(true);
    }

    // Nếu item này đang được chọn và có URL, thì phát nhạc
    if (isSelected && sound.url) {
      if (isPlaying) {
        audioElement.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      } else {
        audioElement.pause();
      }
    } else if (audioElement) {
      audioElement.pause();
    }

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [isSelected, sound.url, sound.id]);

  // Tính phần trăm tiến trình
  const progressPercentage = duration
    ? (currentTime / duration) * 100
    : 0;

  // Xử lý chức năng play/pause
  const handlePlayPauseToggle = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className={`p-4 hover:bg-gray-700/50 cursor-pointer flex flex-col transition-colors
         ${isSelected ? 'bg-gray-700' : ''}`}
      onClick={() => {
        onClick(sound);
        setIsPlaying(true);
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <img
            className='w-10 h-10 rounded-full'
            src={sound.singerAvatar}
            alt={sound.singerName}
          />
          <div>
            <div className="font-semibold">{sound.name}</div>
            <div className="text-sm text-gray-400">{sound.singerName}</div>
          </div>
        </div>

        {/* Nút Play/Pause */}
        {isSelected && (
          <button
            onClick={handlePlayPauseToggle}
            className="focus:outline-none"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white" />
            )}
          </button>
        )}

        {isSelected && (
          <div className="w-6 h-6 flex items-center justify-center bg-blue-500 rounded-full">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Thanh tiến trình */}
      {isSelected && (
        <div className="mt-2 w-full h-1 bg-gray-600 relative">
          <div
            className="absolute h-full bg-blue-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={sound.url}
        preload="metadata"
      />
    </div>
  );
};

export default SoundPreview;