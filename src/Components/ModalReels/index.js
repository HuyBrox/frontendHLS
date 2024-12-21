import React, { useEffect, useRef, useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { IoArrowBack } from "react-icons/io5";
import { MdOutlineSlowMotionVideo } from "react-icons/md";

const ModalReels = ({ isOpen, onClose, onUploadSuccess, profilePicture, username, fullname }) => {
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fullNameCaption, setFullnameCaption] = useState(fullname);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [caption]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (fullname) {
      const lastName = fullname ? fullname.split(' ').slice(-1)[0] : '';
      setFullnameCaption(`${lastName} ơi, bạn đang nghĩ gì thế?`);
    }
  }, [fullname]);

  const resetModal = () => {
    setCurrentStep('upload');
    setFileList([]);
    setPreviewImage(null);
    setCaption('');
  };

  const handleModalCancel = () => {
    if (currentStep === 'upload' || !previewImage) {
      onClose();
      resetModal();
    } else {
      setShowCancelModal(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileList([file]); // Lưu file trực tiếp
      setPreviewImage(URL.createObjectURL(file)); // Hiển thị xem trước video
      setCurrentStep('details'); // Chuyển sang bước chi tiết
    }
  };

  const handleUpload = async () => {
    if (fileList.length > 0) {
      try {
        setIsLoading(true);

        const formData = new FormData();
        formData.append('video', fileList[0]); // Gửi tệp video
        if (caption?.trim()) {
          formData.append('caption', caption); // Gửi nội dung caption
        }

        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/reels/newReel`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (response.ok) {
          const newReel = await response.json();
          onUploadSuccess(newReel);
          setTimeout(() => {
            onClose();
            resetModal();
            window.location.reload();
          }, 2000);
        } else {
          const errorData = await response.json();
          alert(errorData.message || 'Tạo bài viết thất bại');
        }
      } catch (error) {
        alert('Lỗi khi upload: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Vui lòng chọn video để tải lên!');
    }
  };

  const handleCancelAction = () => {
    setShowCancelModal(false);
  };

  const handleConfirmCancel = () => {
    onClose();
    resetModal();
  };

  if (!isOpen) return null;

  const renderUploadStep = () => (
    <div className="upload-container">
      <div className="upload-header">
        <div className="title-upload">Tạo Reels mới</div>
        <div className="Close-upload" onClick={handleModalCancel}><CloseOutlined /></div>
      </div>
      <div className="upload-content">
        <MdOutlineSlowMotionVideo className="upload-icon" />
        <div className="upload-text">Kéo video vào đây</div>
        <label className="select-button">
          Chọn từ máy tính
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="details-container">
      <div className="details-header">
        <button className="back-button" onClick={() => setCurrentStep('upload')}>
          <IoArrowBack />
        </button>
        <span className="title-z">Tạo Reels</span>
        <button onClick={handleModalCancel} className="close"><CloseOutlined /></button>
      </div>
      <div className="details-content">
        <div className="scrollable-container">
          <div className="details-top">
            <div className="user-info">
              <img src={profilePicture} alt="avatar" className="user-avatar" />
              <div className="Name-user">
                <span className="fullname text-white">{fullname}</span>
                <span className="username text-gray-400">@{username}</span>
              </div>
            </div>
            <div className="textCaption">
              <textarea
                ref={textareaRef}
                className="caption-input"
                placeholder={fullNameCaption}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{
                  overflow: 'hidden', // Hide scrollbar
                  minHeight: '50px', // Minimum height
                }}
              />
            </div>
          </div>
          <div className="details-bottom">
            <div className="content-bottom">
              <div className="preview-image">
                <video
                  src={previewImage}
                  controls
                  className="video-fullscreen"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="test">
          <button
            className="share-button"
            onClick={handleUpload}
            disabled={isLoading}
          >
            {isLoading ? 'Đang tải...' : 'Đăng bài'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCancelModal = () => (
    showCancelModal && (
      <div
        className="cancel-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCancelAction();
          }
        }}
      >
        <div className="cancel-modal-content">
          <h3>Bỏ bài viết?</h3>
          <p>Nếu bạn rời đi, thay đổi của bạn sẽ không được lưu.</p>
          <div className="modal-actions">
            <button
              className="cancel-button"
              onClick={handleCancelAction}
            >
              Hủy
            </button>
            <button
              className="discard-button"
              onClick={handleConfirmCancel}
            >
              Bỏ
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="modal-overlay" onClick={handleModalCancel}>
      <div className="create-post-modal" onClick={e => e.stopPropagation()}>
        {currentStep === 'upload' && renderUploadStep()}
        {currentStep === 'details' && renderDetailsStep()}
        {renderCancelModal()}
      </div>
    </div>
  );
};

export default ModalReels;
