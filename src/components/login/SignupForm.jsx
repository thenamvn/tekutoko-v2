import React, { useState, useRef } from "react";
import Logo2 from "../logo/logo_2";
import handleKeyDown from "../../utils/handleKeyDown";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";

const SignupForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false); // State để hiển thị form điều khoản
  const [canAccept, setCanAccept] = useState(false); // Trạng thái để kiểm tra có thể nhấn Accept
  const termsRef = useRef(null); // Tham chiếu đến phần nội dung điều khoản

  const handleScroll = () => {
    if (termsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      // Kiểm tra xem người dùng đã cuộn đến cuối chưa
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setCanAccept(true); // Cho phép nhấn Accept
      } else {
        setCanAccept(false); // Không cho phép nhấn Accept
      }
    }
  };

  const handleSubmit = (event) => {
    if (event) event.preventDefault();
    setIsSubmitting(true);

    const newErrors = {};
    if (!fullname) newErrors.fullname = t('signupForm.fullNameRequired');
    if (!username) newErrors.username = t('signupForm.emailRequired');
    if (!password) newErrors.password = t('signupForm.passwordRequired');
    if (!confirmPassword) newErrors.confirmPassword = t('signupForm.confirmPasswordRequired');
    if (password !== confirmPassword) newErrors.confirmPassword = t('signupForm.passwordsDoNotMatch');

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false); // Đặt lại trạng thái khi có lỗi
    } else {
      setShowTerms(true); // Hiển thị form điều khoản khi không có lỗi
    }
  };

  const handleAgree = () => {
    handleSignUp(fullname, username, password, confirmPassword);
    setIsSubmitting(false); // Đặt lại trạng thái khi người dùng đồng ý
    setShowTerms(false); // Ẩn form điều khoản sau khi đồng ý
    setCanAccept(false); // Đặt lại trạng thái khi người dùng đồng ý
  };

  const handleSignUp = async (fullname, username, password, confirmPassword) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (password !== confirmPassword) {
      console.error("Passwords do not match");
      return;
    }

    try {
      // First, attempt to sign up
      const signupResponse = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname, username, password }),
      });

      const signupData = await signupResponse.json();

      if (signupData.success) {
        // If signup is successful, proceed with automatic login
        const loginResponse = await fetch(`${apiUrl}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const loginData = await loginResponse.json();

        if (loginData.success) {
          // Store user data in localStorage
          localStorage.setItem("token", loginData.token);
          localStorage.setItem("username", loginData.username);
          localStorage.setItem("current_username", loginData.fullname);
          localStorage.setItem("id", loginData.id);

          // Check for redirect path
          const redirectPath = localStorage.getItem("redirectPath");
          if (redirectPath) {
            localStorage.removeItem("redirectPath"); // Clear the redirect path
            navigate(redirectPath);
          } else {
            navigate("/home");
          }
        } else {
          alert(t(loginData.message));
        }
      } else {
        alert(t(signupData.message));
      }
    } catch (error) {
      console.error("Error during signup/login:", error);
      alert(t("error.generalError"));
    }
  };

  const handleDecline = () => {
    setShowTerms(false); // Ẩn form nếu người dùng không đồng ý
    setIsSubmitting(false); // Đặt lại trạng thái khi người dùng không đồng ý
    setCanAccept(false); // Đặt lại trạng thái khi người dùng không đồng ý
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-8 w-96">
        <div className="flex items-center justify-center mb-6">
          <Logo2 />
        </div>
        <form id="signup-form" onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              placeholder={t('signupForm.fullNamePlaceholder')}
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full px-2 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/90 transition-all duration-300 placeholder-slate-400 shadow-sm group-hover:shadow-md"
            />
            {errors.fullname && <div className="text-red-500 text-sm mt-1">{errors.fullname}</div>}
          </div>
          <div className="mb-4">
            <input
              type="email"
              placeholder={t('signupForm.emailPlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full px-2 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/90 transition-all duration-300 placeholder-slate-400 shadow-sm group-hover:shadow-md"
            />
            {errors.username && <div className="text-red-500 text-sm mt-1">{errors.username}</div>}
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder={t('signupForm.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/90 transition-all duration-300 placeholder-slate-400 shadow-sm group-hover:shadow-md"
            />
            {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
          </div>
          <div className="mb-4">
            <input
              type="password"
              placeholder={t('signupForm.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleSubmit)}
              className="w-full px-2 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/90 transition-all duration-300 placeholder-slate-400 shadow-sm group-hover:shadow-md"
            />
            {errors.confirmPassword && <div className="text-red-500 text-sm mt-1">{errors.confirmPassword}</div>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-2 px-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-white">
            {t('signupForm.signUpButton')}
          </button>
          <p className="mt-6 text-center text-gray-600">
            {t('signupForm.alreadyHaveAccount')}
            <a onClick={() => navigate('/login')} className="text-violet-600 hover:text-violet-700 font-semibold transition-colors duration-200 cursor-pointer"> {t('signupForm.signIn')}</a>
          </p>
        </form>
      </div>
      {/* Modal Điều Khoản và Điều Kiện */}
      {showTerms && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-md p-8 w-96">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('signupForm.termsTitle')}</h2>
              <button onClick={handleDecline} className="text-gray-500 hover:text-gray-700">
                <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none"></path>
                  <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" fill="currentColor"></path>
                </svg>
              </button>
            </header>
            <section className="overflow-y-auto h-64" ref={termsRef} onScroll={handleScroll}>
              <div dangerouslySetInnerHTML={{ __html: t('signupForm.termsDescription') }} />
            </section>
            <footer className="flex justify-end mt-4">
              <button onClick={handleDecline} className="bg-gray-200 text-gray-700 rounded-md px-4 py-2 mr-2 hover:bg-gray-300">
                {t('signupForm.cancelButton')}
              </button>
              <button onClick={handleAgree} disabled={!canAccept} className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 disabled:opacity-50">
                {t('signupForm.agreeButton')}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupForm;