import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPropertyById } from "../store/propertySlice.js";
import api from "../utils/api.js";
import PropertyComments from "../components/PropertyComments.jsx";

export default function PropertyDetailsPage() {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { selectedProperty, loadingDetails, errorDetails } = useSelector(
        (state) => state.properties || {}
    );

    // Gallery State
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Booking Form State
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [bookingStatus, setBookingStatus] = useState(null);

    // Fetch details on mount
    useEffect(() => {
        if (propertyId) {
            dispatch(fetchPropertyById(propertyId));
        }
    }, [dispatch, propertyId]);

    // Submit Booking Request
    const handleBooking = async (e) => {
        e.preventDefault();
        if (!checkIn || !checkOut) {
            setBookingStatus({ type: "error", text: "Please select both check-in and check-out dates." });
            return;
        }

        try {
            const res = await api.post("bookings/create", {
                propertyId,
                startDate: checkIn,
                endDate: checkOut
            });
            if (res.data?.success || res.status === 200 || res.status === 201) {
                setBookingStatus({ type: "success", text: "Booking request submitted successfully!" });
            }
        } catch (err) {
            setBookingStatus({ 
                type: "error", 
                text: err.response?.data?.message || "Property is unavailable for these dates." 
            });
        }
    };

    if (loadingDetails) {
        return (
            <div className="min-h-screen w-full bg-[#f9f9ff] flex flex-col items-center justify-center p-12 space-y-3">
                <div className="w-8 h-8 border-3 border-[#151c27] border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">
                    Loading Property Details...
                </div>
            </div>
        );
    }

    if (errorDetails || !selectedProperty) {
        return (
            <div className="min-h-screen w-full bg-[#f9f9ff] p-8 flex flex-col items-center justify-center space-y-4">
                <div className="p-6 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-md uppercase tracking-wider max-w-lg w-full text-center">
                    ⚠️ {errorDetails || "Property record not found."}
                </div>
                <button 
                    onClick={() => navigate(-1)} 
                    className="px-4 py-2 bg-[#151c27] text-white text-xs font-bold uppercase tracking-wider rounded cursor-pointer"
                >
                    Back To Marketplace
                </button>
            </div>
        );
    }

    // Safely prepare image list
    const imagesList = selectedProperty.images?.length > 0 
        ? selectedProperty.images 
        : selectedProperty.image 
            ? [selectedProperty.image] 
            : [];

    // Extract amenities (supports array or comma-separated string)
    const amenitiesList = Array.isArray(selectedProperty.amenities)
        ? selectedProperty.amenities
        : typeof selectedProperty.amenities === "string"
            ? selectedProperty.amenities.split(",").map((a) => a.trim())
            : ["WiFi", "Air Conditioning", "Parking", "Kitchen", "Security"];

    return (
        <div className="min-h-screen w-full bg-[#f9f9ff] text-[#151c27] font-sans antialiased">
            
            {/* TOP NAVIGATION BAR */}
            <div className="bg-white border-b border-[#e2e8f8] sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="text-xs font-bold uppercase tracking-wider text-[#151c27] hover:underline flex items-center gap-2 cursor-pointer"
                    >
                        ← Back To Marketplace
                    </button>
                    <span className="text-[10px] font-bold text-[#7d8497] uppercase tracking-widest">
                        Asset ID: {selectedProperty._id || selectedProperty.id}
                    </span>
                </div>
            </div>

            {/* MAIN CONTENT BODY */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
                
                {/* 📸 GALLERY SECTION */}
                <div className="bg-white border border-[#e2e8f8] rounded-xl overflow-hidden shadow-xs p-4 space-y-4">
                    <div className="w-full h-96 sm:h-[480px] bg-[#f9f9ff] rounded-lg overflow-hidden relative border border-[#e2e8f8]">
                        {imagesList.length > 0 ? (
                            <img 
                                src={imagesList[activeImageIndex]} 
                                alt={selectedProperty.title} 
                                className="w-full h-full object-cover transition-all duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold uppercase text-gray-400 tracking-widest">
                                No Images Uploaded
                            </div>
                        )}
                        <span className="absolute bottom-4 left-4 bg-[#151c27] text-white text-xs font-black px-3 py-1.5 rounded-md uppercase tracking-wider shadow-md">
                            ${selectedProperty.pricePerNight || selectedProperty.price || "0"} / Night
                        </span>
                    </div>

                    {imagesList.length > 1 && (
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {imagesList.map((imgUrl, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveImageIndex(index)}
                                    className={`w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                        activeImageIndex === index ? "border-[#151c27] scale-95 shadow-md" : "border-[#e2e8f8] opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    <img src={imgUrl} alt="thumbnail" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 🏠 PROPERTY DETAILS & BOOKING SIDEBAR GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* LEFT 2 COLUMNS: ORGANIZED PROPERTY SPECIFICATIONS */}
                    <div className="lg:col-span-2 bg-white border border-[#e2e8f8] rounded-xl p-6 sm:p-8 space-y-8 shadow-xs">
                        
                        {/* 1. Header & Title Block */}
                        <div>
                            <div className="flex justify-between items-center text-[10px] font-black uppercase text-[#7d8497] tracking-widest mb-1">
                                <span>Category: {selectedProperty.category || selectedProperty.type || "Rental Property"}</span>
                                <span className="text-emerald-600 font-bold">● Active Listing</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold uppercase text-[#151c27] tracking-tight">
                                {selectedProperty.title || selectedProperty.name || "Untitled Property Listing"}
                            </h1>
                            <p className="text-xs text-gray-500 mt-2 font-semibold flex items-center gap-1">
                                📍 {selectedProperty.location || selectedProperty.address || "Location verified"}
                            </p>
                        </div>

                        {/* 2. Key Specifications Metric Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#f9f9ff] rounded-lg border border-[#e2e8f8]">
                            <div>
                                <span className="text-[9px] font-bold uppercase text-[#7d8497] block">Type</span>
                                <span className="text-xs font-bold text-[#151c27] uppercase">{selectedProperty.type || "Apartment"}</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase text-[#7d8497] block">Max Guests</span>
                                <span className="text-xs font-bold text-[#151c27]">{selectedProperty.maxGuests || selectedProperty.guests || "4"} People</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase text-[#7d8497] block">Bedrooms</span>
                                <span className="text-xs font-bold text-[#151c27]">{selectedProperty.bedrooms || selectedProperty.beds || "2"} Rooms</span>
                            </div>
                            <div>
                                <span className="text-[9px] font-bold uppercase text-[#7d8497] block">Bathrooms</span>
                                <span className="text-xs font-bold text-[#151c27]">{selectedProperty.bathrooms || selectedProperty.baths || "2"} Baths</span>
                            </div>
                        </div>

                        {/* 3. Description Section */}
                        <div className="space-y-3 border-t border-[#e2e8f8] pt-6">
                            <h3 className="text-xs font-bold uppercase text-[#7d8497] tracking-widest">
                                Property Description
                            </h3>
                            <p className="text-xs text-[#45464c] leading-relaxed whitespace-pre-line">
                                {selectedProperty.description || "No detailed description provided for this listing."}
                            </p>
                        </div>

                        {/* 4. Amenities Grid */}
                        <div className="space-y-3 border-t border-[#e2e8f8] pt-6">
                            <h3 className="text-xs font-bold uppercase text-[#7d8497] tracking-widest">
                                Included Amenities & Features
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {amenitiesList.map((item, index) => (
                                    <span 
                                        key={index} 
                                        className="px-3 py-1.5 bg-[#f9f9ff] text-[#151c27] border border-[#e2e8f8] rounded-md text-[11px] font-bold uppercase tracking-wider"
                                    >
                                        ✓ {item}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT 1 COLUMN: BOOKING FORM */}
                    <div className="bg-white border border-[#e2e8f8] rounded-xl p-6 space-y-4 shadow-xs sticky top-20">
                        <span className="text-[10px] font-bold uppercase text-[#7d8497] tracking-widest block">
                            Direct Booking Desk
                        </span>
                        
                        <form onSubmit={handleBooking} className="space-y-4">
                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-gray-500 mb-1">Check In</label>
                                    <input 
                                        type="date" 
                                        value={checkIn} 
                                        onChange={(e) => setCheckIn(e.target.value)} 
                                        className="w-full bg-[#f9f9ff] border border-[#e2e8f8] p-2.5 rounded-md focus:outline-none focus:border-[#151c27]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold uppercase text-gray-500 mb-1">Check Out</label>
                                    <input 
                                        type="date" 
                                        value={checkOut} 
                                        onChange={(e) => setCheckOut(e.target.value)} 
                                        className="w-full bg-[#f9f9ff] border border-[#e2e8f8] p-2.5 rounded-md focus:outline-none focus:border-[#151c27]"
                                    />
                                </div>
                            </div>

                            {bookingStatus && (
                                <div className={`p-3 text-xs font-bold rounded-md border ${
                                    bookingStatus.type === "success" 
                                        ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                                        : "bg-red-50 text-red-800 border-red-200"
                                }`}>
                                    {bookingStatus.text}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                className="w-full py-3 bg-[#151c27] hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-md transition-all cursor-pointer shadow-sm"
                            >
                                Confirm Reservation
                            </button>
                        </form>
                    </div>

                </div>

                {/* 💬 REVIEWS & FEEDBACK THREAD */}
                <PropertyComments propertyId={propertyId || selectedProperty?._id || selectedProperty?.id} />

            </div>
        </div>
    );
}