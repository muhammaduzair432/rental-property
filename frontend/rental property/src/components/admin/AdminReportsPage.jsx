import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSystemReports, fetchGlobalBookings } from "../../store/adminSlice.js";

export default function AdminReportsPage() {
    const dispatch = useDispatch();
    const { systemReports = {}, globalBookings = [] } = useSelector((state) => state.admin || {});

    // ⚡ UX Improvement: Default to "latest" mode to keep initial load clean and uncluttered
    const [timeRange, setTimeRange] = useState("latest"); // "latest" | "all" | "daily" | "weekly" | "monthly" | "yearly"
    const [selectedStatus, setSelectedStatus] = useState("ALL"); // "ALL" | "confirmed" | "pending" | "cancelled"
    const [searchQuery, setSearchQuery] = useState("");

    // Custom Calendar Drill-Down States (Defaulted to current 2026 year & month)
    const [selectedYear, setSelectedYear] = useState("2026");
    const [selectedMonth, setSelectedMonth] = useState("8"); // August

    useEffect(() => {
        dispatch(fetchSystemReports());
        dispatch(fetchGlobalBookings());
    }, [dispatch]);

    const usersRep = systemReports.usersSummaryReport || {};
    const bookingsRep = systemReports.bookingsSummaryReport || {};
    const earningsRep = systemReports.earningsFinancialReport || {};

    // 🕒 Advanced Time-Range & Latest Filtering Logic Matrix
    const filterBookingsByTime = (bookingList) => {
        // Ensure bookings are sorted newest first for "latest" view
        const sortedList = [...bookingList].sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));

        if (timeRange === "latest") {
            // Show only the top 10 most recent bookings by default
            return sortedList.slice(0, 10);
        }

        const now = new Date();
        return sortedList.filter((b) => {
            const bookingDate = new Date(b.createdAt || b.startDate);
            if (isNaN(bookingDate.getTime())) return true; 

            if (timeRange === "daily") {
                const diffHours = (now - bookingDate) / (1000 * 60 * 60);
                return diffHours <= 24;
            }
            if (timeRange === "weekly") {
                const diffDays = (now - bookingDate) / (1000 * 60 * 60 * 24);
                return diffDays <= 7;
            }
            if (timeRange === "monthly") {
                return (
                    bookingDate.getMonth() + 1 === parseInt(selectedMonth) &&
                    bookingDate.getFullYear().toString() === selectedYear
                );
            }
            if (timeRange === "yearly") {
                return bookingDate.getFullYear().toString() === selectedYear;
            }
            return true; // "all"
        });
    };

    // Apply Time, Status Filter, and Search Queries
    const filteredBookings = filterBookingsByTime(globalBookings).filter((b) => {
        const propertyTitle = b.property?.title || "";
        const tenantName = b.user?.fullname || b.user?.username || "";

        const matchesStatus = selectedStatus === "ALL" || b.status === selectedStatus;
        const matchesSearch = 
            propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.status?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const availableYears = ["2026", "2025", "2024", "2023", "2022"];

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

            {/* ⏱️ TIME RANGE MATRIX FILTER BUTTONS & CALENDAR DRILL-DOWN BAR */}
            <div className="bg-[#1c1b1b] p-4 sm:p-5 border border-[#353535] shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                
                {/* Time Range Matrix Buttons */}
                <div className="flex flex-wrap gap-1.5 bg-[#0e0e0e] p-1.5 border border-[#353535]">
                    {["latest", "all", "daily", "weekly", "monthly", "yearly"].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3.5 py-2 text-[9px] font-bold uppercase tracking-widest transition-all cursor-pointer rounded-none ${
                                timeRange === range
                                    ? "bg-[#5ddda1] text-[#003823] shadow-md"
                                    : "text-[#8e9192] hover:text-[#e5e2e1] bg-[#1c1b1b]"
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                {/* Calendar Year / Month Selectors */}
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">📅 Calendar:</span>
                    
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            setTimeRange("yearly");
                        }}
                        className="text-xs bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] px-3 py-2 rounded-none focus:outline-none focus:border-[#5ddda1] font-mono cursor-pointer"
                    >
                        {availableYears.map(yr => (
                            <option key={yr} value={yr}>{yr}</option>
                        ))}
                    </select>

                    <select
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            setTimeRange("monthly");
                        }}
                        className="text-xs bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] px-3 py-2 rounded-none focus:outline-none focus:border-[#5ddda1] font-mono cursor-pointer"
                    >
                        {[
                            {val: "1", name: "January"}, {val: "2", name: "February"}, {val: "3", name: "March"},
                            {val: "4", name: "April"}, {val: "5", name: "May"}, {val: "6", name: "June"},
                            {val: "7", name: "July"}, {val: "8", name: "August"}, {val: "9", name: "September"},
                            {val: "10", name: "October"}, {val: "11", name: "November"}, {val: "12", name: "December"}
                        ].map(m => (
                            <option key={m.val} value={m.val}>{m.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Controls Bar: Search & Status Filter Pills */}
            <div className="bg-[#1c1b1b] p-4 sm:p-5 border border-[#353535] shadow-xl flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="w-full lg:w-96">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search property, tenant or status..."
                        className="w-full text-xs p-3.5 border border-[#444748] rounded-none bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] placeholder:text-[#8e9192]"
                    />
                </div>

                {/* Status Filter Pills */}
                <div className="w-full lg:w-auto flex overflow-x-auto gap-2 pb-2 lg:pb-0 scrollbar-none">
                    {["ALL", "confirmed", "pending", "cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-3 py-2 text-[9px] font-bold uppercase tracking-wider border rounded-none whitespace-nowrap cursor-pointer transition-all ${
                                selectedStatus === status
                                    ? "border-[#5ddda1] text-[#5ddda1] bg-[#083823]/30"
                                    : "border-[#444748] text-[#8e9192] bg-[#0e0e0e] hover:text-[#e5e2e1]"
                            }`}
                        >
                            {status.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Global Bookings Table */}
            <div className="bg-[#1c1b1b] p-6 sm:p-8 rounded-none border border-[#353535] shadow-2xl space-y-6">
                <div>
                    <span className="text-[9px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">RESERVATIONS LEDGER</span>
                    <h3 className="text-base font-serif font-bold uppercase tracking-wider text-[#e5e2e1] mt-1">
                        {timeRange === "latest" ? "Latest Reservations Matrix (Top 10)" : `Global Reservations Matrix (${filteredBookings.length})`}
                    </h3>
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
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-xs font-bold text-[#8e9192] uppercase tracking-widest">
                                        No reservation records found matching the selected filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((b) => (
                                    <tr key={b._id || Math.random()} className="hover:bg-[#0e0e0e] transition-colors">
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

            {/* Footer Metrics */}
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8e9192] uppercase px-1">
                <span>Active Filter Mode: <strong className="text-[#5ddda1] uppercase">{timeRange}</strong></span>
                <span>Showing Bookings: {filteredBookings.length} of {globalBookings.length}</span>
            </div>

        </div>
    );
}