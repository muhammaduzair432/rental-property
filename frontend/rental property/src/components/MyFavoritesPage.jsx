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

    // 🛡️ Memoized Selectors
    const favorites = useSelector((state) => state.favorite?.favorites) || [];
    const loading = useSelector((state) => state.favorite?.loading) || false;
    const error = useSelector((state) => state.favorite?.error) || null;
    const actionLoadingId = useSelector((state) => state.favorite?.actionLoadingId) || null;
    const toastMessage = useSelector((state) => state.favorite?.toastMessage) || null;

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
        <div className="space-y-8 sm:space-y-10 relative bg-[#131313] text-[#e5e2e1] min-h-screen pb-16 px-4 sm:px-6 lg:px-8">
            
            {/* 🍞 FLOATING TOAST POPUP MESSAGE */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 animate-bounce transition-all">
                    <div className={`px-5 py-3.5 rounded-none shadow-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 border ${
                        toastMessage.type === "add"
                            ? "bg-[#5ddda1] text-[#003823] border-[#5ddda1]"
                            : "bg-[#1c1b1b] text-[#ffb4ab] border-[#444748]"
                    }`}>
                        <span className="text-sm">{toastMessage.type === "add" ? "❤️" : "🗑️"}</span>
                        <span>{toastMessage.text}</span>
                    </div>
                </div>
            )}

            {/* HEADER NAVIGATION BAR */}
            <div className="flex items-center justify-between border-b border-[#353535] pb-4 pt-2">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#5ddda1] hover:underline flex items-center gap-2 cursor-pointer transition-all"
                >
                    ← Back to Catalog
                </button>
                <span className="text-[9px] sm:text-[10px] font-bold text-[#c4c7c7] uppercase tracking-[0.25em]">
                    TENANT PORTAL
                </span>
            </div>

            {/* MAIN CONTENT CONTAINER */}
            <div className="space-y-6 max-w-7xl mx-auto">
                
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#353535] pb-4">
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#c4c7c7] uppercase tracking-[0.2em] block">
                            SAVED COLLECTION
                        </span>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-tight text-[#e5e2e1] mt-1">
                            My Favorite Stays ({favorites.length})
                        </h2>
                    </div>

                    <button 
                        onClick={() => dispatch(fetchUserFavorites())}
                        className="px-4 py-2.5 bg-[#1c1b1b] border border-[#444748] text-[10px] font-bold uppercase tracking-widest text-[#5ddda1] hover:bg-[#5ddda1] hover:text-[#003823] transition-all cursor-pointer self-start sm:self-auto rounded-none shadow-md"
                    >
                        ↻ Refresh List
                    </button>
                </div>

                {error && (
                    <div className="p-4 text-xs font-bold rounded-none bg-[#1c1b1b] text-[#ffb4ab] border border-[#444748] uppercase tracking-wider shadow-lg flex items-center gap-2">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {/* FAVORITES LIST GRID */}
                {loading ? (
                    <div className="p-16 sm:p-20 flex flex-col items-center justify-center space-y-4 bg-[#1c1b1b] border border-[#353535]">
                        <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
                        <div className="text-[10px] font-bold tracking-[0.25em] text-[#c4c7c7] uppercase font-mono text-center">
                            Fetching Saved Favorites...
                        </div>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="bg-[#1c1b1b] border border-[#353535] rounded-none p-10 sm:p-16 text-center space-y-4 shadow-2xl">
                        <div className="text-3xl">❤️</div>
                        <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-[#e5e2e1]">
                            No Favorites Saved Yet
                        </h3>
                        <p className="text-xs text-[#c4c7c7] max-w-sm mx-auto leading-relaxed">
                            You haven't saved any listings to your wishlist. Click the heart button on any property card in the marketplace to add it here.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full sm:w-auto px-6 py-3 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer shadow-lg"
                            >
                                Browse Marketplace →
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {favorites.map((item) => {
                            const property = item.property || item;
                            const propId = property._id || property.id || item._id;
                            const isHeartLoading = String(actionLoadingId) === String(propId);

                            return (
                                <div 
                                    key={propId} 
                                    className="bg-[#1c1b1b] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-between hover:border-[#5ddda1] transition-all duration-500 group"
                                >

                                    {/* Thumbnail Image Container */}
                                    <div className="aspect-[4/5] relative overflow-hidden bg-[#0e0e0e] border-b border-[#353535]">
                                        {property.image || property.images?.[0] ? (
                                            <img 
                                                src={property.image || property.images?.[0]} 
                                                alt={property.title || "Property"} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter contrast-110" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold tracking-widest text-[#8e9192] uppercase">
                                                No Image Record
                                            </div>
                                        )}
                                        
                                        {/* Dark Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-80 pointer-events-none"></div>

                                        {/* Price Badge */}
                                        <div className="absolute top-6 left-6 bg-[#080808]/90 backdrop-blur-md text-[#5ddda1] border border-[#444748] px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-none shadow-lg">
                                            ${property.pricePerNight || property.price || "0"} / night
                                        </div>

                                        {/* ❤️ HEART REMOVE BUTTON */}
                                        <button
                                            onClick={(e) => handleRemoveFavorite(e, propId)}
                                            disabled={isHeartLoading}
                                            title="Remove from Favorites"
                                            className="absolute top-6 right-6 p-2.5 rounded-none bg-[#080808]/85 hover:bg-[#080808] backdrop-blur-md border border-[#444748] shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer z-10"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                className={`w-5 h-5 transition-all duration-300 ${
                                                    isHeartLoading
                                                        ? "animate-pulse fill-gray-500 text-gray-500"
                                                        : "fill-[#5ddda1] text-[#5ddda1] scale-110"
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
                                    <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase text-[#8e9192] tracking-[0.2em]">
                                                <span>{property.type || "Estate"}</span>
                                                <span className="text-[#5ddda1] flex items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 bg-[#5ddda1] rounded-full inline-block"></span> 
                                                    Verified Asset
                                                </span>
                                            </div>
                                            <h4 className="font-serif text-xl font-semibold text-[#e5e2e1] tracking-tight line-clamp-1">
                                                {property.title || property.name || "Architectural Masterpiece"}
                                            </h4>
                                            <p className="text-xs text-[#c4c7c7] line-clamp-2 leading-relaxed font-sans">
                                                {property.description || "Rigorous inspection standards met for absolute luxury and structural brilliance."}
                                            </p>
                                        </div>

                                        <button 
                                            onClick={() => navigate(`/property/${propId}`)}
                                            className="w-full py-3.5 bg-[#080808] hover:bg-[#5ddda1] text-[#e5e2e1] hover:text-[#003823] border border-[#444748] hover:border-[#5ddda1] text-xs font-bold uppercase tracking-[0.15em] rounded-none transition-all duration-300 cursor-pointer text-center shadow-lg"
                                        >
                                            View Details & Book →
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