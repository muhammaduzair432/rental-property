import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { purgeAdminReview } from "../../store/adminSlice.js";
import api from "../../utils/api.js";

export default function AdminReviewsModeration() {
    const dispatch = useDispatch();
    const { successMessage } = useSelector((state) => state.admin || {});
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // ⚡ UX Improvement: Default to "latest" mode to avoid overwhelming clutter on initial load
    const [timeRange, setTimeRange] = useState("latest"); // "latest" | "all" | "daily" | "weekly" | "monthly" | "yearly"
    const [selectedRating, setSelectedRating] = useState("ALL"); // "ALL" | "5" | "4" | "3" | "2" | "1"
    const [searchQuery, setSearchQuery] = useState("");

    // Custom Calendar Drill-Down States (Defaulted to current 2026 year & month)
    const [selectedYear, setSelectedYear] = useState("2026");
    const [selectedMonth, setSelectedMonth] = useState("8"); // August

    const fetchAllReviews = async () => {
        try {
            const res = await api.get("admin/reviews/all"); 
            const data = res.data?.data || res.data?.reviews || res.data || [];
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch admin reviews:", err);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllReviews();
    }, [successMessage]);

    const handlePurgeReview = async (reviewId) => {
        if (window.confirm("Permanently purge this review from the platform?")) {
            await dispatch(purgeAdminReview(reviewId));
            fetchAllReviews();
        }
    };

    // 🕒 Advanced Time-Range & Latest Filtering Logic Matrix
    const filterReviewsByTime = (reviewList) => {
        // Ensure reviews are sorted newest first for "latest" view
        const sortedList = [...reviewList].sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));

        if (timeRange === "latest") {
            // Show only the top 10 most recent reviews by default
            return sortedList.slice(0, 10);
        }

        const now = new Date();
        return sortedList.filter((rev) => {
            const revDate = new Date(rev.createdAt || rev.timestamp);
            if (isNaN(revDate.getTime())) return true; 

            if (timeRange === "daily") {
                const diffHours = (now - revDate) / (1000 * 60 * 60);
                return diffHours <= 24;
            }
            if (timeRange === "weekly") {
                const diffDays = (now - revDate) / (1000 * 60 * 60 * 24);
                return diffDays <= 7;
            }
            if (timeRange === "monthly") {
                return (
                    revDate.getMonth() + 1 === parseInt(selectedMonth) &&
                    revDate.getFullYear().toString() === selectedYear
                );
            }
            if (timeRange === "yearly") {
                return revDate.getFullYear().toString() === selectedYear;
            }
            return true; // "all"
        });
    };

    // Apply Time, Star Rating Filter, and Search Queries
    const filteredReviews = filterReviewsByTime(reviews).filter((rev) => {
        const user = rev.user || {};
        const property = rev.property || {};

        const matchesRating = selectedRating === "ALL" || String(rev.rating) === selectedRating;
        const matchesSearch = 
            rev.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.title?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesRating && matchesSearch;
    });

    const availableYears = ["2026", "2025", "2024", "2023", "2022"];

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
            {/* Hero Banner with Themed Visual & Dark Vignette Filter */}
            <div className="relative w-full h-64 sm:h-80 bg-[#0e0e0e] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-end p-6 sm:p-10">
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=90')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30"></div>

                <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        REVIEW MODERATION BOARD
                    </span>
                    <h2 className="text-xl sm:text-3xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">
                        {timeRange === "latest" ? "Latest System Reviews (Top 10)" : `Manage System Reviews (${filteredReviews.length})`}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        {timeRange === "latest"
                            ? "Displaying recent community feedback. Select 'All' or filter by time range to view complete logs."
                            : "Inspect and purge fraudulent or toxic reviews across all platform listings to maintain high community standards."
                        }
                    </p>
                </div>
            </div>

            {/* ⏱️ TIME RANGE MATRIX FILTER BUTTONS & CALENDAR DRILL-DOWN */}
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

            {/* Controls Bar: Search & Rating Filter Pills */}
            <div className="bg-[#1c1b1b] p-4 sm:p-5 border border-[#353535] shadow-xl flex flex-col lg:flex-row gap-4 justify-between items-center">
                <div className="w-full lg:w-96">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search reviews, user or property titles..."
                        className="w-full text-xs p-3.5 border border-[#444748] rounded-none bg-[#0e0e0e] text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] placeholder:text-[#8e9192]"
                    />
                </div>

                {/* Star Rating Filter Pills */}
                <div className="w-full lg:w-auto flex overflow-x-auto gap-2 pb-2 lg:pb-0 scrollbar-none">
                    {["ALL", "5", "4", "3", "2", "1"].map((star) => (
                        <button
                            key={star}
                            onClick={() => setSelectedRating(star)}
                            className={`px-3 py-2 text-[9px] font-bold uppercase tracking-wider border rounded-none whitespace-nowrap cursor-pointer transition-all ${
                                selectedRating === star
                                    ? "border-[#5ddda1] text-[#5ddda1] bg-[#083823]/30"
                                    : "border-[#444748] text-[#8e9192] bg-[#0e0e0e] hover:text-[#e5e2e1]"
                            }`}
                        >
                            {star === "ALL" ? "All Ratings" : `★ ${star} Stars`}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[#1c1b1b] border border-[#353535]">
                    <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
                    <div className="text-[10px] font-bold tracking-[0.25em] text-[#8e9192] uppercase font-mono">
                        Loading Reviews Feed...
                    </div>
                </div>
            ) : filteredReviews.length === 0 ? (
                <div className="bg-[#1c1b1b] p-12 border border-dashed border-[#444748] text-center text-xs font-bold text-[#8e9192] uppercase rounded-none tracking-widest shadow-2xl">
                    No reviews registered matching the selected filter.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((rev) => {
                        const rId = rev._id || rev.id;
                        const user = rev.user || {};
                        const property = rev.property || {};

                        return (
                            <div 
                                key={rId} 
                                className="bg-[#1c1b1b] border border-[#353535] hover:border-[#5ddda1] p-5 sm:p-6 rounded-none shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all duration-300"
                            >
                                <div className="space-y-3 flex-1 pr-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-3">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt="" className="w-9 h-9 rounded-none object-cover border border-[#444748]" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-none bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] font-bold flex items-center justify-center text-xs uppercase">
                                                    {(user.fullname || "U").charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <h5 className="text-xs font-serif font-bold uppercase tracking-wide text-[#e5e2e1]">{user.fullname || user.username || "Tenant"}</h5>
                                                <span className="text-[9px] text-[#8e9192] font-mono">Property Unit: <strong className="text-[#e5e2e1] uppercase">{property.title || "Listing"}</strong></span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-mono font-black text-[#5ddda1] bg-[#083823] px-2 py-0.5 border border-[#5ddda1]">★ {rev.rating} / 5</span>
                                    </div>
                                    <p className="text-xs text-[#c4c7c7] font-sans pl-12 leading-relaxed">"{rev.comment}"</p>
                                </div>

                                <button 
                                    onClick={() => handlePurgeReview(rId)}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-[#1c1b1b] hover:bg-[#ffb4ab] text-[#ffb4ab] hover:text-[#380007] border border-[#444748] hover:border-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-md transition-all shrink-0"
                                >
                                    Purge Review
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Metrics */}
            <div className="flex justify-between items-center text-[10px] font-mono text-[#8e9192] uppercase px-1">
                <span>Active Filter: <strong className="text-[#5ddda1] uppercase">{timeRange}</strong></span>
                <span>Showing Reviews: {filteredReviews.length} of {reviews.length}</span>
            </div>

        </div>
    );
}