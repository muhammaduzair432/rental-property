import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile, clearProfileState } from "../store/profileSlice.js";

export default function UserProfileModal({ isOpen, onClose }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    // 🛡️ Fully Memoized Atomic Selectors
    const loading = useSelector((state) => state.profile?.loading) || false;
    const error = useSelector((state) => state.profile?.error) || null;
    const successMessage = useSelector((state) => state.profile?.successMessage) || null;

    const [isEditing, setIsEditing] = useState(false);

    // Form inputs state
    const [fullname, setFullname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState(""); 
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    // Synchronize inputs with user Redux state whenever modal opens or user updates
    useEffect(() => {
        if (user && isOpen) {
            setFullname(user.fullname || user.fullName || user.name || "");
            setUsername(user.username || "");
            setEmail(user.email || "");
            setPhone(user.phone || user.phoneNumber || "");
            setPassword(""); 
            setAvatarPreview(user.avatar || user.avatarUrl || "");
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

    // Toggle into Edit Mode cleanly & pre-fill fields with latest user data
    const handleStartEditing = () => {
        dispatch(clearProfileState()); 
        if (user) {
            setFullname(user.fullname || user.fullName || user.name || "");
            setUsername(user.username || "");
            setEmail(user.email || "");
            setPhone(user.phone || user.phoneNumber || "");
            setAvatarPreview(user.avatar || user.avatarUrl || "");
        }
        setIsEditing(true);
    };

    // Cancel Edit Mode
    const handleCancelEditing = () => {
        dispatch(clearProfileState());
        setIsEditing(false);
        setPassword("");
        setAvatarPreview(user.avatar || user.avatarUrl || "");
        setAvatarFile(null);
    };

    // Submit Updated Form Data to API
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("fullname", fullname);
        formData.append("username", username);
        formData.append("email", email);
        if (phone) formData.append("phone", phone);
        if (password) formData.append("password", password); 
        if (avatarFile) {
            formData.append("avatar", avatarFile); 
        }

        const result = await dispatch(updateUserProfile(formData));
        if (updateUserProfile.fulfilled.match(result)) {
            setIsEditing(false);
            setPassword("");
            setAvatarFile(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]/85 backdrop-blur-sm p-4 animate-fadeIn">
            
            {/* Modal Container */}
            <div className="bg-[#1c1b1b] border border-[#353535] w-full max-w-md rounded-none shadow-2xl overflow-hidden flex flex-col relative text-[#e5e2e1]">
                
                {/* Header */}
                <div className="bg-[#0e0e0e] border-b border-[#353535] text-[#e5e2e1] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-[#5ddda1]">👤</span>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#e5e2e1]">
                            {isEditing ? "Edit Account Profile" : "User Profile Details"}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#8e9192] hover:text-[#5ddda1] text-xs font-bold p-1 cursor-pointer transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* System Feedback Badges */}
                {successMessage && !isEditing && (
                    <div className="bg-[#083823]/50 text-[#5ddda1] border-b border-[#5ddda1] px-6 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span>✓</span> {successMessage}
                    </div>
                )}
                {error && (
                    <div className="bg-[#1c1b1b] text-[#ffb4ab] border-b border-[#444748] px-6 py-3 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* CONDITIONALLY RENDERED FORM */}
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
                                            className="w-24 h-24 rounded-none border-2 border-[#5ddda1] object-cover shadow-2xl"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-none border-2 border-[#444748] bg-[#0e0e0e] flex items-center justify-center shadow-2xl text-[#5ddda1]">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10 fill-current">
                                                <circle cx="12" cy="8" r="4" />
                                                <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
                                            </svg>
                                        </div>
                                    )}

                                    <label className="absolute inset-0 bg-black/70 rounded-none flex flex-col items-center justify-center text-[#5ddda1] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-lg">📷</span>
                                        <span className="text-[9px] font-bold uppercase tracking-widest mt-1">Upload</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>

                                <div className="text-center">
                                    <span className="inline-block bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] px-3 py-1 rounded-none text-[9px] font-bold uppercase tracking-wider">
                                        role: {user.role || "user"}
                                    </span>
                                </div>
                            </div>

                            {/* Edit Mode Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#5ddda1] block mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={fullname}
                                        onChange={(e) => setFullname(e.target.value)}
                                        required
                                        className="w-full text-xs p-3 border border-[#444748] bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#5ddda1] block mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full text-xs p-3 border border-[#444748] bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#5ddda1] block mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full text-xs p-3 border border-[#444748] bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#5ddda1] block mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full text-xs p-3 border border-[#444748] bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1]"
                                    />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#5ddda1] block mb-1">
                                        New Password <span className="text-[#8e9192] font-normal lowercase">(leave blank to keep current)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full text-xs p-3 border border-[#444748] bg-[#0e0e0e] text-[#e5e2e1] rounded-none focus:outline-none focus:border-[#5ddda1]"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Footer Action Buttons (Edit Mode) */}
                        <div className="bg-[#0e0e0e] border-t border-[#353535] px-6 py-4 flex items-center justify-between gap-3 mt-auto">
                            <button
                                type="button"
                                onClick={handleCancelEditing}
                                disabled={loading}
                                className="px-5 py-3 bg-[#1c1b1b] border border-[#444748] text-xs font-bold uppercase tracking-widest text-[#e5e2e1] hover:bg-[#353535] transition-all cursor-pointer rounded-none"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-[#5ddda1] text-[#003823] text-xs font-bold uppercase tracking-widest rounded-none hover:bg-[#08a56e] transition-all cursor-pointer flex items-center gap-2 shadow-xl disabled:opacity-40"
                            >
                                {loading && (
                                    <div className="w-3.5 h-3.5 border-2 border-[#003823] border-t-transparent rounded-none animate-spin"></div>
                                )}
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                    </form>
                ) : (
                    /* VIEW MODE */
                    <div className="flex flex-col flex-1 overflow-hidden">
                        
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto max-h-[70vh]">
                            
                            {/* Avatar Display */}
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="User Avatar"
                                            className="w-24 h-24 rounded-none border-2 border-[#5ddda1] object-cover shadow-2xl"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-none border-2 border-[#444748] bg-[#0e0e0e] flex items-center justify-center shadow-2xl text-[#5ddda1]">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10 fill-current">
                                                <circle cx="12" cy="8" r="4" />
                                                <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center">
                                    <span className="inline-block bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] px-3 py-1 rounded-none text-[9px] font-bold uppercase tracking-wider">
                                        role: {user.role || "user"}
                                    </span>
                                </div>
                            </div>

                            {/* View Mode Details Card */}
                            <div className="space-y-3 bg-[#0e0e0e] p-5 rounded-none border border-[#353535]">
                                <div className="flex justify-between items-center border-b border-[#353535] pb-3">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192]">Full Name</span>
                                    <span className="text-xs font-bold text-[#e5e2e1]">{user.fullname || user.fullName || user.name || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#353535] pb-3">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192]">Username</span>
                                    <span className="text-xs font-bold text-[#e5e2e1]">@{user.username || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#353535] pb-3">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192]">Email Address</span>
                                    <span className="text-xs font-bold text-[#e5e2e1]">{user.email || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-[#353535] pb-3">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192]">Phone Number</span>
                                    <span className="text-xs font-bold text-[#e5e2e1]">{user.phone || user.phoneNumber || "Not Specified"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192]">Password</span>
                                    <span className="text-xs font-bold text-[#e5e2e1]">••••••••••••</span>
                                </div>
                            </div>

                        </div>

                        {/* Footer Action Buttons (View Mode) */}
                        <div className="bg-[#0e0e0e] border-t border-[#353535] px-6 py-4 flex items-center justify-between gap-3 mt-auto">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-3 bg-[#1c1b1b] border border-[#444748] text-xs font-bold uppercase tracking-widest text-[#e5e2e1] hover:bg-[#353535] transition-all cursor-pointer rounded-none"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                onClick={handleStartEditing}
                                className="px-6 py-3 bg-[#5ddda1] text-[#003823] text-xs font-bold uppercase tracking-widest rounded-none hover:bg-[#08a56e] transition-all cursor-pointer flex items-center gap-2 shadow-xl"
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