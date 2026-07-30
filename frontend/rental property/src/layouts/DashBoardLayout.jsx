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

    // States for Search query inputs (passed down to UserDashboard hero banner)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");

    // Price Range States (passed down to UserDashboard hero banner)
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(Infinity);

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

    const isOwner = user?.role === "owner";
    const isAdmin = user?.role === "admin";

    return (
        <div className="min-h-screen w-full bg-[#131313] text-[#e5e2e1] flex flex-col antialiased font-sans selection:bg-[#5ddda1]/30 selection:text-black">
            
            {/* 👤 USER PROFILE POP-UP MODAL */}
            <UserProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />

            {/* 🌐 NAV BAR SECTION (Redesigned exactly to match the editorial reference layout) */}
            <header className="bg-[#080808]/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#353535]">
                <nav className="flex justify-between items-center px-6 lg:px-16 py-4 max-w-7xl mx-auto h-20">
                    
                    {/* Brand Logo */}
                    <div 
                        onClick={() => navigate("/dashboard")} 
                        className="font-serif text-xl font-bold tracking-tighter text-[#5ddda1] cursor-pointer"
                    >
                        ESTATE ARCHIVE
                    </div>

                    {/* Middle Dynamic Navigation Links */}
                    {isAdmin ? (
                        <div className="hidden md:flex gap-8 items-center text-xs font-semibold tracking-[0.15em] uppercase text-[#c4c7c7]">
                            <span onClick={() => setAdminActiveTab("home")} className={`cursor-pointer transition-colors pb-1 ${adminActiveTab === "home" ? "text-[#5ddda1] border-b border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Home</span>
                            <span onClick={() => setAdminActiveTab("users")} className={`cursor-pointer transition-colors pb-1 ${adminActiveTab === "users" ? "text-[#5ddda1] border-b border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Users</span>
                            <span onClick={() => setAdminActiveTab("reports")} className={`cursor-pointer transition-colors pb-1 ${adminActiveTab === "reports" ? "text-[#5ddda1] border-b border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Reports</span>
                            <span onClick={() => setAdminActiveTab("reviews")} className={`cursor-pointer transition-colors pb-1 ${adminActiveTab === "reviews" ? "text-[#5ddda1] border-b border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Reviews</span>
                            <span onClick={() => setAdminActiveTab("logs")} className={`cursor-pointer transition-colors pb-1 ${adminActiveTab === "logs" ? "text-[#5ddda1] border-b border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Logs</span>
                        </div>
                    ) : isOwner ? (
                        <div className="hidden md:flex gap-8 items-center text-xs font-semibold tracking-[0.15em] uppercase text-[#c4c7c7]">
                            <span onClick={() => setOwnerActiveTab("home")} className={`cursor-pointer transition-colors pb-1 ${ownerActiveTab === "home" ? "text-[#5ddda1] border-b border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Home</span>
                            <span onClick={() => setOwnerActiveTab("add-property")} className={`cursor-pointer transition-colors pb-1 ${ownerActiveTab === "add-property" ? "text-[#5ddda1] border-b border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Add Property</span>
                            <span onClick={() => setOwnerActiveTab("my-properties")} className={`cursor-pointer transition-colors pb-1 ${ownerActiveTab === "my-properties" ? "text-[#5ddda1] border-b border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>My Properties</span>
                            <span onClick={() => setOwnerActiveTab("earnings")} className={`cursor-pointer transition-colors pb-1 ${ownerActiveTab === "earnings" ? "text-[#5ddda1] border-b border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Earnings</span>
                        </div>
                    ) : (
                        <div className="hidden md:flex gap-8 items-center text-xs font-semibold tracking-[0.15em] uppercase text-[#c4c7c7]">
                            <span onClick={() => navigate("/dashboard")} className="text-[#5ddda1] border-b border-[#5ddda1] pb-1 cursor-pointer">Portfolio</span>
                            <span onClick={() => navigate("/dashboard")} className="hover:text-[#5ddda1] transition-colors duration-300 cursor-pointer">Listings</span>
                            <span onClick={() => navigate("/my-bookings")} className="hover:text-[#5ddda1] transition-colors duration-300 cursor-pointer">My Bookings</span>
                            <span onClick={() => navigate("/favourites")} className="hover:text-[#5ddda1] transition-colors duration-300 cursor-pointer">Favourites</span>
                        </div>
                    )}

                    {/* Right Side Actions: Notification Bell, Profile Trigger, Logout */}
                    <div className="flex items-center space-x-4">
                        <NotificationBell />

                        <div 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-2.5 cursor-pointer group p-1 rounded-none hover:bg-[#1c1b1b] border border-transparent hover:border-[#444748] transition-all"
                            title="Click to view & edit your profile"
                        >
                            <div className="hidden sm:flex flex-col text-right justify-center">
                                <span className="text-xs font-bold text-[#e5e2e1] group-hover:text-[#5ddda1]">
                                    {user?.fullname || user?.username}
                                </span>
                                <span className="text-[9px] text-[#c4c7c7]">{user?.email}</span>
                            </div>

                            {user?.avatar ? (
                                <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-none border border-[#444748] object-cover" />
                            ) : (
                                <div className="w-8 h-8 rounded-none border border-[#444748] bg-[#1c1b1b] flex items-center justify-center text-[#5ddda1]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleSystemLogout}
                            className="bg-[#5ddda1] text-[#003823] px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-none transition-all hover:bg-[#08a56e] cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>

                </nav>
            </header>

            {/* MAIN CONTENT SECTION */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pt-[104px]">
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
                        setSearchQuery={setSearchQuery}
                        selectedFilter={selectedFilter}
                        setSelectedFilter={setSelectedFilter}
                        minPrice={minPrice}
                        setMinPrice={setMinPrice}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
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