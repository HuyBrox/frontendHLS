import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import Peer from 'peerjs';
import { Phone, Video, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';

export function Call({ selectedChat }) {
  const [callStatus, setCallStatus] = useState('idle'); // Trạng thái cuộc gọi
  const [isMicOn, setIsMicOn] = useState(true); // Mic bật/tắt
  const [isVideoOn, setIsVideoOn] = useState(true); // Video bật/tắt
  const [onlineUsers, setOnlineUsers] = useState([]); // Danh sách người dùng online

  const localVideoRef = useRef(null); // Tham chiếu video local
  const remoteVideoRef = useRef(null); // Tham chiếu video remote
  const socketRef = useRef(null); // Socket.io kết nối
  const peerRef = useRef(null); // PeerJS kết nối
  const localStreamRef = useRef(null); // Stream local (audio/video)
  const callRef = useRef(null); // Cuộc gọi hiện tại

  const senderId = localStorage.getItem('_id'); // Lấy userId từ localStorage
  const receiverId = selectedChat?.userId; // Lấy receiverId từ selectedChat

  useEffect(() => {
    if (!senderId) return;

    // Khởi tạo socket.io
    socketRef.current = io(`${process.env.REACT_APP_SOCKET_URL}`, {
      query: { userId: senderId },
      autoConnect: true,
    });

    // Khởi tạo PeerJS
    peerRef.current = new Peer(senderId);

    // Lắng nghe các sự kiện socket
    setupSocketListeners();

    // Lắng nghe các sự kiện PeerJS
    setupPeerListeners();

    // Dọn dẹp tài nguyên khi component unmount
    return () => {
      cleanupResources();
    };
  }, [senderId]);

  const checkWebRTCSupport = () => {
    if (!navigator.mediaDevices || !window.RTCPeerConnection) {
      alert('Trình duyệt không hỗ trợ WebRTC. Vui lòng sử dụng Chrome/Firefox phiên bản mới.');
      return false;
    }
    return true;
  };

  const setupSocketListeners = () => {
    socketRef.current.on('incomingCall', async ({ senderId: incomingSenderId, callerName, callType }) => {
      const accept = window.confirm(`Cuộc gọi ${callType} đến từ ${callerName}. Bạn có muốn nhận?`);
      if (accept) {
        await startCall(incomingSenderId, callType, false);
      }
    });

    socketRef.current.on('endCall', () => {
      alert('Cuộc gọi đã kết thúc');
      endCall();
    });

    socketRef.current.on('getOnlineUsers', (users) => {
      setOnlineUsers(users.filter(user => user !== senderId));
    });
  };

  const setupPeerListeners = () => {
    peerRef.current.on('call', async (call) => {
      const localStream = await setupMediaStream('video');
      call.answer(localStream);
      callRef.current = call;

      // Hiển thị local stream của người nhận
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
        localVideoRef.current.play().catch(e => console.error('Lỗi phát video local:', e));
      }

      call.on('stream', handleRemoteStream);
    });
  };

  const handleRemoteStream = (remoteStream) => {
    console.log('Nhận stream remote:', remoteStream);

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((e) => console.error('Lỗi phát video remote:', e));
    }
  };

  const setupMediaStream = async (callType) => {
    try {
      const constraints = {
        video: callType === 'video' ? { facingMode: 'user' } : false,
        audio: true
      };

      console.log('Cấu hình getUserMedia:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.style.display = callType === 'video' ? 'block' : 'none';
      }

      // Đảm bảo trạng thái tracks khớp với state
      stream.getAudioTracks().forEach(track => track.enabled = isMicOn);
      stream.getVideoTracks().forEach(track => track.enabled = isVideoOn);

      return stream;
    } catch (error) {
      handleMediaError(error);
    }
  };

  const handleMediaError = (error) => {
    console.error('Lỗi truy cập media:', error.name, error.message);
    if (error.name === 'NotAllowedError') {
      alert('Không có quyền truy cập camera. Hãy cấp quyền trong cài đặt trình duyệt.');
    } else if (error.name === 'NotFoundError') {
      alert('Không tìm thấy camera. Hãy kết nối thiết bị và thử lại.');
    } else {
      alert(`Lỗi truy cập media: ${error.message}`);
    }
  };

  const startCall = async (receiverId, callType, isInitiator = true) => {
    try {
      if (!checkWebRTCSupport()) return;

      // Set trạng thái dựa vào loại cuộc gọi
      if (callType === 'video') {
        setIsVideoOn(true);
        setIsMicOn(true);
      } else {
        setIsVideoOn(false);
        setIsMicOn(true);
      }

      const localStream = await setupMediaStream(callType);
      if (!localStream) throw new Error('Không thể lấy media stream');

      setCallStatus('in-call');

      if (isInitiator && peerRef.current) {
        const call = peerRef.current.call(receiverId, localStream);
        if (!call) throw new Error('Không thể tạo cuộc gọi');

        callRef.current = call;
        call.on('stream', handleRemoteStream);
      }
    } catch (error) {
      console.error('Lỗi:', error);
      endCall();
    }
  };

  const endCall = () => {
    if (callRef.current) {
      callRef.current.close();
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    setCallStatus('idle');
    setIsVideoOn(false);

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    socketRef.current.emit('endCall', {
      senderId: senderId,
      receiverId: callRef.current?.peer,
    });
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const newMicState = !isMicOn;
      setIsMicOn(newMicState);

      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = newMicState;
      });
    }
  };

  const toggleVideo = async () => {
    const newVideoState = !isVideoOn;
    setIsVideoOn(newVideoState);

    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = newVideoState;
      });

      if (localVideoRef.current) {
        localVideoRef.current.style.display = newVideoState ? 'block' : 'none';
      }
    }
  };

  const cleanupResources = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerRef.current) peerRef.current.destroy();
    if (socketRef.current) socketRef.current.disconnect();
  };

  return (
    <div className="relative">
      {selectedChat && receiverId && (
        <div className="flex space-x-2">
          <button
            className="p-2 rounded-full hover:bg-gray-600 transition-colors"
            onClick={() => startCall(receiverId, 'voice')}
          >
            <Phone className="w-5 h-5 text-white" />
          </button>

          <button
            className="p-2 rounded-full hover:bg-gray-600 transition-colors"
            onClick={() => startCall(receiverId, 'video')}
          >
            <Video className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {callStatus === 'in-call' && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col items-center justify-center p-4">
          {/* Controls */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex space-x-4 z-10">
            <button onClick={toggleMic} className="p-3 rounded-full bg-gray-700 hover:bg-gray-600">
              {isMicOn ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-red-500" />}
            </button>
            <button onClick={toggleVideo} className="p-3 rounded-full bg-gray-700 hover:bg-gray-600">
              {isVideoOn ? <VideoIcon className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-red-500" />}
            </button>
            <button onClick={endCall} className="p-3 rounded-full bg-red-600 hover:bg-red-700">
              <Phone className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Videos */}
          <div className="relative w-full h-[80vh] flex items-center justify-center">
            {/* Remote video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />

            {/* Local video - chỉ hiển thị khi isVideoOn = true */}
            {isVideoOn && (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="absolute bottom-4 right-4 w-48 h-32 object-cover rounded-lg border-2 border-white"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}