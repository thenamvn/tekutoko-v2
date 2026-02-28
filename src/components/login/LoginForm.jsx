import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Logo2 from "../logo/logo_2";
import { useTranslation } from "react-i18next";
import { useGoogleLogin } from '@react-oauth/google';
// import LineLogin from "./LineLogin";
const LoginForm = () => {
  const url = window.location.origin;
  const apiUrl = process.env.REACT_APP_API_URL;
  const client_id = process.env.REACT_APP_LINE_CLIENT_ID;
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const usernameRef = useRef();
  const passwordRef = useRef();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleLoginGoogle = (name, username, picture) => {

    fetch(`${apiUrl}/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullname: name,
        username: username,
        picture: picture
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Lưu token và thông tin người dùng vào localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username);
          localStorage.setItem("current_username", data.fullname);
          localStorage.setItem("id", data.id);
          const redirectPath = localStorage.getItem("redirectPath");
          if (redirectPath) {
            localStorage.removeItem("redirectPath");
            navigate(redirectPath);
          } else {
            navigate("/home");
          }
        } else {
          alert(t(data.message || "An error occurred during login."));
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred during Google login. Please try again later.");
      });
  };

  const generateRandomString = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  };
  const handleLineLogin = async () => {
    const state = generateRandomString(16);
    localStorage.setItem('lineState', state);
    const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${client_id}&redirect_uri=${url}/line&state=${state}&scope=profile%20openid%20email`;
    // Mở URL đăng nhập Line trong một tab mới
    window.open(lineLoginUrl, '_self');
  };

  const handleLogin = async (event) => { // Change to async function
    event.preventDefault();
    const username = usernameRef.current.value; // Use useRef
    const password = passwordRef.current.value; // Use useRef
    const remember = rememberMe; // Use state directly

    try {
      const response = await fetch(`${apiUrl}/login`, { // Use await for fetch
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json(); // Use await for response.json()

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        localStorage.setItem("current_username", data.fullname);
        localStorage.setItem("id", data.id);

        if (remember) {
          localStorage.setItem("username", username);
          localStorage.setItem("password", password);
        } else {
          localStorage.removeItem("password");
        }

        const redirectPath = localStorage.getItem("redirectPath");
        if (redirectPath) {
          localStorage.removeItem("redirectPath");
          navigate(redirectPath);
        } else {
          navigate("/home");
        }
      } else {
        console.log(t(data.message));
        alert(t(data.message));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const navigateToSignupForm = () => {
    navigate("/signup");
  };

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("username");
    const rememberedPassword = localStorage.getItem("password");

    if (rememberedUsername && rememberedPassword) {
      usernameRef.current.value = rememberedUsername;
      passwordRef.current.value = rememberedPassword;
      setRememberMe(true);
    }
  }, []);

  const handleRememberMeChange = () => {
    setRememberMe(!rememberMe);
    if (!rememberMe) {
      localStorage.removeItem("password");
    }
  };

  const handleLoginClick = (event) => {
    event.preventDefault(); // Prevent default form submission
    handleLogin(event);
    if (rememberMe) {
      localStorage.setItem("username", usernameRef.current.value);
      localStorage.setItem("password", passwordRef.current.value);
    }
  };

  const handleResetPasswordClick = () => {
    navigate("/resetpassword");
  };

  // Thêm chức năng đăng nhập bằng Google
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Gửi yêu cầu đến Google API để lấy thông tin người dùng
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userInfo = await userInfoResponse.json();
        handleLoginGoogle(userInfo.name, userInfo.email, userInfo.picture);
      } catch (error) {
        console.error("Error during Google login:", error);
        alert(t('loginForm.googleLoginFailure'));
      }
    },
    onError: (error) => {
      console.error("Error during Google login:", error);
      alert(t('loginForm.googleLoginFailure'));
    },
  });

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <form
        id="login-form"
        className="bg-white rounded-lg shadow-md p-8 w-96"
        onSubmit={handleLoginClick} // Pass the event to handleLoginClick
      >
        <div className="flex items-center justify-center mb-6">
          <Logo2 />
        </div>
        <div className="mb-4">
          <input
            type="email"
            placeholder={t("loginForm.emailPlaceholder")}
            id="username"
            name="username"
            ref={usernameRef}
            autoComplete="username"
            className="w-full px-2 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/90 transition-all duration-300 placeholder-slate-400 shadow-sm group-hover:shadow-md"
          />
        </div>
        <div className="mb-4">
          <input
            type={passwordVisible ? "text" : "password"}
            placeholder={t("loginForm.passwordPlaceholder")}
            id="password"
            name="password"
            ref={passwordRef}
            autoComplete="current-password"
            className="w-full px-2 py-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 focus:bg-white/90 transition-all duration-300 placeholder-slate-400 shadow-sm group-hover:shadow-md"
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center text-gray-700 text-sm">
            <input
              type="checkbox"
              id="remember-me"
              className="mr-2"
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
            {t("loginForm.rememberMe")}
          </label>
          <a
            onClick={handleResetPasswordClick}
            className="text-violet-600 hover:text-violet-700 transition-colors duration-200 cursor-pointer"
          >
            {t("loginForm.forgotPassword")}
          </a>
        </div>
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center text-gray-700 text-sm">
            <input
              type="checkbox"
              id="show-password"
              className="mr-2"
              onChange={togglePasswordVisibility}
            />
            {t("loginForm.showPassword")}
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-2 px-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-white"
        >
          {t("loginForm.signIn")}
        </button>
        <div className="mt-4 text-center text-gray-600">
          {t("loginForm.or")}
        </div>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="w-full flex items-center justify-center space-x-3 bg-white/80 backdrop-blur-sm border border-slate-200/50 hover:border-slate-300/50 rounded-2xl py-2 px-3 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] group"
            onClick={handleGoogleLogin}
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
            <span className="text-slate-700 font-semibold group-hover:text-slate-800 transition-colors duration-200">
              {t("loginForm.loginWithGoogle")}
            </span>
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center space-x-3 bg-green-500 from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold py-2 px-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white"
            onClick={handleLineLogin}
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#00c300" d="M12.5,42h23c3.59,0,6.5-2.91,6.5-6.5v-23C42,8.91,39.09,6,35.5,6h-23C8.91,6,6,8.91,6,12.5v23C6,39.09,8.91,42,12.5,42z"></path>
              <path fill="#fff" d="M37.113,22.417c0-5.865-5.88-10.637-13.107-10.637s-13.108,4.772-13.108,10.637c0,5.258,4.663,9.662,10.962,10.495c0.427,0.092,1.008,0.282,1.155,0.646c0.132,0.331,0.086,0.85,0.042,1.185c0,0-0.153,0.925-0.187,1.122c-0.057,0.331-0.263,1.296,1.135,0.707c1.399-0.589,7.548-4.445,10.298-7.611h-0.001C36.203,26.879,37.113,24.764,37.113,22.417z M18.875,25.907h-2.604c-0.379,0-0.687-0.308-0.687-0.688V20.01c0-0.379,0.308-0.687,0.687-0.687c0.379,0,0.687,0.308,0.687,0.687v4.521h1.917c0.379,0,0.687,0.308,0.687,0.687C19.562,25.598,19.254,25.907,18.875,25.907z M21.568,25.219c0,0.379-0.308,0.688-0.687,0.688s-0.687-0.308-0.687-0.688V20.01c0-0.379,0.308-0.687,0.687-0.687s0.687,0.308,0.687,0.687V25.219z M27.838,25.219c0,0.297-0.188,0.559-0.47,0.652c-0.071,0.024-0.145,0.036-0.218,0.036c-0.215,0-0.42-0.103-0.549-0.275l-2.669-3.635v3.222c0,0.379-0.308,0.688-0.688,0.688c-0.379,0-0.688-0.308-0.688-0.688V20.01c0-0.296,0.189-0.558,0.47-0.652c0.071-0.024,0.144-0.035,0.218-0.035c0.214,0,0.42,0.103,0.549,0.275l2.67,3.635V20.01c0-0.379,0.309-0.687,0.688-0.687c0.379,0,0.687,0.308,0.687,0.687V25.219z M32.052,21.927c0.379,0,0.688,0.308,0.688,0.688c0,0.379-0.308,0.687-0.688,0.687h-1.917v1.23h1.917c0.379,0,0.688,0.308,0.688,0.687c0,0.379-0.309,0.688-0.688,0.688h-2.604c-0.378,0-0.687-0.308-0.687-0.688v-2.603c0-0.001,0-0.001,0-0.001c0,0,0-0.001,0-0.001v-2.601c0-0.001,0-0.001,0-0.002c0-0.379,0.308-0.687,0.687-0.687h2.604c0.379,0,0.688,0.308,0.688,0.687s-0.308,0.687-0.688,0.687h-1.917v1.23H32.052z"></path>
            </svg>
            <span>{t("loginForm.loginWithLine")}</span>
          </button>
        </div>
        <p className="mt-6 text-center text-gray-600">
          {t("loginForm.noAccount")}{" "}
          <a
            onClick={navigateToSignupForm}
            className="text-violet-600 hover:text-violet-700 font-semibold transition-colors duration-200 cursor-pointer"
          >
            {t("loginForm.signUp")}
          </a>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;