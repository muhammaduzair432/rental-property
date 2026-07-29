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
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-2">
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">SYSTEM INTEL REPORTS</span>
                <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">Platform Analytics & Bookings Ledger</h2>
                <p className="text-xs text-gray-500">Comprehensive overview of platform volume, financial earnings, commissions, and global reservations.</p>
            </div>

            {/* Metrics Grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#7d8497] uppercase">Gross Platform Volume</span>
                    <h3 className="text-2xl font-black text-emerald-600">${Number(earningsRep.grossPlatformVolume || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#7d8497] uppercase">Net 10% Commission</span>
                    <h3 className="text-2xl font-black text-blue-600">${Number(earningsRep.netPlatformCommissionEarnings || 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#7d8497] uppercase">Total Accounts</span>
                    <h3 className="text-2xl font-black text-[#151c27]">{usersRep.totalRegisteredAccounts || 0} Users</h3>
                </div>
            </div>

            {/* Global Bookings Table */}
            <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#151c27]">Global Reservations Matrix ({globalBookings.length})</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#e2e8f8] text-[#7d8497] uppercase font-bold text-[9px]">
                                <th className="py-3 px-4">Property</th>
                                <th className="py-3 px-4">Tenant</th>
                                <th className="py-3 px-4">Dates</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Total Price</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f8] font-medium text-[#151c27]">
                            {globalBookings.map((b) => (
                                <tr key={b._id} className="hover:bg-[#f9f9ff]">
                                    <td className="py-3 px-4 font-bold uppercase">{b.property?.title || "Property Unit"}</td>
                                    <td className="py-3 px-4">{b.user?.fullname || b.user?.username || "User"}</td>
                                    <td className="py-3 px-4 text-gray-500">{new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 uppercase font-bold text-[9px]">
                                        <span className={`px-2 py-0.5 rounded ${b.status === "confirmed" ? "bg-emerald-100 text-emerald-800" : b.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{b.status}</span>
                                    </td>
                                    <td className="py-3 px-4 text-right font-black text-emerald-600">${b.totalPrice}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}