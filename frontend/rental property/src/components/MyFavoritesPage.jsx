import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
    fetchUserFavorites, 
    toggleFavoriteProperty, 
    clearToastMessage 
} from "../store/favoriteSlice.js";

export default function MyFavoritesPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { favorites = [], loading = false, error = null, actionLoadingId = null, toastMessage = null } = 
        useSelector((state) => state.favorite || {});

    useEffect(() => {
        dispatch(fetchUserFavorites());
    }, [dispatch]);

    // Auto-dismiss popup toast after 3 seconds
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                dispatch(clearToastMessage());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage, dispatch]);

    const handleRemoveFavorite = (e, propertyId) => {
        e.stopPropagation();
        e.preventDefault();
        if (propertyId) {
            dispatch(toggleFavoriteProperty(propertyId));
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f9ff] text-[#151c27] font-sans antialiased relative">
            
            {/* 🍞 FLOATING TOAST POPUP MESSAGE */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce transition-all">
                    <div className={`px-4 py-3 rounded-xl shadow-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${
                        toastMessage.type === "add"
                            ? "bg-[#151c27] text-white border-[#151c27]"
                            : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                        <span className="text-base">{toastMessage.type === "add" ? "❤️" : "🗑️"}</span>
                        <span>{toastMessage.text}</span>
                    </div>
                </div>
            )}

            {/* HEADER NAVIGATION BAR */}
            <div className="bg-white border-b border-[#e2e8f8] sticky top-0 z-30 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="text-xs font-bold uppercase tracking-wider text-[#151c27] hover:underline flex items-center gap-2 cursor-pointer"
                    >
                        ← Back to Marketplace
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-widest text-[#151c27]">
                        Tenant Portal
                    </h1>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f8] pb-4">
                    <div>
                        <span className="text-[10px] font-bold text-[#7d8497] uppercase tracking-widest block">
                            SAVED COLLECTION
                        </span>
                        <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">
                            My Favorite Stays ({favorites.length})
                        </h2>
                    </div>

                    <button 
                        onClick={() => dispatch(fetchUserFavorites())}
                        className="px-3 py-1.5 bg-white border border-[#e2e8f8] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#f9f9ff] transition-all cursor-pointer self-start sm:self-auto"
                    >
                        🔄 Refresh List
                    </button>
                </div>

                {error && (
                    <div className="p-3 text-xs font-bold rounded-md bg-red-50 text-red-800 border border-red-200 uppercase tracking-wider">
                        ⚠️ {error}
                    </div>
                )}

                {/* FAVORITES LIST GRID */}
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-3 border-[#151c27] border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">
                            Fetching Saved Favorites...
                        </div>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="bg-white border border-[#e2e8f8] rounded-xl p-12 text-center space-y-4 shadow-xs">
                        <div className="text-4xl">❤️</div>
                        <h3 className="text-base font-bold uppercase tracking-wide text-[#151c27]">
                            No Favorites Saved Yet
                        </h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            You haven't saved any listings to your wishlist. Click the heart button on any property card in the marketplace to add it here.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-5 py-2.5 bg-[#151c27] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-sm"
                        >
                            Browse Marketplace
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((item) => {
                            const property = item.property || item;
                            const propId = property._id || property.id || item._id;
                            const isHeartLoading = String(actionLoadingId) === String(propId);

                            return (
                                <div key={propId} className="bg-white border border-[#e2e8f8] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-gray-400 transition-all group relative">

                                    {/* Thumbnail Image Container */}
                                    <div className="h-48 bg-[#f9f9ff] relative border-b border-[#e2e8f8]">
                                        {property.image || property.images?.[0] ? (
                                            <img 
                                                src={property.image || property.images?.[0]} 
                                                alt={property.title || "Property"} 
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[9px] font-bold tracking-widest text-gray-400 uppercase">
                                                No Image Record
                                            </div>
                                        )}
                                        
                                        {/* Price Badge */}
                                        <span className="absolute bottom-3 left-3 px-2 py-1 bg-[#151c27] text-white text-[10px] font-black rounded uppercase tracking-wider shadow-md">
                                            ${property.pricePerNight || property.price || "0"} / night
                                        </span>

                                        {/* ❤️ HEART REMOVE BUTTON */}
                                        <button
                                            onClick={(e) => handleRemoveFavorite(e, propId)}
                                            disabled={isHeartLoading}
                                            title="Remove from Favorites"
                                            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white backdrop-blur-xs border border-white/50 shadow-md transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer z-10"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className={`w-5 h-5 transition-all duration-300 ${
                                                    isHeartLoading
                                                        ? "animate-pulse fill-gray-300 text-gray-300"
                                                        : "fill-red-500 text-red-500 scale-105"
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

                                    {/* Info Block */}
                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase text-[#7d8497] tracking-wider">
                                                <span>{property.type || "Space"}</span>
                                                <span className="text-gray-400">📍 {property.location || "Verified Location"}</span>
                                            </div>
                                            <h4 className="text-xs font-bold uppercase tracking-wide text-[#151c27] line-clamp-1">
                                                {property.title || property.name || "Reserved Property Space"}
                                            </h4>
                                            <p className="text-[11px] text-[#45464c] line-clamp-2 leading-relaxed">
                                                {property.description || "No descriptive logs registered."}
                                            </p>
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
        </div>
    );
}