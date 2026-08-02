import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSystemLogs } from "../../store/adminSlice.js";

export default function AdminSystemLogs() {
    const dispatch = useDispatch();
    const { systemLogs = [] } = useSelector((state) => state.admin || {});

    // ⚡ UX Improvement: Default to "latest" mode so the page isn't messy on first load
    const [timeRange, setTimeRange] = useState("latest"); // "latest" | "all" | "daily" | "weekly" | "monthly" | "yearly"
    const [selectedActionType, setSelectedActionType] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    // Custom Calendar Drill-Down States (Defaulted to current 2026 year & month)
    const [selectedYear, setSelectedYear] = useState("2026");
    const [selectedMonth, setSelectedMonth] = useState("8"); // August

    useEffect(() => {
        dispatch(fetchSystemLogs());
    }, [dispatch]);

    // 🕒 Advanced Time-Range & Latest Filtering Logic Matrix
    const filterLogsByTime = (logList) => {
        // Ensure logs are sorted by newest first for "latest" view
        const sortedList = [...logList].sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));

        if (timeRange === "latest") {
            // Show only the top 10 most recent logs by default for clean UX
            return sortedList.slice(0, 10);
        }

        const now = new Date();
        return sortedList.filter((log) => {
            const logDate = new Date(log.createdAt || log.timestamp);
            if (isNaN(logDate.getTime())) return true; 

            if (timeRange === "daily") {
                const diffHours = (now - logDate) / (1000 * 60 * 60);
                return diffHours <= 24;
            }
            if (timeRange === "weekly") {
                const diffDays = (now - logDate) / (1000 * 60 * 60 * 24);
                return diffDays <= 7;
            }
            if (timeRange === "monthly") {
                return (
                    logDate.getMonth() + 1 === parseInt(selectedMonth) &&
                    logDate.getFullYear().toString() === selectedYear
                );
            }
            if (timeRange === "yearly") {
                return logDate.getFullYear().toString() === selectedYear;
            }
            return true; // "all"
        });
    };

    // Apply Time, Action Type, and Search Queries
    const filteredLogs = filterLogsByTime(systemLogs).filter((log) => {
        const matchesAction = selectedActionType === "ALL" || log.actionType === selectedActionType;
        const matchesSearch = 
            log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.actionType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.performedBy?.username?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesAction && matchesSearch;
    });

    const uniqueActionTypes = ["ALL", ...Array.from(new Set(systemLogs.map((l) => l.actionType).filter(Boolean)))];
    const availableYears = ["2026", "2025", "2024", "2023", "2022"];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
            {/* Hero Banner with Themed Visual & Dark Vignette Filter */}
            <div className="relative w-full h-64 sm:h-80 bg-[#0e0e0e] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-end p-6 sm:p-10">
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=90')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30"></div>

                <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        OPERATIONAL AUDIT TRAIL
                    </span>
                    <h2 className="text-xl sm:text-3xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">
                        {timeRange === "latest" ? "Latest System Logs (Top 10)" : `System Audit Logs (${filteredLogs.length})`}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        {timeRange === "latest" 
                            ? "Displaying recent operational activities. Select 'All' or filter by time range to view complete logs."
                            : "Real-time historical event logs recorded across administrator actions, user operations, and security checkpoints."
                        }
                    </p>
                </div>
            </div>

            {/* ⏱️ TIME RANGE MATRIX FILTER BUTTONS & DRILL-DOWN BAR */}
            <div className="bg-[#1c1b1b] p-4 sm:p-5 border border-[#353535] shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                
                {/* Time Range Matrix Buttons (Includes explicit "latest" and "all" controls) */}
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

            {/* Controls Bar: Search & Action Category Filter Pills */}
            <div className="bg-[#1c1b1b] p-4 sm:p-5 border border-[#353535] shadow-xl flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="w-full lg:w-96">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search log descriptions, user or actions..."
                        className="w-full text-xs p-3.5 border border-[#444748] rounded-none bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] placeholder:text-[#8e9192]"
                    />
                </div>

                <div className="w-full lg:w-auto flex overflow-x-auto gap-2 pb-2 lg:pb-0 scrollbar-none">
                    {uniqueActionTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedActionType(type)}
                            className={`px-3 py-2 text-[9px] font-bold uppercase tracking-wider border rounded-none whitespace-nowrap cursor-pointer transition-all ${
                                selectedActionType === type
                                    ? "border-[#5ddda1] text-[#5ddda1] bg-[#083823]/30"
                                    : "border-[#444748] text-[#8e9192] bg-[#0e0e0e] hover:text-[#e5e2e1]"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* System Audit Logs Table Card */}
            <div className="bg-[#1c1b1b] rounded-none border border-[#353535] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#353535] bg-[#0e0e0e] text-[#8e9192] uppercase font-bold text-[9px] tracking-[0.2em]">
                                <th className="py-4 px-5">Action Type</th>
                                <th className="py-4 px-5">Description</th>
                                <th className="py-4 px-5">Performed By</th>
                                <th className="py-4 px-5 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#353535] font-medium text-[#e5e2e1]">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-xs font-bold text-[#8e9192] uppercase tracking-widest">
                                        No system audit logs recorded matching the selected filter.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log._id || Math.random()} className="hover:bg-[#0e0e0e] transition-colors">
                                        <td className="py-4 px-5 font-mono font-bold text-[#5ddda1] tracking-wide whitespace-nowrap">
                                            {log.actionType}
                                        </td>
                                        <td className="py-4 px-5 text-[#c4c7c7] font-sans leading-relaxed font-mono text-[11px]">{log.description}</td>
                                        <td className="py-4 px-5 text-[#e5e2e1] font-sans">
                                            <span className="font-bold uppercase tracking-wide">{log.performedBy?.username || "Admin"}</span>
                                            <span className="text-[9px] text-[#8e9192] uppercase tracking-wider block font-mono">({log.performedBy?.role || "system"})</span>
                                        </td>
                                        <td className="py-4 px-5 text-right font-mono text-[#8e9192] whitespace-nowrap text-[10px]">
                                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A"}
                                        </td>
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
                <span>Showing Events: {filteredLogs.length} of {systemLogs.length}</span>
            </div>

        </div>
    );
}