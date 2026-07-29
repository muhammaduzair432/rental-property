import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { logoutSuccess } from "../store/authSlice.js";
import UserDashboard from "../components/UserDashboard.jsx";
import UserProfileModal from "../components/UserProfileModal.jsx";
import AddPropertyForm from "../components/AddPropertyForm.jsx";
import OwnerDashboardHome from "../components/OwnerDashboardHome.jsx"; 
import OwnerPropertiesList from "../components/OwnerPropertiesList.jsx"; 
import OwnerEarningsPage from "../components/OwnerEarningsPage.jsx";
import OwnerReviewsPage from "../components/OwnerReviewsPage.jsx";
import NotificationBell from "../components/NotificationBell.jsx";

// 🛡️ Admin Components Import
import AdminHomeFeed from "../components/admin/AdminHomeFeed.jsx";
import AdminUsersDirectory from "../components/admin/AdminUsersDirectory.jsx";
import AdminReportsPage from "../components/admin/AdminReportsPage.jsx";
import AdminReviewsModeration from "../components/admin/AdminReviewsModeration.jsx";
import AdminSystemLogs from "../components/admin/AdminSystemLogs.jsx";

export default function DashBoardLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // 🛡️ Memoized Selector (Prevents anonymous object reference warning)
    const user = useSelector((state) => state.auth?.user);

    // States for Search query inputs (User View)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");

    // Price Range States (User View)
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(Infinity);
    const [sliderMax, setSliderMax] = useState(50000); 
    const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);

    // Internal View Tab States for Roles
    const [ownerActiveTab, setOwnerActiveTab] = useState("home");
    const [adminActiveTab, setAdminActiveTab] = useState("home");

    // User Profile Pop-up Modal State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    const handleSystemLogout = () => {
        dispatch(logoutSuccess());
        navigate("/auth");
    };

    const handleSliderChange = (e) => {
        const val = Number(e.target.value);
        setMaxPrice(val);
    };

    const resetPriceFilter = () => {
        setMinPrice(0);
        setMaxPrice(Infinity);
    };

    const applyPreset = (max) => {
        setMinPrice(0);
        setMaxPrice(max);
        if (max !== Infinity && max > sliderMax) {
            setSliderMax(max);
        }
    };

    const isFilteredActive = minPrice > 0 || maxPrice !== Infinity;
    const isOwner = user?.role === "owner";
    const isAdmin = user?.role === "admin";

    return (
        <div className="min-h-screen w-full bg-[#131313] text-[#e5e2e1] flex flex-col antialiased font-sans selection:bg-[#5ddda1]/30 selection:text-black">
            
            {/* 👤 USER PROFILE POP-UP MODAL */}
            <UserProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />

            {/* 🌐 NAV BAR SECTION */}
            <nav className="w-full bg-[#080808]/80 backdrop-blur-md border-b border-[#353535] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    
                    {/* Left: Brand Logo */}
                    <div 
                        onClick={() => navigate("/dashboard")} 
                        className="flex flex-col space-y-0.5 min-w-max cursor-pointer"
                    >
                        <span className="text-[10px] font-bold tracking-[0.2em] text-[#c4c7c7] uppercase">ESTATE ARCHIVE</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#5ddda1]">
                            {isAdmin ? "Admin Portal" : isOwner ? "Owner Portal" : "Dashboard"}
                        </span>
                    </div>

                    {/* Middle Section: Dynamic Navigation based on Role */}
                    {!isAdmin && !isOwner ? (
                        <div className="hidden md:flex items-center flex-1 max-w-xl mx-4 border border-[#444748] rounded-none bg-[#1c1b1b] px-3 py-1.5 gap-2 relative">
                            <input 
                                type="text" 
                                placeholder="Search properties..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent text-xs w-full focus:outline-none text-[#e5e2e1] placeholder:text-[#8e9192]"
                            />
                            <span className="text-[#444748]">|</span>
                            
                            <select 
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7] cursor-pointer focus:outline-none shrink-0"
                            >
                                <option value="all" className="bg-[#1c1b1b]">All Types</option>
                                <option value="house" className="bg-[#1c1b1b]">House</option>
                                <option value="apartment" className="bg-[#1c1b1b]">Apartment</option>
                                <option value="villa" className="bg-[#1c1b1b]">Luxury Villa</option>
                            </select>

                            <span className="text-[#444748]">|</span>

                            <div className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-none transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isFilteredActive
                                            ? "bg-[#5ddda1] text-[#003823]"
                                            : "text-[#c4c7c7] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
                                    }`}
                                >
                                    <span>💵</span>
                                    <span>
                                        {maxPrice === Infinity 
                                            ? minPrice > 0 ? `> $${minPrice}` : "Any Price" 
                                            : `$${minPrice} - $${maxPrice}`}
                                    </span>
                                    <span className="text-[8px]">{isPriceFilterOpen ? "▲" : "▼"}</span>
                                </button>

                                {isPriceFilterOpen && (
                                    <div className="absolute top-10 right-0 w-80 bg-[#1c1b1b] border border-[#444748] rounded-none shadow-2xl p-4 space-y-4 z-50">
                                        <div className="flex justify-between items-center border-b border-[#444748] pb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5e2e1]">
                                                Price Filter
                                            </span>
                                            {isFilteredActive && (
                                                <button 
                                                    onClick={resetPriceFilter}
                                                    className="text-[9px] text-[#ffb4ab] font-bold uppercase hover:underline cursor-pointer"
                                                >
                                                    Reset All
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[8px] font-bold uppercase text-[#c4c7c7] block">Quick Presets</span>
                                            <div className="grid grid-cols-4 gap-1">
                                                <button onClick={() => applyPreset(1000)} className="px-2 py-1 text-[9px] font-bold bg-[#0e0e0e] hover:bg-[#2a2a2a] border border-[#444748] rounded-none text-[#e5e2e1] cursor-pointer">&lt; $1k</button>
                                                <button onClick={() => applyPreset(5000)} className="px-2 py-1 text-[9px] font-bold bg-[#0e0e0e] hover:bg-[#2a2a2a] border border-[#444748] rounded-none text-[#e5e2e1] cursor-pointer">&lt; $5k</button>
                                                <button onClick={() => applyPreset(15000)} className="px-2 py-1 text-[9px] font-bold bg-[#0e0e0e] hover:bg-[#2a2a2a] border border-[#444748] rounded-none text-[#e5e2e1] cursor-pointer">&lt; $15k</button>
                                                <button onClick={() => applyPreset(Infinity)} className="px-2 py-1 text-[9px] font-bold bg-[#5ddda1] text-[#003823] rounded-none cursor-pointer">Any</button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1">
                                            <div className="flex-1">
                                                <label className="text-[8px] font-bold uppercase text-[#c4c7c7] block mb-1">Min Price ($)</label>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                                                    className="w-full text-xs p-2 border border-[#444748] bg-[#0e0e0e] rounded-none font-bold text-[#e5e2e1] focus:outline-none"
                                                />
                                            </div>
                                            <span className="text-[#8e9192] self-end pb-2 font-bold">-</span>
                                            <div className="flex-1">
                                                <label className="text-[8px] font-bold uppercase text-[#c4c7c7] block mb-1">Max Price ($)</label>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={maxPrice === Infinity ? "" : maxPrice}
                                                    placeholder="Unlimited"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setMaxPrice(val === "" ? Infinity : Number(val));
                                                    }}
                                                    className="w-full text-xs p-2 border border-[#444748] bg-[#0e0e0e] rounded-none font-bold text-[#e5e2e1] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-2">
                                            <div className="flex justify-between text-[9px] font-bold text-[#c4c7c7] uppercase">
                                                <span>$0</span>
                                                <span className="text-[#5ddda1]">Max Cap: {maxPrice === Infinity ? "Unlimited" : `$${maxPrice}`}</span>
                                                <span>${sliderMax.toLocaleString()}</span>
                                            </div>
                                            <input 
                                                type="range"
                                                min="0"
                                                max={sliderMax}
                                                step="250"
                                                value={maxPrice === Infinity ? sliderMax : maxPrice}
                                                onChange={handleSliderChange}
                                                className="w-full h-2 bg-[#2a2a2a] rounded-none appearance-none cursor-pointer accent-[#5ddda1]"
                                            />
                                        </div>

                                        <button 
                                            onClick={() => setIsPriceFilterOpen(false)}
                                            className="w-full py-2 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer"
                                        >
                                            Apply Filter
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : isAdmin ? (
                        <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7]">
                            <span onClick={() => setAdminActiveTab("home")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "home" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Home</span>
                            <span onClick={() => setAdminActiveTab("users")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "users" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Manage Users</span>
                            <span onClick={() => setAdminActiveTab("reports")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "reports" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Reports</span>
                            <span onClick={() => setAdminActiveTab("reviews")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "reviews" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Manage Reviews</span>
                            <span onClick={() => setAdminActiveTab("logs")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "logs" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>System Logs</span>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7]">
                            <span onClick={() => setOwnerActiveTab("home")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "home" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Home</span>
                            <span onClick={() => setOwnerActiveTab("add-property")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "add-property" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Add Property</span>
                            <span onClick={() => setOwnerActiveTab("my-properties")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "my-properties" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>My Properties</span>
                            <span onClick={() => setOwnerActiveTab("earnings")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "earnings" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Earnings</span>
                            <span onClick={() => setOwnerActiveTab("manage-reviews")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "manage-reviews" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>View/Manage Reviews</span>
                        </div>
                    )}

                    {/* Right Side: Notifications / Profile / Logout */}
                    <div className="flex items-center space-x-3 min-w-max">
                        {!isAdmin && !isOwner && (
                            <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7] pr-2">
                                <span onClick={() => navigate("/dashboard")} className="cursor-pointer hover:text-[#5ddda1]">Browse</span>
                                <span onClick={() => navigate("/my-bookings")} className="cursor-pointer hover:text-[#5ddda1]">My Bookings</span>
                                <span onClick={() => navigate("/favourites")} className="cursor-pointer hover:text-[#5ddda1]">Favourites</span>
                            </div>
                        )}

                        {/* 🔔 Role-Based Notification Bell */}
                        <NotificationBell />

                        <span className="bg-[#2a2a2a] text-[#5ddda1] border border-[#444748] px-2.5 py-1 rounded-none text-[9px] lowercase tracking-normal font-bold">
                            role: {user?.role}
                        </span>

                        <div 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-none hover:bg-[#1c1b1b] border border-transparent hover:border-[#444748] transition-all"
                            title="Click to view & edit your profile"
                        >
                            <div className="flex flex-col text-right justify-center">
                                <span className="text-xs font-bold text-[#e5e2e1] group-hover:text-[#5ddda1] group-hover:underline">
                                    {user?.fullname || user?.username}
                                </span>
                                <span className="text-[9px] font-medium text-[#c4c7c7]">{user?.email}</span>
                            </div>
                            
                            {user?.avatar ? (
                                <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-none border border-[#444748] object-cover" />
                            ) : (
                                <div className="w-9 h-9 rounded-none border border-[#444748] bg-[#1c1b1b] flex items-center justify-center overflow-hidden text-[#5ddda1]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleSystemLogout}
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 border border-[#444748] text-[#e5e2e1] bg-[#1c1b1b] rounded-none hover:bg-[#5ddda1] hover:text-[#003823] transition-all cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>

                </div>
            </nav>

            {/* MAIN CONTENT SECTION */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {isAdmin ? (
                    <div className="space-y-6">
                        {adminActiveTab === "home" && <AdminHomeFeed />}
                        {adminActiveTab === "users" && <AdminUsersDirectory />}
                        {adminActiveTab === "reports" && <AdminReportsPage />}
                        {adminActiveTab === "reviews" && <AdminReviewsModeration />}
                        {adminActiveTab === "logs" && <AdminSystemLogs />}
                    </div>
                ) : user?.role === "user" ? (
                    <UserDashboard 
                        searchQuery={searchQuery} 
                        selectedFilter={selectedFilter}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                    />
                ) : user?.role === "owner" ? (
                    <div className="space-y-6">
                        {ownerActiveTab === "home" && <OwnerDashboardHome />}
                        {ownerActiveTab === "add-property" && <AddPropertyForm />}
                        {ownerActiveTab === "my-properties" && <OwnerPropertiesList />}
                        {ownerActiveTab === "earnings" && <OwnerEarningsPage />}
                        {ownerActiveTab === "manage-reviews" && <OwnerReviewsPage />}
                    </div>
                ) : (
                    <div className="bg-[#1c1b1b] p-8 rounded-none border border-[#444748] text-center text-xs font-bold uppercase tracking-wider text-[#c4c7c7]">
                        Please sign in with a verified account to access this workspace.
                    </div>
                )}
            </main>

            {/* FOOTER SECTION */}
            <footer className="w-full bg-[#0e0e0e] border-t border-[#353535] mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7]">
                    <div>
                        &copy; {new Date().getFullYear()} ESTATE ARCHIVE. CURATED EXCELLENCE.
                    </div>
                    <div className="flex space-x-6">
                        <span className="hover:text-[#5ddda1] cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-[#5ddda1] cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-[#5ddda1] cursor-pointer transition-colors">Support</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}