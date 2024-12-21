import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { LayoutUploadStory } from './LayoutUploadStory';
import { NocationOff } from './NocationOff';

const StoryUploadModal = (
  { isOpen,
    onClose,
    onUploadStory,
    searchKeyword,
    setSearchKeyword,
    onSearch,
    searchResults,
    sounds }
) => {
  const [media, setMedia] = useState(null);
  const [contentType, setContentType] = useState('image');
  const [caption, setCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("00:30");
  const [currentTime, setCurrentTime] = useState(0);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [selectedSound, setSelectedSound] = useState(null);
  const [currentSound, setCurrentSound] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
    } else if (isRendered) {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (videoRef.current && contentType === 'video') {
      videoRef.current.play();
    }
  }, [media, contentType]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileSelect = (file) => {
    if (file) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setMedia(file);
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setContentType(type);
        setPreview(URL.createObjectURL(file));

        if (type === 'video') {
          setStartTime(0);
          setEndTime(27);
          setCurrentTime(0);
        }
      } else {
        alert('Vui lòng chọn file hình ảnh hoặc video');
      }
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setEndTime(Math.min(27, videoRef.current.duration));
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      if (time >= endTime) {
        videoRef.current.currentTime = startTime;
      }
    }
  };

  const renderVideo = () => (
    <div className="relative w-full h-full max-h-[600px] max-w-full flex items-center justify-center">
      <video
        ref={videoRef}
        src={preview}
        className="max-w-full max-h-full h-full object-contain"
        onLoadedMetadata={handleVideoLoad}
        onTimeUpdate={handleTimeUpdate}
        onClick={() => {
          if (videoRef.current) {
            if (videoRef.current.paused) {
              videoRef.current.play();
            } else {
              videoRef.current.pause();
            }
          }
        }}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        controls={false}
      />
      {/* Mute/Unmute button */}
      <button
        onClick={toggleMute}
        className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white" />
        ) : (
          <Volume2 className="w-5 h-5 text-white" />
        )}
      </button>
    </div>
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleSubmit = async () => {
    if (media) {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }

      setIsUploading(true);
      try {
        const isAudioContent = selectedSound && selectedSound._id;

        const formData = {
          media,
          contentType: isAudioContent ? `${contentType}_audio` : contentType,
          sound: selectedSound?._id,
          timeAction: isAudioContent ? startTime : undefined,
          timeEnd: isAudioContent ? endTime : undefined
        };

        if (contentType === 'video') {
          formData.videoTiming = {
            startTime,
            endTime,
            duration: endTime - startTime
          };
        }
        // console.log('Form data being sent:', formData);
        await onUploadStory(formData);
      } catch (error) {
        console.error('Upload failed:', error);
        setIsUploading(false);
      }
    }
  };

  const handleCloseAttempt = () => {
    if (media || caption.trim()) {
      setShowConfirmDialog(true);
    } else {
      setIsClosing(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleConfirmedClose = () => {
    setShowConfirmDialog(false);
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isRendered) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out
          ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        style={{ zIndex: 999, overflowY: 'auto' }}
      >
        <LayoutUploadStory
          isClosing={isClosing}
          handleCloseAttempt={handleCloseAttempt}
          isUploading={isUploading}
          media={media}
          isDragging={isDragging}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          contentType={contentType}
          handleFileChange={handleFileChange}
          preview={preview}
          renderVideo={renderVideo}
          setPreview={setPreview}
          caption={caption}
          setCaption={setCaption}
          selectedSound={selectedSound}
          setSelectedSound={setSelectedSound}
          handleSubmit={handleSubmit}
          sounds={sounds}
          searchKeyword={searchKeyword}
          onSearch={onSearch}
          searchResults={searchResults}
          setSearchKeyword={setSearchKeyword}
          handleDragLeave={handleDragLeave}
          videoDuration={videoDuration}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          setEndTime={setEndTime}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          fileInputRef={fileInputRef}
          currentSound={currentSound}
          setCurrentSound={setCurrentSound}
          setMedia={setMedia}
        />
      </div>

      <NocationOff
        showConfirmDialog={showConfirmDialog}
        setShowConfirmDialog={setShowConfirmDialog}
        handleConfirmedClose={handleConfirmedClose}
      />
    </>
  );
};

export default StoryUploadModal;