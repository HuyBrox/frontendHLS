import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { IoClose, IoSearch } from "react-icons/io5";
import "../../../../assets/style/ModalFollow.scss";
import { useNavigate } from "react-router-dom";
import { toggleFollowUser } from './../../../../store/features/FollowUnfollow/followSlice';

const FollowingModal = ({
  isOpen,
  onClose,
  currentUserId,
  targetUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [followStates, setFollowStates] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Select following users from Redux state
  const followingUsers = useSelector(state => state.follow.followingUsers);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/following/${targetUserId || currentUserId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Could not fetch following users.');
        }

        const data = await response.json();
        if (data.success) {
          const currentUserFollowingResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/following/${currentUserId}`, {
            method: 'GET',
            credentials: 'include',
          });

          const currentUserFollowingData = await currentUserFollowingResponse.json();
          const currentUserFollowingIds = currentUserFollowingData.success
            ? currentUserFollowingData.following.map(user => user._id)
            : [];

          const enhancedUsers = data.following.map(user => ({
            ...user,
            isFollowing: currentUserFollowingIds.includes(user._id)
          }));

          setUsers(enhancedUsers);

          const initialStates = {};
          enhancedUsers.forEach(user => {
            initialStates[user._id] = user.isFollowing;
          });
          setFollowStates(initialStates);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, currentUserId, targetUserId, refreshKey]);

  useEffect(() => {
    setFilteredUsers(
      users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, users]);

  const handleFollowToggle = async (userId) => {
    try {
      // Optimistically update local state
      setFollowStates(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));

      // Dispatch Redux action
      await dispatch(toggleFollowUser(userId)).unwrap();

      // Update users list
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId
            ? { ...user, isFollowing: !user.isFollowing }
            : user
        )
      );

      // Trigger a refresh of the users list
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      // Revert local state on error
      setFollowStates(prev => ({
        ...prev,
        [userId]: !prev[userId]
      }));
      console.error('Error toggling follow status:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="follow-modal">
      <div className="follow-modal__content">
        <div className="follow-modal__header">
          <h2>Đang theo dõi</h2>
          <button className="follow-modal__close" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="follow-modal__search">
          <IoSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="follow-modal__list">
          {filteredUsers.map(user => (
            <div
              key={user._id}
              className="follow-modal__user"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                // Ngăn việc điều hướng nếu click vào nút follow/unfollow
                if (e.target.closest('.follow-modal__follow-button') ||
                  e.target.closest('.checkButton')) {
                  return;
                }
                window.location.href = (`/profile/${user._id}`);
                onClose();
              }}
            >
              <div className="follow-modal__user-info">
                <img src={user.profilePicture} alt={user.username} />
                <div className="follow-modal__user-details">
                  <span className="username">{user.username}</span>
                  <span className="fullname">{user.fullname}</span>
                </div>
              </div>
              {currentUserId !== user._id && (
                <button
                  className={followStates[user._id] ? 'following' : 'follow'}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFollowToggle(user._id);
                  }}
                >
                  {followStates[user._id] ? 'Đang theo dõi' : 'Theo dõi'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowingModal;