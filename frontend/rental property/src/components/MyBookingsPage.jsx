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

            // Filter out any cancelled bookings returned by backend
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

    // Immediate cancellation & removal from list
    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this reservation?")) return;

        try {
            setCancelLoadingId(bookingId);
            setError(null);

            // Call backend cancellation API
            const res = await api.put(`bookings/cancel/${bookingId}`);

            // Show success message
            setSuccessMessage(res.data?.message || "Reservation canceled successfully.");

            // ⚡ IMMEDIATELY filter out and remove booking from state & update count
            setUserBookings((prevBookings) =>
                prevBookings.filter((booking) => {
                    const bId = booking._id || booking.id;
                    return String(bId) !== String(bookingId);
                })
            );

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);

        } catch (err) {
            console.error("Cancel booking error:", err);
            setError(err.response?.data?.message || err.message || "Failed to cancel reservation.");
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
        <div className="min-h-screen bg-[#f9f9ff] text-[#151c27] font-sans antialiased">
            {/* Header Navigation */}
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

            {/* Main Content Container */}
            <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                
                {/* Header title showing live active count */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f8] pb-4">
                    <div>
                        <span className="text-[10px] font-bold text-[#7d8497] uppercase tracking-widest block">
                            MY RESERVATIONS
                        </span>
                        <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">
                            Booked Stays ({userBookings.length})
                        </h2>
                    </div>

                    <button 
                        onClick={fetchUserBookings}
                        className="px-3 py-1.5 bg-white border border-[#e2e8f8] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#f9f9ff] transition-all cursor-pointer self-start sm:self-auto"
                    >
                        🔄 Refresh List
                    </button>
                </div>

                {/* Notifications */}
                {successMessage && (
                    <div className="p-3 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                        ✓ {safeText(successMessage)}
                    </div>
                )}

                {error && (
                    <div className="p-3 text-xs font-bold rounded-md bg-red-50 text-red-800 border border-red-200 uppercase tracking-wider">
                        ⚠️ {safeText(error)}
                    </div>
                )}

                {/* Content Stream */}
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-3 border-[#151c27] border-t-transparent rounded-full animate-spin"></div>
                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 font-mono">
                            Retrieving Reservation Records...
                        </div>
                    </div>
                ) : userBookings.length === 0 ? (
                    <div className="bg-white border border-[#e2e8f8] rounded-xl p-12 text-center space-y-4 shadow-xs">
                        <div className="text-4xl">🏨</div>
                        <h3 className="text-base font-bold uppercase tracking-wide text-[#151c27]">
                            No Active Stays
                        </h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">
                            You currently have no active property reservations.
                        </p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="px-5 py-2.5 bg-[#151c27] hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-sm"
                        >
                            Browse Marketplace
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {userBookings.map((booking) => {
                            const bookingId = booking._id || booking.id;
                            const property = booking.property || booking.propertyDetails || {};

                            const startDate = booking.startDate || booking.checkIn;
                            const endDate = booking.endDate || booking.checkOut;
                            const nights = booking.totalNights || calculateNights(startDate, endDate);
                            
                            const statusRaw = booking.status || "pending";
                            const status = typeof statusRaw === "string" ? statusRaw.toLowerCase() : "pending";

                            const propTitle = safeText(property.title || property.name, "Reserved Property Space");
                            const propLocation = safeText(property.location || property.address, "Verified location");
                            const propType = safeText(property.type || property.category, "Rental Space");

                            return (
                                <div
                                    key={String(bookingId)}
                                    className="bg-white border border-[#e2e8f8] hover:border-gray-300 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start md:items-center justify-between transition-all"
                                >
                                    {/* Left: Property Thumbnail & Details */}
                                    <div className="flex gap-4 items-start sm:items-center w-full md:w-auto">
                                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#f9f9ff] rounded-lg border border-[#e2e8f8] overflow-hidden shrink-0">
                                            {typeof property.image === "string" || (Array.isArray(property.images) && typeof property.images[0] === "string") ? (
                                                <img
                                                    src={property.image || property.images[0]}
                                                    alt={propTitle}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-400 font-bold uppercase text-center p-2">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7d8497]">
                                                    {propType}
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-[10px] font-mono text-gray-400 uppercase">
                                                    Ref: {String(bookingId).slice(-6)}
                                                </span>
                                            </div>

                                            <h3 
                                                onClick={() => property._id && navigate(`/property/${property._id}`)}
                                                className="text-base font-bold uppercase text-[#151c27] tracking-tight hover:underline cursor-pointer"
                                            >
                                                {propTitle}
                                            </h3>

                                            <p className="text-xs text-gray-500 font-medium">
                                                📍 {propLocation}
                                            </p>

                                            <div className="pt-1">
                                                <span
                                                    className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider inline-block ${
                                                        status === "confirmed"
                                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                            : "bg-amber-100 text-amber-800 border border-amber-200"
                                                    }`}
                                                >
                                                    ● {status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle: Dates & Pricing */}
                                    <div className="w-full md:w-auto bg-[#f9f9ff] border border-[#e2e8f8] p-3.5 rounded-lg space-y-2 text-xs">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#7d8497] block">
                                            Selected Stay Window
                                        </span>

                                        <div className="flex items-center gap-3 font-semibold text-[#151c27]">
                                            <div>
                                                <span className="text-[9px] text-gray-400 block uppercase">Check In</span>
                                                <span>{formatDate(startDate)}</span>
                                            </div>
                                            <span className="text-gray-400">→</span>
                                            <div>
                                                <span className="text-[9px] text-gray-400 block uppercase">Check Out</span>
                                                <span>{formatDate(endDate)}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-[#e2e8f8] pt-1.5 flex justify-between items-center text-[10px] text-gray-600 font-medium">
                                            <span>Duration: {nights} {nights === 1 ? "Night" : "Nights"}</span>
                                            <span className="font-bold text-[#151c27]">
                                                Total: ${safeText(booking.totalPrice || (property.pricePerNight * nights) || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Cancel Action */}
                                    <div className="w-full md:w-auto flex md:flex-col justify-end items-end gap-2 shrink-0">
                                        <button
                                            onClick={() => handleCancel(bookingId)}
                                            disabled={cancelLoadingId === bookingId}
                                            className="w-full md:w-auto px-4 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {cancelLoadingId === bookingId ? "Canceling..." : "Cancel Reservation"}
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