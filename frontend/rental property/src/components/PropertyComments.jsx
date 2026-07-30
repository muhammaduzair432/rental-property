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

            const res = await api.put(`properties/review/edit/${reviewId}`, {
                comment: editCommentText,
                rating: Number(editRating)
            });

            if (res.data) {
                setEditingReviewId(null);
                setStatusMessage({ type: "success", text: "Review updated successfully!" });
                fetchReviews(); 
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

            const res = await api.delete(`properties/review/delete/${reviewId}`);

            if (res.data || res.status === 200) {
                setStatusMessage({ type: "success", text: "Review deleted successfully!" });
                fetchReviews(); 
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
        <div className="bg-[#1c1b1b] border border-[#353535] rounded-none p-6 sm:p-10 space-y-8 shadow-2xl text-[#e5e2e1]">
            
            {/* Header */}
            <div>
                <span className="text-[10px] font-bold text-[#8e9192] uppercase tracking-[0.2em] block">
                    COMMUNITY FEEDBACK
                </span>
                <h3 className="text-lg font-serif font-bold uppercase text-[#e5e2e1] tracking-tight mt-1">
                    Property Reviews & Ratings ({reviews.length})
                </h3>
            </div>

            {/* Status Alert Message */}
            {statusMessage && (
                <div className={`p-3.5 text-xs font-bold rounded-none uppercase tracking-wider ${
                    statusMessage.type === "success" ? "bg-[#083823]/50 text-[#5ddda1] border border-[#5ddda1]" :
                    statusMessage.type === "error" ? "bg-[#1c1b1b] text-[#ffb4ab] border border-[#444748]" :
                    "bg-[#0e0e0e] text-[#5ddda1] border border-[#353535]"
                }`}>
                    {statusMessage.text}
                </div>
            )}

            {/* Post Review Form */}
            <form onSubmit={handlePostReview} className="space-y-4 bg-[#0e0e0e] p-5 rounded-none border border-[#353535]">
                <div className="flex items-center space-x-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5ddda1]">
                        Rating:
                    </span>
                    <select 
                        value={rating} 
                        onChange={(e) => setRating(e.target.value)}
                        className="bg-[#1c1b1b] border border-[#444748] p-2 rounded-none text-xs font-bold text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] cursor-pointer"
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
                    className="w-full bg-[#1c1b1b] border border-[#444748] p-3.5 rounded-none text-xs focus:outline-none focus:border-[#5ddda1] text-[#e5e2e1] placeholder:text-[#8e9192]"
                />
                
                <div className="flex justify-end">
                    <button 
                        type="submit" 
                        className="px-6 py-3 bg-[#5ddda1] text-[#003823] text-xs font-bold uppercase tracking-[0.15em] rounded-none hover:bg-[#08a56e] cursor-pointer transition-all shadow-lg"
                    >
                        Publish Review
                    </button>
                </div>
            </form>

            {/* Reviews Stream */}
            <div className="space-y-6 pt-4 border-t border-[#353535]">
                {loading ? (
                    <div className="text-center py-6 text-xs text-[#8e9192] font-bold uppercase tracking-widest font-mono">
                        Loading Reviews...
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#8e9192] font-bold uppercase tracking-widest">
                        No reviews posted yet for this property.
                    </div>
                ) : (
                    reviews.map((rev) => {
                        const reviewId = rev._id || rev.id;
                        const reviewUserId = rev.user?._id || rev.user?.id || rev.user;
                        const currentUserId = currentUser?._id || currentUser?.id;
                        
                        const isOwner = Boolean(currentUserId && reviewUserId && String(currentUserId) === String(reviewUserId));
                        const hostReply = rev.reply;

                        return (
                            <div key={reviewId} className="space-y-3 border-b border-[#353535] pb-6 last:border-b-0">
                                <div className="flex items-start space-x-4">
                                    
                                    {/* User Avatar */}
                                    {rev.user?.avatar ? (
                                        <img 
                                            src={rev.user.avatar} 
                                            alt="avatar" 
                                            className="w-10 h-10 rounded-none object-cover border border-[#444748] shrink-0" 
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-none bg-[#0e0e0e] text-[#5ddda1] border border-[#444748] font-bold text-xs flex items-center justify-center uppercase shrink-0">
                                            {(rev.user?.fullname || rev.user?.username || "U").slice(0, 2)}
                                        </div>
                                    )}

                                    {/* Review Content Area */}
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs font-bold text-[#e5e2e1]">
                                                    {rev.user?.fullname || rev.user?.username || "Verified Tenant"}
                                                </span>
                                                <span className="text-[10px] text-[#5ddda1] font-bold">
                                                    {"★".repeat(editingReviewId === reviewId ? editRating : (rev.rating || 5))}
                                                </span>
                                            </div>
                                            <span className="text-[9px] text-[#8e9192] font-mono">
                                                {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ""}
                                            </span>
                                        </div>

                                        {/* Inline Editing Form */}
                                        {editingReviewId === reviewId ? (
                                            <div className="space-y-3 bg-[#0e0e0e] p-4 rounded-none border border-[#353535]">
                                                <select 
                                                    value={editRating} 
                                                    onChange={(e) => setEditRating(Number(e.target.value))}
                                                    className="bg-[#1c1b1b] border border-[#444748] p-2 rounded-none text-xs font-bold text-[#e5e2e1]"
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
                                                    className="w-full bg-[#1c1b1b] border border-[#444748] p-2.5 rounded-none text-xs text-[#e5e2e1] focus:outline-none"
                                                />
                                                <div className="flex items-center space-x-3">
                                                    <button 
                                                        onClick={() => handleUpdateReview(reviewId)}
                                                        className="px-4 py-2 bg-[#5ddda1] text-[#003823] text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer hover:bg-[#08a56e]"
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingReviewId(null)}
                                                        className="px-4 py-2 bg-[#1c1b1b] text-[#c4c7c7] border border-[#444748] text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer hover:bg-[#353535]"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[#c4c7c7] leading-relaxed font-sans">
                                                {rev.comment || rev.content || rev.text}
                                            </p>
                                        )}

                                        {/* Host Reply Box */}
                                        {hostReply && (
                                            <div className="mt-3 bg-[#0e0e0e] border border-[#353535] p-4 rounded-none space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-[#5ddda1] text-[#003823] text-[9px] font-bold px-2 py-0.5 rounded-none uppercase tracking-widest">
                                                        HOST
                                                    </span>
                                                    <span className="text-[10px] font-bold text-[#8e9192] uppercase tracking-wider">Property Host Response</span>
                                                </div>
                                                <p className="text-xs text-[#e5e2e1] leading-relaxed font-sans">
                                                    {hostReply}
                                                </p>
                                            </div>
                                        )}

                                        {/* Owner Action Buttons */}
                                        {isOwner && editingReviewId !== reviewId && (
                                            <div className="flex items-center space-x-4 pt-1">
                                                <button 
                                                    onClick={() => startEditing(rev)}
                                                    className="text-[10px] font-bold text-[#5ddda1] hover:underline uppercase tracking-wider cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteReview(reviewId)}
                                                    className="text-[10px] font-bold text-[#ffb4ab] hover:underline uppercase tracking-wider cursor-pointer"
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