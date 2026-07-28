import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOwnerDashboard, acceptBooking, rejectBooking, clearOwnerNotice } from "../store/ownerDashboardSlice.js";
import OwnerBookingDetailsModal from "./OwnerBookingDetailsModal.jsx";

export default function OwnerDashboardHome() {
    const dispatch = useDispatch();
    const { bookings = [], loading, actionLoadingId, successMessage, error } = useSelector((state) => state.ownerDashboard || {});
    
    const [inspectBooking, setInspectBooking] = useState(null);

    useEffect(() => {
        dispatch(fetchOwnerDashboard());
    }, [dispatch]);

    // ⏱️ Auto-dismiss popup messages after 3 seconds
    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => {
                dispatch(clearOwnerNotice());
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error, dispatch]);

    const handleAccept = (e, id) => {
        e.stopPropagation();
        dispatch(acceptBooking(id));
    };

    const handleReject = (e, id) => {
        e.stopPropagation();
        dispatch(rejectBooking(id));
    };

    return (
        <div className="space-y-6">
            
            <OwnerBookingDetailsModal 
                booking={inspectBooking} 
                onClose={() => setInspectBooking(null)} 
            />

            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-2">
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">HOST PORTAL HOME</span>
                <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">Incoming Booking Stream</h2>
                <p className="text-xs text-gray-500">Manage tenant reservation requests, approve or decline stays, and review details.</p>
            </div>

            {successMessage && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="p-12 flex justify-center">
                    <div className="w-6 h-6 border-2 border-[#151c27] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : bookings.length === 0 ? (
                <div className="bg-white p-12 border border-dashed border-[#e2e8f8] text-center text-xs font-bold text-gray-400 uppercase rounded-xl tracking-wider">
                    No active pending booking requests found.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {bookings.map((booking) => {
                        const bId = booking._id || booking.id;
                        const isActionBusy = actionLoadingId === bId;
                        const status = (booking.status || "pending").toLowerCase();
                        const property = booking.property || {};
                        const tenant = booking.tenant || booking.user || {};

                        return (
                            <div 
                                key={bId}
                                onClick={() => setInspectBooking(booking)}
                                className="bg-white border border-[#e2e8f8] hover:border-[#151c27] p-5 rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all cursor-pointer group"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                            status === "confirmed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                        }`}>
                                            ● {status}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-mono">ID: {bId.slice(-6)}</span>
                                    </div>
                                    <h4 className="text-sm font-bold uppercase text-[#151c27] group-hover:underline">
                                        {property.title || "Rental Property Unit"}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Tenant: <strong className="text-[#151c27]">{tenant.fullname || tenant.username || "Verified User"}</strong> • Stay Total: ${booking.totalPrice || "0"}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                    {status === "pending" && (
                                        <>
                                            <button
                                                onClick={(e) => handleAccept(e, bId)}
                                                disabled={isActionBusy}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                {isActionBusy ? "Processing..." : "Accept"}
                                            </button>
                                            <button
                                                onClick={(e) => handleReject(e, bId)}
                                                disabled={isActionBusy}
                                                className="px-4 py-2 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    <span className="text-xs text-gray-400 pl-2">Click to inspect →</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}