import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  verifyOtp,
  resendOtp,
  loginUser,
} from "../store/authSlice.js";
import usePasteCleaner from "../hooks/usePasteCleaner.js";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  usePasteCleaner(); // Custom hook to clean pasted input in forms

  // ⚡ Persistent Auth State Initialization via SessionStorage to prevent reset on page refresh
  const [authState, setAuthState] = useState(() => {
    return sessionStorage.getItem("auth_portal_state") || "login";
  });

  const [email, setEmail] = useState(() => {
    return sessionStorage.getItem("auth_portal_email") || "";
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const savedTime = sessionStorage.getItem("auth_portal_timer");
    return savedTime ? parseInt(savedTime, 10) : 120;
  });

  // Select the loading status directly from our slice
  const { loading: isSliceLoading } = useSelector((state) => state.auth);

  // Form inputs matching our backend requirements
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [otpArray, setOtpArray] = useState(new Array(6).fill(""));

  const [uiError, setUiError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef([]);

  // Sync auth state changes to sessionStorage so refreshes hold their position
  useEffect(() => {
    sessionStorage.setItem("auth_portal_state", authState);
  }, [authState]);

  useEffect(() => {
    if (email) {
      sessionStorage.setItem("auth_portal_email", email);
    }
  }, [email]);

  // Clear UI error on state switch
  useEffect(() => {
    setUiError("");
  }, [authState]);

  // 🕒 2-Minute Countdown Timer Loop effect
  useEffect(() => {
    if (authState !== "otp") return;
    if (timeLeft <= 0) return;

    const timerInterval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const nextTime = prevTime - 1;
        sessionStorage.setItem("auth_portal_timer", nextTime);
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [authState, timeLeft]);

  // Format seconds cleanly into MM:SS format layout
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ⚡ Precise Error Parser Mapped to Your Exact Backend Responses (Login & Registration)
  const getAuthErrorMessage = (errorObj) => {
    const errorText =
      typeof errorObj === "string"
        ? errorObj
        : errorObj?.payload ||
          errorObj?.response?.data?.message ||
          errorObj?.message ||
          String(errorObj || "");
    const errStr = errorText.toLowerCase();

    // 1. Backend validation messages
    if (errStr.includes("all fields are required")) {
      return "All fields are required.";
    }
    if (errStr.includes("between 3 and 20 characters")) {
      return "Username must be between 3 and 20 characters.";
    }
    if (errStr.includes("can only contain letters, numbers")) {
      return "Username can only contain letters, numbers, underscore (_) and hyphen (-).";
    }
    if (errStr.includes("at least one letter and one number")) {
      return "Username must contain at least one letter and one number.";
    }
    if (errStr.includes("at least 8 characters")) {
      return "Password must be at least 8 characters long.";
    }
    if (errStr.includes("already exists")) {
      return errorText; // Returns exact duplicate field error from MongoDB catch block
    }
    if (errStr.includes("user not found with this email") || errStr.includes("not found")) {
      return "User not found with this email.";
    }
    if (errStr.includes("invalid user credentials") || errStr.includes("credentials")) {
      return "Invalid password. Please check your password and try again.";
    }
    if (errStr.includes("not verified")) {
      return "Account not verified. Please verify your account before logging in.";
    }

    return errorText || "An unexpected error occurred.";
  };

  // 1. Submit Login Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setUiError("");
    setIsSubmitting(true);

    try {
      await dispatch(loginUser({ email, password })).unwrap();
      setIsSubmitting(false);
      sessionStorage.clear(); // Clear persistence upon successful login session
      navigate("/dashboard");
    } catch (error) {
      setIsSubmitting(false);
      setUiError(getAuthErrorMessage(error));
    }
  };

  // 2. Submit Registration Handler (Mirrors backend username & password rules)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setUiError("");

    const trimmedUsername = username.trim();

    // Frontend validation guards matching your updated backend constraints
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setUiError("Username must be between 3 and 20 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      setUiError("Username can only contain letters, numbers, underscore (_) and hyphen (-).");
      return;
    }
    if (!/[a-zA-Z]/.test(trimmedUsername) || !/[0-9]/.test(trimmedUsername)) {
      setUiError("Username must contain at least one letter and one number.");
      return;
    }
    if (password.length < 8) {
      setUiError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    const dataPayload = new FormData();
    dataPayload.append("username", trimmedUsername);
    dataPayload.append("email", email.trim());
    dataPayload.append("password", password);
    dataPayload.append("fullname", fullname.trim());
    if (avatar) {
      dataPayload.append("avatar", avatar);
    }

    try {
      await dispatch(registerUser(dataPayload)).unwrap();

      setTimeout(() => {
        setIsSubmitting(false);
        setTimeLeft(120);
        sessionStorage.setItem("auth_portal_timer", 120);
        setAuthState("otp");
      }, 150);
    } catch (error) {
      setUiError(getAuthErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  // 3. Submit OTP Handler
  const handleOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    setUiError("");

    if (timeLeft <= 0) {
      setUiError("Your verification timer expired. Please request a new code.");
      return;
    }

    const combinedOtpString = otpArray.join("");
    if (combinedOtpString.length !== 6) {
      setUiError("Please populate all 6 verification code blocks.");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(verifyOtp({ email, otp: combinedOtpString })).unwrap();

      setAuthState("verified");
      setIsSubmitting(false);
      setOtpArray(new Array(6).fill(""));

      setTimeout(() => {
        setAuthState("login");
        sessionStorage.clear();
      }, 3200);
    } catch (error) {
      setUiError(getAuthErrorMessage(error));
      setIsSubmitting(false);
    }
  };

  // 4. Reset/Resend Code Handler
  const handleResendCode = async () => {
    if (timeLeft > 0) return;

    setUiError("");
    setIsSubmitting(true);
    try {
      await dispatch(resendOtp({ email })).unwrap();
      setTimeLeft(120);
      sessionStorage.setItem("auth_portal_timer", 120);
      setOtpArray(new Array(6).fill(""));
    } catch (error) {
      setUiError(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Clean & Robust OTP Sequential Focus Management & Paste Feature
  const handleOtpChange = (value, index) => {
    const cleanValue = value.replace(/\D/g, "").slice(-1);
    const updatedOtp = [...otpArray];
    updatedOtp[index] = cleanValue;
    setOtpArray(updatedOtp);

    if (cleanValue && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!pasteData) return;

    const digits = pasteData.replace(/\D/g, "").split("").slice(0, 6);
    const newOtp = new Array(6).fill("");
    
    digits.forEach((digit, idx) => {
      newOtp[idx] = digit;
    });

    setOtpArray(newOtp);
    
    const targetIndex = Math.min(digits.length - 1, 5);
    if (targetIndex >= 0 && otpRefs.current[targetIndex]) {
      otpRefs.current[targetIndex].focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const updatedOtp = [...otpArray];
      if (updatedOtp[index]) {
        updatedOtp[index] = "";
        setOtpArray(updatedOtp);
      } else if (index > 0) {
        updatedOtp[index - 1] = "";
        setOtpArray(updatedOtp);
        otpRefs.current[index - 1].focus();
      }
    }
  };

  const combinedLoadingState = isSubmitting || isSliceLoading;
  const isResendDisabled = combinedLoadingState || timeLeft > 0;

  return (
    <div className="min-h-screen w-full bg-[#131313] text-[#e5e2e1] flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans antialiased selection:bg-[#5ddda1]/30 selection:text-black relative overflow-hidden">
      
      {/* Custom Styles for Smooth Verification Animation */}
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes drawTick {
          0% { stroke-dashoffset: 48; opacity: 0; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        .animate-scale-circle {
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-check-tick {
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: drawTick 0.4s ease 0.3s forwards;
        }
      `}</style>

      {/* ⚡ Themed Loading Progress Bar */}
      {combinedLoadingState && (
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0e0e0e] overflow-hidden z-50">
          <div className="w-full h-full bg-[#5ddda1] animate-[pulse_1s_infinite] shadow-[0_0_12px_#5ddda1]"></div>
        </div>
      )}

      <div className="w-full max-w-5xl bg-[#1c1b1b] rounded-none border border-[#353535] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[660px]">
        
        {/* LEFT BLOCK PANEL: INTERACTIVE CORE FORMS CONTAINER */}
        <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-[#1c1b1b] relative">
          {authState !== "verified" && (
            <div className="space-y-2 border-b border-[#353535] pb-5">
              <span className="text-[10px] font-bold tracking-[0.3em] text-[#5ddda1] uppercase">
                AUTHENTICATION
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#e5e2e1] uppercase">
                {authState === "login" && "Welcome Back"}
                {authState === "register" && "Create Account"}
                {authState === "otp" && "Verification Code"}
              </h1>
              <p className="text-xs text-[#c4c7c7] font-sans leading-relaxed">
                {authState === "login" &&
                  "Access curated properties and reserve them Today!"}
                {authState === "register" &&
                  "Register your profile credentials for secure platform access."}
                {authState === "otp" &&
                  "Enter or paste the 6-digit verification code dispatched to your email inbox."}
              </p>
            </div>
          )}

          {uiError && authState !== "verified" && (
            <div className="p-4 bg-[#0e0e0e] border border-[#ffb4ab]/40 text-[#ffb4ab] text-xs rounded-none font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
              <span>⚠️</span> <span>{uiError}</span>
            </div>
          )}

          {/* A. LOGIN INTERFACE FORM GRID */}
          {authState === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled={combinedLoadingState}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@gmail.com"
                  className="w-full text-xs border border-[#444748] px-4 py-3 bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] transition-all placeholder:text-[#8e9192] disabled:opacity-50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  disabled={combinedLoadingState}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="password"
                  className="w-full text-xs border border-[#444748] px-4 py-3 bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] transition-all placeholder:text-[#8e9192] disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={combinedLoadingState}
                className="w-full py-3.5 bg-[#5ddda1] text-[#003823] rounded-none font-bold text-xs tracking-[0.2em] uppercase hover:bg-[#08a56e] transition-all shadow-xl cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2.5"
              >
                {combinedLoadingState && (
                  <div className="w-4 h-4 border-2 border-[#003823] border-t-transparent rounded-none animate-spin"></div>
                )}
                {combinedLoadingState ? "Authenticating..." : "Login"}
              </button>
              <div className="text-center pt-3 border-t border-[#353535]">
                <span className="text-xs text-[#c4c7c7]">
                  New to the platform?{" "}
                </span>
                <button
                  type="button"
                  disabled={combinedLoadingState}
                  onClick={() => setAuthState("register")}
                  className="text-xs font-bold underline text-[#5ddda1] hover:text-white cursor-pointer transition-colors ml-1"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* B. MULTI-PART FILES REGISTER FORM GRID */}
          {authState === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">
                    Username (Letters + Digits)
                  </label>
                  <input
                    type="text"
                    value={username}
                    disabled={combinedLoadingState}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="e.g. user123"
                    className="w-full text-xs border border-[#444748] px-3.5 py-2.5 bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] placeholder:text-[#8e9192] disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullname}
                    disabled={combinedLoadingState}
                    onChange={(e) => setFullname(e.target.value)}
                    required
                    placeholder="full name"
                    className="w-full text-xs border border-[#444748] px-3.5 py-2.5 bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] placeholder:text-[#8e9192] disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  disabled={combinedLoadingState}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@domain.com"
                  className="w-full text-xs border border-[#444748] px-3.5 py-2.5 bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] placeholder:text-[#8e9192] disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">
                  Password (Min 8 chars)
                </label>
                <input
                  type="password"
                  value={password}
                  disabled={combinedLoadingState}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full text-xs border border-[#444748] px-3.5 py-2.5 bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] placeholder:text-[#8e9192] disabled:opacity-50"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">
                  Profile Avatar Asset
                </label>
                <input
                  type="file"
                  disabled={combinedLoadingState}
                  onChange={(e) => setAvatar(e.target.files[0])}
                  accept="image/*"
                  className="w-full text-xs text-[#c4c7c7] file:mr-4 file:py-2.5 file:px-4 file:rounded-none file:border-0 file:text-[9px] file:font-bold file:uppercase file:bg-[#5ddda1] file:text-[#003823] file:cursor-pointer hover:file:bg-[#08a56e] bg-[#0e0e0e] border border-[#444748] disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={combinedLoadingState}
                className="w-full py-3.5 bg-[#5ddda1] text-[#003823] rounded-none font-bold text-xs tracking-[0.2em] uppercase hover:bg-[#08a56e] transition-all shadow-xl cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2.5 mt-2"
              >
                {combinedLoadingState && (
                  <div className="w-4 h-4 border-2 border-[#003823] border-t-transparent rounded-none animate-spin"></div>
                )}
                {combinedLoadingState ? "Creating Account..." : "Register Now"}
              </button>
              <div className="text-center pt-3 border-t border-[#353535]">
                <span className="text-xs text-[#c4c7c7]">
                  Already registered?{" "}
                </span>
                <button
                  type="button"
                  disabled={combinedLoadingState}
                  onClick={() => setAuthState("login")}
                  className="text-xs font-bold underline text-[#5ddda1] hover:text-white cursor-pointer transition-colors ml-1"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* C. 6-DIGIT OTP FIELDS + COUNTDOWN TIMER WIDGET WITH CLEAN PASTE SUPPORT */}
          {authState === "otp" && (
            <div className="space-y-6">
              <div className="flex justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otpArray.map((digit, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (otpRefs.current[i] = el)}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-mono font-bold border border-[#444748] bg-[#0e0e0e] text-[#5ddda1] rounded-none focus:outline-none focus:border-[#5ddda1] focus:ring-1 focus:ring-[#5ddda1] transition-all disabled:opacity-50"
                    disabled={combinedLoadingState || timeLeft === 0}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs px-1 bg-[#0e0e0e] p-3 border border-[#353535]">
                <div className="flex items-center gap-2 font-medium text-[#c4c7c7]">
                  <span className="text-[9px] uppercase tracking-[0.15em] text-[#8e9192]">
                    Time Expires In:
                  </span>
                  <span
                    className={`font-mono font-bold text-xs ${timeLeft < 30 ? "text-[#ffb4ab] animate-pulse" : "text-[#5ddda1]"}`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResendDisabled}
                  className={`text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                    isResendDisabled
                      ? "text-[#8e9192] opacity-40 cursor-not-allowed no-underline"
                      : "text-[#5ddda1] underline hover:text-white cursor-pointer"
                  }`}
                >
                  {combinedLoadingState && isSubmitting
                    ? "Dispatching..."
                    : "Resend code"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleOtpSubmit}
                disabled={combinedLoadingState || timeLeft === 0}
                className={`w-full py-3.5 bg-[#5ddda1] text-[#003823] rounded-none font-bold text-xs tracking-[0.2em] uppercase hover:bg-[#08a56e] transition-all shadow-xl flex items-center justify-center gap-2.5 min-h-[46px] ${timeLeft === 0 ? "opacity-40 cursor-not-allowed bg-gray-600" : "cursor-pointer"}`}
              >
                {combinedLoadingState && (
                  <div className="w-4 h-4 border-2 border-[#003823] border-t-transparent rounded-none animate-spin"></div>
                )}
                {combinedLoadingState ? "Validating Code..." : "Verify Code"}
              </button>
            </div>
          )}

          {/* D. ANIMATED ACCOUNT VERIFIED SUCCESS SCREEN WITH ROUNDED GREEN CIRCLE AND WHITE TICK */}
          {authState === "verified" && (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-12">
              <div className="w-20 h-20 rounded-full bg-[#08a56e] flex items-center justify-center shadow-[0_0_30px_rgba(93,221,161,0.4)] animate-scale-circle">
                <svg
                  className="w-10 h-10 text-white animate-check-tick"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <h2 className="font-serif text-xl font-bold tracking-tight text-[#5ddda1] uppercase">
                  Identity Verified
                </h2>
                <p className="text-xs text-[#c4c7c7] max-w-xs font-sans leading-relaxed">
                  Your account credentials have been authorized successfully.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3 text-[9px] text-[#8e9192] font-mono uppercase tracking-[0.25em]">
                <span className="inline-block w-2 h-2 rounded-none bg-[#5ddda1] animate-ping"></span>
                Establishing secure session...
              </div>
            </div>
          )}
        </div>

        {/* RIGHT BLOCK PANEL: RESTORED HIGH-DEF ARCHITECTURAL FEED IMAGE */}
        <div className="hidden md:block relative bg-[#0e0e0e] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=90')`,
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/50 to-transparent"></div>
          <div className="absolute bottom-10 left-10 right-10 text-[#e5e2e1] z-10 space-y-3">
            <span className="text-[9px] font-bold tracking-[0.3em] text-[#5ddda1] uppercase">
              Curated Excellence
            </span>
            <h3 className="font-serif text-2xl font-bold tracking-tight uppercase text-[#e5e2e1]">
              Rental Property Feed
            </h3>
            <p className="text-xs text-[#c4c7c7] leading-relaxed font-sans max-w-sm">
              Experience verified structural property listings managed
              dynamically via high-end architecture and role-based permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}