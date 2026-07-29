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
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-2">
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">REVIEW MODERATION BOARD</span>
                <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">Manage System Reviews ({reviews.length})</h2>
                <p className="text-xs text-gray-500">Inspect and purge fraudulent or toxic reviews across all platform listings.</p>
            </div>

            {loading ? (
                <div className="p-12 text-center text-xs font-bold text-gray-400 uppercase">Loading reviews feed...</div>
            ) : reviews.length === 0 ? (
                <div className="bg-white p-12 border border-dashed border-[#e2e8f8] text-center text-xs font-bold text-gray-400 uppercase rounded-xl tracking-wider">
                    No reviews registered in the system database yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((rev) => {
                        const rId = rev._id || rev.id;
                        const user = rev.user || {};
                        const property = rev.property || {};

                        return (
                            <div key={rId} className="bg-white border border-[#e2e8f8] p-5 rounded-xl space-y-3 shadow-xs flex items-center justify-between">
                                <div className="space-y-1.5 flex-1 pr-4">
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                                                {(user.fullname || "U").charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h5 className="text-xs font-bold text-[#151c27]">{user.fullname || user.username || "Tenant"}</h5>
                                            <span className="text-[9px] text-gray-400">Property Unit: <strong className="text-[#151c27] uppercase">{property.title || "Listing"}</strong></span>
                                        </div>
                                        <span className="text-xs font-black text-amber-500 ml-auto">★ {rev.rating} / 5</span>
                                    </div>
                                    <p className="text-xs text-[#45464c] pl-11">"{rev.comment}"</p>
                                </div>
                                <button 
                                    onClick={() => handlePurgeReview(rId)}
                                    className="px-3.5 py-2 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold uppercase rounded-lg hover:bg-red-600 hover:text-white cursor-pointer transition-all shrink-0"
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