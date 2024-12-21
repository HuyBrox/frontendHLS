import React, { useEffect, useRef, useState } from 'react';
import { CenterContent } from './CenterContent';
import { RightSidebar } from './RightSidebar';
import "./Home.scss";
import "./RightSiderbar.scss";
import "./centerContent.scss";
import StoryModal from './../../../Components/StoryModal/index';
import StoryUploadModal from './../../../Components/StoryUploadModal/index';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = ({ openStoryOnLoad = false }) => {
  const [expandSuggestions, setExpandSuggestions] = useState(false);
  const [storyPage, setStoryPage] = useState(0);
  const [postText, setPostText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [stories, setStories] = useState([]); // Danh sách tất cả stories
  const [loading, setLoading] = useState(true);
  const [hasMoreStories, setHasMoreStories] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [selectedStoryGroup, setSelectedStoryGroup] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const isFetched = useRef(false);
  const [posts, setPosts] = useState([]);
  const [postPage, setPostPage] = useState(1);
  const [postLoading, setPostLoading] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const followingUsers = useSelector(state => state.follow.followingUsers);
  const [sounds, setSounds] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentStoryData, setCurrentStoryData] = useState(null);

  const navigate = useNavigate();
  const { _id } = useParams();
  // Số lượng stories mỗi lần tải
  const storiesPerPage = 10;

  // Hook để refresh suggested users khi followingUsers thay đổi
  useEffect(() => {
    if (isFetched.current) {
      fetchSuggestedUsers();
    }
  }, [followingUsers]);

  useEffect(() => {
    if (openStoryOnLoad && _id) {
      setShowModal(true)
    }
  }, [openStoryOnLoad, _id]);

  // Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/story/getAllStory?page=${storyPage}&limit=${storiesPerPage}`,
          {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          // Append hoặc gán lại stories
          setStories((prevStories) =>
            storyPage === 0 ? data.stories : [...prevStories, ...data.stories]
          );
          if (data.stories.length < storiesPerPage) {
            setHasMoreStories(false);
          }
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, [storyPage, refreshKey]);

  // Fetch chi tiết các stories để mở StoryModal
  const fetchStoryDetails = async ({ stories, initialStoryIndex = 0 }) => {
    try {
      // Fetch toàn bộ stories của user để có context
      const userStoriesResponse = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/story/getAllStory?userId=${stories[initialStoryIndex].userId._id}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const userStoriesData = await userStoriesResponse.json();

      if (userStoriesData.success) {
        // Tìm index của story hiện tại
        const currentStoryIndex = userStoriesData.stories.findIndex(s => s._id === stories[initialStoryIndex]._id);

        // Set stories và mở modal
        setStories(userStoriesData.stories);
        setSelectedStoryGroup(userStoriesData.stories);
        setCurrentStoryIndex(currentStoryIndex);
        setShowModal(true);

        navigate(`/story/${userStoriesData.stories[currentStoryIndex]._id}`);
      }
    } catch (error) {
      console.error('Error fetching story details:', error);
    }
  };

  useEffect(() => {
    // Nếu có _id trong URL và chưa có stories
    const fetchInitialStoryDetails = async () => {
      if (_id && stories.length === 0) {
        try {
          // Fetch chi tiết story từ API
          const response = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/story/getStory/${_id}`,
            {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          const data = await response.json();

          if (data.success) {
            // Fetch toàn bộ stories của user để có context
            const userStoriesResponse = await fetch(
              `${process.env.REACT_APP_BACKEND_URL}/story/getAllStory?userId=${data.story.userId._id}`,
              {
                method: 'GET',
                credentials: 'include',
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            const userStoriesData = await userStoriesResponse.json();

            if (userStoriesData.success) {
              // Tìm index của story hiện tại
              const currentStoryIndex = userStoriesData.stories.findIndex(s => s._id === _id);

              // Set stories và mở modal
              setStories(userStoriesData.stories);
              setSelectedStoryGroup(userStoriesData.stories);
              setCurrentStoryIndex(currentStoryIndex);
              setShowModal(true);
            }
          }
        } catch (error) {
          console.error("Error fetching initial story details:", error);
          navigate('/'); // Quay lại trang chủ nếu lỗi
        }
      }
    };

    fetchInitialStoryDetails();
  }, [_id, stories.length, navigate]);

  const fetchStory = async (_id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/story/getStory/${_id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Process likes to get specific reaction types
      const desiredReactions = ['sad', 'angry', 'love', 'haha', 'like'];
      const effectIcon = data.story.likes.flatMap(likeObj =>
        likeObj.reactionTypes.filter(reaction => desiredReactions.includes(reaction))
      );

      // Create a new story data object with processed effectIcon
      const processedStoryData = {
        ...data,
        story: {
          ...data.story,
          effectIcon: [...new Set(effectIcon)] // Remove duplicates
        }
      };

      setCurrentStoryData(processedStoryData);
      return processedStoryData;
    } catch (error) {
      console.error('Error fetching story:', error);
      setCurrentStoryData(null);
    }
  };

  // Thêm useEffect để fetch story khi _id thay đổi
  useEffect(() => {
    if (_id) {
      fetchStory(_id);
    }
  }, [_id]);


  // Tạo story mới
  const createNewStory = async (storyData) => {
    try {
      const formData = new FormData();

      // Các trường cơ bản
      formData.append("caption", storyData.caption || "");
      formData.append("privacy", storyData.privacy || "friends");
      formData.append("contentType", storyData.contentType || "image");

      // Xử lý media file
      if (storyData.media) {
        formData.append("media", storyData.media);
      }

      // Xử lý các trường cho video_audio và image_audio
      if (storyData.contentType === 'video_audio' || storyData.contentType === 'image_audio') {
        if (!storyData.sound) {
          throw new Error(`Cần cung cấp âm thanh cho nội dung ${storyData.contentType}`);
        }
        formData.append("sound", storyData.sound);
        formData.append("timeAction", storyData.timeAction || "0:0");
        formData.append("timeEnd", storyData.timeEnd || "0:0");
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/story/newStory`,
        {
          method: 'POST',
          credentials: 'include',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        setStories((prevStories) => [data.story, ...prevStories]);
        setRefreshKey((prevKey) => prevKey + 1);
        setStoryPage(0);
        return data.story;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error creating new story:", error);
      throw error;
    }
  };
  // người gợi ý
  const fetchSuggestedUsers = async () => {
    setIsFetchingSuggestions(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/home/suggested-users`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuggestedUsers(data.users);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  useEffect(() => {
    if (!isFetched.current) {
      fetchSuggestedUsers();
      isFetched.current = true;
    }
  }, []);

  // xóa story
  const deleteStory = async (storyId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/story/deleteStory/${storyId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Cập nhật danh sách stories
        setStories((prevStories) =>
          prevStories.filter((story) => story._id !== storyId)
        );

        setShowModal(false);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  // like story
  const handleLikeStory = async (storyId, reactionType) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/story/likeStory/${storyId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reactionType }),
        }
      );

      const data = await response.json();
      if (data.success) {
        // Cập nhật lại danh sách stories để hiển thị cảm xúc mới
        setStories((prevStories) => {
          return prevStories.map((story) => {
            if (story._id === storyId) {
              return { ...story, likes: data.likes }; // Cập nhật story được like
            }
            return story; // Giữ nguyên các story khác
          });
        });
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  // Đánh dấu story đã xem
  const updateStoryStatus = (storyId) => {
    setStories((prevStories) =>
      prevStories.map((story) =>
        story._id === storyId ? { ...story, isViewed: true } : story
      )
    );
  };

  // Thêm function để lấy danh sách âm thanh
  const fetchSounds = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/sound/getSound`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        // console.log(data);
        setSounds(data.sounds);
      }
    } catch (error) {
      console.error('Error fetching sounds:', error);
    }
  };

  // Thêm function để tìm kiếm âm thanh
  const searchSounds = async (keyword) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/sound/searchSound?keyword=${keyword}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      console.log(data);
      if (data.success) {
        setSearchResults(data.sounds);
      }
    } catch (error) {
      console.error('Error searching sounds:', error);
    }
  };

  useEffect(() => {
    fetchSounds();
  }, []);
  // Fetch bài viết từ API
  const fetchPosts = async () => {
    setPostLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/home/getPostHome?page=${postPage}&limit=20`, // Fetch API với trang hiện tại
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      // console.log(data)
      if (data.success) {
        setPosts((prevPosts) =>
          postPage === 1 ? data.posts : [...prevPosts, ...data.posts]
        );

        if (data.posts.length < 20) {
          setHasMorePosts(false);
        }
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setPostLoading(false);
    }
  };

  // Tải bài viết khi postPage thay đổi
  useEffect(() => {
    fetchPosts();
  }, [postPage]);

  const viewStory = async (storyId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/story/${storyId}/view`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Cập nhật state stories với lượt xem mới
        setStories((prevStories) =>
          prevStories.map((story) =>
            story._id === storyId
              ? { ...story, views: data.views }
              : story
          )
        );
        return data.views;
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error updating story view:', error);
    }
  };

  const loadMorePosts = () => {
    if (hasMorePosts && !postLoading) {
      setPostPage((prevPage) => prevPage + 1);
    }
  };
  return (
    <div
      className="flex justify-center text-white min-h-screen bg-homeGradient"
      style={{ width: '100%' }}
    >
      <div className="flex w-full">
        <CenterContent
          postText={postText}
          setPostText={setPostText}
          storyPage={storyPage}
          setStoryPage={setStoryPage}
          stories={stories}
          storiesPerPage={storiesPerPage}
          fetchStoryDetails={fetchStoryDetails}
          createNewStory={createNewStory}
          openStoryModal={() => setIsStoryModalOpen(true)}
          posts={posts}
          loading={loading || postLoading}
          loadMorePosts={loadMorePosts}
          hasMorePosts={hasMorePosts}
        />
        <RightSidebar
          expandSuggestions={expandSuggestions}
          setExpandSuggestions={setExpandSuggestions}
          isHovered={isHovered}
          setIsHovered={setIsHovered}
          suggestedUsers={suggestedUsers} // Truyền danh sách người dùng gợi ý
          isFetchingSuggestions={isFetchingSuggestions} // Truyền trạng thái đang tải
        />
      </div>
      {isStoryModalOpen && (
        <StoryUploadModal
          isOpen={isStoryModalOpen}
          onClose={() => setIsStoryModalOpen(false)}
          onUploadStory={async (storyData) => {
            try {
              await createNewStory(storyData);
              setIsStoryModalOpen(false);
            } catch (error) {
              console.error('Error uploading story:', error);
            }
          }}
          sounds={sounds}
          searchResults={searchResults}
          onSearch={searchSounds}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
        />
      )}

      {showModal && selectedStoryGroup && (
        <StoryModal
          story={selectedStoryGroup[currentStoryIndex]}
          userId={selectedStoryGroup[currentStoryIndex].userId._id}
          stories={selectedStoryGroup}
          onClose={() => {
            setShowModal(false);
            setSelectedStoryGroup(null);
            setCurrentStoryIndex(0);
            setCurrentStoryData(null);
          }}
          currentStoryIndex={currentStoryIndex}
          setCurrentStoryIndex={setCurrentStoryIndex}
          onUpdateStory={updateStoryStatus}
          onCreateStory={() => {
            setShowModal(false);
            setIsStoryModalOpen(true);
          }}
          onDeleteStory={deleteStory}
          fetchStory={fetchStory}
          currentStoryData={currentStoryData}
          onLikeStory={handleLikeStory}
          effectIcon={currentStoryData?.story?.effectIcon || []}
          onViewStory={viewStory}
        />
      )}
    </div>
  );
};

export default Home;
