import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById, clearSelectedProperty } from "../store/propertySlice.js";
import { createBooking, clearBookingState } from "../store/bookingSlice.js"; 
import PropertyComments from "../components/PropertyComments.jsx";

export default function PropertyDetailsPage() {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get current logged-in user to check ID and role
    const { user } = useSelector((state) => state.auth || {});
    const isOwnerRole = user?.role === "owner";

    const { selectedProperty, loadingDetails, errorDetails } = useSelector(
        (state) => state.properties || {}
    );

    // Extract Redux Booking State
    const { loading: bookingLoading, error: bookingError, successMessage } = useSelector(
        (state) => state.booking || {}
    );

    // Gallery & Form State
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [localError, setLocalError] = useState(null);

    // ⚡ Force fresh fetch on mount & clear stale cache to guarantee updated images render
    useEffect(() => {
        if (propertyId) {
            dispatch(clearSelectedProperty());
            dispatch(fetchPropertyById(propertyId));
        }
        return () => {
            dispatch(clearBookingState());
        };
    }, [dispatch, propertyId]);

    // Price & Duration Calculation
    const pricePerNight = selectedProperty?.pricePerNight || selectedProperty?.price || 0;

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const totalNights = calculateNights();
    const totalPrice = totalNights * pricePerNight;

    // 🛡️ Bulletproof check: Is the current logged-in user the absolute creator/owner of this property?
    const propertyOwnerId = typeof selectedProperty?.owner === "object" 
        ? selectedProperty?.owner?._id || selectedProperty?.owner?.id 
        : selectedProperty?.owner || selectedProperty?.ownerId;

    const currentUserId = user?._id || user?.id;
    const isMyOwnProperty = Boolean(propertyOwnerId && currentUserId && String(propertyOwnerId) === String(currentUserId));

    // Handle Redux Booking Submission
    const handleBooking = async (e) => {
        e.preventDefault();
        setLocalError(null);

        if (isMyOwnProperty) {
            setLocalError("You cannot book your own property asset.");
            return;
        }

        if (!checkIn || !checkOut) {
            setLocalError("Please select both check-in and check-out dates.");
            return;
        }

        if (totalNights <= 0) {
            setLocalError("Check-out date must be after check-in date.");
            return;
        }

        const targetPropertyId = propertyId || selectedProperty?._id || selectedProperty?.id;

        const result = await dispatch(
            createBooking({
                propertyId: targetPropertyId,
                property: targetPropertyId,
                startDate: checkIn,
                endDate: checkOut,
                checkIn: checkIn,
                checkOut: checkOut,
                totalNights,
                totalPrice,
            })
        );

        if (createBooking.fulfilled.match(result)) {
            setCheckIn("");
            setCheckOut("");
        }
    };

    // ⚡ Dynamic Back Navigation Handler based on User Role
    const handleBackNavigation = () => {
        if (isOwnerRole) {
            navigate(-1);
        } else {
            navigate("/dashboard");
        }
    };

    if (loadingDetails) {
        return (
            <div className="min-h-screen w-full bg-[#131313] flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#c4c7c7] font-mono">
                    Loading Asset Specifications...
                </div>
            </div>
        );
    }

    if (errorDetails || !selectedProperty) {
        return (
            <div className="min-h-screen w-full bg-[#131313] p-8 flex flex-col items-center justify-center space-y-4 text-[#e5e2e1]">
                <div className="p-4 text-xs font-bold text-[#ffb4ab] bg-[#1c1b1b] border border-[#444748] rounded-none uppercase tracking-wider max-w-lg w-full text-center shadow-xl">
                    ⚠️ {errorDetails || "Property record not found."}
                </div>
                <button 
                    onClick={handleBackNavigation} 
                    className="px-6 py-3 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer shadow-lg"
                >
                    {isOwnerRole ? "Back To My Properties" : "Back To Catalog"}
                </button>
            </div>
        );
    }

    // 📸 Robust Image Normalizer: Supports arrays, comma strings, and single image fallbacks
    const rawImages = selectedProperty.images || [];
    const parsedImages = typeof rawImages === "string" 
        ? rawImages.split(",").map(i => i.trim()).filter(Boolean)
        : Array.isArray(rawImages) ? rawImages : [];
    
    const singleImageFallback = selectedProperty.image ? [selectedProperty.image] : [];
    const imagesList = Array.from(new Set([...parsedImages, ...singleImageFallback])).filter(Boolean);

    // Extract amenities
    const amenitiesList = Array.isArray(selectedProperty.amenities)
        ? selectedProperty.amenities
        : typeof selectedProperty.amenities === "string"
            ? selectedProperty.amenities.split(",").map((a) => a.trim()).filter(Boolean)
            : ["WiFi", "Air Conditioning", "Parking", "Kitchen", "Security"];

    return (
        <div className="min-h-screen w-full bg-[#131313] text-[#e5e2e1] font-sans antialiased pb-20">
            
            {/* TOP NAVIGATION BAR */}
            <div className="bg-[#080808]/90 backdrop-blur-md border-b border-[#353535] sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <button 
                        onClick={handleBackNavigation} 
                        className="text-xs font-bold uppercase tracking-widest text-[#5ddda1] hover:underline flex items-center gap-2 cursor-pointer transition-all"
                    >
                        ← {isOwnerRole ? "Back To My Properties" : "Back To Catalog"}
                    </button>
                    <span className="text-[9px] font-mono font-bold text-[#8e9192] uppercase tracking-[0.2em]">
                        Asset ID: {selectedProperty._id || selectedProperty.id}
                    </span>
                </div>
            </div>

            {/* MAIN CONTENT BODY */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10 pt-10">
                
                {/* GALLERY SECTION */}
                <div className="bg-[#1c1b1b] border border-[#353535] rounded-none overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4">
                    <div className="w-full h-96 sm:h-[520px] bg-[#0e0e0e] rounded-none overflow-hidden relative border border-[#444748]">
                        {imagesList.length > 0 ? (
                            <img 
                                src={imagesList[activeImageIndex] || imagesList[0]} 
                                alt={selectedProperty.title} 
                                className="w-full h-full object-cover filter contrast-110 transition-all duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold uppercase text-[#8e9192] tracking-widest">
                                No Images Uploaded
                            </div>
                        )}
                        <span className="absolute bottom-6 left-6 bg-[#080808]/90 backdrop-blur-md text-[#5ddda1] border border-[#444748] px-4 py-2 text-xs font-bold rounded-none uppercase tracking-widest shadow-xl">
                            ${pricePerNight} / Night
                        </span>
                    </div>

                    {imagesList.length > 1 && (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {imagesList.map((imgUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`w-24 h-24 shrink-0 rounded-none overflow-hidden border-2 transition-all cursor-pointer ${
                                        activeImageIndex === index ? "border-[#5ddda1] scale-95 shadow-2xl" : "border-[#444748] opacity-50 hover:opacity-100"
                                    }`}
                                >
                                    <img src={imgUrl} alt="thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* DETAILS & SIDEBAR GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* LEFT COLUMNS: PROPERTY SPECIFICATIONS */}
                    <div className="lg:col-span-2 bg-[#1c1b1b] border border-[#353535] rounded-none p-6 sm:p-10 space-y-8 shadow-2xl">
                        <div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#8e9192] tracking-[0.2em] mb-2">
                                <span>Category: {selectedProperty.category || selectedProperty.type || "Rental Property"}</span>
                                <span className={selectedProperty.isApproved ? "text-[#5ddda1] font-bold flex items-center gap-1.5" : "text-[#ffb4ab] font-bold flex items-center gap-1.5"}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${selectedProperty.isApproved ? "bg-[#5ddda1]" : "bg-[#ffb4ab]"}`}></span>
                                    {selectedProperty.isApproved ? "Verified Active Listing" : "Pending Admin Approval"}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">
                                {selectedProperty.title || selectedProperty.name || "Untitled Property Listing"}
                            </h1>
                            <p className="text-xs text-[#c4c7c7] mt-2 font-sans flex items-center gap-1.5">
                                📍 {selectedProperty.location || selectedProperty.address || "Location verified"}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-[#0e0e0e] rounded-none border border-[#353535]">
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192] block">Type</span>
                                <span className="text-xs font-bold text-[#e5e2e1] uppercase">{selectedProperty.type || "Apartment"}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192] block">Max Guests</span>
                                <span className="text-xs font-bold text-[#e5e2e1]">{selectedProperty.maxGuests || selectedProperty.guests || "4"} People</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192] block">Bedrooms</span>
                                <span className="text-xs font-bold text-[#e5e2e1]">{selectedProperty.bedrooms || selectedProperty.beds || "2"} Rooms</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[#8e9192] block">Bathrooms</span>
                                <span className="text-xs font-bold text-[#e5e2e1]">{selectedProperty.bathrooms || selectedProperty.baths || "2"} Baths</span>
                            </div>
                        </div>

                        <div className="space-y-3 border-t border-[#353535] pt-6">
                            <h3 className="text-xs font-bold uppercase text-[#5ddda1] tracking-[0.2em]">Property Description</h3>
                            <p className="text-xs text-[#c4c7c7] leading-relaxed whitespace-pre-line font-sans">
                                {selectedProperty.description || "No detailed description provided."}
                            </p>
                        </div>

                        <div className="space-y-3 border-t border-[#353535] pt-6">
                            <h3 className="text-xs font-bold uppercase text-[#5ddda1] tracking-[0.2em]">Included Amenities</h3>
                            <div className="flex flex-wrap gap-2.5">
                                {amenitiesList.map((item, index) => (
                                    <span key={index} className="px-3.5 py-2 bg-[#0e0e0e] text-[#e5e2e1] border border-[#353535] rounded-none text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="text-[#5ddda1]">✓</span> {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: BOOKING DESK OR OWNER PREVIEW NOTICE */}
                    <div className="bg-[#1c1b1b] border border-[#353535] rounded-none p-6 sm:p-8 space-y-6 shadow-2xl sticky top-28">
                        <div className="flex justify-between items-baseline border-b border-[#353535] pb-4">
                            <span className="text-2xl font-serif font-bold text-[#e5e2e1]">${pricePerNight}</span>
                            <span className="text-xs font-bold text-[#8e9192] uppercase tracking-widest">/ night</span>
                        </div>
                        
                        {isMyOwnProperty ? (
                            <div className="bg-[#0e0e0e] border border-[#353535] p-5 rounded-none space-y-2 text-xs text-[#c4c7c7]">
                                <span className="font-bold uppercase tracking-[0.2em] text-[#ffb4ab] block">🚫 Booking Restricted</span>
                                <p className="text-xs leading-relaxed">You cannot book your own property asset. Reservation actions are disabled for property creators.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleBooking} className="space-y-5">
                                <div className="space-y-4 text-xs">
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] mb-1.5">Check In</label>
                                        <input 
                                            type="date" 
                                            min={new Date().toISOString().split("T")[0]}
                                            value={checkIn} 
                                            onChange={(e) => setCheckIn(e.target.value)} 
                                            className="w-full bg-[#0e0e0e] border border-[#444748] p-3 rounded-none focus:outline-none focus:border-[#5ddda1] text-[#e5e2e1]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1] mb-1.5">Check Out</label>
                                        <input 
                                            type="date" 
                                            min={checkIn || new Date().toISOString().split("T")[0]}
                                            value={checkOut} 
                                            onChange={(e) => setCheckOut(e.target.value)} 
                                            className="w-full bg-[#0e0e0e] border border-[#444748] p-3 rounded-none focus:outline-none focus:border-[#5ddda1] text-[#e5e2e1]"
                                        />
                                    </div>
                                </div>

                                {/* Live Price Breakdown */}
                                {totalNights > 0 && (
                                    <div className="bg-[#0e0e0e] p-4 rounded-none border border-[#353535] space-y-2.5 text-xs">
                                        <div className="flex justify-between text-[#c4c7c7] font-medium">
                                            <span>${pricePerNight} × {totalNights} {totalNights === 1 ? "night" : "nights"}</span>
                                            <span>${totalPrice}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-bold text-[#e5e2e1] border-t border-[#353535] pt-2.5 uppercase tracking-wider">
                                            <span>Total Amount</span>
                                            <span className="text-[#5ddda1]">${totalPrice}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Redux State Alerts */}
                                {(localError || bookingError) && (
                                    <div className="p-3.5 text-xs font-bold rounded-none border bg-[#0e0e0e] text-[#ffb4ab] border-[#444748] uppercase tracking-wider shadow-lg">
                                        ⚠️ {localError || bookingError}
                                    </div>
                                )}

                                {successMessage && (
                                    <div className="p-3.5 text-xs font-bold rounded-none border bg-[#083823]/50 text-[#5ddda1] border-[#5ddda1] uppercase tracking-wider shadow-lg">
                                        ✓ {successMessage}
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={bookingLoading}
                                    className="w-full py-3.5 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-xs font-bold uppercase tracking-[0.2em] rounded-none transition-all cursor-pointer shadow-xl disabled:opacity-40"
                                >
                                    {bookingLoading ? "Processing Booking..." : "Confirm Reservation"}
                                </button>
                            </form>
                        )}
                    </div>

                </div>

                {/* REVIEWS & REPLIES SECTION */}
                <PropertyComments propertyId={propertyId || selectedProperty?._id || selectedProperty?.id} />

            </div>
        </div>
    );
}