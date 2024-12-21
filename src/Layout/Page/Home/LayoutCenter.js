import { Posts } from './Posts';
import { IoAdd } from "react-icons/io5";
export function LayoutCenter({
  storyPage,
  loading,
  openStoryModal,
  getStoriesForPage,
  fetchStoryDetails,
  posts,
}) {
  const userId = localStorage.getItem('_id');
  const storyContainerStyle = {
    transition: 'transform 0.3s ease-in-out',
    transform: `translateX(0)`,
  };
  return (
    <div className="w-[600px] overflow-y-auto pb-8 main-home">
      <div style={{ paddingTop: " 20px" }}>

        {/* Stories Section */}
        <div className="relative mb-4">
          <div className="relative rounded-lg p-4">
            <div className="flex space-x-4 overflow-hidden">
              {/* Create Story Card */}
              {storyPage === 0 && !loading && (
                <div className="flex w-14 h-14 flex-col items-center space-y-1 cursor-pointer" onClick={openStoryModal}>
                  <div className="rounded-full p-[4px]" style={{ marginLeft: "10px" }}>
                    <div className="bg-[#10101a] rounded-full w-14 h-14 p-[2px]">
                      <IoAdd size={24} className='w-full h-full' />
                    </div>
                  </div>
                  <span className="text-xs text-white mt-1">Add story</span>
                </div>
              )}

              <div
                className="flex space-x-4 transition-transform duration-300 ease-in-out"
                style={storyContainerStyle}
              >
                {loading ? (
                  Array(6).fill(0).map((_, index) => (
                    <div key={index} className="flex flex-col items-center space-y-1">
                      <div className="w-14 h-14 rounded-full bg-gray-700 animate-pulse" />
                      <div className="w-12 h-2 bg-gray-700 animate-pulse rounded" />
                    </div>
                  ))
                ) : (
                  getStoriesForPage(storyPage)?.map((group, index) => (
                    <div
                      key={`${group.userId._id}-${index}`}
                      className="flex flex-col items-center space-y-1 cursor-pointer"
                      onClick={() => {
                        fetchStoryDetails({
                          stories: group.stories,
                          initialStoryIndex: 0
                        });
                      }}
                    >
                      <div className="rounded-full p-[2px] ring-gradient-instagram">
                        <div className="bg-[#10101a] rounded-full p-[2px]">
                          <img
                            src={group.userId.profilePicture}
                            alt="Story"
                            className="w-14 h-14 rounded-full object-cover"
                          />
                        </div>
                      </div>
                      <span className="text-xs text-white mt-1 truncate w-16 text-center">
                        {group.userId.fullname}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần bài viết */}
      <Posts
        loading={loading}
        posts={posts?.map(post => ({
          id: post._id,
          author: post.author.username,
          authorId: post.author._id,
          authorProfilePicture: post.author.profilePicture,
          caption: post.caption,
          content: post.caption,
          images: post.img ? [post.img] : [],
          createdAt: post.createdAt,
          likes: post.likes || [],
          comments: new Array(post.commentCount || 0),
          shares: [],
          userId: userId
        }))}
        userId={userId}
      />
    </div>
  );
}