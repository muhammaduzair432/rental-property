import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { logoutSuccess } from "../store/authSlice.js";
import api from "../utils/api.js"; // Import the API utility for making requests
import UserDashboard from "../components/UserDashboard.jsx";

export default function DashBoardLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const getProperties = async () => {
        const response = await api.get("/browse");
        console.log(response.data);
    }
    
    // States for Search query inputs
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    const handleSystemLogout = () => {
        dispatch(logoutSuccess());
        navigate("/auth");
    };

    return (
        <div className="min-h-screen w-full bg-[#f9f9ff] text-[#151c27] flex flex-col antialiased font-sans">
            
            {/* 🌐 NAV BAR SECTION */}
            <nav className="w-full bg-white border-b border-[#e2e8f8] shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    
                    {/* Left: Brand Logo */}
                    <div className="flex flex-col space-y-0.5 min-w-max">
                        <span className="text-[10px] font-bold tracking-widest text-[#7d8497] uppercase">RENTAL PROPERTY</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#151c27]">Dashboard</span>
                    </div>

                    {/* Middle Left: Integrated Search & Filter Controls */}
                    <div className="hidden md:flex items-center flex-1 max-w-md mx-4 border border-[#e2e8f8] rounded-md bg-[#f9f9ff] px-3 py-1.5 gap-2">
                        <input 
                            type="text" 
                            placeholder="Search properties..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent text-xs w-full focus:outline-none text-[#151c27]"
                        />
                        <span className="text-gray-300">|</span>
                        <select 
                            value={selectedFilter}
                            onChange={(e) => setSelectedFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-[#7d8497] cursor-pointer focus:outline-none"
                        >
                            <option value="all">All Types</option>
                            <option value="house">House</option>
                            <option value="apartment">Apartment</option>
                            <option value="villa">Luxury Villa</option>
                        </select>
                    </div>

                    {/* Middle Right: Navigation Menus & Role */}
                    <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-[#7d8497]">
                        <span className="text-[#151c27] border-b-2 border-[#151c27] py-2 cursor-pointer">Browse</span>
                        <span className="hover:text-[#151c27] cursor-pointer transition-colors">My Bookings</span>
                        <span className="hover:text-[#151c27] cursor-pointer transition-colors">Favourites</span>
                        <span className="bg-[#151c27] text-white px-2.5 py-1 rounded text-[9px] lowercase tracking-normal">
                            role: {user.role}
                        </span>
                    </div>

                    {/* Right: User Profile Stack & Logout */}
                    <div className="flex items-center space-x-4 min-w-max">
                        <div className="flex flex-col text-right justify-center">
                            <span className="text-xs font-bold text-[#151c27]">{user.fullname || user.username}</span>
                            <span className="text-[9px] font-medium text-[#7d8497]">{user.email}</span>
                        </div>
                        
                        {/* Conditional Avatar System: Shows avatar if uploaded, otherwise absolutely blank gray box */}
                        {user.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-md border border-[#e2e8f8] object-cover" />
                        ) : (
                            <div className="w-9 h-9 rounded-md bg-gray-200 border border-[#e2e8f8] flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                                --
                            </div>
                        )}

                        <button 
                            onClick={handleSystemLogout}
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 border border-[#e2e8f8] text-[#151c27] bg-[#f9f9ff] rounded-md hover:bg-black hover:text-white transition-all cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>

                </div>
            </nav>

            {/* 📺 BODY MAIN CONTENT SECTION */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {user.role === "user" ? (
                <UserDashboard searchQuery={searchQuery} selectedFilter={selectedFilter} />
                ) : (
                    <div className="bg-white p-8 rounded-md border border-[#e2e8f8] text-center text-xs font-bold uppercase tracking-wider text-gray-400">
                        Please sign in with a standard User account to view this directory stream.
                    </div>
                )}
            </main>

            {/* 📝 FOOTER SECTION */}
            <footer className="w-full bg-white border-t border-[#e2e8f8] mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-[#7d8497]">
                    <div>
                        &copy; {new Date().getFullYear()} Rental Property Platform. Secure Database Connection Configured.
                    </div>
                    <div className="flex space-x-6">
                        <span className="hover:text-[#151c27] cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-[#151c27] cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-[#151c27] cursor-pointer transition-colors">Contact Support</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}