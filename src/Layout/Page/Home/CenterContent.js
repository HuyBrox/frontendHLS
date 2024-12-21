import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfileData } from './../../../store/features/profile/profileSlice';
import { useNavigate } from 'react-router-dom';
import { LayoutCenter } from './LayoutCenter';

export const CenterContent = ({
  postText,
  setPostText,
  stories,
  fetchStoryDetails,
  posts,
  loading,
  openStoryModal
}) => {
  const { profileData } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = profileData?._id;
  const fullname = profileData?.fullname;
  const [fullNameCaption, setFullnameCaption] = useState(fullname);
  const [storyPage, setStoryPage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const storiesPerPage = 4;

  // Nhóm stories theo userId
  const groupedStoryArray = useMemo(() => {
    if (!stories || !Array.isArray(stories)) return [];

    const grouped = stories.reduce((acc, story) => {
      if (!story || !story.userId || !story.userId._id) return acc;
      const userId = story.userId._id;

      if (!acc[userId]) {
        acc[userId] = {
          userId: story.userId,
          stories: [],
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    const groupedArray = Object.values(grouped);
    const currentUserId = localStorage.getItem('_id');
    if (currentUserId) {
      return groupedArray.sort((a, b) => {
        if (a.userId._id === currentUserId) return -1;
        if (b.userId._id === currentUserId) return 1;
        return 0;
      });
    }
    return groupedArray;
  }, [stories]);


  // Tổng số trang
  const totalPages = Math.ceil(groupedStoryArray.length / storiesPerPage);

  // Animation
  const animateStoryTransition = (direction) => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Duration should match CSS transition
  };

  // Logic lấy danh sách stories theo trang
  const getStoriesForPage = (page) => {
    const startIndex = page * storiesPerPage;
    const endIndex = startIndex + storiesPerPage;
    const currentPageStories = groupedStoryArray.slice(startIndex, endIndex);

    // Nếu không phải trang cuối cùng, thêm phần tử cuối từ trang trước
    if (page > 0) {
      const previousPageLastStory = groupedStoryArray[startIndex - 1];
      return [previousPageLastStory, ...currentPageStories];
    }

    return currentPageStories;
  };

  const nextStoryPage = () => {
    if (storyPage < totalPages - 1 && !isAnimating) {
      animateStoryTransition('next');
      setStoryPage((prev) => prev + 1);
    }
  };

  const prevStoryPage = () => {
    if (storyPage > 0 && !isAnimating) {
      animateStoryTransition('prev');
      setStoryPage((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const myUserId = localStorage.getItem('_id');
      if (myUserId) {
        try {
          await dispatch(fetchProfileData({ myUserId }));
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      }
    };
    fetchData();
  }, [dispatch]);

  useEffect(() => {
    if (fullname) {
      const lastName = fullname ? fullname.split(' ').slice(-1)[0] : '';
      setFullnameCaption(`${lastName} ơi, bạn đang nghĩ gì thế?`);
    }
  }, [fullname]);

  const handleGoToProfile = () => {
    navigate(`/profile/${userId}`);
  };


  return (
    <div className="flex-1 w-full flex justify-center main-center">
      <LayoutCenter
        handleGoToProfile={handleGoToProfile}
        profileData={profileData}
        postText={postText}
        setPostText={setPostText}
        fullNameCaption={fullNameCaption}
        storyPage={storyPage}
        prevStoryPage={prevStoryPage}
        nextStoryPage={nextStoryPage}
        totalPages={totalPages}
        loading={loading}
        openStoryModal={openStoryModal}
        getStoriesForPage={getStoriesForPage}
        fetchStoryDetails={fetchStoryDetails}
        posts={posts}
      />
    </div>
  );
};
