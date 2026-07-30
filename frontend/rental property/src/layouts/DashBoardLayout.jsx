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

    // 🛡️ Memoized Selector
    const user = useSelector((state) => state.auth?.user);

    // States for Search query inputs
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");

    // Price Range States
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(Infinity);

    // Internal View Tab States for Roles
    const [ownerActiveTab, setOwnerActiveTab] = useState("home");
    const [adminActiveTab, setAdminActiveTab] = useState("home");

    // User Profile Pop-up Modal State & Mobile Menu Toggle State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

            {/* 🌐 RESPONSIVE NAVBAR SECTION */}
            <header className="bg-[#080808]/90 backdrop-blur-md fixed top-0 w-full z-50 border-b border-[#353535]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between gap-6">
                    
                    {/* Brand Name with Stylish Font */}
                    <div 
                        onClick={() => navigate("/dashboard")} 
                        className="flex flex-col cursor-pointer min-w-max"
                    >
                        <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#e5e2e1] uppercase">
                            RENTAL PROPERTY
                        </span>
                        <span className="text-[9px] font-bold tracking-[0.25em] text-[#5ddda1] uppercase">
                            {isAdmin ? "Admin Portal" : isOwner ? "Owner Portal" : "Curated Excellence"}
                        </span>
                    </div>

                    {/* Desktop Navigation Links with Spacing and Hover Underline */}
                    {isAdmin ? (
                        <div className="hidden lg:flex gap-10 items-center text-xs font-bold tracking-[0.15em] uppercase text-[#c4c7c7]">
                            <span onClick={() => setAdminActiveTab("home")} className={`cursor-pointer transition-colors pb-1 hover:underline ${adminActiveTab === "home" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Home</span>
                            <span onClick={() => setAdminActiveTab("users")} className={`cursor-pointer transition-colors pb-1 hover:underline ${adminActiveTab === "users" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Manage Users</span>
                            <span onClick={() => setAdminActiveTab("reports")} className={`cursor-pointer transition-colors pb-1 hover:underline ${adminActiveTab === "reports" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Reports</span>
                            <span onClick={() => setAdminActiveTab("reviews")} className={`cursor-pointer transition-colors pb-1 hover:underline ${adminActiveTab === "reviews" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Manage Reviews</span>
                            <span onClick={() => setAdminActiveTab("logs")} className={`cursor-pointer transition-colors pb-1 hover:underline ${adminActiveTab === "logs" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>System Logs</span>
                        </div>
                    ) : isOwner ? (
                        <div className="hidden lg:flex gap-10 items-center text-xs font-bold tracking-[0.15em] uppercase text-[#c4c7c7]">
                            <span onClick={() => setOwnerActiveTab("home")} className={`cursor-pointer transition-colors pb-1 hover:underline ${ownerActiveTab === "home" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Home</span>
                            <span onClick={() => setOwnerActiveTab("add-property")} className={`cursor-pointer transition-colors pb-1 hover:underline ${ownerActiveTab === "add-property" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Add Property</span>
                            <span onClick={() => setOwnerActiveTab("my-properties")} className={`cursor-pointer transition-colors pb-1 hover:underline ${ownerActiveTab === "my-properties" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>My Properties</span>
                            <span onClick={() => setOwnerActiveTab("earnings")} className={`cursor-pointer transition-colors pb-1 hover:underline ${ownerActiveTab === "earnings" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Earnings</span>
                            <span onClick={() => setOwnerActiveTab("manage-reviews")} className={`cursor-pointer transition-colors pb-1 hover:underline ${ownerActiveTab === "manage-reviews" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>View/Manage Reviews</span>
                        </div>
                    ) : (
                        <div className="hidden lg:flex gap-10 items-center text-xs font-bold tracking-[0.15em] uppercase text-[#c4c7c7]">
                            <span onClick={() => navigate("/dashboard")} className="cursor-pointer hover:text-[#5ddda1] transition-colors pb-1 hover:underline">Home</span>
                            <span onClick={() => navigate("/my-bookings")} className="cursor-pointer hover:text-[#5ddda1] transition-colors pb-1 hover:underline">My Bookings</span>
                            <span onClick={() => navigate("/favourites")} className="cursor-pointer hover:text-[#5ddda1] transition-colors pb-1 hover:underline">Favourites</span>
                        </div>
                    )}

                    {/* Right Action Center */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <NotificationBell />

                        <div 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-3 cursor-pointer group p-1 rounded-none hover:bg-[#1c1b1b] border border-transparent hover:border-[#444748] transition-all"
                        >
                            <div className="flex flex-col text-right justify-center">
                                <span className="text-xs font-bold text-[#e5e2e1] group-hover:text-[#5ddda1]">
                                    {user?.fullname || user?.username}
                                </span>
                                <span className="text-[9px] text-[#c4c7c7]">{user?.email}</span>
                            </div>

                            {user?.avatar ? (
                                <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2  border-[#444748] object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full border border-[#444748] bg-[#1c1b1b] flex items-center justify-center text-[#5ddda1]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Logout Button with exact specified color */}
                        <button 
                            onClick={handleSystemLogout}
                            className="bg-[#5ddda1] text-[#003823] px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-none transition-all hover:bg-[#08a56e] cursor-pointer shadow-md"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile Hamburger Toggle Button */}
                    <div className="flex lg:hidden items-center gap-4">
                        <NotificationBell />
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-[#e5e2e1] p-2 focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                </div>

                {/* Mobile Dropdown Menu Drawer */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-[#0e0e0e] border-b border-[#353535] px-6 py-6 space-y-4 text-xs font-bold tracking-widest uppercase">
                        <div onClick={() => { navigate("/dashboard"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Browse Catalog</div>
                        <div onClick={() => { navigate("/my-bookings"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">My Bookings</div>
                        <div onClick={() => { navigate("/favourites"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Favourites</div>
                        <div onClick={() => { setIsProfileModalOpen(true); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#5ddda1]">View Profile</div>
                        <div className="pt-4 border-t border-[#353535]">
                            <button 
                                onClick={handleSystemLogout}
                                className="w-full bg-[#5ddda1] text-[#003823] py-3 text-xs font-bold uppercase tracking-widest rounded-none"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
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

            {/* 🌐 ROLE-DYNAMIC FOOTER SECTION */}
            <footer className="w-full bg-[#0e0e0e] border-t border-[#353535] text-[#e5e2e1] pt-16 pb-8 mt-auto">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-12 gap-12">
                    
                    {/* Column 1: Brand & Bio */}
                    <div className="md:col-span-5 space-y-4">
                        <span className="font-serif text-xl font-bold tracking-tight text-[#e5e2e1] uppercase">
                            RENTAL PROPERTY
                        </span>
                        <p className="text-xs text-[#c4c7c7] leading-relaxed max-w-sm">
                            Curating exceptional architectural spaces, bespoke modern villas, and verified residential milestones worldwide.
                        </p>
                    </div>

                    {/* Column 2: Role-Dynamic Ecosystem Links */}
                    <div className="md:col-span-3 space-y-3 text-xs font-bold uppercase tracking-wider">
                        <p className="text-[#5ddda1]">Ecosystem ({user?.role})</p>
                        <ul className="space-y-2 text-[#c4c7c7] font-normal">
                            {isAdmin ? (
                                <>
                                    <li onClick={() => setAdminActiveTab("home")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Admin Home Feed</li>
                                    <li onClick={() => setAdminActiveTab("users")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">User Directory</li>
                                    <li onClick={() => setAdminActiveTab("reports")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">System Reports</li>
                                </>
                            ) : isOwner ? (
                                <>
                                    <li onClick={() => setOwnerActiveTab("home")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Owner Workspace</li>
                                    <li onClick={() => setOwnerActiveTab("add-property")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Publish Property</li>
                                    <li onClick={() => setOwnerActiveTab("earnings")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Financial Earnings</li>
                                </>
                            ) : (
                                <>
                                    <li onClick={() => navigate("/dashboard")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Portfolio Catalog</li>
                                    <li onClick={() => navigate("/my-bookings")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">My Stays & Bookings</li>
                                    <li onClick={() => navigate("/favourites")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Saved Favourites</li>
                                </>
                            )}
                        </ul>
                    </div>

                    {/* Column 3: Global Newsletter */}
                    <div className="md:col-span-4 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#5ddda1]">Global Newsletter</p>
                        <p className="text-xs text-[#c4c7c7]">Receive quarterly market analysis and exclusive previews.</p>
                        <div className="flex border-b border-[#444748] py-2">
                            <input 
                                type="email" 
                                placeholder="Email Address" 
                                className="bg-transparent border-none focus:ring-0 w-full p-0 text-xs text-[#e5e2e1] placeholder:text-[#8e9192] focus:outline-none" 
                            />
                            <button className="text-[10px] font-bold uppercase tracking-widest text-[#5ddda1] hover:text-[#08a56e] cursor-pointer shrink-0">
                                Subscribe
                            </button>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-16 flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-[#353535] text-[10px] font-bold uppercase tracking-widest text-[#c4c7c7]">
                    <div>
                        &copy; {new Date().getFullYear()} RENTAL PROPERTY. CURATED EXCELLENCE.
                    </div>
                    <div className="flex space-x-6 mt-4 sm:mt-0">
                        <span className="hover:text-[#5ddda1] cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="hover:text-[#5ddda1] cursor-pointer transition-colors">Terms of Service</span>
                        <span className="hover:text-[#5ddda1] cursor-pointer transition-colors">Support</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}