import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { logoutSuccess, switchPortalRole } from "../store/authSlice.js";
import { fetchAdminNotifications } from "../store/adminSlice.js";
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
    const [searchParams, setSearchParams] = useSearchParams();

    // 🛡️ Memoized Selector
    const user = useSelector((state) => state.auth?.user);

    // States for Search query inputs
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("all");

    // Price Range States
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(Infinity);

    // User Profile Pop-up Modal State & Mobile Menu Toggle State
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSwitchingRole, setIsSwitchingRole] = useState(false);

    const isOwner = user?.role === "owner";
    const isAdmin = user?.role === "admin";

    // ⚡ Read active tab directly from URL search params (defaults to "home" if missing)
    const currentTab = searchParams.get("tab") || "home";

    // Helper to update the tab in the URL query string
    const handleTabChange = (tabName) => {
        setSearchParams({ tab: tabName });
    };

    // ⚡ Trigger fetch for admin notifications on mount if user is an admin
    useEffect(() => {
        if (isAdmin) {
            dispatch(fetchAdminNotifications());
        }
    }, [dispatch, isAdmin]);

    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    const handleSystemLogout = () => {
        dispatch(logoutSuccess());
        navigate("/auth");
    };

    // ⚡ Resolve avatar across any common schema property name
    const userAvatar = user?.avatar || user?.avatarUrl || user?.profilePicture || user?.image;

    // ⚡ Role Toggle Switch Handler (resets tab parameter on role switch)
    const handlePortalToggle = async () => {
        const targetRole = isOwner ? "user" : "owner";
        setIsSwitchingRole(true);
        try {
            await dispatch(switchPortalRole(targetRole)).unwrap();
            setIsSwitchingRole(false);
            setSearchParams({}); // Reset tab parameter
            navigate("/dashboard");
        } catch (error) {
            setIsSwitchingRole(false);
            alert(error || "Failed to switch portal mode.");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#131313] text-[#e5e2e1] flex flex-col antialiased font-sans selection:bg-[#5ddda1]/30 selection:text-black">
            
            {/* 👤 USER PROFILE POP-UP MODAL */}
            <UserProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />

            {/* 🌐 RESPONSIVE NAVBAR SECTION */}
            <header className="bg-[#080808]/95 backdrop-blur-md w-full z-50 border-b border-[#353535] sticky top-0 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
                    
                    {/* Brand Name with Stylish Font */}
                    <div 
                        onClick={() => { setSearchParams({}); navigate("/dashboard"); }} 
                        className="flex flex-col cursor-pointer min-w-max"
                    >
                        <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-[#e5e2e1] uppercase">
                            RENTAL PROPERTY
                        </span>
                        <span className="text-[9px] font-bold tracking-[0.25em] text-[#5ddda1] uppercase">
                            {isAdmin ? "Admin Portal" : isOwner ? "Owner Portal" : "Curated Excellence"}
                        </span>
                    </div>

                    {/* Desktop Navigation Links */}
                    {isAdmin ? (
                        <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold tracking-[0.15em] uppercase text-[#c4c7c7]">
                            <span onClick={() => handleTabChange("home")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "home" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Home</span>
                            <span onClick={() => handleTabChange("users")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "users" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Users</span>
                            <span onClick={() => handleTabChange("reports")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "reports" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Reports</span>
                            <span onClick={() => handleTabChange("reviews")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "reviews" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Reviews</span>
                            <span onClick={() => handleTabChange("logs")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "logs" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Logs</span>
                        </nav>
                    ) : isOwner ? (
                        <nav className="hidden lg:flex items-center space-x-6 text-[11px] font-bold tracking-[0.12em] uppercase text-[#c4c7c7] whitespace-nowrap">
                            <span onClick={() => handleTabChange("home")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "home" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Home</span>
                            <span onClick={() => handleTabChange("add-property")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "add-property" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Add Property</span>
                            <span onClick={() => handleTabChange("my-properties")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "my-properties" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Properties</span>
                            <span onClick={() => handleTabChange("earnings")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "earnings" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Earnings</span>
                            <span onClick={() => handleTabChange("manage-reviews")} className={`cursor-pointer transition-colors pb-1 ${currentTab === "manage-reviews" ? "text-[#5ddda1] border-b-2 border-[#5ddda1]" : "hover:text-[#5ddda1]"}`}>Reviews</span>
                        </nav>
                    ) : (
                        <nav className="hidden lg:flex items-center space-x-10 text-xs font-bold tracking-[0.15em] uppercase text-[#c4c7c7]">
                            <span onClick={() => navigate("/dashboard")} className="cursor-pointer hover:text-[#5ddda1] transition-colors pb-1">Home</span>
                            <span onClick={() => navigate("/my-bookings")} className="cursor-pointer hover:text-[#5ddda1] transition-colors pb-1">My Bookings</span>
                            <span onClick={() => navigate("/favourites")} className="cursor-pointer hover:text-[#5ddda1] transition-colors pb-1">Favourites</span>
                        </nav>
                    )}

                    {/* Right Action Center */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <NotificationBell />

                        {/* 🔄 Theme-Matched Portal Switch Button */}
                        {!isAdmin && (
                            <button
                                onClick={handlePortalToggle}
                                disabled={isSwitchingRole}
                                className="hover:bg-[#5ddda1] text-[#5ddda1] hover:text-[#003823] border border-[#5ddda1] px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer shadow-sm disabled:opacity-40 flex items-center gap-2 whitespace-nowrap"
                                title="Switch between User and Owner portals"
                            >
                                {isSwitchingRole && <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent animate-spin"></div>}
                                <span>{isOwner ? "Switch to User Portal" : "Switch to Owner Portal"}</span>
                            </button>
                        )}

                        {/* Interactive Profile Tab with Bulletproof Avatar Check */}
                        <div 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-2.5 cursor-pointer group px-2 py-1 rounded-none hover:bg-[#1c1b1b] border border-transparent hover:border-[#444748] transition-all"
                            title="Open Profile Modal"
                        >
                            <div className="flex flex-col text-right justify-center">
                                <span className="text-xs font-bold text-[#e5e2e1] group-hover:text-[#5ddda1]">
                                    {user?.fullname || user?.username}
                                </span>
                                <span className="text-[9px] text-[#c4c7c7]">{user?.email}</span>
                            </div>

                            {userAvatar ? (
                                <img src={userAvatar} alt="avatar" className="w-9 h-9 rounded-full border-2 border-[#444748] object-cover shrink-0" />
                            ) : (
                                <div className="w-9 h-9 rounded-full border border-[#444748] bg-[#1c1b1b] flex items-center justify-center text-[#5ddda1] uppercase font-bold text-xs shrink-0">
                                    {(user?.fullname || user?.username || "U").charAt(0)}
                                </div>
                            )}
                        </div>

                        {/* Logout Button */}
                        <button 
                            onClick={handleSystemLogout}
                            className="bg-[#5ddda1] text-[#003823] px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-none transition-all hover:bg-[#08a56e] cursor-pointer shadow-md shrink-0"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile Hamburger & Controls */}
                    <div className="flex lg:hidden items-center gap-3">
                        <NotificationBell />
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-[#e5e2e1] p-1.5 focus:outline-none cursor-pointer"
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
                    <div className="lg:hidden bg-[#0e0e0e] border-b border-[#353535] px-6 py-6 space-y-4 text-xs font-bold tracking-widest uppercase shadow-2xl">
                        {isAdmin ? (
                            <>
                                <div onClick={() => { handleTabChange("home"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Home Feed</div>
                                <div onClick={() => { handleTabChange("users"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Manage Users</div>
                                <div onClick={() => { handleTabChange("reports"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">System Reports</div>
                                <div onClick={() => { handleTabChange("reviews"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Manage Reviews</div>
                                <div onClick={() => { handleTabChange("logs"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">System Logs</div>
                            </>
                        ) : isOwner ? (
                            <>
                                <div onClick={() => { handleTabChange("home"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Owner Workspace</div>
                                <div onClick={() => { handleTabChange("add-property"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Add Property</div>
                                <div onClick={() => { handleTabChange("my-properties"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">My Properties</div>
                                <div onClick={() => { handleTabChange("earnings"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Financial Earnings</div>
                                <div onClick={() => { handleTabChange("manage-reviews"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Manage Reviews</div>
                            </>
                        ) : (
                            <>
                                <div onClick={() => { navigate("/dashboard"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Browse Catalog</div>
                                <div onClick={() => { navigate("/my-bookings"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">My Bookings</div>
                                <div onClick={() => { navigate("/favourites"); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#c4c7c7] hover:text-[#5ddda1]">Favourites</div>
                            </>
                        )}

                        {/* Mobile Portal Switcher Button */}
                        {!isAdmin && (
                            <div 
                                onClick={() => { handlePortalToggle(); setIsMobileMenuOpen(false); }} 
                                className="cursor-pointer text-[#5ddda1] pt-3 border-t border-[#353535] flex items-center justify-between bg-[#083823] p-3 border border-[#5ddda1]"
                            >
                                <span>{isOwner ? "Switch to User Portal" : "Switch to Owner Portal"}</span>
                                <span className="text-[9px] bg-[#5ddda1] text-[#003823] px-2 py-1 font-bold">Switch</span>
                            </div>
                        )}

                        <div onClick={() => { setIsProfileModalOpen(true); setIsMobileMenuOpen(false); }} className="cursor-pointer text-[#5ddda1] pt-2 border-t border-[#353535]">View Profile</div>
                        <div className="pt-2">
                            <button 
                                onClick={handleSystemLogout}
                                className="w-full bg-[#5ddda1] text-[#003823] py-3 text-xs font-bold uppercase tracking-widest rounded-none cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* MAIN CONTENT SECTION */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-0 sm:p-0 lg:p-0 pt-6 sm:pt-8">
                {isAdmin ? (
                    <div className="space-y-6">
                        {currentTab === "home" && <AdminHomeFeed />}
                        {currentTab === "users" && <AdminUsersDirectory />}
                        {currentTab === "reports" && <AdminReportsPage />}
                        {currentTab === "reviews" && <AdminReviewsModeration />}
                        {currentTab === "logs" && <AdminSystemLogs />}
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
                        {currentTab === "home" && <OwnerDashboardHome />}
                        {currentTab === "add-property" && <AddPropertyForm />}
                        {currentTab === "my-properties" && <OwnerPropertiesList />}
                        {currentTab === "earnings" && <OwnerEarningsPage />}
                        {currentTab === "manage-reviews" && <OwnerReviewsPage />}
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
                                    <li onClick={() => handleTabChange("home")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Admin Home Feed</li>
                                    <li onClick={() => handleTabChange("users")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">User Directory</li>
                                    <li onClick={() => handleTabChange("reports")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">System Reports</li>
                                </>
                            ) : isOwner ? (
                                <>
                                    <li onClick={() => handleTabChange("home")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Owner Workspace</li>
                                    <li onClick={() => handleTabChange("add-property")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Publish Property</li>
                                    <li onClick={() => handleTabChange("earnings")} className="hover:text-[#5ddda1] cursor-pointer transition-colors">Financial Earnings</li>
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
                        <span className="hover:text-[#5ddda1] cursor-pointer transition-colors" onClick={() => navigate("/privacy-policy")}>Privacy Policy</span>
                        <span className="hover:text-[#5ddda1] cursor-pointer transition-colors">Terms of Service</span>
                        <span className="hover:text-[#5ddda1] cursor-pointer transition-colors">Support</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}