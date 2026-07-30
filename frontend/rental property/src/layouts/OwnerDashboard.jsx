// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchOwnerDashboard, acceptBooking, rejectBooking } from "../store/ownerDashboardSlice.js";
// import OwnerBookingDetailsModal from "./OwnerBookingDetailsModal.jsx";

// export default function OwnerDashboardHome() {
//     const dispatch = useDispatch();
//     const { bookings = [], loading, actionLoadingId, successMessage, error } = useSelector((state) => state.ownerDashboard || {});
    
//     const [inspectBooking, setInspectBooking] = useState(null);

//     useEffect(() => {
//         dispatch(fetchOwnerDashboard());
//     }, [dispatch]);

//     const handleAccept = (e, id) => {
//         e.stopPropagation();
//         dispatch(acceptBooking(id));
//     };

//     const handleReject = (e, id) => {
//         e.stopPropagation();
//         dispatch(rejectBooking(id));
//     };

//     return (
//         <div className="space-y-6 sm:space-y-8 bg-[#131313] text-[#e5e2e1] font-sans antialiased">
            
//             {/* Single Booking Inspection Modal */}
//             <OwnerBookingDetailsModal 
//                 booking={inspectBooking} 
//                 onClose={() => setInspectBooking(null)} 
//             />

//             {/* Header Banner */}
//             <div className="bg-[#1c1b1b] p-6 sm:p-8 rounded-none border border-[#353535] shadow-2xl space-y-2">
//                 <span className="text-[9px] sm:text-[10px] font-bold text-[#8e9192] uppercase tracking-[0.25em]">HOST PORTAL HOME</span>
//                 <h2 className="text-xl sm:text-2xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">Incoming Booking Stream</h2>
//                 <p className="text-xs text-[#c4c7c7] font-sans">Manage tenant reservation requests, approve or decline stays, and review details.</p>
//             </div>

//             {successMessage && (
//                 <div className="bg-[#083823]/50 text-[#5ddda1] border border-[#5ddda1] px-4 py-3 rounded-none text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
//                     <span>✓</span> {successMessage}
//                 </div>
//             )}
//             {error && (
//                 <div className="bg-[#1c1b1b] text-[#ffb4ab] border border-[#444748] px-4 py-3 rounded-none text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
//                     <span>⚠️</span> {error}
//                 </div>
//             )}

//             {/* Bookings Stream List */}
//             {loading ? (
//                 <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[#1c1b1b] border border-[#353535]">
//                     <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
//                     <div className="text-[10px] font-bold tracking-[0.25em] text-[#8e9192] uppercase font-mono">
//                         Retrieving Reservation Stream...
//                     </div>
//                 </div>
//             ) : bookings.length === 0 ? (
//                 <div className="bg-[#1c1b1b] p-12 border border-[#353535] text-center text-xs font-bold text-[#8e9192] uppercase rounded-none tracking-widest shadow-2xl">
//                     No active booking requests found for your portfolio properties.
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 gap-6">
//                     {bookings.map((booking) => {
//                         const bId = booking._id || booking.id;
//                         const isActionBusy = actionLoadingId === bId;
//                         const status = (booking.status || "pending").toLowerCase();
//                         const property = booking.property || {};
//                         const tenant = booking.tenant || booking.user || {};
//                         const propertyImage = property.image || property.images?.[0] || "";

//                         return (
//                             <div 
//                                 key={bId}
//                                 onClick={() => setInspectBooking(booking)}
//                                 className="bg-[#1c1b1b] border border-[#353535] hover:border-[#5ddda1] p-5 sm:p-6 rounded-none shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 transition-all duration-300 cursor-pointer group"
//                             >
//                                 {/* Left Side: Property Thumbnail & Metadata */}
//                                 <div className="flex gap-4 items-start sm:items-center w-full lg:w-auto">
//                                     <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#0e0e0e] rounded-none border border-[#444748] overflow-hidden shrink-0 relative">
//                                         {propertyImage ? (
//                                             <img
//                                                 src={propertyImage}
//                                                 alt={property.title || "Property"}
//                                                 className="w-full h-full object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-500"
//                                             />
//                                         ) : (
//                                             <div className="w-full h-full flex items-center justify-center text-[9px] text-[#8e9192] font-bold uppercase text-center p-2">
//                                                 No Asset Image
//                                             </div>
//                                         )}
//                                         <span className="absolute bottom-1 left-1 bg-[#080808]/90 text-[#5ddda1] text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
//                                             Ref: {bId.slice(-4)}
//                                         </span>
//                                     </div>

//                                     <div className="space-y-1.5 flex-1">
//                                         <div className="flex items-center gap-2">
//                                             <span className={`px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-widest ${
//                                                 status === "confirmed" ? "bg-[#083823] text-[#5ddda1] border border-[#5ddda1]" :
//                                                 status === "rejected" ? "bg-[#2a1215] text-[#ffb4ab] border border-[#444748]" : "bg-[#2d2512] text-[#ffdf9e] border border-[#444748]"
//                                             }`}>
//                                                 ● {status}
//                                             </span>
//                                             <span className="text-[9px] text-[#8e9192] font-mono">
//                                                 {booking.totalNights || 1} {booking.totalNights === 1 ? "Night" : "Nights"}
//                                             </span>
//                                         </div>

//                                         <h4 className="text-sm font-serif font-bold uppercase text-[#e5e2e1] group-hover:text-[#5ddda1] transition-colors line-clamp-1">
//                                             {property.title || "Rental Property Unit"}
//                                         </h4>

//                                         <p className="text-xs text-[#c4c7c7] font-sans">
//                                             Tenant: <strong className="text-[#e5e2e1]">{tenant.fullname || tenant.username || "Verified User"}</strong> • Stay Total: <span className="text-[#5ddda1] font-bold">${booking.totalPrice || "0"}</span>
//                                         </p>
//                                     </div>
//                                 </div>

//                                 {/* Right Side: Actions */}
//                                 <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-[#353535]">
//                                     {status === "pending" && (
//                                         <>
//                                             <button
//                                                 onClick={(e) => handleAccept(e, bId)}
//                                                 disabled={isActionBusy}
//                                                 className="flex-1 lg:flex-none px-5 py-2.5 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer disabled:opacity-40 shadow-md"
//                                             >
//                                                 {isActionBusy ? "Processing..." : "Accept"}
//                                             </button>
//                                             <button
//                                                 onClick={(e) => handleReject(e, bId)}
//                                                 disabled={isActionBusy}
//                                                 className="flex-1 lg:flex-none px-5 py-2.5 bg-[#1c1b1b] hover:bg-[#ffb4ab] text-[#ffb4ab] hover:text-[#380007] border border-[#444748] hover:border-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest rounded-none transition-all cursor-pointer disabled:opacity-40 shadow-md"
//                                             >
//                                                 Reject
//                                             </button>
//                                         </>
//                                     )}
//                                     <span className="text-[10px] text-[#8e9192] uppercase tracking-widest pl-2 hidden sm:inline">Inspect →</span>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}

//         </div>
//     );
// }