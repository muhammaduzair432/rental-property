import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../utils/api.js";

export default function PropertyComments({ propertyId }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(5);
    const [statusMessage, setStatusMessage] = useState(null);

    // Edit State Management
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editCommentText, setEditCommentText] = useState("");
    const [editRating, setEditRating] = useState(5);

    // Get current logged-in user from Redux store
    const { user: currentUser } = useSelector((state) => state.auth || {});

    useEffect(() => {
        if (propertyId) {
            fetchReviews();
        }
    }, [propertyId]);

    // 📥 Fetch Reviews
    const fetchReviews = async () => {
        try {
            const res = await api.get(`properties/reviews/${propertyId}`);
            const fetchedData = res.data?.reviews || res.data?.data || res.data || [];
            setReviews(Array.isArray(fetchedData) ? fetchedData : []);
        } catch (err) {
            console.error("Failed to load property reviews:", err);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    // 💬 Post a New Review
    const handlePostReview = async (e) => {
        e.preventDefault();
        if (!reviewText.trim()) return;

        try {
            setStatusMessage({ type: "info", text: "Submitting review..." });

            const res = await api.post(`properties/review/${propertyId}`, {
                comment: reviewText,
                rating: Number(rating)
            });

            if (res.data) {
                setReviewText("");
                setRating(5);
                setStatusMessage({ type: "success", text: "Review published successfully!" });
                fetchReviews();
                setTimeout(() => setStatusMessage(null), 3000);
            }
        } catch (err) {
            console.error("Review submission error:", err);
            setStatusMessage({ 
                type: "error", 
                text: err.response?.data?.message || "Failed to post review. Ensure your session is active." 
            });
        }
    };

    // ✏️ Enable Edit Mode for a specific review
    const startEditing = (review) => {
        setEditingReviewId(review._id || review.id);
        setEditCommentText(review.comment || review.content || review.text || "");
        setEditRating(review.rating || 5);
    };

 // 💾 Submit Updated Review
    const handleUpdateReview = async (reviewId) => {
        if (!editCommentText.trim()) return;

        try {
            setStatusMessage({ type: "info", text: "Updating review..." });

            // ✅ Exact match: PUT /properties/review/edit/:reviewId
            const res = await api.put(`properties/review/edit/${reviewId}`, {
                comment: editCommentText,
                rating: Number(editRating)
            });

            if (res.data) {
                setEditingReviewId(null);
                setStatusMessage({ type: "success", text: "Review updated successfully!" });
                fetchReviews(); // Refresh review list
                setTimeout(() => setStatusMessage(null), 3000);
            }
        } catch (err) {
            console.error("Review update error:", err);
            setStatusMessage({ 
                type: "error", 
                text: err.response?.data?.message || "Failed to update review." 
            });
        }
    };

    // 🗑️ Delete Review
    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            setStatusMessage({ type: "info", text: "Deleting review..." });

            // ✅ Exact match: DELETE /properties/review/delete/:reviewId
            const res = await api.delete(`properties/review/delete/${reviewId}`);

            if (res.data || res.status === 200) {
                setStatusMessage({ type: "success", text: "Review deleted successfully!" });
                fetchReviews(); // Refresh review list
                setTimeout(() => setStatusMessage(null), 3000);
            }
        } catch (err) {
            console.error("Review deletion error:", err);
            setStatusMessage({ 
                type: "error", 
                text: err.response?.data?.message || "Failed to delete review." 
            });
        }
    };

    if (!propertyId) return null;

    return (
        <div className="bg-white border border-[#e2e8f8] rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
            
            {/* Header */}
            <div>
                <span className="text-[10px] font-bold text-[#7d8497] uppercase tracking-widest block">
                    COMMUNITY FEEDBACK
                </span>
                <h3 className="text-base font-bold uppercase text-[#151c27] tracking-wide">
                    Property Reviews & Ratings ({reviews.length})
                </h3>
            </div>

            {/* Status Alert Message */}
            {statusMessage && (
                <div className={`p-3 text-xs font-bold rounded-md uppercase tracking-wider ${
                    statusMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    statusMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" :
                    "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                    {statusMessage.text}
                </div>
            )}

            {/* Post Review Form */}
            <form onSubmit={handlePostReview} className="space-y-4 bg-[#f9f9ff] p-4 rounded-lg border border-[#e2e8f8]">
                <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d8497]">
                        Rating:
                    </span>
                    <select 
                        value={rating} 
                        onChange={(e) => setRating(e.target.value)}
                        className="bg-white border border-[#e2e8f8] p-1.5 rounded text-xs font-bold text-[#151c27] focus:outline-none cursor-pointer"
                    >
                        <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                        <option value={3}>⭐⭐⭐ (3/5)</option>
                        <option value={2}>⭐⭐ (2/5)</option>
                        <option value={1}>⭐ (1/5)</option>
                    </select>
                </div>

                <textarea 
                    rows="3" 
                    placeholder="Write your review or feedback about this property..." 
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full bg-white border border-[#e2e8f8] p-3 rounded-md text-xs focus:outline-none focus:border-[#151c27] text-[#151c27]"
                />
                
                <div className="flex justify-end">
                    <button 
                        type="submit" 
                        className="px-4 py-2 bg-[#151c27] text-white text-xs font-bold uppercase tracking-wider rounded-md hover:bg-black cursor-pointer transition-all"
                    >
                        Publish Review
                    </button>
                </div>
            </form>

            {/* Reviews Stream */}
            <div className="space-y-6 pt-4 border-t border-[#e2e8f8]">
                {loading ? (
                    <div className="text-center py-6 text-xs text-gray-400 font-bold uppercase tracking-wider font-mono">
                        Loading Reviews...
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-6 text-xs text-gray-400 font-bold uppercase tracking-wider">
                        No reviews posted yet for this property.
                    </div>
                ) : (
                    reviews.map((rev) => {
                        const reviewId = rev._id || rev.id;
                        const reviewUserId = rev.user?._id || rev.user?.id || rev.user;
                        const currentUserId = currentUser?._id || currentUser?.id;
                        
                        // Check if current user owns this review
                        const isOwner = Boolean(currentUserId && reviewUserId && String(currentUserId) === String(reviewUserId));

                        return (
                            <div key={reviewId} className="space-y-3 border-b border-[#e2e8f8] pb-6 last:border-b-0">
                                <div className="flex items-start space-x-3">
                                    
                                    {/* User Avatar */}
                                    {rev.user?.avatar ? (
                                        <img 
                                            src={rev.user.avatar} 
                                            alt="avatar" 
                                            className="w-9 h-9 rounded-full object-cover border border-[#e2e8f8] shrink-0" 
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-[#151c27] text-white font-bold text-xs flex items-center justify-center uppercase shrink-0">
                                            {(rev.user?.fullname || rev.user?.username || "U").slice(0, 2)}
                                        </div>
                                    )}

                                    {/* Review Content Area */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-bold text-[#151c27]">
                                                    {rev.user?.fullname || rev.user?.username || "Verified Tenant"}
                                                </span>
                                                <span className="text-[10px] text-amber-500 font-bold">
                                                    {"★".repeat(editingReviewId === reviewId ? editRating : (rev.rating || 5))}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-mono">
                                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                                            </span>
                                        </div>

                                        {/* Inline Editing Form */}
                                        {editingReviewId === reviewId ? (
                                            <div className="space-y-3 bg-[#f9f9ff] p-3 rounded-md border border-[#e2e8f8]">
                                                <select 
                                                    value={editRating} 
                                                    onChange={(e) => setEditRating(Number(e.target.value))}
                                                    className="bg-white border border-[#e2e8f8] p-1 rounded text-xs font-bold text-[#151c27]"
                                                >
                                                    <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                                                    <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                                                    <option value={3}>⭐⭐⭐ (3/5)</option>
                                                    <option value={2}>⭐⭐ (2/5)</option>
                                                    <option value={1}>⭐ (1/5)</option>
                                                </select>
                                                <textarea 
                                                    rows="2"
                                                    value={editCommentText}
                                                    onChange={(e) => setEditCommentText(e.target.value)}
                                                    className="w-full bg-white border border-[#e2e8f8] p-2 rounded text-xs text-[#151c27] focus:outline-none"
                                                />
                                                <div className="flex items-center space-x-2">
                                                    <button 
                                                        onClick={() => handleUpdateReview(reviewId)}
                                                        className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded cursor-pointer hover:bg-emerald-700"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingReviewId(null)}
                                                        className="px-3 py-1 bg-gray-200 text-gray-700 text-[10px] font-bold uppercase rounded cursor-pointer hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[#45464c] leading-relaxed">
                                                {rev.comment || rev.content || rev.text}
                                            </p>
                                        )}

                                        {/* Owner Action Buttons (Edit / Delete) */}
                                        {isOwner && editingReviewId !== reviewId && (
                                            <div className="flex items-center space-x-3 pt-1">
                                                <button 
                                                    onClick={() => startEditing(rev)}
                                                    className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteReview(reviewId)}
                                                    className="text-[10px] font-bold text-red-600 hover:underline uppercase tracking-wider cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
}