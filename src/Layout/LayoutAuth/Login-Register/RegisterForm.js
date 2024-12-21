import React, { useState } from 'react';
import { RiAccountCircleFill } from "react-icons/ri";
import { MdOutlineAccountCircle } from "react-icons/md";
import { BiLogoGmail } from "react-icons/bi";
import { BsKey } from "react-icons/bs";
import { VscEye } from "react-icons/vsc";
import { PiEyeClosedThin } from "react-icons/pi";
import { FaFacebook } from "react-icons/fa";
import { FaStaylinked } from "react-icons/fa6";
import { VscTwitter } from "react-icons/vsc";
import { GoogleOutlined } from '@ant-design/icons';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../Components/ui/alert-dialog';

export const RegisterForm = ({
  registerUser,
  handleRegisterChange,
  handleRegisterSubmit,
  showRegisterPassword,
  setShowRegisterPassword,
  registerError,
  successMessage,
  checkPasswordStrength,
  passwordStrength,
  handleSendOTP,
  handleVerifyOTP,
  setRegisterUser
}) => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');

  const handleSendOtpClick = async () => {
    if (
      !registerUser.username.trim() ||
      !registerUser.fullname.trim() ||
      !registerUser.email.trim() ||
      !registerUser.password.trim()
    ) {
      setOtpError('Vui lòng nhập đầy đủ thông tin trước khi gửi OTP.');
      return;
    }

    await handleSendOTP();
    setShowOTPModal(true);
    setOtpError('');
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text'); // Lấy dữ liệu dán từ clipboard
    if (!/^\d{6}$/.test(pastedData)) return; // Chỉ xử lý nếu chuỗi là 6 số

    const newOtp = pastedData.split(''); // Chia thành mảng ký tự số
    setOtp(newOtp);

    // Cập nhật giá trị OTP vào registerUser
    setRegisterUser((prevState) => ({
      ...prevState,
      otp: pastedData,
    }));

    // Focus vào ô cuối cùng
    const lastInput = document.querySelector(`input[name="otp-${newOtp.length - 1}"]`);
    if (lastInput) lastInput.focus();
  };


  // Xử lý thay đổi từng ô nhập OTP
  // Xử lý thay đổi từng ô nhập OTP
  const handleOTPChange = (element, index) => {
    if (!/^\d*$/.test(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value.slice(-1); // Giới hạn 1 ký tự số
    setOtp(newOtp);

    // Gộp các ký tự từ mảng otp thành chuỗi
    const otpValue = newOtp.join('');

    // Cập nhật giá trị OTP vào registerUser
    setRegisterUser((prevState) => ({
      ...prevState,
      otp: otpValue,
    }));

    // Focus vào ô tiếp theo nếu có
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  // Xử lý xóa ký tự khi nhấn Backspace
  const handleBackspace = (e, index) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);

        const prevInput = document.querySelector(`input[name="otp-${index - 1}"]`);
        if (prevInput) prevInput.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }

      const otpValue = newOtp.join('');
      setRegisterUser((prevState) => ({
        ...prevState,
        otp: otpValue,
      }));
    }
  };




  // Xử lý xác thực OTP và gửi form đăng ký
  const handleOTPSubmit = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 số OTP');
      return;
    }

    try {
      // Xác thực OTP
      const isOtpValid = await handleVerifyOTP(registerUser.email, otpValue);

      if (isOtpValid) {
        // Nếu OTP hợp lệ, cập nhật OTP vào state
        const updatedRegisterUser = {
          ...registerUser,
          otp: otpValue
        };

        // Cập nhật state registerUser trước khi submit
        setRegisterUser(updatedRegisterUser);

        // Đóng modal OTP
        setShowOTPModal(false);

        // Gọi hàm đăng ký với form đã có OTP
        handleRegisterSubmit(new Event('submit'));
      } else {
        setOtpError('OTP không chính xác. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error("Lỗi khi xác thực OTP:", error);
      setOtpError('Đã xảy ra lỗi khi xác thực OTP.');
    }
  };

  // Modified handleChange để kiểm tra độ mạnh mật khẩu
  const modifiedHandleRegisterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') {
      checkPasswordStrength(value);
    }
    handleRegisterChange(e);
  };

  // Modified submit handler để chặn mật khẩu yếu
  const modifiedHandleRegisterSubmit = (e) => {
    e.preventDefault();
    if (passwordStrength === 'Yếu') {
      return; // Không gửi form nếu mật khẩu yếu
    }
    handleRegisterSubmit(e);
  };

  return (
    <>
      <form onSubmit={modifiedHandleRegisterSubmit} className="sign-up-form">
        <h2 className="title">Đăng ký</h2>
        {registerError && <p className="error-message">{registerError}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="input-field">
          <RiAccountCircleFill className="fas fa-user" />
          <input
            type="text"
            name="username"
            placeholder="Tên người dùng"
            value={registerUser.username}
            onChange={handleRegisterChange}
            required
            maxLength={15}
          />
        </div>

        <div className="input-field">
          <MdOutlineAccountCircle className="fas fa-user" />
          <input
            type="text"
            name="fullname"
            placeholder="Họ tên"
            value={registerUser.fullname}
            onChange={handleRegisterChange}
            required
            maxLength={20}
          />
        </div>

        <div className="input-field">
          <BiLogoGmail className="fas fa-envelope" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={registerUser.email}
            onChange={handleRegisterChange}
            required
          />
        </div>

        <div className="input-field" style={{ position: "relative" }}>
          <BsKey className="icon-left" />
          <input
            type={showRegisterPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={registerUser.password}
            onChange={modifiedHandleRegisterChange}
            required
            style={{
              paddingRight: "40px",
            }}
          />
          <button
            type="button"
            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
            className="password-toggle"
            style={{
              background: 'none',
              border: 'none',
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: '#aaa'
            }}
          >
            {showRegisterPassword ? <VscEye style={{ fontSize: '1.3rem' }} /> : <PiEyeClosedThin style={{ fontSize: '1.3rem' }} />}
          </button>
        </div>


        {passwordStrength && (
          <div
            style={{
              color:
                passwordStrength === 'Rất mạnh' ? 'green' :
                  passwordStrength === 'Mạnh' ? 'blue' :
                    passwordStrength === 'Trung bình' ? 'orange' : 'red',
              marginBottom: '10px',
            }}
          >
            {passwordStrength === 'Yếu'
              ? 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.'
              : `Độ mạnh mật khẩu: ${passwordStrength}`}
          </div>
        )}

        <button
          type="button"
          onClick={handleSendOtpClick} // Gửi OTP và hiển thị modal
          className="btn flex justify-center items-center"
        >
          ĐĂNG KÝ
        </button>

        <p className="social-text">Or Đăng ký with social platforms</p>
        <div className="social-media">
          <button className="social-icon"><FaFacebook /></button>
          <button className="social-icon"><VscTwitter /></button>
          <button className="social-icon"><GoogleOutlined /></button>
          <button className="social-icon"><FaStaylinked /></button>
        </div>
      </form>

      {/* Modal OTP */}
      {showOTPModal && (
        <AlertDialog open={showOTPModal} onOpenChange={setShowOTPModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác thực OTP</AlertDialogTitle>
            </AlertDialogHeader>
            <p className="text-gray-500 mb-4 text-center">
              Vui lòng nhập mã OTP được gửi đến email của bạn
            </p>

            <div className="flex justify-center space-x-2 text-black" onPaste={handlePaste}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  name={`otp-${index}`}
                  maxLength="1"
                  className="w-12 h-12 text-center border rounded-lg text-black"
                  value={data}
                  onChange={(e) => handleOTPChange(e.target, index)}
                  onKeyDown={(e) => handleBackspace(e, index)}
                  onFocus={(e) => e.target.select()}
                  autoComplete="off"
                />
              ))}
            </div>

            {otpError && <p className="text-red-500 text-center mt-2">{otpError}</p>}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowOTPModal(false)}
                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
              >
                Hủy
              </button>
              <button
                type="button"  // Thay đổi từ mặc định submit sang button
                onClick={handleOTPSubmit}  // Sử dụng hàm handleOTPSubmit để xử lý
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Xác nhận
              </button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};
