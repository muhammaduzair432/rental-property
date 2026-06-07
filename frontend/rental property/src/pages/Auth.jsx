import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register, verifyOtp, resendOtp, login } from "../store/authSlice.js"; 
import { useNavigate } from "react-router-dom";

export default function Auth() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Dynamic Form States: "login" | "register" | "otp" | "verified"
    const [authState, setAuthState] = useState("login");
    
    // Select the loading status directly from our slice
    const { loading: isSliceLoading } = useSelector((state) => state.auth);

    // Form inputs matching our backend requirements
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [fullname, setFullname] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [otpArray, setOtpArray] = useState(new Array(6).fill(""));

    // ⏱️ Timer States: 2 minutes = 120 seconds matrix limit
    const [timeLeft, setTimeLeft] = useState(120);

    const [uiError, setUiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const otpRefs = useRef([]);

    // 🕒 2-Minute Countdown Timer Loop effect
    useEffect(() => {
        if (authState !== "otp") return;
        if (timeLeft <= 0) return;

        const timerInterval = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [authState, timeLeft]);

    // Format seconds cleanly into MM:SS format layout
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // 1. Submit Login Handler (Bypasses custom hook context matching to eliminate errors)
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setUiError("");
        setIsSubmitting(true);

        try {
            await dispatch(login({ email, password })).unwrap();
            setIsSubmitting(false);
            // Dynamic redirection push to role-based system view!
            navigate("/dashboard");
        } catch (error) {
            setIsSubmitting(false);
            const errorText = typeof error === 'string' ? error : error?.message || "Invalid credentials. Please check parameters.";
            setUiError(errorText);
        }
    };

    // 2. Submit Registration Handler (Assembles JavaScript FormData for Multer)
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setUiError("");
        setIsSubmitting(true);

        const dataPayload = new FormData();
        dataPayload.append("username", username);
        dataPayload.append("email", email);
        dataPayload.append("password", password);
        dataPayload.append("fullname", fullname);
        if (avatar) {
            dataPayload.append("avatar", avatar);
        }

        try {
            await dispatch(registerUser(dataPayload)).unwrap();
            
            setTimeout(() => {
                setIsSubmitting(false);
                setTimeLeft(120); // Sync to 2 minutes
                setAuthState("otp");
            }, 150);
        } catch (error) {
            const errorText = typeof error === 'string' ? error : error?.message || "Registration failed.";
            setUiError(errorText);
            setIsSubmitting(false);
        }
    };

    // 3. Submit OTP Handler (Transitions smoothly to Success Screen View)
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
            }, 3200);

        } catch (error) {
            const errorText = typeof error === 'string' ? error : error?.message || "Invalid or expired code.";
            setUiError(errorText);
            setIsSubmitting(false);
        }
    };

    // 4. Reset/Resend Code Operational Handler Trigger (CONNECTED TO REDUX)
    const handleResendCode = async () => {
        if (timeLeft > 0) return;

        setUiError("");
        setIsSubmitting(true);
        try {
            await dispatch(resendOtp({ email })).unwrap();
            setTimeLeft(120); // Refresh countdown matrix state parameters back to 2 full minutes
            setOtpArray(new Array(6).fill(""));
        } catch (error) {
            const errorText = typeof error === 'string' ? error : error?.message || "Failed to resend authentication token.";
            setUiError(errorText);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 5. OTP Sequential Focus Management
    const handleOtpChange = (value, index) => {
        const updatedOtp = [...otpArray];
        updatedOtp[index] = value.slice(-1);
        setOtpArray(updatedOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otpArray[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    const combinedLoadingState = isSubmitting || isSliceLoading;

    // Derived UX state calculating whether the resend path must stay disabled
    const isResendDisabled = combinedLoadingState || timeLeft > 0;

    return (
        <div className="min-h-[calc(100vh-37px)] w-full bg-[#f9f9ff] text-[#151c27] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-5xl bg-white rounded-md border border-[#e2e8f8] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">

                {/* LEFT BLOCK PANEL: DYNAMIC INTERACTIVE CORE FORMS CONTAINER */}
                <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-white animate-fadeIn">
                    
                    {authState !== "verified" && (
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold tracking-widest text-[#7d8497] uppercase">RENTAL PROPERTY</span>
                            <h1 className="text-2xl font-bold tracking-tight text-[#151c27] uppercase">
                                {authState === "login" && "Welcome Back"}
                                {authState === "register" && "Create Account"}
                                {authState === "otp" && "Enter Code"}
                            </h1>
                            <p className="text-xs text-[#45464c]">
                                {authState === "login" && "Enter your email and password to log in."}
                                {authState === "register" && "Fill out your details to sign up for an account."}
                                {authState === "otp" && "We sent a 6-digit verification code to your email inbox."}
                            </p>
                        </div>
                    )}

                    {uiError && authState !== "verified" && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium animate-shake">
                            {uiError}
                        </div>
                    )}

                    {/* A. LOGIN INTERFACE FORM GRID */}
                    {authState === "login" && (
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#45464c] mb-1">Email </label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="enter email" className="w-full text-sm border border-[#e2e8f8] px-3 py-2 bg-[#f9f9ff] rounded-md focus:outline-none focus:border-[#151c27] transition-colors" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#45464c] mb-1">Password </label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="enter password" className="w-full text-sm border border-[#e2e8f8] px-3 py-2 bg-[#f9f9ff] rounded-md focus:outline-none focus:border-[#151c27] transition-colors" />
                            </div>
                            <button type="submit" disabled={combinedLoadingState} className="w-full py-2.5 bg-[#151c27] text-white rounded font-medium text-xs tracking-wider uppercase hover:bg-black transition-all shadow-sm cursor-pointer">
                                {combinedLoadingState ? "Processing..." : "login"}
                            </button>
                            <div className="text-center pt-2">
                                <span className="text-xs text-[#45464c]">Don't have an account? </span>
                                <button type="button" onClick={() => setAuthState("register")} className="text-xs font-bold underline text-[#151c27] hover:opacity-80 cursor-pointer">Register Here</button>
                            </div>
                        </form>
                    )}

                    {/* B. MULTI-PART FILES REGISTER FORM GRID */}
                    {authState === "register" && (
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#45464c] mb-1">Username </label>
                                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="username" className="w-full text-sm border border-[#e2e8f8] px-3 py-1.5 bg-[#f9f9ff] rounded-md focus:outline-none focus:border-[#151c27]" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#45464c] mb-1">Full Name</label>
                                    <input type="text" value={fullname} onChange={(e) => setFullname(e.target.value)} required placeholder="full name" className="w-full text-sm border border-[#e2e8f8] px-3 py-1.5 bg-[#f9f9ff] rounded-md focus:outline-none focus:border-[#151c27]" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#45464c] mb-1">Email </label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="enter email" className="w-full text-sm border border-[#e2e8f8] px-3 py-1.5 bg-[#f9f9ff] rounded-md focus:outline-none focus:border-[#151c27]" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#45464c] mb-1">Password </label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="enter password" className="w-full text-sm border border-[#e2e8f8] px-3 py-1.5 bg-[#f9f9ff] rounded-md focus:outline-none focus:border-[#151c27]" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#45464c] mb-1">Profile Image Avatar File Buffer</label>
                                <input type="file" onChange={(e) => setAvatar(e.target.files[0])} accept="image/*" className="w-full text-xs text-[#45464c] file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#151c27] file:text-white file:cursor-pointer hover:file:bg-black" />
                            </div>
                            <button type="submit" disabled={combinedLoadingState} className="w-full py-2.5 bg-[#151c27] text-white rounded font-medium text-xs tracking-wider uppercase hover:bg-black transition-all shadow-sm cursor-pointer">
                                {combinedLoadingState ? "Registering..." : "Register "}
                            </button>
                            <div className="text-center pt-1">
                                <span className="text-xs text-[#45464c]">Already registered? </span>
                                <button type="button" onClick={() => setAuthState("login")} className="text-xs font-bold underline text-[#151c27] hover:opacity-80 cursor-pointer"> Login</button>
                            </div>
                        </form>
                    )}

                    {/* C. 6-DIGIT OTP FIELDS + COUNTDOWN TIMER WIDGET */}
                    {authState === "otp" && (
                        <div className="space-y-6">
                            <div className="flex justify-between gap-2">
                                {otpArray.map((digit, i) => (
                                    <input
                                        key={i}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        ref={(el) => (otpRefs.current[i] = el)}
                                        onChange={(e) => handleOtpChange(e.target.value, i)}
                                        onKeyDown={(e) => handleOtpKeyDown(e, i)}
                                        className="w-10 h-12 text-center text-lg font-bold border border-[#e2e8f8] bg-[#f9f9ff] rounded-md focus:outline-none focus:border-[#151c27] transition-colors"
                                        disabled={combinedLoadingState || timeLeft === 0}
                                    />
                                ))}
                            </div>

                            {/* ⏱️ Dynamic Visual Countdown Layout Node */}
                            <div className="flex items-center justify-between text-xs px-1">
                                <div className="flex items-center gap-1.5 font-medium text-gray-500">
                                    <span>Code expires in:</span>
                                    <span className={`font-mono font-bold ${timeLeft < 30 ? "text-red-500 animate-pulse" : "text-[#151c27]"}`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={handleResendCode}
                                    disabled={isResendDisabled}
                                    className={`text-xs font-bold uppercase tracking-wide transition-all duration-300 ${
                                        isResendDisabled 
                                        ? "text-gray-300 opacity-40 cursor-not-allowed no-underline" 
                                        : "text-[#151c27] underline hover:opacity-80 cursor-pointer"
                                    }`}
                                >
                                    {combinedLoadingState && isSubmitting ? "Sending..." : "Resend OTP"}
                                </button>
                            </div>

                            <button 
                                type="button" 
                                onClick={handleOtpSubmit}
                                disabled={combinedLoadingState || timeLeft === 0} 
                                className={`w-full py-2.5 bg-[#151c27] text-white rounded font-medium text-xs tracking-wider uppercase hover:bg-black transition-all shadow-sm flex items-center justify-center min-h-[42px] ${timeLeft === 0 ? "opacity-40 cursor-not-allowed bg-gray-400" : "cursor-pointer"}`}
                            >
                                {combinedLoadingState ? "Verifying..." : "Verify otp"}
                            </button>
                        </div>
                    )}

                    {/* D. ANIMATED ACCOUNT VERIFIED SUCCESS SCREEN WITH SIMPLIFIED TEXT */}
                    {authState === "verified" && (
                        <div className="flex flex-col items-center justify-center text-center space-y-6 py-8 animate-fadeIn">
                            <div className="w-20 h-20 flex items-center justify-center">
                                <svg className="success-circle-wrapper w-16 h-16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                                    <circle className="animate-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                                    <path className="animate-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                                </svg>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-xl font-bold tracking-tight text-[#10b981] uppercase">Account Verified!</h2>
                                <p className="text-xs text-[#45464c] max-w-xs font-medium">
                                    Your account has been created successfully.
                                </p>
                            </div>

                            <div className="pt-4 flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#151c27] animate-ping"></span>
                                Taking you to login page...
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT BLOCK PANEL: THEME ART SIDE PANEL IMAGE VISUAL DISPLAY GRID */}
                <div className="hidden md:block relative bg-[#e7eefe]">
                    <div className="absolute inset-0 bg-cover bg-center mix-blend-multiply opacity-90" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80')` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141b2b] via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-8 left-8 right-8 text-white z-10 space-y-2">
                        <span className="text-[9px] font-bold tracking-widest text-gray-300 uppercase">Premium Spaces Feed</span>
                        <h3 className="text-lg font-bold tracking-tight uppercase">Rental Property </h3>
                        <p className="text-xs text-gray-300 leading-relaxed font-light">Experience verified structural property listings managed dynamically via role-based access loops.</p>
                    </div>
                </div>

            </div>
        </div>
    );
}