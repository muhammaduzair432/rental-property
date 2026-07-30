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

            {/* 🌐 NAV BAR SECTION (Cleaned up: Search & filters removed and relocated to hero banner) */}
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

                    {/* Middle Section: Dynamic Navigation for Admin or Owner */}
                    {isAdmin ? (
                        <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7]">
                            <span onClick={() => setAdminActiveTab("home")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "home" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Home</span>
                            <span onClick={() => setAdminActiveTab("users")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "users" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Manage Users</span>
                            <span onClick={() => setAdminActiveTab("reports")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "reports" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Reports</span>
                            <span onClick={() => setAdminActiveTab("reviews")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "reviews" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Manage Reviews</span>
                            <span onClick={() => setAdminActiveTab("logs")} className={`py-2 cursor-pointer transition-colors ${adminActiveTab === "logs" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>System Logs</span>
                        </div>
                    ) : isOwner ? (
                        <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7]">
                            <span onClick={() => setOwnerActiveTab("home")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "home" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Home</span>
                            <span onClick={() => setOwnerActiveTab("add-property")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "add-property" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Add Property</span>
                            <span onClick={() => setOwnerActiveTab("my-properties")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "my-properties" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>My Properties</span>
                            <span onClick={() => setOwnerActiveTab("earnings")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "earnings" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>Earnings</span>
                            <span onClick={() => setOwnerActiveTab("manage-reviews")} className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "manage-reviews" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#e5e2e1]"}`}>View/Manage Reviews</span>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7]">
                            <span onClick={() => navigate("/dashboard")} className="cursor-pointer hover:text-[#5ddda1]">Browse Catalog</span>
                            <span onClick={() => navigate("/my-bookings")} className="cursor-pointer hover:text-[#5ddda1]">My Bookings</span>
                            <span onClick={() => navigate("/favourites")} className="cursor-pointer hover:text-[#5ddda1]">Favourites</span>
                        </div>
                    )}

                    {/* Right Side: Notifications / Profile / Logout */}
                    <div className="flex items-center space-x-3 min-w-max">
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