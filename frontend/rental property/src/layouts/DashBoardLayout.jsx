import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { logoutSuccess } from "../store/authSlice.js";
import UserDashboard from "../components/UserDashboard.jsx";
import UserProfileModal from "../components/UserProfileModal.jsx";
import AddPropertyForm from "../components/AddPropertyForm.jsx";
import OwnerDashboardHome from "../components/OwnerDashboardHome.jsx"; 
import OwnerPropertiesList from "../components/OwnerPropertiesList.jsx"; // 👈 Imported Dynamic Owner Properties List

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

    // Owner Internal View Tab State
    const [ownerActiveTab, setOwnerActiveTab] = useState("home");

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

    return (
        <div className="min-h-screen w-full bg-[#f9f9ff] text-[#151c27] flex flex-col antialiased font-sans">
            
            {/* 👤 USER PROFILE POP-UP MODAL */}
            <UserProfileModal 
                isOpen={isProfileModalOpen} 
                onClose={() => setIsProfileModalOpen(false)} 
            />

            {/* 🌐 NAV BAR SECTION */}
            <nav className="w-full bg-white border-b border-[#e2e8f8] shadow-xs sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                    
                    {/* Left: Brand Logo */}
                    <div 
                        onClick={() => navigate("/dashboard")} 
                        className="flex flex-col space-y-0.5 min-w-max cursor-pointer"
                    >
                        <span className="text-[10px] font-bold tracking-widest text-[#7d8497] uppercase">RENTAL PROPERTY</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#151c27]">
                            {isOwner ? "Owner Portal" : "Dashboard"}
                        </span>
                    </div>

                    {/* Middle Section: Dynamic Navigation */}
                    {!isOwner ? (
                        <div className="hidden md:flex items-center flex-1 max-w-xl mx-4 border border-[#e2e8f8] rounded-md bg-[#f9f9ff] px-3 py-1.5 gap-2 relative">
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
                                className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-[#7d8497] cursor-pointer focus:outline-none shrink-0"
                            >
                                <option value="all">All Types</option>
                                <option value="house">House</option>
                                <option value="apartment">Apartment</option>
                                <option value="villa">Luxury Villa</option>
                            </select>

                            <span className="text-gray-300">|</span>

                            <div className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                                        isFilteredActive
                                            ? "bg-[#151c27] text-white shadow-xs"
                                            : "text-[#7d8497] hover:text-[#151c27] hover:bg-gray-100"
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
                                    <div className="absolute top-10 right-0 w-80 bg-white border border-[#e2e8f8] rounded-xl shadow-2xl p-4 space-y-4 z-50">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#151c27]">
                                                Price Filter
                                            </span>
                                            {isFilteredActive && (
                                                <button 
                                                    onClick={resetPriceFilter}
                                                    className="text-[9px] text-red-600 font-bold uppercase hover:underline cursor-pointer"
                                                >
                                                    Reset All
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-[8px] font-bold uppercase text-gray-400 block">Quick Presets</span>
                                            <div className="grid grid-cols-4 gap-1">
                                                <button onClick={() => applyPreset(1000)} className="px-2 py-1 text-[9px] font-bold bg-[#f9f9ff] hover:bg-gray-200 border border-[#e2e8f8] rounded text-[#151c27] cursor-pointer">&lt; $1k</button>
                                                <button onClick={() => applyPreset(5000)} className="px-2 py-1 text-[9px] font-bold bg-[#f9f9ff] hover:bg-gray-200 border border-[#e2e8f8] rounded text-[#151c27] cursor-pointer">&lt; $5k</button>
                                                <button onClick={() => applyPreset(15000)} className="px-2 py-1 text-[9px] font-bold bg-[#f9f9ff] hover:bg-gray-200 border border-[#e2e8f8] rounded text-[#151c27] cursor-pointer">&lt; $15k</button>
                                                <button onClick={() => applyPreset(Infinity)} className="px-2 py-1 text-[9px] font-bold bg-[#151c27] text-white rounded cursor-pointer">Any</button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-1">
                                            <div className="flex-1">
                                                <label className="text-[8px] font-bold uppercase text-gray-400 block mb-1">Min Price ($)</label>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={minPrice}
                                                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                                                    className="w-full text-xs p-2 border border-[#e2e8f8] rounded-md font-bold text-[#151c27] focus:outline-none"
                                                />
                                            </div>
                                            <span className="text-gray-300 self-end pb-2 font-bold">-</span>
                                            <div className="flex-1">
                                                <label className="text-[8px] font-bold uppercase text-gray-400 block mb-1">Max Price ($)</label>
                                                <input 
                                                    type="number"
                                                    min="0"
                                                    value={maxPrice === Infinity ? "" : maxPrice}
                                                    placeholder="Unlimited"
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setMaxPrice(val === "" ? Infinity : Number(val));
                                                    }}
                                                    className="w-full text-xs p-2 border border-[#e2e8f8] rounded-md font-bold text-[#151c27] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-2">
                                            <div className="flex justify-between text-[9px] font-bold text-[#7d8497] uppercase">
                                                <span>$0</span>
                                                <span className="text-[#151c27]">Max Cap: {maxPrice === Infinity ? "Unlimited" : `$${maxPrice}`}</span>
                                                <span>${sliderMax.toLocaleString()}</span>
                                            </div>
                                            <input 
                                                type="range"
                                                min="0"
                                                max={sliderMax}
                                                step="250"
                                                value={maxPrice === Infinity ? sliderMax : maxPrice}
                                                onChange={handleSliderChange}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#151c27]"
                                            />
                                        </div>

                                        <button 
                                            onClick={() => setIsPriceFilterOpen(false)}
                                            className="w-full py-2 bg-[#151c27] hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer"
                                        >
                                            Apply Filter
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-[#7d8497]">
                            <span 
                                onClick={() => setOwnerActiveTab("home")}
                                className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "home" ? "text-[#151c27] border-b-2 border-[#151c27]" : "hover:text-[#151c27]"}`}
                            >
                                Home
                            </span>
                            <span 
                                onClick={() => setOwnerActiveTab("add-property")}
                                className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "add-property" ? "text-[#151c27] border-b-2 border-[#151c27]" : "hover:text-[#151c27]"}`}
                            >
                                Add Property
                            </span>
                            <span 
                                onClick={() => setOwnerActiveTab("my-properties")}
                                className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "my-properties" ? "text-[#151c27] border-b-2 border-[#151c27]" : "hover:text-[#151c27]"}`}
                            >
                                My Properties
                            </span>
                            <span 
                                onClick={() => setOwnerActiveTab("earnings")}
                                className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "earnings" ? "text-[#151c27] border-b-2 border-[#151c27]" : "hover:text-[#151c27]"}`}
                            >
                                Earnings
                            </span>
                            <span 
                                onClick={() => setOwnerActiveTab("manage-reviews")}
                                className={`py-2 cursor-pointer transition-colors ${ownerActiveTab === "manage-reviews" ? "text-[#151c27] border-b-2 border-[#151c27]" : "hover:text-[#151c27]"}`}
                            >
                                View/Manage Reviews
                            </span>
                        </div>
                    )}

                    {/* Right Side: Profile / Logout */}
                    <div className="flex items-center space-x-4 min-w-max">
                        
                        {!isOwner && (
                            <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase tracking-wider text-[#7d8497] pr-2">
                                <span onClick={() => navigate("/dashboard")} className="cursor-pointer hover:text-[#151c27]">Browse</span>
                                <span onClick={() => navigate("/my-bookings")} className="cursor-pointer hover:text-[#151c27]">My Bookings</span>
                                <span onClick={() => navigate("/favourites")} className="cursor-pointer hover:text-[#151c27]">Favourites</span>
                            </div>
                        )}

                        <span className="bg-[#151c27] text-white px-2.5 py-1 rounded text-[9px] lowercase tracking-normal">
                            role: {user?.role}
                        </span>

                        <div 
                            onClick={() => setIsProfileModalOpen(true)}
                            className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-[#e2e8f8] transition-all"
                            title="Click to view & edit your profile"
                        >
                            <div className="flex flex-col text-right justify-center">
                                <span className="text-xs font-bold text-[#151c27] group-hover:underline">
                                    {user?.fullname || user?.username}
                                </span>
                                <span className="text-[9px] font-medium text-[#7d8497]">{user?.email}</span>
                            </div>
                            
                            {user?.avatar ? (
                                <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-[#e2e8f8] object-cover" />
                            ) : (
                                <div className="w-9 h-9 rounded-full border border-[#e2e8f8] bg-blue-50 flex items-center justify-center overflow-hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6">
                                        <circle cx="12" cy="8" r="4" fill="#3B82F6" />
                                        <path d="M5 20c0-3.3 3-6 7-6s7 2.7 7 6" fill="#3B82F6" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleSystemLogout}
                            className="text-[10px] font-bold uppercase tracking-wider px-3 py-2 border border-[#e2e8f8] text-[#151c27] bg-[#f9f9ff] rounded-md hover:bg-black hover:text-white transition-all cursor-pointer"
                        >
                            Logout
                        </button>
                    </div>

                </div>
            </nav>

            {/* MAIN CONTENT SECTION */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {user?.role === "user" ? (
                    <UserDashboard 
                        searchQuery={searchQuery} 
                        selectedFilter={selectedFilter}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                    />
                ) : user?.role === "owner" ? (
                    <div className="space-y-6">
                        {ownerActiveTab === "home" && (
                            <OwnerDashboardHome /> 
                        )}

                        {ownerActiveTab === "add-property" && <AddPropertyForm />}

                        {ownerActiveTab === "my-properties" && (
                            <OwnerPropertiesList /> // 👈 Dynamic Inventory List with Edit, Delete & Inspection
                        )}

                        {ownerActiveTab === "earnings" && (
                            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-4">
                                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">FINANCIAL LEDGER</span>
                                <h3 className="text-base font-bold uppercase tracking-wider text-[#151c27]">Earnings & Payouts Report</h3>
                                <p className="text-xs text-gray-500">Your total pending balance is <strong className="text-[#151c27]">$3,250.00</strong>. Next scheduled bank transfer is on Friday.</p>
                            </div>
                        )}

                        {ownerActiveTab === "manage-reviews" && (
                            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-4">
                                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">FEEDBACK STREAM</span>
                                <h3 className="text-base font-bold uppercase tracking-wider text-[#151c27]">View / Manage Tenant Reviews</h3>
                                <div className="p-12 border border-dashed border-[#e2e8f8] text-center text-xs font-bold text-gray-400 uppercase rounded-md tracking-wider">
                                    No tenant reviews received yet for your active listings.
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-md border border-[#e2e8f8] text-center text-xs font-bold uppercase tracking-wider text-gray-400">
                        Please sign in with a verified account to access this workspace.
                    </div>
                )}
            </main>

            {/* FOOTER SECTION */}
            <footer className="w-full bg-white border-t border-[#e2e8f8] mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-[#7d8497]">
                    <div>
                        &copy; {new Date().getFullYear()} Rental Property Platform. Role-Based Dynamic Layout Active.
                    </div>
                    <div className="flex space-x-6">
                        <span className="hover:text-[#151c27] cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-[#151c27] cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-[#151c27] cursor-pointer transition-colors">Support</span>
                    </div>
                </div>
            </footer>

        </div>
    );
}