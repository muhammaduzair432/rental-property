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
        <div className="w-full max-w-7xl mx-auto space-y-8 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
            {/* Hero Banner with Themed Visual & Dark Vignette Filter */}
            <div className="relative w-full h-64 sm:h-80 bg-[#0e0e0e] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-end p-6 sm:p-10">
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=90')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30"></div>

                <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        FINANCIAL LEDGER
                    </span>
                    <h2 className="text-xl sm:text-3xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">
                        Earnings & Payouts Report
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        Track revenue streams generated from confirmed tenant stays across your portfolio properties.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-[#1c1b1b] text-[#ffb4ab] border border-[#444748] px-4 py-3.5 rounded-none text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1c1b1b] p-6 rounded-none border border-[#353535] shadow-2xl space-y-2">
                    <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">Total Confirmed Revenue</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#5ddda1]">${Number(totalEarnings).toLocaleString()}</h3>
                </div>
                <div className="bg-[#1c1b1b] p-6 rounded-none border border-[#353535] shadow-2xl space-y-2">
                    <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">Confirmed Stays</span>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#e5e2e1]">{confirmedCount} <span className="text-xs font-sans uppercase text-[#8e9192]">Bookings</span></h3>
                </div>
            </div>

            {/* Property Performance Breakdown Table */}
            <div className="bg-[#1c1b1b] p-6 sm:p-8 rounded-none border border-[#353535] shadow-2xl space-y-6">
                <div>
                    <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">PORTFOLIO ANALYTICS</span>
                    <h3 className="text-base font-serif font-bold uppercase tracking-wider text-[#e5e2e1] mt-1">Property Performance Breakdown</h3>
                </div>

                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[#0e0e0e] border border-[#353535]">
                        <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
                        <div className="text-[10px] font-bold tracking-[0.25em] text-[#8e9192] uppercase font-mono">
                            Analyzing Revenue Streams...
                        </div>
                    </div>
                ) : performanceList.length === 0 ? (
                    <div className="bg-[#0e0e0e] p-12 border border-dashed border-[#444748] text-center text-xs font-bold text-[#8e9192] uppercase rounded-none tracking-widest shadow-xl">
                        No property earnings records found yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-[#353535]">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-[#353535] bg-[#0e0e0e] text-[#8e9192] uppercase font-bold text-[9px] tracking-[0.2em]">
                                    <th className="py-4 px-5">Property Unit</th>
                                    <th className="py-4 px-5">Location</th>
                                    <th className="py-4 px-5">Base Rate</th>
                                    <th className="py-4 px-5 text-center">Bookings Count</th>
                                    <th className="py-4 px-5 text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#353535] font-medium text-[#e5e2e1]">
                                {performanceList.map((item) => {
                                    return (
                                        <tr key={item.propertyId} className="hover:bg-[#0e0e0e] transition-colors">
                                            <td className="py-4 px-5 flex items-center gap-3.5">
                                                {item.thumbnail && (
                                                    <img src={item.thumbnail} alt="" className="w-10 h-10 rounded-none object-cover border border-[#444748] shrink-0" />
                                                )}
                                                <span className="font-serif font-bold uppercase tracking-wide text-[#e5e2e1]">{item.title}</span>
                                            </td>
                                            <td className="py-4 px-5 text-[#c4c7c7] font-sans">{item.location}</td>
                                            <td className="py-4 px-5 font-mono text-[#c4c7c7]">${item.basePricePerNight} / night</td>
                                            <td className="py-4 px-5 text-center font-mono font-bold text-[#e5e2e1]">{item.totalBookingsCount}</td>
                                            <td className="py-4 px-5 text-right font-mono font-bold text-[#5ddda1]">${item.revenueGenerated}</td>
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