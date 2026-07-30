import React from "react";

export default function OwnerBookingDetailsModal({ booking, onClose }) {
    if (!booking) return null;

    const property = booking.property || {};
    const tenant = booking.tenant || booking.user || {};
    const checkIn = booking.startDate || booking.checkIn;
    const checkOut = booking.endDate || booking.checkOut;

    return (
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-[#080808]/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-[#1c1b1b] border border-[#353535] w-full max-w-lg rounded-none shadow-2xl overflow-hidden flex flex-col text-[#e5e2e1] my-auto">
                
                {/* Modal Header */}
                <div className="bg-[#0e0e0e] border-b border-[#353535] px-6 py-5 flex items-center justify-between">
                    <div>
                        <span className="text-[9px] font-bold text-[#5ddda1] uppercase tracking-[0.25em] block">HOST VERIFICATION</span>
                        <h3 className="text-xs font-bold uppercase text-[#e5e2e1] tracking-wider mt-1">Reservation Inspection Docket</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="font-bold text-[#8e9192] hover:text-[#5ddda1] cursor-pointer px-2 py-1 text-sm transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body Content */}
                <div className="p-6 sm:p-8 space-y-4 text-xs">
                    
                    {/* Property Asset Card */}
                    <div className="bg-[#0e0e0e] p-4 sm:p-5 rounded-none border border-[#353535] space-y-2 shadow-xl">
                        <span className="text-[9px] font-bold text-[#5ddda1] uppercase tracking-[0.2em] block">Property Asset</span>
                        <h4 className="font-serif font-bold text-[#e5e2e1] text-sm uppercase tracking-wide">{property.title || "Rental Unit"}</h4>
                        <p className="text-[#c4c7c7] font-sans">📍 {property.location || "Location not specified"}</p>
                    </div>

                    {/* Tenant Profile Card */}
                    <div className="bg-[#0e0e0e] p-4 sm:p-5 rounded-none border border-[#353535] space-y-2 shadow-xl">
                        <span className="text-[9px] font-bold text-[#5ddda1] uppercase tracking-[0.2em] block">Tenant Profile</span>
                        <p className="font-bold text-[#e5e2e1]">Name: <span className="font-normal text-[#c4c7c7]">{tenant.fullname || tenant.username || "Verified User"}</span></p>
                        <p className="text-[#c4c7c7]">Email: <span className="font-mono text-[#e5e2e1]">{tenant.email || "N/A"}</span></p>
                        <p className="text-[#c4c7c7]">Phone: <span className="font-mono text-[#e5e2e1]">{tenant.phone || "Not provided"}</span></p>
                    </div>

                    {/* Stay Financials & Schedule Card */}
                    <div className="bg-[#0e0e0e] p-4 sm:p-5 rounded-none border border-[#353535] space-y-2.5 shadow-xl">
                        <span className="text-[9px] font-bold text-[#5ddda1] uppercase tracking-[0.2em] block">Stay Financials & Schedule</span>
                        <div className="grid grid-cols-2 gap-3 text-[#c4c7c7]">
                            <p>Check-In: <strong className="text-[#e5e2e1] block font-mono mt-0.5">{checkIn ? new Date(checkIn).toLocaleDateString() : "N/A"}</strong></p>
                            <p>Check-Out: <strong className="text-[#e5e2e1] block font-mono mt-0.5">{checkOut ? new Date(checkOut).toLocaleDateString() : "N/A"}</strong></p>
                            <p>Total Revenue: <strong className="text-[#5ddda1] block font-mono text-sm mt-0.5">${booking.totalPrice || "0"}</strong></p>
                            <p>Status: <strong className="uppercase text-[#5ddda1] block tracking-wider mt-0.5">{booking.status || "pending"}</strong></p>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-[#0e0e0e] border-t border-[#353535] px-6 py-4 flex justify-end">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-3 bg-[#5ddda1] text-[#003823] text-[10px] font-bold uppercase tracking-widest rounded-none hover:bg-[#08a56e] cursor-pointer transition-all shadow-lg"
                    >
                        Close Inspector
                    </button>
                </div>

            </div>
        </div>
    );
}