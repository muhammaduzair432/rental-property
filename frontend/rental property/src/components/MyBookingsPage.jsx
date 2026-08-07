import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";

export default function MyBookingsPage() {
    const navigate = useNavigate();

    const [userBookings, setUserBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelLoadingId, setCancelLoadingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Fetch user reservations on mount
    useEffect(() => {
        fetchUserBookings();
    }, []);

    const fetchUserBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("bookings/my-list");
            
            const bookingsData = 
                res.data?.data || 
                res.data?.bookings || 
                res.data?.myBookings || 
                res.data || [];

            const list = Array.isArray(bookingsData) ? bookingsData : [];

            // Filter out any cancelled bookings returned by backend database ledger
            const activeBookings = list.filter((b) => {
                const status = (b.status || "").toLowerCase();
                return status !== "cancelled" && status !== "canceled";
            });

            setUserBookings(activeBookings);
        } catch (err) {
            console.error("Fetch bookings error:", err);
            setError(err.response?.data?.message || err.message || "Failed to load your reservations.");
        } finally {
            setLoading(false);
        }
    };

    // Cancellation handler aligned with ledger strategy & concession tracking
    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel or terminate this reservation?")) return;

        try {
            setCancelLoadingId(bookingId);
            setError(null);

            // Call backend cancellation API
            const res = await api.put(`bookings/cancel/${bookingId}`);

            // Extract structured cancellation feedback from ledger response if available
            const cancellationDetails = res.data?.data;
            let displayMessage = res.data?.message || "Reservation successfully updated.";
            
            if (cancellationDetails?.cancellationType === "CANCELLED_MID_STAY") {
                displayMessage = `Mid-stay cancellation logged. Owner concession applied: $${cancellationDetails.ownerConcessionApplied.toFixed(2)}`;
            }

            // Show success summary message
            setSuccessMessage(displayMessage);

            // ⚡ IMMEDIATELY filter out and remove booking from active state view
            setUserBookings((prevBookings) =>
                prevBookings.filter((booking) => {
                    const bId = booking._id || booking.id;
                    return String(bId) !== String(bookingId);
                })
            );

            // Clear success message after 5 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);

        } catch (err) {
            console.error("Cancel booking error:", err);
            setError(err.response?.data?.message || err.message || "Failed to process cancellation.");
        } finally {
            setCancelLoadingId(null);
        }
    };

    // Helper: Formats ISO date to readable string
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Helper: Calculates stay duration in nights
    const calculateNights = (start, end) => {
        if (!start || !end) return 1;
        const diff = new Date(end) - new Date(start);
        const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights : 1;
    };

    // Helper: Safely extracts text values
    const safeText = (val, fallback = "") => {
        if (!val) return fallback;
        if (typeof val === "string" || typeof val === "number") return String(val);
        if (typeof val === "object") {
            return val.title || val.name || val.address || val.message || fallback;
        }
        return fallback;
    };

    return (
        <div className="space-y-8 sm:space-y-10 relative bg-[#131313] text-[#e5e2e1] min-h-screen pb-16 px-4 sm:px-6 lg:px-8">
            
            {/* Top Action Navigator Bar */}
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

            {/* Main Content Container */}
            <div className="space-y-6 max-w-6xl mx-auto">
                
                {/* Header Title & Refresh Action */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#353535] pb-4">
                    <div>
                        <span className="text-[9px] sm:text-[10px] font-bold text-[#c4c7c7] uppercase tracking-[0.2em] block">
                            RESERVATION ARCHIVE
                        </span>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold uppercase tracking-tight text-[#e5e2e1] mt-1">
                            Booked Stays ({userBookings.length})
                        </h2>
                    </div>

                    <button 
                        onClick={fetchUserBookings}
                        className="px-4 py-2.5 bg-[#1c1b1b] border border-[#444748] text-[10px] font-bold uppercase tracking-widest text-[#5ddda1] hover:bg-[#5ddda1] hover:text-[#003823] transition-all cursor-pointer self-start sm:self-auto rounded-none shadow-md"
                    >
                        ↻ Refresh Records
                    </button>
                </div>

                {/* Notifications */}
                {successMessage && (
                    <div className="p-4 text-xs font-bold rounded-none bg-[#5ddda1] text-[#003823] border border-[#5ddda1] uppercase tracking-wider shadow-lg flex items-center gap-2">
                        <span>✓</span> {safeText(successMessage)}
                    </div>
                )}

                {error && (
                    <div className="p-4 text-xs font-bold rounded-none bg-[#1c1b1b] text-[#ffb4ab] border border-[#444748] uppercase tracking-wider shadow-lg flex items-center gap-2">
                        <span>⚠️</span> {safeText(error)}
                    </div>
                )}

                {/* Content Stream */}
                {loading ? (
                    <div className="p-16 sm:p-20 flex flex-col items-center justify-center space-y-4 bg-[#1c1b1b] border border-[#353535]">
                        <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
                        <div className="text-[10px] font-bold tracking-[0.25em] text-[#c4c7c7] uppercase font-mono text-center">
                            Syncing reservation ledger logs...
                        </div>
                    </div>
                ) : userBookings.length === 0 ? (
                    <div className="bg-[#1c1b1b] border border-[#353535] rounded-none p-10 sm:p-16 text-center space-y-4 shadow-2xl">
                        <div className="text-3xl">🏛️</div>
                        <h3 className="text-sm font-serif font-bold uppercase tracking-widest text-[#e5e2e1]">
                            No Active Stays Registered
                        </h3>
                        <p className="text-xs text-[#c4c7c7] max-w-sm mx-auto leading-relaxed">
                            You currently possess no verified property reservations within our secure repository.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full sm:w-auto px-6 py-3 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-xs font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer shadow-lg"
                            >
                                Explore Portfolio Catalog →
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {userBookings.map((booking) => {
                            const bookingId = booking._id || booking.id;
                            const property = booking.property || booking.propertyDetails || {};

                            const startDate = booking.startDate || booking.checkIn;
                            const endDate = booking.endDate || booking.checkOut;
                            const nights = booking.totalNights || calculateNights(startDate, endDate);
                            
                            const statusRaw = booking.status || "pending";
                            const status = typeof statusRaw === "string" ? statusRaw.toLowerCase() : "pending";

                            const propTitle = safeText(property.title || property.name, "Reserved Property Asset");
                            const propLocation = safeText(property.location || property.address, "Verified coordinate archive");
                            const propType = safeText(property.type || property.category, "Estate Space");

                            return (
                                <div
                                    key={String(bookingId)}
                                    className="bg-[#1c1b1b] border border-[#353535] rounded-none p-4 sm:p-6 shadow-2xl flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between hover:border-[#5ddda1] transition-all duration-500 group"
                                >
                                    {/* Left: Property Thumbnail & Details */}
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full lg:w-auto flex-1">
                                        <div className="w-full sm:w-28 h-40 sm:h-28 bg-[#0e0e0e] rounded-none border border-[#444748] overflow-hidden shrink-0">
                                            {typeof property.image === "string" || (Array.isArray(property.images) && typeof property.images[0] === "string") ? (
                                                <img
                                                    src={property.image || property.images[0]}
                                                    alt={propTitle}
                                                    className="w-full h-full object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[9px] text-[#8e9192] font-bold uppercase text-center p-2">
                                                    No Image Record
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2 flex-1 w-full">
                                            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold uppercase text-[#8e9192] tracking-[0.2em]">
                                                <span>{propType}</span>
                                                <span>•</span>
                                                <span className="font-mono text-[#5ddda1]">
                                                    REF: {String(bookingId).slice(-6)}
                                                </span>
                                            </div>

                                            <h4 
                                                onClick={() => property._id && navigate(`/property/${property._id}`)}
                                                className="font-serif text-base sm:text-lg font-semibold text-[#e5e2e1] tracking-tight hover:text-[#5ddda1] cursor-pointer transition-colors line-clamp-1"
                                            >
                                                {propTitle}
                                            </h4>

                                            <p className="text-xs text-[#c4c7c7] font-sans line-clamp-1">
                                                📍 {propLocation}
                                            </p>

                                            <div className="pt-1">
                                                <span
                                                    className={`px-3 py-1 rounded-none text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 border ${
                                                        status === "confirmed"
                                                            ? "bg-[#083823]/50 text-[#5ddda1] border-[#5ddda1]"
                                                            : "bg-[#2a2a2a] text-[#c4c7c7] border-[#444748]"
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${status === "confirmed" ? "bg-[#5ddda1]" : "bg-[#c4c7c7]"}`}></span>
                                                    {status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Dates & Financial Valuation */}
                                    <div className="w-full lg:w-80 bg-[#0e0e0e] border border-[#353535] p-4 rounded-none space-y-3 text-xs shrink-0">
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#c4c7c7] block">
                                            Stay Allocation Window
                                        </span>

                                        <div className="flex items-center justify-between text-[#e5e2e1] font-sans">
                                            <div>
                                                <span className="text-[8px] text-[#8e9192] block uppercase tracking-wider">Check In</span>
                                                <span className="font-bold text-xs">{formatDate(startDate)}</span>
                                            </div>
                                            <span className="text-[#5ddda1]">→</span>
                                            <div className="text-right">
                                                <span className="text-[8px] text-[#8e9192] block uppercase tracking-wider">Check Out</span>
                                                <span className="font-bold text-xs">{formatDate(endDate)}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-[#353535] pt-2 flex justify-between items-center text-[10px] text-[#c4c7c7] uppercase font-bold tracking-wider">
                                            <span>Duration: {nights} {nights === 1 ? "Night" : "Nights"}</span>
                                            <span className="text-[#5ddda1]">
                                                ${safeText(booking.totalPrice || (property.pricePerNight * nights) || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Cancellation Action */}
                                    <div className="w-full lg:w-auto flex lg:flex-col justify-end items-end gap-2 shrink-0">
                                        <button
                                            onClick={() => handleCancel(bookingId)}
                                            disabled={cancelLoadingId === bookingId}
                                            className="w-full lg:w-auto px-6 py-3 bg-[#080808] hover:bg-[#93000a] text-[#ffb4ab] hover:text-[#ffdad6] border border-[#444748] hover:border-[#93000a] text-[10px] font-bold uppercase tracking-[0.15em] rounded-none transition-all duration-300 cursor-pointer disabled:opacity-40 shadow-lg text-center"
                                        >
                                            {cancelLoadingId === bookingId ? "Processing..." : "Cancel Reservation"}
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