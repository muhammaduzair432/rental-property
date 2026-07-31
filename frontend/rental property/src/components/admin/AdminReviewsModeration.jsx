import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { purgeAdminReview } from "../../store/adminSlice.js";
import api from "../../utils/api.js";

export default function AdminReviewsModeration() {
    const dispatch = useDispatch();
    const { successMessage } = useSelector((state) => state.admin || {});
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllReviews = async () => {
        try {
            // ⚡ Corrected route path matching your admin router prefix
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

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
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
                        Manage System Reviews ({reviews.length})
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        Inspect and purge fraudulent or toxic reviews across all platform listings to maintain high community standards.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[#1c1b1b] border border-[#353535]">
                    <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
                    <div className="text-[10px] font-bold tracking-[0.25em] text-[#8e9192] uppercase font-mono">
                        Loading Reviews Feed...
                    </div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="bg-[#1c1b1b] p-12 border border-dashed border-[#444748] text-center text-xs font-bold text-[#8e9192] uppercase rounded-none tracking-widest shadow-2xl">
                    No reviews registered in the system database yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((rev) => {
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
        </div>
    );
}