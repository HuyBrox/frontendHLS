import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchCurrentUserStories,
  updateStoryStatus,
} from '../../../../store/features/story/storySlice';
import ProfileNote from './../Note/ProfileNote/index';
import Settings from '../../../../assets/images/setting.png';
import { useNavigate } from 'react-router-dom';
import StoryViewer from './../StoryViewer/index';
import Loading from '../../../../Components/Loading/index';
import { detectAndWrapLinks } from './../../../../Components/Messenger/chatWindow';
import { formatNumberString } from '../../../../Components/formatNumber/index';
const UserProfile = ({
  profileData,
  isOwnProfile,
  isFollowing,
  userIdFollowing,
  followStats,
  handleProfilePictureClick,
  handleFollowUnfollow,
  handleFollowerModalOpen,
  handleFollowingModalOpen,
  handleNoteClick,
  featuredNote,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userStories, loading } = useSelector((state) => state.story);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [allStoriesViewed, setAllStoriesViewed] = useState(false);
  const formattedFollowers = formatNumberString(followStats.followers.length);
  const formattedFollowing = formatNumberString(followStats.following.length);
  const formattedPost = formatNumberString(profileData?.posts?.length || 0);


  // Cập nhật trạng thái allStoriesViewed
  useEffect(() => {
    if (userStories?.length > 0) {
      const areAllStoriesViewed = userStories.every((story) => story.isViewed);
      setAllStoriesViewed(areAllStoriesViewed);
    }
  }, [userStories]);

  // Lấy trạng thái stories từ sessionStorage
  useEffect(() => {
    const viewedStatus = sessionStorage.getItem(
      `storiesViewed_${profileData._id}`
    );
    setAllStoriesViewed(viewedStatus === 'true');
  }, [profileData._id]);

  // Lưu trạng thái allStoriesViewed vào sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      `storiesViewed_${profileData._id}`,
      JSON.stringify(allStoriesViewed)
    );
  }, [allStoriesViewed, profileData._id]);

  const handleAvatarClick = async () => {
    if (!profileData.stories?.length) {
      handleProfilePictureClick();
      return;
    }

    if (!allStoriesViewed) {
      await dispatch(fetchCurrentUserStories(profileData._id)); // Use profileData._id here
      setShowStoryViewer(true);
    } else {
      handleProfilePictureClick();
    }
  };

  const handleArchiveClick = () => {
    navigate('/archive/stories/');
  }
  const handleStoryComplete = () => {
    setAllStoriesViewed(true);
    userStories.forEach((story) => {
      dispatch(updateStoryStatus(story._id));
    });
    setShowStoryViewer(false);
  };

  const handleGoToSettings = () => {
    navigate('/account/setting');
  };

  const getAvatarClassName = () => {
    const baseClass = 'profile__uploadImageUser';

    if (!profileData.stories?.length) return baseClass;

    if (!allStoriesViewed) return `${baseClass} has-stories`;

    return `${baseClass} all-viewed`;
  };

  if (!profileData || loading) {
    // Chỉ hiển thị Loading khi đang tải dữ liệu hoặc chưa có profileData
    return <Loading />;
  }

  return (
    <div className="profile__header">
      <div className="profile__pictureUser">
        <div className={getAvatarClassName()} onClick={handleAvatarClick}>
          <img src={profileData.profilePicture} alt="Profile" />
        </div>
        <ProfileNote
          isOwnProfile={isOwnProfile}
          featuredNote={featuredNote}
          onEditClick={handleNoteClick}
          profileData={profileData}
        />
        <h2 className="profile__fullnameResponsive">
          {profileData.fullname}
        </h2>
      </div>
      <div className="profile__info">
        <div className="profile__infoTop">
          <h2 className="profile__idUser">{profileData.username}</h2>
          <div className="profile__actions">
            {!isOwnProfile && (
              <button
                className={`follow-button ${isFollowing ? 'following' : ''}`}
                onClick={handleFollowUnfollow}
              >
                {isFollowing
                  ? 'Đang theo dõi'
                  : userIdFollowing?.includes(localStorage.getItem('_id'))
                    ? 'Theo dõi lại'
                    : 'Theo dõi'}
              </button>
            )}
            {isOwnProfile && (
              <>
                <button onClick={handleGoToSettings}>
                  Chỉnh sửa trang cá nhân
                </button>
                <button onClick={handleArchiveClick}>Xem kho lưu trữ</button>
              </>
            )}
          </div>
          {isOwnProfile && (
            <div className="profile__setting">
              <img src={Settings} alt="Settings" />
            </div>
          )}
        </div>
        <div className="profile__bottom">
          <span>{formattedPost} bài viết</span>
          <span
            className="clickable"
            onClick={() => handleFollowerModalOpen('followers')}
          >
            {formattedFollowers} người theo dõi
          </span>
          <span
            className="clickable"
            onClick={() => handleFollowingModalOpen('following')}
          >
            Đang theo dõi {formattedFollowing} người dùng
          </span>
        </div>
        <div className="profile__nameUser">{profileData.fullname}</div>
        <div className="profile__bio">
          {detectAndWrapLinks(profileData.bio || '')}
        </div>
      </div>

      {showStoryViewer && userStories?.length > 0 && (
        <StoryViewer
          stories={userStories}
          onClose={() => setShowStoryViewer(false)}
          onComplete={handleStoryComplete}
        />
      )}
    </div>
  );
};

export default UserProfile;
