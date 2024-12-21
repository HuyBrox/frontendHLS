import { useEffect, useRef } from "react";
import "./Notification.scss";

export default function Notification({ setIsNotificationActive, isNotificationActive }) {
  const searchRef = useRef(null);
  const bodyRef = useRef(document.querySelector('body'));

  useEffect(() => {
    const body = bodyRef.current;
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsNotificationActive(false);
      }
    };

    if (isNotificationActive) {
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
  }, [isNotificationActive, setIsNotificationActive]);

  return (
    <div
      ref={searchRef}
      className={`Notification ${isNotificationActive ? "active" : ""}`}
    >
      <div className="Notification-content">
        <h2 className="text-xl font-semibold p-4">Thông báo</h2>
        <div className="notification-sections">
          <div className="section">
            <h3 className="text-sm font-medium px-4 py-3 text-gray-500">Tháng này</h3>
            <div className="notification-item flex items-center px-4 py-3">
              <div className="user-avatar w-12 h-12 rounded-full overflow-hidden mr-3">
                <img src="https://via.placeholder.com/40" alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="notification-content flex-1">
                <span className="font-medium">_huybrox</span> đã bắt đầu theo dõi bạn.
                <div className="text-sm text-gray-500">2 tuần</div>
              </div>
              <button className="bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm">
                Theo dõi
              </button>
            </div>
            <div className="notification-item flex items-center px-4 py-3">
              <div className="user-avatar w-12 h-12 rounded-full overflow-hidden mr-3">
                <img src="https://via.placeholder.com/40" alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="notification-content flex-1">
                <span className="font-medium">phuoclog23_7</span> đã yêu cầu theo dõi bạn.
                <div className="text-sm text-gray-500">3 tuần</div>
              </div>
              <div className="flex gap-2">
                <button className="bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm">
                  Xác nhận
                </button>
                <button className="bg-gray-200 text-black px-4 py-1.5 rounded-md text-sm">
                  Xóa
                </button>
              </div>
            </div>
          </div>

          <div className="section">
            <h3 className="text-sm font-medium px-4 py-3 text-gray-500">Trước đó</h3>
            {['_huyy2206', 'x_tera_yaar_02', 'bantimalviya86', 'bantimalviya86', 'bantimalviya86'].map((username, index) => (
              <div key={index} className="notification-item flex items-center px-4 py-3">
                <div className="user-avatar w-12 h-12 rounded-full overflow-hidden mr-3">
                  <img src="https://via.placeholder.com/40" alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="notification-content flex-1">
                  <span className="font-medium">{username}</span> đã bắt đầu theo dõi bạn.
                  <div className="text-sm text-gray-500">5 tuần</div>
                </div>
                <button className="bg-blue-500 text-white px-4 py-1.5 rounded-md text-sm">
                  Theo dõi
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}