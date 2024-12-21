import React, { useState, useEffect, useRef } from 'react';
import { AiFillLike } from "react-icons/ai";
import { FaComment, FaShare } from "react-icons/fa";
import haha from "../../../assets/images/svg-haha.svg";
import sad from "../../../assets/images/svg-sad.svg";
import angry from "../../../assets/images/svg-angry.svg";
import like from "../../../assets/images/like-icon-a.webp";
import love from "../../../assets/images/svg-heart.svg";

const SocialButtons = ({ post, handleCommentClick }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const timeoutRef = useRef(null);
  const showTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const mouseDownTimeRef = useRef(null);

  const reactions = [
    { id: 'like', icon: like, label: 'Thích', color: 'text-blue-500' },
    { id: 'love', icon: love, label: 'Yêu thích', color: 'text-red-500' },
    { id: 'haha', icon: haha, label: 'Haha', color: 'text-yellow-500' },
    { id: 'sad', icon: sad, label: 'Buồn', color: 'text-yellow-500' },
    { id: 'angry', icon: angry, label: 'Phẫn nộ', color: 'text-orange-500' }
  ];

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    showTimeoutRef.current = setTimeout(() => {
      setShowReactions(true);
    }, 700);
  };

  const handleMouseLeave = (e) => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }

    const relatedTarget = e.relatedTarget;
    if (containerRef.current?.contains(relatedTarget)) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setShowReactions(false);
      setHoveredReaction(null);
    }, 400);
  };

  const handleMouseDown = () => {
    mouseDownTimeRef.current = Date.now();
  };

  const handleMouseUp = () => {
    const mouseUpTime = Date.now();
    const pressDuration = mouseUpTime - mouseDownTimeRef.current;

    // Nếu nhấn nhanh (dưới 500ms), xử lý như một quick like
    if (pressDuration < 500) {
      if (!selectedReaction) {
        // Nếu chưa có reaction nào được chọn, set reaction là 'like'
        setSelectedReaction('like');
      } else {
        // Nếu đã có reaction, bỏ chọn reaction
        setSelectedReaction(null);
      }
      setShowReactions(false);
    }
  };

  const handleReactionClick = (reactionId) => {
    setSelectedReaction(reactionId === selectedReaction ? null : reactionId);
    setShowReactions(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, []);

  const getButtonContent = () => {
    if (!selectedReaction) {
      return (
        <>
          <AiFillLike size={20} />
          <span>Thích</span>
        </>
      );
    }

    const reaction = reactions.find(r => r.id === selectedReaction);
    return (
      <>
        <img src={reaction?.icon} className="w-5 h-5" alt={reaction?.label} />
        <span className={reaction?.color}>{reaction?.label}</span>
      </>
    );
  };

  return (
    <div className="flex justify-between relative" ref={containerRef}>
      {/* Like Button with Reactions */}
      <div className="relative flex-1">
        <button
          className={`w-full flex items-center justify-center gap-2 py-2 ${selectedReaction ? reactions.find(r => r.id === selectedReaction)?.color : 'text-gray-400'
            } hover:bg-gray-800 rounded-lg transition-all`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {getButtonContent()}
        </button>
      </div>

      {/* Comment Button */}
      <button onClick={(e) => handleCommentClick(e, post.id)} className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-blue-500 hover:bg-gray-800 rounded-lg transition-colors">
        <FaComment size={20} />
        <span>Bình luận</span>
      </button>

      {/* Share Button */}
      <button className="flex-1 flex items-center justify-center gap-2 py-2 text-gray-400 hover:text-blue-500 hover:bg-gray-800 rounded-lg transition-colors">
        <FaShare size={20} />
        <span>Chia sẻ</span>
      </button>

      {/* Reaction Icons Popup */}
      {showReactions && (
        <div
          className="absolute bottom-full left-0 mb-2 flex gap-2 bg-black rounded-full p-2 shadow-lg transition-all"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {reactions.map((reaction) => (
            <div key={reaction.id} className="relative group">
              <button
                className="hover:bg-gray-700 rounded-full transition-transform hover:scale-125 p-1"
                onClick={() => handleReactionClick(reaction.id)}
                onMouseEnter={() => setHoveredReaction(reaction.id)}
                onMouseLeave={() => setHoveredReaction(null)}
              >
                <img
                  src={reaction.icon}
                  className="w-9 h-9"
                  alt={reaction.label}
                />
              </button>
              {hoveredReaction === reaction.id && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm py-1 px-2 rounded whitespace-nowrap">
                  {reaction.label}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialButtons;