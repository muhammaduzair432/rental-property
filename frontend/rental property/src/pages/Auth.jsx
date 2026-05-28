import React, { useState, useRef } from "react";
import { useAuthActions } from "../hooks/useAuthActions.js"; // Custom hook for auth action simulations


export default function Auth() {
    // Tab States: "login" | "register" | "otp"
    const [authState, setAuthState] = useState("login");
    const { login, register } = useAuthActions();

    // Form inputs matching our backend requirements
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [fullname, setFullname] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [otpArray, setOtpArray] = useState(new Array(6).fill(""));

    const [uiError, setUiError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const otpRefs = useRef([]);

    // 1. Submit Login Handler
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setUiError("");
        setIsSubmitting(true);

        const result = await login({ email, password });
        setIsSubmitting(false);
        if (!result.success) {
            setUiError("Invalid credentials string. Please check parameters.");
        }
    };

    // 2. Submit Registration Handler (Assembles JavaScript FormData for Multer)
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setUiError("");
        
        // if (!avatar) {
        //     setUiError("Please select an avatar profile picture to upload.");
        //     return;
        // }

        setIsSubmitting(true);
        const dataPayload = new FormData();
        dataPayload.append("username", username);
        dataPayload.append("email", email);
        dataPayload.append("password", password);
        dataPayload.append("fullname", fullname);
        dataPayload.append("avatar", avatar); // Holds file binary buffer

        const result = await register(dataPayload);
        setIsSubmitting(false);

        if (result.success) {
            setAuthState("otp"); // Pivot form container context directly to token verify state
        } else {
            setUiError("Registration failed. Account might already exist.");
        }
    };

    // 3. OTP Sequential Input Logic
    const handleOtpChange = (value, index) => {
        const updatedOtp = [...otpArray];
        updatedOtp[index] = value.slice(-1);
        setOtpArray(updatedOtp);

        // Shift focus forward if entry field is populated
        if (value && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otpArray[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    return (
        <div className="min-h-[calc(100vh-37px)] w-full bg-[#f9f9ff] text-[#151c27] flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-5xl bg-white rounded-md border border-[#e2e8f8] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
                
                {/* LEFT BLOCK PANEL: DYNAMIC INTERACTIVE CORE FORMS CONTAINER */}
                <div className="p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-white animate-fadeIn">
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold tracking-widest text-[#7d8497] uppercase">RENTAL PROPERTY</span>
                        <h1 className="text-2xl font-bold tracking-tight text-[#151c27] uppercase">
                            {authState === "login" && "Welcome Back"}
                            {authState === "register" && "Create Account"}
                            {authState === "otp" && "Verify Security Token"}
                        </h1>
                        <p className="text-xs text-[#45464c]">
                            {authState === "login" && "Enter your parameters to access your dashboard channels."}
                            {authState === "register" && "Stage your identity credentials into our cluster database."}
                            {authState === "otp" && "Input the 6-digit verification code forwarded to your mailbox."}
                        </p>
                    </div>

                    {uiError && (
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
                            <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-[#151c27] text-white rounded font-medium text-xs tracking-wider uppercase hover:bg-black transition-all shadow-sm">
                                {isSubmitting ? "Processing..." : "login"}
                            </button>
                            <div className="text-center pt-2">
                                <span className="text-xs text-[#45464c]">Don't have an account? </span>
                                <button type="button" onClick={() => setAuthState("register")} className="text-xs font-bold underline text-[#151c27] hover:opacity-80">Register Here</button>
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
                                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#45464c] mb-1">Full  Name</label>
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
                            <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-[#151c27] text-white rounded font-medium text-xs tracking-wider uppercase hover:bg-black transition-all shadow-sm">
                                {isSubmitting ? "Uploading Node Buffers..." : "Register "}
                            </button>
                            <div className="text-center pt-1">
                                <span className="text-xs text-[#45464c]">Already registered? </span>
                                <button type="button" onClick={() => setAuthState("login")} className="text-xs font-bold underline text-[#151c27] hover:opacity-80"> Login</button>
                            </div>
                        </form>
                    )}

                    {/* C. 6-DIGIT NUMERIC SEQUENTIAL OTP FIELD WRAP */}
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
                                    />
                                ))}
                            </div>
                            <button className="w-full py-2.5 bg-[#151c27] text-white rounded font-medium text-xs tracking-wider uppercase hover:bg-black transition-all">
                                Verify Token Sequence
                            </button>
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