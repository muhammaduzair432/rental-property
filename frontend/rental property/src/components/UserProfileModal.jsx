import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, clearProfileState } from "../store/profileSlice.js";

export default function UserProfileModal({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { loading, error, successMessage } = useSelector((state) => state.profile || {});

    const [isEditing, setIsEditing] = useState(false);

    // Form inputs state
    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState(""); // 🔑 Added Password State
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    // Synchronize inputs with user Redux state whenever modal opens
    useEffect(() => {
        if (user && isOpen) {
            setFullname(user.fullname || user.name || "");
            setUsername(user.username || "");
            setEmail(user.email || "");
            setPhone(user.phone || user.phoneNumber || "");
            setPassword(""); // Keep password field empty by default for security
            setAvatarPreview(user.avatar || "");
        }
    }, [user, isOpen]);

    // Reset component and clear Redux alerts when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setIsEditing(false);
            setAvatarFile(null);
            setPassword("");
            dispatch(clearProfileState());
        } else {
            dispatch(clearProfileState());
        }
    }, [isOpen, dispatch]);

    if (!isOpen || !user) return null;

    // Handle avatar image selection and create instant visual preview
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // Toggle into Edit Mode cleanly
    const handleStartEditing = () => {
        dispatch(clearProfileState()); // Clears any leftover success/error messages
        setIsEditing(true);
    };

    // Cancel Edit Mode
    const handleCancelEditing = () => {
        dispatch(clearProfileState());
        setIsEditing(false);
        setPassword("");
        setAvatarPreview(user.avatar || "");
        setAvatarFile(null);
    };

    // Submit Updated Form Data to API: router.route("/update-profile").put(verifyJwt, uploadfile.single("avatar"), updateProfile)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("fullname", fullname);
        formData.append("username", username);
        formData.append("email", email);
        if (phone) formData.append("phone", phone);
        if (password) formData.append("password", password); // 🔑 Appends password if user entered a new one
        if (avatarFile) {
            formData.append("avatar", avatarFile); // Matches uploadfile.single("avatar")
        }

        const result = await dispatch(updateUserProfile(formData));
        if (updateUserProfile.fulfilled.match(result)) {
            setIsEditing(false);
            setPassword("");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            
            {/* Modal Container */}
            <div className="bg-white border border-[#e2e8f8] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">
                
                {/* Header */}
                <div className="bg-[#151c27] text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">👤</span>
                        <h3 className="text-xs font-black uppercase tracking-widest">
                            {isEditing ? "Edit Account Profile" : "User Profile Details"}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-sm font-bold p-1 cursor-pointer transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* System Feedback Badges */}
                {successMessage && !isEditing && (
                    <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                        <span>✅</span> {successMessage}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-800 border-b border-red-200 px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* 🛡️ CONDITIONALLY RENDERED FORM: Only active when editing */}
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                        
                        {/* Body Content (Edit Inputs) */}
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
                            
                            {/* Avatar Display / Camera Overlay */}
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="relative group">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="User Avatar"
                                            className="w-24 h-24 rounded-full border-2 border-[#151c27] object-cover shadow-md"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full border-2 border-[#151c27] bg-blue-50 flex items-center justify-center shadow-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-12 h-12">
                                                <circle cx="12" cy="8" r="4" fill="#3B82F6" />
                                                <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" fill="#3B82F6" />
                                            </svg>
                                        </div>
                                    )}

                                    <label className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white cursor-pointer opacity-90 hover:opacity-100 transition-opacity">
                                        <span className="text-xl">📷</span>
                                        <span className="text-[8px] font-bold uppercase tracking-wider">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="text-center">
                                    <span className="inline-block bg-[#151c27] text-white px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                        Role: {user.role || "user"}
                                    </span>
                                </div>
                            </div>

                            {/* Edit Mode Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        required
                                        className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold uppercase text-[#7d8497] block mb-1">
                                        New Password <span className="text-gray-400 font-normal">(Leave blank to keep current)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full text-xs p-2.5 border border-[#e2e8f8] rounded-lg font-bold text-[#151c27] focus:outline-none focus:border-[#151c27]"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Footer Action Buttons (Edit Mode) */}
                        <div className="bg-[#f9f9ff] border-t border-[#e2e8f8] px-6 py-4 flex items-center justify-between gap-3 mt-auto">
                            <button
                                type="button"
                                onClick={handleCancelEditing}
                                disabled={loading}
                                className="px-4 py-2 bg-white border border-[#e2e8f8] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-5 py-2 bg-[#151c27] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-all cursor-pointer flex items-center gap-2 shadow-xs disabled:opacity-50"
                            >
                                {loading && (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                    </form>
                ) : (
                    /* VIEW MODE (Non-Form Container) */
                    <div className="flex flex-col flex-1 overflow-hidden">
                        
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
                            
                            {/* Avatar Display */}
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="User Avatar"
                                            className="w-24 h-24 rounded-full border-2 border-[#151c27] object-cover shadow-md"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full border-2 border-[#151c27] bg-blue-50 flex items-center justify-center shadow-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-12 h-12">
                                                <circle cx="12" cy="8" r="4" fill="#3B82F6" />
                                                <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" fill="#3B82F6" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center">
                                    <span className="inline-block bg-[#151c27] text-white px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                        Role: {user.role || "user"}
                                    </span>
                                </div>
                            </div>

                            {/* View Mode Card */}
                            <div className="space-y-3 bg-[#f9f9ff] p-4 rounded-xl border border-[#e2e8f8]">
                                <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-2">
                                    <span className="text-[10px] font-bold uppercase text-[#7d8497]">Full Name</span>
                                    <span className="text-xs font-bold text-[#151c27]">{user.fullname || user.name || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-2">
                                    <span className="text-[10px] font-bold uppercase text-[#7d8497]">Username</span>
                                    <span className="text-xs font-bold text-[#151c27]">@{user.username || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-2">
                                    <span className="text-[10px] font-bold uppercase text-[#7d8497]">Email Address</span>
                                    <span className="text-xs font-bold text-[#151c27]">{user.email || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#e2e8f8] pb-2">
                                    <span className="text-[10px] font-bold uppercase text-[#7d8497]">Phone Number</span>
                                    <span className="text-xs font-bold text-[#151c27]">{user.phone || user.phoneNumber || "Not Specified"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold uppercase text-[#7d8497]">Password</span>
                                    <span className="text-xs font-bold text-[#151c27]">••••••••••••</span>
                                </div>
                            </div>

                        </div>

                        {/* Footer Action Buttons (View Mode) */}
                        <div className="bg-[#f9f9ff] border-t border-[#e2e8f8] px-6 py-4 flex items-center justify-between gap-3 mt-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 bg-white border border-[#e2e8f8] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleStartEditing}
                                className="px-5 py-2 bg-[#151c27] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                            >
                                ✏️ Edit Profile
                            </button>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}