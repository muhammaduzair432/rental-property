import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSystemReports, fetchGlobalBookings } from "../../store/adminSlice.js";

export default function AdminReportsPage() {
    const dispatch = useDispatch();
    const { systemReports = {}, globalBookings = [] } = useSelector((state) => state.admin || {});

    useEffect(() => {
        dispatch(fetchSystemReports());
        dispatch(fetchGlobalBookings());
    }, [dispatch]);

    const usersRep = systemReports.usersSummaryReport || {};
    const bookingsRep = systemReports.bookingsSummaryReport || {};
    const earningsRep = systemReports.earningsFinancialReport || {};

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
            {/* Hero Banner with Themed Visual & Dark Vignette Filter */}
            <div className="relative w-full h-64 sm:h-80 bg-[#0e0e0e] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-end p-6 sm:p-10">
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=90')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30"></div>

                <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        SYSTEM INTEL REPORTS
                    </span>
                    <h2 className="text-xl sm:text-3xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">
                        Platform Analytics & Bookings Ledger
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        Comprehensive overview of platform volume, financial earnings, commissions, and global reservations across all properties.
                    </p>
                </div>
            </div>

            {/* Metrics Grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1c1b1b] p-6 rounded-none border border-[#353535] shadow-2xl space-y-2">
                    <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">Gross Platform Volume</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#5ddda1]">${Number(earningsRep.grossPlatformVolume || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-[#1c1b1b] p-6 rounded-none border border-[#353535] shadow-2xl space-y-2">
                    <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">Net 10% Commission</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#5ddda1]">${Number(earningsRep.netPlatformCommissionEarnings || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-[#1c1b1b] p-6 rounded-none border border-[#353535] shadow-2xl space-y-2">
                    <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">Total Accounts</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#e5e2e1]">{usersRep.totalRegisteredAccounts || 0} <span className="text-xs font-sans uppercase text-[#8e9192]">Users</span></h3>
                </div>
            </div>

            {/* Global Bookings Table */}
            <div className="bg-[#1c1b1b] p-6 sm:p-8 rounded-none border border-[#353535] shadow-2xl space-y-6">
                <div>
                    <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">RESERVATIONS LEDGER</span>
                    <h3 className="text-base font-serif font-bold uppercase tracking-wider text-[#e5e2e1] mt-1">Global Reservations Matrix ({globalBookings.length})</h3>
                </div>

                <div className="overflow-x-auto border border-[#353535]">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#353535] bg-[#0e0e0e] text-[#8e9192] uppercase font-bold text-[9px] tracking-[0.2em]">
                                <th className="py-4 px-5">Property</th>
                                <th className="py-4 px-5">Tenant</th>
                                <th className="py-4 px-5">Dates</th>
                                <th className="py-4 px-5">Status</th>
                                <th className="py-4 px-5 text-right">Total Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#353535] font-medium text-[#e5e2e1]">
                            {globalBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-xs font-bold text-[#8e9192] uppercase tracking-widest">
                                        No global reservation records found.
                                    </td>
                                </tr>
                            ) : (
                                globalBookings.map((b) => (
                                    <tr key={b._id} className="hover:bg-[#0e0e0e] transition-colors">
                                        <td className="py-4 px-5 font-serif font-bold uppercase tracking-wide text-[#e5e2e1]">{b.property?.title || "Property Unit"}</td>
                                        <td className="py-4 px-5 text-[#c4c7c7] font-sans">{b.user?.fullname || b.user?.username || "User"}</td>
                                        <td className="py-4 px-5 text-[#c4c7c7] font-mono">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</td>
                                        <td className="py-4 px-5 uppercase font-bold text-[9px]">
                                            <span className={`px-2.5 py-1 rounded-none uppercase tracking-widest border ${
                                                b.status === "confirmed" ? "bg-[#083823] text-[#5ddda1] border-[#5ddda1]" : 
                                                b.status === "cancelled" ? "bg-[#2a1215] text-[#ffb4ab] border-[#444748]" : 
                                                "bg-[#2d2512] text-[#ffdf9e] border-[#444748]"
                                            }`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-right font-mono font-bold text-[#5ddda1]">${b.totalPrice}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}