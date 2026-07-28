import React from "react";

export default function OwnerBookingDetailsModal({ booking, onClose }) {
    if (!booking) return null;

    const property = booking.property || {};
    const tenant = booking.tenant || booking.user || {};
    const checkIn = booking.startDate || booking.checkIn;
    const checkOut = booking.endDate || booking.checkOut;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white border border-[#e2e8f8] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                
                <div className="bg-[#151c27] text-white px-6 py-4 flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest">Reservation Inspection Docket</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-sm font-bold cursor-pointer">✕</button>
                </div>

                <div className="p-6 space-y-4 text-xs">
                    <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e2e8f8] space-y-2">
                        <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-wider block">Property Asset</span>
                        <h4 className="font-bold text-[#151c27] text-sm uppercase">{property.title || "Rental Unit"}</h4>
                        <p className="text-gray-500">📍 {property.location || "Location not specified"}</p>
                    </div>

                    <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e2e8f8] space-y-2">
                        <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-wider block">Tenant Profile</span>
                        <p className="font-bold text-[#151c27]">Name: {tenant.fullname || tenant.username || "Verified User"}</p>
                        <p className="text-gray-600">Email: {tenant.email || "N/A"}</p>
                        <p className="text-gray-600">Phone: {tenant.phone || "Not provided"}</p>
                    </div>

                    <div className="bg-[#f9f9ff] p-4 rounded-xl border border-[#e2e8f8] space-y-2">
                        <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-wider block">Stay Financials & Schedule</span>
                        <div className="grid grid-cols-2 gap-2 text-gray-700">
                            <p>Check-In: <strong>{checkIn ? new Date(checkIn).toLocaleDateString() : "N/A"}</strong></p>
                            <p>Check-Out: <strong>{checkOut ? new Date(checkOut).toLocaleDateString() : "N/A"}</strong></p>
                            <p>Total Revenue: <strong className="text-emerald-600">${booking.totalPrice || "0"}</strong></p>
                            <p>Status: <strong className="uppercase">{booking.status || "pending"}</strong></p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#f9f9ff] border-t border-[#e2e8f8] px-6 py-4 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-[#151c27] text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-black cursor-pointer">
                        Close Inspector
                    </button>
                </div>

            </div>
        </div>
    );
}