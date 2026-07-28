import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOwnerEarnings } from "../store/ownerEarningsSlice.js";

export default function OwnerEarningsPage() {
    const dispatch = useDispatch();
    const { overview = {}, loading, error } = useSelector((state) => state.ownerEarnings || {});

    useEffect(() => {
        dispatch(fetchOwnerEarnings());
    }, [dispatch]);

    // ⚡ Extract metrics directly from your backend's 'analytics' payload object
    const analyticsData = overview.analytics || overview;
    const totalEarnings = analyticsData.grandTotalEarnings || analyticsData.totalEarnings || 0;
    const confirmedCount = analyticsData.totalConfirmedBookingsCount || analyticsData.confirmedBookingsCount || 0;
    const performanceList = analyticsData.propertyPerformanceBreakdown || analyticsData.earningsHistory || [];

    return (
        <div className="space-y-6">
            
            {/* Header Banner */}
            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-2">
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">FINANCIAL LEDGER</span>
                <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">Earnings & Payouts Report</h2>
                <p className="text-xs text-gray-500">Track revenue streams generated from confirmed tenant stays across your properties.</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                    ⚠️ {error}
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#7d8497] uppercase tracking-wider">Total Confirmed Revenue</span>
                    <h3 className="text-2xl font-black text-emerald-600">${Number(totalEarnings).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#7d8497] uppercase tracking-wider">Confirmed Stays</span>
                    <h3 className="text-2xl font-black text-[#151c27]">{confirmedCount} Bookings</h3>
                </div>
                <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#7d8497] uppercase tracking-wider">Next Payout Status</span>
                    <h3 className="text-2xl font-black text-blue-600">Scheduled</h3>
                </div>
            </div>

            {/* Property Performance Breakdown Table */}
            <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-[#151c27]">Property Performance Breakdown</h3>

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="w-6 h-6 border-2 border-[#151c27] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : performanceList.length === 0 ? (
                    <div className="p-12 border border-dashed border-[#e2e8f8] text-center text-xs font-bold text-gray-400 uppercase rounded-xl tracking-wider">
                        No property earnings records found yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-[#e2e8f8] text-[#7d8497] uppercase font-bold text-[9px]">
                                    <th className="py-3 px-4">Property Unit</th>
                                    <th className="py-3 px-4">Location</th>
                                    <th className="py-3 px-4">Base Rate</th>
                                    <th className="py-3 px-4 text-center">Bookings Count</th>
                                    <th className="py-3 px-4 text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e2e8f8] font-medium text-[#151c27]">
                                {performanceList.map((item) => {
                                    return (
                                        <tr key={item.propertyId} className="hover:bg-[#f9f9ff] transition-colors">
                                            <td className="py-3 px-4 flex items-center gap-3">
                                                {item.thumbnail && (
                                                    <img src={item.thumbnail} alt="" className="w-9 h-9 rounded object-cover border" />
                                                )}
                                                <span className="font-bold uppercase">{item.title}</span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">{item.location}</td>
                                            <td className="py-3 px-4">${item.basePricePerNight} / night</td>
                                            <td className="py-3 px-4 text-center font-bold">{item.totalBookingsCount}</td>
                                            <td className="py-3 px-4 text-right font-black text-emerald-600">${item.revenueGenerated}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
}