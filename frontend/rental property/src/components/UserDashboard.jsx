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
    setSearchQuery = () => {},
    selectedFilter = "all",
    setSelectedFilter = () => {},
    minPrice = 0,
    setMinPrice = () => {},
    maxPrice = Infinity,
    setMaxPrice = () => {}
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [sliderMax, setSliderMax] = useState(50000);
    const [isPriceFilterOpen, setIsPriceFilterOpen] = useState(false);

    // 📄 Pagination State (Exactly 3 cards per page)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    // 🛡️ Memoized Selectors
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

    // Reset pagination back to page 1 whenever search or filter parameters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedFilter, minPrice, maxPrice]);

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

        const itemPrice = Number(item.pricePerNight || item.price || 0);
        const matchesPrice = itemPrice >= minPrice && (maxPrice === Infinity || itemPrice <= maxPrice);

        return matchesSearch && matchesType && matchesPrice;
    });

    // 📄 Sliced Properties for Current Page (Exactly 3 cards)
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentProperties = filteredProperties.slice(startIndex, startIndex + itemsPerPage);

    const handleFavoriteClick = (e, propertyId) => {
        e.stopPropagation();
        e.preventDefault();
        if (propertyId) {
            dispatch(toggleFavoriteProperty(propertyId));
        }
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

    if (loadingList) {
        return (
            <div className="flex flex-col items-center justify-center p-16 space-y-4 bg-[#131313] min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
                <div className="text-[10px] font-bold tracking-[0.25em] text-[#c4c7c7] uppercase font-mono">
                    Syncing architectural archive catalog...
                </div>
            </div>
        );
    }

    if (errorList) {
        return (
            <div className="bg-[#1c1b1b] text-[#ffb4ab] p-6 text-xs font-bold uppercase border border-[#444748] rounded-none tracking-wider">
                ⚠️ Error: {errorList}
            </div>
        );
    }

    return (
        <div className="space-y-10 relative bg-[#131313] text-[#e5e2e1] min-h-screen pb-16">
            
            {/* 🍞 FLOATING TOAST POPUP NOTIFICATION */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 transition-all duration-300 animate-bounce">
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

            {/* PROPERTY DETAILS MODAL */}
            {selectedPropertyId && (
                <PropertyDetailsModal 
                    propertyId={selectedPropertyId} 
                    onClose={() => setSelectedPropertyId(null)} 
                />
            )}

            {/* 🌟 LARGE ETHEREAL OBSIDIAN HERO SECTION */}
            <section className="relative h-[560px] min-h-[480px] flex items-center justify-center overflow-hidden border border-[#353535] rounded-none shadow-2xl">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=2000" 
                        alt="Luxury Architecture Villa" 
                        className="w-full h-full object-cover scale-105 filter grayscale contrast-125 brightness-75"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/70 via-[#131313]/30 to-[#131313]"></div>
                </div>

                <div className="relative z-10 px-6 max-w-5xl mx-auto w-full text-center space-y-6">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#5ddda1] mb-2 block">Legacy In Every Detail</span>
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-[#e5e2e1] tracking-tight">
                            Discover Your Heritage
                        </h1>
                    </div>

                    {/* Integrated Search & Filter Bar on Image */}
                    <div className="bg-[#1c1b1b]/95 backdrop-blur-md p-4 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-end border border-[#444748] shadow-2xl rounded-none text-left">
                        
                        <div className="px-3">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#5ddda1] block mb-1">Search & Location</label>
                            <div className="flex items-center border-b border-[#444748] py-2">
                                <span className="text-[#5ddda1] mr-2 text-xs">📍</span>
                                <input 
                                    type="text" 
                                    placeholder="Search properties..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent text-xs w-full focus:outline-none text-[#e5e2e1] placeholder:text-[#8e9192]"
                                />
                            </div>
                        </div>

                        <div className="px-3">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#5ddda1] block mb-1">Property Type</label>
                            <div className="flex items-center border-b border-[#444748] py-2">
                                <span className="text-[#5ddda1] mr-2 text-xs">🏛️</span>
                                <select 
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7] cursor-pointer focus:outline-none w-full appearance-none"
                                >
                                    <option value="all" className="bg-[#1c1b1b]">All Types</option>
                                    <option value="house" className="bg-[#1c1b1b]">House</option>
                                    <option value="apartment" className="bg-[#1c1b1b]">Apartment</option>
                                    <option value="villa" className="bg-[#1c1b1b]">Luxury Villa</option>
                                </select>
                            </div>
                        </div>

                        <div className="px-3 relative">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[#5ddda1] block mb-1">Price Range</label>
                            <button
                                type="button"
                                onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                                className="w-full flex items-center justify-between border-b border-[#444748] py-2 text-[10px] font-bold uppercase tracking-wider text-[#c4c7c7] cursor-pointer focus:outline-none"
                            >
                                <span>
                                    {maxPrice === Infinity 
                                        ? minPrice > 0 ? `> $${minPrice}` : "Any Price" 
                                        : `$${minPrice} - $${maxPrice}`}
                                </span>
                                <span className="text-[8px]">{isPriceFilterOpen ? "▲" : "▼"}</span>
                            </button>

                            {/* Dropdown Price Filter Panel */}
                            {isPriceFilterOpen && (
                                <div className="absolute top-14 left-0 w-72 bg-[#1c1b1b] border border-[#444748] rounded-none shadow-2xl p-4 space-y-4 z-50">
                                    <div className="flex justify-between items-center border-b border-[#444748] pb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#e5e2e1]">Price Filter</span>
                                        {isFilteredActive && (
                                            <button onClick={resetPriceFilter} className="text-[9px] text-[#ffb4ab] font-bold uppercase hover:underline cursor-pointer">Reset</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 gap-1">
                                        <button onClick={() => applyPreset(1000)} className="px-1 py-1 text-[8px] font-bold bg-[#0e0e0e] hover:bg-[#2a2a2a] border border-[#444748] text-[#e5e2e1]">&lt; $1k</button>
                                        <button onClick={() => applyPreset(5000)} className="px-1 py-1 text-[8px] font-bold bg-[#0e0e0e] hover:bg-[#2a2a2a] border border-[#444748] text-[#e5e2e1]">&lt; $5k</button>
                                        <button onClick={() => applyPreset(15000)} className="px-1 py-1 text-[8px] font-bold bg-[#0e0e0e] hover:bg-[#2a2a2a] border border-[#444748] text-[#e5e2e1]">&lt; $15k</button>
                                        <button onClick={() => applyPreset(Infinity)} className="px-1 py-1 text-[8px] font-bold bg-[#5ddda1] text-[#003823]">Any</button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value) || 0)} className="w-full text-xs p-1.5 border border-[#444748] bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none" placeholder="Min" />
                                        <input type="number" min="0" value={maxPrice === Infinity ? "" : maxPrice} onChange={(e) => setMaxPrice(e.target.value === "" ? Infinity : Number(e.target.value))} className="w-full text-xs p-1.5 border border-[#444748] bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none" placeholder="Max" />
                                    </div>
                                    <button onClick={() => setIsPriceFilterOpen(false)} className="w-full py-2 bg-[#5ddda1] text-[#003823] text-[9px] font-bold uppercase tracking-wider">Apply</button>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => navigate("/favorites")}
                            className="bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] h-[48px] w-full text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                        >
                            ❤️ Favorites ({favoriteIds.length})
                        </button>

                    </div>
                </div>
            </section>

            {/* 🛡️ SINGLE UNIFIED FEATURE HIGHLIGHT CARD WITH EMBEDDED FIGMA ICON IFRAMES */}
            <section className="bg-[#1c1b1b] border border-[#353535] rounded-none shadow-2xl grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#353535]">
                
                {/* Feature Item 1: Expert Curation */}
                <div className="p-8 flex items-start gap-4">
                    <div className="shrink-0 w-14 h-14 bg-[#0e0e0e] border border-[#444748] overflow-hidden flex items-center justify-center">
                        <iframe 
                            style={{ border: "none", width: "56px", height: "56px", pointerEvents: "none" }} 
                            src="https://embed.figma.com/design/1T03iRAIEkRfXCDOUsrU78/Untitled?node-id=1-244&embed-host=share" 
                            title="Expert Curation Icon"
                        ></iframe>
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="font-serif text-lg font-semibold text-[#e5e2e1] uppercase tracking-wide">
                            Expert Curation
                        </h3>
                        <p className="text-xs text-[#c4c7c7] leading-relaxed">
                            Every property undergoes a rigorous 200-point inspection to ensure absolute architectural brilliance.
                        </p>
                    </div>
                </div>

                {/* Feature Item 2: Global Reach */}
                <div className="p-8 flex items-start gap-4">
                    <div className="shrink-0 w-14 h-14 bg-[#0e0e0e] border border-[#444748] overflow-hidden flex items-center justify-center">
                        <iframe 
                            style={{ border: "none", width: "56px", height: "56px", pointerEvents: "none" }} 
                            src="https://embed.figma.com/design/1T03iRAIEkRfXCDOUsrU78/Untitled?node-id=1-251&embed-host=share" 
                            title="Global Reach Icon"
                        ></iframe>
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="font-serif text-lg font-semibold text-[#e5e2e1] uppercase tracking-wide">
                            Global Reach
                        </h3>
                        <p className="text-xs text-[#c4c7c7] leading-relaxed">
                            Our network spans 45 countries, providing exclusive access to off-market estates worldwide.
                        </p>
                    </div>
                </div>

                {/* Feature Item 3: White-Glove Service */}
                <div className="p-8 flex items-start gap-4">
                    <div className="shrink-0 w-14 h-14 bg-[#0e0e0e] border border-[#444748] overflow-hidden flex items-center justify-center">
                        <iframe 
                            style={{ border: "none", width: "56px", height: "56px", pointerEvents: "none" }} 
                            src="https://embed.figma.com/design/1T03iRAIEkRfXCDOUsrU78/Untitled?node-id=1-259&embed-host=share" 
                            title="White-Glove Service Icon"
                        ></iframe>
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="font-serif text-lg font-semibold text-[#e5e2e1] uppercase tracking-wide">
                            White-Glove Service
                        </h3>
                        <p className="text-xs text-[#c4c7c7] leading-relaxed">
                            From private viewings to bespoke legal advisory, our concierge team handles every detail.
                        </p>
                    </div>
                </div>

            </section>

            {/* CATALOG HEADER BAR */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#353535] pb-4 px-2 pt-4">
                <div>
                    <span className="text-[10px] font-bold text-[#c4c7c7] uppercase tracking-[0.2em]">CURATED PORTFOLIO</span>
                    <h2 className="text-2xl font-serif font-bold uppercase tracking-tight text-[#e5e2e1] mt-1">
                        Available Accommodations ({filteredProperties.length}) — Page {currentPage} of {totalPages}
                    </h2>
                </div>
            </div>

            {/* BEAUTIFULLY STYLISHED PROPERTY GRID (Strictly 3 Cards Per Page) */}
            {currentProperties.length === 0 ? (
                <div className="bg-[#1c1b1b] p-16 border border-dashed border-[#444748] text-center text-xs font-bold text-[#c4c7c7] uppercase rounded-none tracking-widest">
                    No verified properties matched your active searching parameters.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {currentProperties.map((item) => {
                        const propId = item._id || item.id;
                        const isFavorite = favoriteIds.map(String).includes(String(propId));
                        const isHeartLoading = String(actionLoadingId) === String(propId);

                        return (
                            <div 
                                key={propId} 
                                className="bg-[#1c1b1b] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-between hover:border-[#5ddda1] transition-all duration-500 group"
                            >
                                {/* Image Container with Cinematic Overlay */}
                                <div className="aspect-[4/5] relative overflow-hidden bg-[#0e0e0e] border-b border-[#353535]">
                                    {item.image || item.images?.[0] ? (
                                        <img 
                                            src={item.image || item.images?.[0]} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter contrast-110" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] font-bold tracking-widest text-[#8e9192] uppercase">
                                            No Image Record
                                        </div>
                                    )}

                                    {/* Dark Gradient Overlay for Professional Contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent opacity-80 pointer-events-none"></div>

                                    {/* Price Badge */}
                                    <div className="absolute top-6 left-6 bg-[#080808]/90 backdrop-blur-md text-[#5ddda1] border border-[#444748] px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-none shadow-lg">
                                        ${item.pricePerNight || item.price || "0"} / night
                                    </div>

                                    {/* ❤️ TOGGLE HEART BUTTON */}
                                    <button
                                        onClick={(e) => handleFavoriteClick(e, propId)}
                                        disabled={isHeartLoading}
                                        title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                                        className="absolute top-6 right-6 p-2.5 rounded-none bg-[#080808]/85 hover:bg-[#080808] backdrop-blur-md border border-[#444748] shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer z-10"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            className={`w-5 h-5 transition-all duration-300 ${
                                                isHeartLoading
                                                    ? "animate-pulse fill-gray-500 text-gray-500"
                                                    : isFavorite
                                                    ? "fill-[#5ddda1] text-[#5ddda1] scale-110"
                                                    : "fill-none text-[#c4c7c7] hover:text-[#5ddda1]"
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
                                <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[9px] font-bold uppercase text-[#8e9192] tracking-[0.2em]">
                                            <span>{item.type || "Estate"}</span>
                                            <span className="text-[#5ddda1] flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 bg-[#5ddda1] rounded-full inline-block"></span> 
                                                Verified Asset
                                            </span>
                                        </div>
                                        <h4 className="font-serif text-xl font-semibold text-[#e5e2e1] tracking-tight line-clamp-1">
                                            {item.title || "Architectural Masterpiece"}
                                        </h4>
                                        <p className="text-xs text-[#c4c7c7] line-clamp-2 leading-relaxed font-sans">
                                            {item.description || "Rigorous inspection standards met for absolute luxury and structural brilliance."}
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

            {/* ⬅️ PREVIOUS & NEXT ARROW PAGINATION CONTROLS ➡️ */}
            {filteredProperties.length > itemsPerPage && (
                <div className="flex items-center justify-between border-t border-[#353535] pt-8 mt-12">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-8 py-4 text-xs font-bold uppercase tracking-widest border rounded-none transition-all duration-300 flex items-center gap-2 ${
                            currentPage === 1 
                                ? "bg-[#0e0e0e] text-[#444748] border-[#353535] cursor-not-allowed opacity-40" 
                                : "bg-[#1c1b1b] text-[#5ddda1] border-[#444748] hover:bg-[#5ddda1] hover:text-[#003823] cursor-pointer shadow-xl"
                        }`}
                    >
                        ← Previous 3 Cards
                    </button>

                    <span className="text-xs font-bold tracking-[0.25em] uppercase text-[#c4c7c7]">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-8 py-4 text-xs font-bold uppercase tracking-widest border rounded-none transition-all duration-300 flex items-center gap-2 ${
                            currentPage === totalPages 
                                ? "bg-[#0e0e0e] text-[#444748] border-[#353535] cursor-not-allowed opacity-40" 
                                : "bg-[#1c1b1b] text-[#5ddda1] border-[#444748] hover:bg-[#5ddda1] hover:text-[#003823] cursor-pointer shadow-xl"
                        }`}
                    >
                        Next 3 Cards →
                    </button>
                </div>
            )}
        </div>
    );
}