import React from 'react';
import { IoAdd } from "react-icons/io5";
import { formatTime } from './../../Layout/Page/Profile/AllPostProfile/PreviewProfilePost/formatTime';

const StoryItem = ({
  group,
  isSelected,
  onSelect,
  onMouseEnter = () => { },
  onMouseLeave = () => { },
  isViewerDetailsModalOpen = false
}) => (
  <div
    className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all
      ${isSelected ? 'default-bg' : 'hover:bg-[#000]'}`}
    onClick={onSelect}
    onMouseEnter={() => {
      // Chỉ thực hiện onMouseEnter khi ViewerDetailsModal không mở
      if (!isViewerDetailsModalOpen) {
        onMouseEnter();
      }
    }}
    onMouseLeave={() => {
      // Chỉ thực hiện onMouseLeave khi ViewerDetailsModal không mở
      if (!isViewerDetailsModalOpen) {
        onMouseLeave();
      }
    }}
  >
    <div className="relative">
      <img
        src={group.user.profilePicture}
        alt=""
        className={`w-14 h-14 rounded-full object-cover image-story-list`}
      />
      {group.stories.length > 1 && (
        <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {group.stories.length}
        </div>
      )}
    </div>
    <div>
      <p className="font-medium line-clamp-1">{group.user.fullname}</p>
      <p className="text-sm text-gray-400">
        {formatTime(new Date(group.stories[0].createdAt).getTime())}
      </p>
    </div>
  </div>
);

const StoryUserList = ({
  groupedStoryArray = [],
  story,
  onCreateStory,
  handleUserSelect,
  isViewerDetailsModalOpen,
  onStoryListMouseEnter,
  onStoryListMouseLeave
}) => {
  const id = localStorage.getItem('_id');
  const currentUserId = story?.userId?._id;

  const ownStories = groupedStoryArray.filter(group => group.user?._id === id) || [];
  const otherStories = groupedStoryArray.filter(group => group.user?._id !== id) || [];

  return (
    <div
      className="w-[360px] min-w-[360px] background-left-storyModal h-full flex flex-col border-story-list"
      style={{ zIndex: 999 }}
      onMouseEnter={() => {
        // Chỉ kích hoạt onStoryListMouseEnter nếu ViewerDetailsModal không mở
        if (!isViewerDetailsModalOpen) {
          onStoryListMouseEnter();
        }
      }}
      onMouseLeave={() => {
        // Chỉ kích hoạt onStoryListMouseLeave nếu ViewerDetailsModal không mở
        if (!isViewerDetailsModalOpen) {
          onStoryListMouseLeave();
        }
      }}
    >
      <div className="p-4 border-b border-[#3a3344]">
        <h2 className="text-xl font-semibold mb-4">Tin</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <h3 className="px-2 py-3 text-sm font-medium">Tin của bạn</h3>
          {ownStories.length > 0 ? (
            ownStories.map((group) => (
              <StoryItem
                key={group.user._id}
                group={group}
                isSelected={group.user._id === currentUserId}
                onSelect={() => handleUserSelect(
                  groupedStoryArray.findIndex(g => g.user._id === group.user._id)
                )}
              />
            ))
          ) : (
            <div
              className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-[#000] transition-all"
              onClick={onCreateStory}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-[#3a3b3c] flex items-center justify-center">
                  <IoAdd size={24} />
                </div>
              </div>
              <div>
                <p className="font-medium">Tạo tin</p>
                <p className="text-sm text-gray-400">Chia sẻ tin của bạn</p>
              </div>
            </div>
          )}
        </div>


        <div className="p-2">
          <h3 className="px-2 py-1 text-sm font-medium">Tất cả tin</h3>
          {otherStories.map((group) => (
            <StoryItem
              key={group.user._id}
              group={group}
              isSelected={group.user._id === currentUserId}
              onSelect={() => handleUserSelect(
                groupedStoryArray.findIndex(g => g.user._id === group.user._id)
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export { StoryUserList, StoryItem };