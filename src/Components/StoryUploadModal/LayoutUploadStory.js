import { useState } from "react";
import SoundPreview from "../SoundPreview/SoundPreview";
import { Loader2, X, Upload, ImagePlus, Camera, Trash2 } from 'lucide-react';

export function LayoutUploadStory({
  isClosing,
  handleCloseAttempt,
  isUploading,
  media,
  isDragging,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  contentType,
  startTime,
  endTime,
  handleSubmit,
  sounds,
  selectedSound,
  setSelectedSound,
  setCurrentSound,
  currentSound,
  searchKeyword,
  onSearch,
  setMedia,
  setSearchKeyword,
  searchResults,
  handleFileChange,
  preview,
  renderVideo,
  setPreview,
  fileInputRef,
  setStartTime,
  setEndTime
}) {
  const [stopAudioFlag, setStopAudioFlag] = useState(false);

  const handleSubmitWrapper = async () => {
    setStopAudioFlag(true);
    await handleSubmit();
    // Reset flag sau khi đã dừng audio
    setStopAudioFlag(false);
  };
  return (
    <div
      className={`bg-gray-900 rounded-xl w-full max-w-6xl shadow-2xl overflow-hidden text-white relative
            transition-all duration-300 ease-in-out transform storyUp
            ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
      style={{ height: '95vh', overflowY: 'auto' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-semibold">Tin của bạn</h2>
        <button
          onClick={handleCloseAttempt}
          disabled={isUploading}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-2/3 p-6 border-r border-gray-700">
          {!media ? (
            <div
              className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-colors
                    ${isDragging ? 'border-blue-500 bg-gray-800/50' : 'border-gray-600'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Camera className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-300 mb-2">
                Kéo thả file hoặc nhấp vào đây
              </p>
              <p className="text-sm text-gray-400 mb-4 text-center">
                Hỗ trợ định dạng JPG, PNG hoặc MP4<br />
                Kích thước tối đa: 300MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="story-file-upload"
              />
              <label
                htmlFor="story-file-upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
              >
                <ImagePlus className="w-5 h-5" />
                Chọn File
              </label>
            </div>
          ) : (
            <div className="relative h-[550px] rounded-xl overflow-hidden bg-black/50 flex flex-col items-center justify-center">
              <div className="max-h-full max-w-full">
                {contentType === 'image' ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-full w-full max-w-full object-cover"
                  />
                ) : (
                  renderVideo()
                )}
              </div>

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => {
                    setMedia(null);
                    setPreview(null);
                  }}
                  className="p-2 bg-gray-900/80 hover:bg-gray-800 rounded-full text-white transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/3 p-6 flex flex-col ">
          <div className="flex-grow flex flex-col">
            {/* Phần tìm kiếm */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm bài hát..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  onSearch(e.target.value);
                }}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>

            {/* Danh sách âm nhạc */}
            <div className="flex-grow overflow-y-auto bg-gray-800 border border-gray-700 rounded-xl max-h-[420px]">
              {searchKeyword ? (
                // Hiển thị kết quả tìm kiếm
                <div className="divide-y divide-gray-700">
                  {searchResults.map((sound) => (
                    <SoundPreview
                      key={sound.id}
                      sound={sound}
                      isSelected={selectedSound?.id === sound.id}
                      onClick={(selectedSound) => {
                        setSelectedSound(selectedSound);
                        setCurrentSound(selectedSound);
                      }}
                      currentSound={currentSound}
                      stopAudio={stopAudioFlag}
                    />
                  ))}
                </div>
              ) : (
                // Hiển thị tất cả âm nhạc
                <div className="divide-y divide-gray-700 overflow-x-hidden">
                  {sounds.map((sound) => (
                    <SoundPreview
                      key={sound._id}
                      sound={{
                        _id: sound._id,
                        url: sound.url,
                        name: sound.name,
                        singerName: sound.singerName,
                        singerAvatar: sound.singerAvatar
                      }}
                      isSelected={selectedSound?._id === sound._id}
                      onClick={setSelectedSound}
                      stopAudio={stopAudioFlag}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nút điều khiển */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={handleCloseAttempt}
              disabled={isUploading}
              className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmitWrapper}
              disabled={!media || isUploading || (contentType === 'video' && (endTime - startTime) > 27)}
              className={`px-6 py-3 rounded-lg flex items-center justify-center gap-2 min-w-[140px]
        ${!media || isUploading || (contentType === 'video' && (endTime - startTime) > 27)
                  ? 'bg-blue-500/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'}
        transition-colors`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang đăng...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Đăng Story</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {isUploading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mb-4 mx-auto text-blue-500" />
            <p className="text-xl font-medium">Đang đăng story của bạn...</p>
            <p className="text-gray-400 mt-2">Vui lòng đợi trong giây lát</p>
          </div>
        </div>
      )}
    </div>
  )
}