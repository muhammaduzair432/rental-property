import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../store/propertySlice.js"; 
import { 
    toggleFavoriteProperty, 
    fetchUserFavorites, 
    clearToastMessage 
} from "../store/favoriteSlice.js"; 
import PropertyDetailsModal from "./PropertyDetailsModal.jsx";
import { useNavigate } from "react-router-dom";

export default function UserDashboard({ 
    searchQuery = "", 
    selectedFilter = "all",
    minPrice = 0,
    maxPrice = Infinity 
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedPropertyId, setSelectedPropertyId] = useState(null);

    // 🛡️ Memoized Selectors (Prevents Selector Unknown reference warning)
    const properties = useSelector((state) => state.properties?.properties) || [];
    const loadingList = useSelector((state) => state.properties?.loadingList) || false;
    const errorList = useSelector((state) => state.properties?.errorList) || null;

    const favoriteIds = useSelector((state) => state.favorite?.favoriteIds) || [];
    const actionLoadingId = useSelector((state) => state.favorite?.actionLoadingId) || null;
    const toastMessage = useSelector((state) => state.favorite?.toastMessage) || null;

    useEffect(() => {
        dispatch(fetchProperties());
        dispatch(fetchUserFavorites());
    }, [dispatch]);

    // Auto-dismiss popup toast notification after 3 seconds
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                dispatch(clearToastMessage());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage, dispatch]);

    const safeProperties = Array.isArray(properties) ? properties : [];

    // Filter Logic with Fail-Safe Price Matching
    const filteredProperties = safeProperties.filter(item => {
        if (!item) return false;

        const matchesSearch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.location || "").toLowerCase().includes(searchQuery.toLowerCase());

        const isHouse = (item.description || "").toLowerCase().includes("house") || (item.type || "").toLowerCase() === "house";
        const isVilla = (item.description || "").toLowerCase().includes("villa") || (item.type || "").toLowerCase() === "villa";
        const isApartment = (item.description || "").toLowerCase().includes("apartment") || (item.type || "").toLowerCase() === "apartment";

        const matchesType = selectedFilter === "all" || 
            (selectedFilter === "house" && isHouse) ||
            (selectedFilter === "villa" && isVilla) ||
            (selectedFilter === "apartment" && isApartment);

        // 💰 Dynamic Price Range Check
        const itemPrice = Number(item.pricePerNight || item.price || 0);
        const matchesPrice = itemPrice >= minPrice && (maxPrice === Infinity || itemPrice <= maxPrice);

        return matchesSearch && matchesType && matchesPrice;
    });

    const handleFavoriteClick = (e, propertyId) => {
        e.stopPropagation();
        e.preventDefault();

        if (propertyId) {
            dispatch(toggleFavoriteProperty(propertyId));
        }
    };

    if (loadingList) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <div className="w-6 h-6 border-2 border-[#151c27] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">
                    Syncing marketplace catalog...
                </div>
            </div>
        );
    }

    if (errorList) {
        return (
            <div className="bg-red-50 text-red-700 p-4 text-xs font-bold uppercase border border-red-200 rounded-md tracking-wider">
                ⚠️ Error: {errorList}
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            
            {/* 🍞 FLOATING TOAST POPUP NOTIFICATION */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 animate-bounce">
                    <div className={`px-4 py-3 rounded-xl shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 border ${
                        toastMessage.type === "add"
                            ? "bg-[#151c27] text-white border-[#151c27]"
                            : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                        <span className="text-base">{toastMessage.type === "add" ? "❤️" : "🗑️"}</span>
                        <span>{toastMessage.text}</span>
                    </div>
                </div>
            )}

            {/* PROPERTY DETAILS MODAL */}
            {selectedPropertyId && (
                <PropertyDetailsModal 
                    propertyId={selectedPropertyId} 
                    onClose={() => setSelectedPropertyId(null)} 
                />
            )}

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                    <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">REAL ESTATE CATALOG</span>
                    <h2 className="text-xl font-bold uppercase tracking-tight text-[#151c27]">Available Accommodations</h2>
                </div>

                <button
                    onClick={() => navigate("/favorites")}
                    className="px-3 py-1.5 bg-white border border-[#e2e8f8] text-xs font-bold uppercase tracking-wider text-[#151c27] hover:bg-[#f9f9ff] rounded transition-all cursor-pointer self-start sm:self-auto"
                >
                    ❤️ My Favorites ({favoriteIds.length}) →
                </button>
            </div>

            {filteredProperties.length === 0 ? (
                <div className="bg-white p-12 border border-dashed border-[#e2e8f8] text-center text-xs font-bold text-gray-400 uppercase rounded-md tracking-wider">
                    No verified properties matched your active searching parameters.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((item) => {
                        const propId = item._id || item.id;
                        const isFavorite = favoriteIds.map(String).includes(String(propId));
                        const isHeartLoading = String(actionLoadingId) === String(propId);

                        return (
                            <div key={propId} className="bg-white border border-[#e2e8f8] rounded-md overflow-hidden shadow-xs flex flex-col justify-between hover:border-gray-400 transition-all animate-fadeIn relative group">

                                {/* Image Container with Overlay */}
                                <div className="h-48 bg-[#f9f9ff] relative border-b border-[#e2e8f8]">
                                    {item.image || item.images?.[0] ? (
                                        <img src={item.image || item.images?.[0]} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold tracking-widest text-gray-400 uppercase">No Image Record</div>
                                    )}
                                    
                                    {/* Price Badge */}
                                    <span className="absolute bottom-3 left-3 px-2 py-1 bg-[#151c27] text-white text-[10px] font-black rounded uppercase tracking-wider shadow-md">
                                        ${item.pricePerNight || item.price || "0"} / night
                                    </span>

                                    {/* ❤️ TOGGLE HEART BUTTON */}
                                    <button
                                        onClick={(e) => handleFavoriteClick(e, propId)}
                                        disabled={isHeartLoading}
                                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-xs border border-white/50 shadow-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-10"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className={`w-5 h-5 transition-all duration-300 ${
                                                isHeartLoading
                                                    ? "animate-pulse fill-gray-300 text-gray-300"
                                                    : isFavorite
                                                    ? "fill-red-500 text-red-500 scale-105"
                                                    : "fill-none text-gray-700 hover:text-red-500"
                                            }`}
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Content Details */}
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-[#7d8497] tracking-wider">
                                            <span>{item.type || "Space"}</span>
                                            <span className="text-emerald-600">● Live Status</span>
                                        </div>
                                        <h4 className="text-xs font-bold uppercase tracking-wide text-[#151c27] line-clamp-1">{item.title || "Premium Suite Asset"}</h4>
                                        <p className="text-[11px] text-[#45464c] line-clamp-2 leading-relaxed">{item.description || "No descriptive logs registered."}</p>
                                    </div>

                                    <button 
                                        onClick={() => navigate(`/property/${propId}`)}
                                        className="w-full py-2 bg-white hover:bg-[#151c27] text-[#151c27] hover:text-white border border-[#151c27] text-[10px] font-bold uppercase tracking-widest rounded transition-all cursor-pointer text-center"
                                    >
                                        View Details & Book
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}