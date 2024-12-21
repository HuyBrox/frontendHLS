import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../../../assets/images/logo192.png';
import './testlogin.css';
import { RegisterForm } from './RegisterForm';
import { LoginForm } from './LoginForm';

export default function LoginRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUpMode, setIsSignUpMode] = useState(location.pathname === '/register');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [loginUser, setLoginUser] = useState({
    email: '',
    password: ''
  });
  const [registerUser, setRegisterUser] = useState({
    username: '',
    fullname: '',
    email: '',
    password: '',
    otp: ''
  });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  // Password strength checking function
  const checkPasswordStrength = (password) => {
    // Criteria for password strength
    const lengthCriteria = password.length >= 8;
    const uppercaseCriteria = /[A-Z]/.test(password);
    const lowercaseCriteria = /[a-z]/.test(password);
    const numberCriteria = /[0-9]/.test(password);
    const specialCharCriteria = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    // Determine strength
    if (password.length === 0) {
      setPasswordStrength('');
    } else if (
      lengthCriteria &&
      uppercaseCriteria &&
      lowercaseCriteria &&
      numberCriteria &&
      specialCharCriteria
    ) {
      setPasswordStrength('Rất mạnh');
    } else if (
      lengthCriteria &&
      ((uppercaseCriteria || lowercaseCriteria) &&
        (numberCriteria || specialCharCriteria))
    ) {
      setPasswordStrength('Mạnh');
    } else if (lengthCriteria) {
      setPasswordStrength('Trung bình');
    } else {
      setPasswordStrength('Yếu');
    }
  };

  // Effect theo dõi URL để cập nhật mode
  useEffect(() => {
    if (location.pathname === '/register') {
      setIsSignUpMode(true);
    } else if (location.pathname === '/login') {
      setIsSignUpMode(false);
    }
  }, [location.pathname]);

  // Effect xử lý animation container
  useEffect(() => {
    const container = document.querySelector('.container');
    if (container) {
      if (isSignUpMode) {
        container.classList.add('sign-up-mode');
      } else {
        container.classList.remove('sign-up-mode');
      }
    }
  }, [isSignUpMode]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginUser({
      ...loginUser,
      [name]: value
    });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterUser({
      ...registerUser,
      [name]: value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/user/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginUser),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        setLoginError(data.message);
      } else {
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('_id', data.user._id);
        setLoginError('');
        alert("Web vẫn còn trong quá trình update vẫn còn chưa hoàn thiện, còn 1 số lỗi và chưa hoàn chỉnh phần home !");
        navigate("/");
      }
    } catch (error) {
      setLoginError('Đã xảy ra lỗi, vui lòng thử lại!');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    // Tạo object mới với thứ tự key cố định
    const orderedData = {
      username: registerUser.username,
      fullname: registerUser.fullname,
      email: registerUser.email,
      password: registerUser.password,
      otp: registerUser.otp
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderedData),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegisterError(data.message || 'Đã xảy ra lỗi không xác định');
        setSuccessMessage('');
      } else {
        setSuccessMessage('Đăng ký thành công! Chuyển hướng đến trang đăng nhập.');
        setRegisterUser({ username: '', fullname: '', email: '', password: '', otp: '' });
        checkPasswordStrength('');
        setRegisterError('');
        setTimeout(() => {
          navigate('/login');
          setIsSignUpMode(false);
        }, 500);
      }
    } catch (error) {
      console.error('Registration Submission Error:', error);
      setRegisterError('Đã xảy ra lỗi, vui lòng thử lại!');
      setSuccessMessage('');
    }
  };


  const handleSendOTP = async () => {
    try {
      if (!registerUser.email) {
        setRegisterError('Vui lòng nhập email trước khi gửi OTP.');
        return;
      }
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/sendOtpRegister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: registerUser.email }),
      });

      const data = await response.json();
      if (!response.ok) {
        setRegisterError(data.message || 'Không thể gửi OTP');
      } else {
        // setSuccessMessage(`OTP đã được gửi tới email ${registerUser.email}.`);
        setRegisterError('');
      }
    } catch (error) {
      setRegisterError('Đã xảy ra lỗi khi gửi OTP.');
    }
  };

  const handleVerifyOTP = async (email, otpValue) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
        // credentials: "include", // Gửi kèm cookie nếu cần
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Lỗi từ backend:", data.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Lỗi kết nối hoặc gọi API:", error);
      return false;
    }
  };



  const handleSignUpClick = () => {
    navigate('/register');
    setIsSignUpMode(true);
    setLoginError('');
    setSuccessMessage('');
    setLoginUser({
      email: '',
      password: ''
    });
  };

  const handleSignInClick = () => {
    navigate('/login');
    setIsSignUpMode(false);
    setRegisterError('');
    setSuccessMessage('');
    checkPasswordStrength('');
    setRegisterUser({
      fullname: '',
      username: '',
      email: '',
      password: ''
    });
  };

  return (
    <div className={`container ${isSignUpMode ? "sign-up-mode" : ""}`}>
      <div className="forms-container">
        <div className="signin-signup">
          <LoginForm
            loginUser={loginUser}
            handleLoginChange={handleLoginChange}
            handleLoginSubmit={handleLoginSubmit}
            showLoginPassword={showLoginPassword}
            setShowLoginPassword={setShowLoginPassword}
            loginError={loginError}
          />

          <RegisterForm
            registerUser={registerUser}
            handleRegisterChange={handleRegisterChange}
            handleRegisterSubmit={handleRegisterSubmit}
            showRegisterPassword={showRegisterPassword}
            setShowRegisterPassword={setShowRegisterPassword}
            registerError={registerError}
            successMessage={successMessage}
            checkPasswordStrength={checkPasswordStrength}
            passwordStrength={passwordStrength}
            handleSendOTP={handleSendOTP}
            handleVerifyOTP={handleVerifyOTP}
            setRegisterUser={setRegisterUser}
          />
        </div>
      </div>

      <div className="panels-container">
        <div className="panel left-panel">
          <div className="content">
            <img src={Logo} alt="" />
            <p>
              Đăng ký để xem ảnh và video từ bạn bè.
            </p>
            <button className="btn transparent" id="sign-up-btn" onClick={handleSignUpClick}>
              Đăng ký
            </button>
          </div>
          <img src="img/log.svg" className="image" alt="" />
        </div>
        <div className="panel right-panel">
          <div className="content">
            <img src={Logo} alt="" />
            <p>
              Đăng nhập để tiếp tục với tài khoản của bạn
            </p>
            <button className="btn transparent" id="sign-in-btn" onClick={handleSignInClick}>
              Đăng nhập
            </button>
          </div>
          <img src="img/register.svg" className="image" alt="" />
        </div>
      </div>
    </div>
  );
}
