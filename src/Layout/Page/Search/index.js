import { useEffect, useRef, useState } from "react";
import "./search.scss";

// Hàm tính thời gian tương đối
function getRelativeTime(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const minute = 60;
  const hour = minute * 60;
  const day = hour * 24;
  const month = day * 30;
  const year = day * 365;

  if (diffInSeconds < minute) {
    return "vừa xong";
  } else if (diffInSeconds < hour) {
    const minutes = Math.floor(diffInSeconds / minute);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < day) {
    const hours = Math.floor(diffInSeconds / hour);
    return `${hours} giờ trước`;
  } else if (diffInSeconds < month) {
    const days = Math.floor(diffInSeconds / day);
    return `${days} ngày trước`;
  } else if (diffInSeconds < year) {
    const months = Math.floor(diffInSeconds / month);
    return `${months} tháng trước`;
  } else {
    const years = Math.floor(diffInSeconds / year);
    return `${years} năm trước`;
  }
}

export default function Search({ setIsSearchActive, isSearchActive }) {
  const searchRef = useRef(null);
  const bodyRef = useRef(document.querySelector('body'));
  const [searchResults, setSearchResults] = useState([]);
  const [query, setQuery] = useState("");

  const [recentSearches, setRecentSearches] = useState(() => {
    // Lấy dữ liệu từ localStorage nếu có
    const storedSearches = localStorage.getItem("recentSearches");
    return storedSearches ? JSON.parse(storedSearches) : [];
  });

  const handleGoToProfile = (id) => {
    // Lấy người dùng từ danh sách tìm kiếm
    const clickedUser = searchResults.find(user => user._id === id);

    if (clickedUser) {
      // Thêm timestamp khi tìm kiếm
      const userWithTimestamp = {
        ...clickedUser,
        searchTimestamp: new Date().toISOString()
      };

      const updatedSearches = [userWithTimestamp, ...recentSearches.filter(user => user._id !== id)];

      // Giới hạn danh sách "Người vừa tìm kiếm" (ví dụ: tối đa 5 người)
      const limitedSearches = updatedSearches.slice(0, 5);

      // Cập nhật state và localStorage
      setRecentSearches(limitedSearches);
      localStorage.setItem("recentSearches", JSON.stringify(limitedSearches));
    }

    setIsSearchActive(false);
    window.location.href = `/profile/${id}`;
  };

  useEffect(() => {
    const body = bodyRef.current;
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchActive(false);
      }
    };

    if (isSearchActive) {
      const scrollPosition = window.pageYOffset;
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.width = '100%';
      body.style.top = `-${scrollPosition}px`;

      document.addEventListener("mousedown", handleClickOutside);
    } else {
      const scrollY = body.style.top;
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      body.style.position = '';
      body.style.top = '';
      body.style.width = '';
      body.style.overflow = '';
    };
  }, [isSearchActive, setIsSearchActive]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/home/smart-search?query=${encodeURIComponent(query)}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (data.success) {
          setSearchResults(data.data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Lỗi khi tìm kiếm:', error);
      }
    };

    const timeoutId = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div
      ref={searchRef}
      className={`search ${isSearchActive ? "active" : ""}`}
    >
      <div className="search-content">
        <h2>Tìm kiếm</h2>

        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="search-input"
            autoFocus={isSearchActive}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            className="clear-button"
            onClick={() => setQuery("")}
          >
            ✕
          </button>
        </div>

        {/* Hiển thị kết quả tìm kiếm khi có query và kết quả */}
        {query && searchResults.length > 0 && (
          <div className="recent-searches">
            <div className="recent-header">
              <span>Kết quả tìm kiếm</span>
            </div>

            <div className="search-items">
              {searchResults.map((user) => (
                <div key={user._id} className="search-item">
                  <div className="item-info" onClick={() => handleGoToProfile(user._id)}>
                    <div className="avatar">
                      <img
                        src={user.profilePicture || "https://via.placeholder.com/40"}
                        alt={user.fullname || user.username}
                      />
                    </div>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      <span className="fullname">{user.fullname || "Người dùng"}</span>
                      <span className="status">
                        {user.isFollowing ? "Đang theo dõi" : "Chưa theo dõi"} |{" "}
                        {user.isFollower ? "Đang được theo dõi" : "Không được theo dõi"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hiển thị người dùng vừa tìm khi không có kết quả tìm kiếm */}
        {(!query || searchResults.length === 0) && recentSearches.length > 0 && (
          <div className="recent-searches">
            <div className="recent-header">
              <span>Người dùng vừa tìm</span>
            </div>
            <div className="search-items">
              {recentSearches.map((user) => (
                <div key={user._id} className="search-item" style={{ padding: "10px 8px" }}>
                  <div className="item-info" onClick={() => handleGoToProfile(user._id)}>
                    <div className="avatar">
                      <img
                        src={user.profilePicture || "https://via.placeholder.com/40"}
                        alt={user.fullname || user.username}
                      />
                    </div>
                    <div className="user-info">
                      <span className="username">{user.username}</span>
                      <span className="fullname">{user.fullname || "Người dùng"}</span>
                    </div>
                  </div>
                  <div className="search-item-right">
                    <span className="search-time">
                      {user.searchTimestamp
                        ? getRelativeTime(user.searchTimestamp)
                        : "Gần đây"}
                    </span>
                    <button
                      className="remove-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedRecentSearches = recentSearches.filter(
                          (recentUser) => recentUser._id !== user._id
                        );
                        setRecentSearches(updatedRecentSearches);
                        localStorage.setItem(
                          "recentSearches",
                          JSON.stringify(updatedRecentSearches)
                        );
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hiển thị không tìm thấy kết quả */}
        {query && searchResults.length === 0 && (
          <div className="no-results text-white">Không tìm thấy kết quả</div>
        )}
      </div>
    </div>
  );
}