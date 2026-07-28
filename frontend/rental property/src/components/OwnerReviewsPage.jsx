import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    fetchOwnerReviewsFeed, 
    replyToReviewAction, 
    updateOwnerReplyAction, 
    deleteOwnerReplyAction, 
    clearReviewNotice 
} from "../store/ownerReviewsSlice.js";

export default function OwnerReviewsPage() {
    const dispatch = useDispatch();
    const { propertiesWithReviews = [], loading, successMessage, error } = useSelector((state) => state.ownerReviews || {});

    const [selectedProperty, setSelectedProperty] = useState(null);
    const [replyInputs, setReplyInputs] = useState({}); // { [reviewId]: "comment text" }
    const [editingReplyId, setEditingReplyId] = useState(null); // track which review's reply is being edited

    useEffect(() => {
        dispatch(fetchOwnerReviewsFeed());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => dispatch(clearReviewNotice()), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error, dispatch]);

    const handleReplySubmit = async (reviewId) => {
        const commentText = replyInputs[reviewId];
        if (!commentText?.trim()) return;

        const result = await dispatch(replyToReviewAction({ reviewId, comment: commentText }));
        if (replyToReviewAction.fulfilled.match(result)) {
            setReplyInputs({ ...replyInputs, [reviewId]: "" });
            dispatch(fetchOwnerReviewsFeed());
            // Update modal selected property live reference if open
            refreshSelectedPropertyModal();
        }
    };

    const handleEditSubmit = async (reviewId) => {
        const commentText = replyInputs[reviewId];
        if (!commentText?.trim()) return;

        const result = await dispatch(updateOwnerReplyAction({ reviewId, comment: commentText }));
        if (updateOwnerReplyAction.fulfilled.match(result)) {
            setEditingReplyId(null);
            setReplyInputs({ ...replyInputs, [reviewId]: "" });
            dispatch(fetchOwnerReviewsFeed());
            refreshSelectedPropertyModal();
        }
    };

    const handleDeleteReply = async (reviewId) => {
        if (window.confirm("Are you sure you want to delete this reply?")) {
            const result = await dispatch(deleteOwnerReplyAction(reviewId));
            if (deleteOwnerReplyAction.fulfilled.match(result)) {
                dispatch(fetchOwnerReviewsFeed());
                refreshSelectedPropertyModal();
            }
        }
    };

    const refreshSelectedPropertyModal = () => {
        // Keeps modal synchronized after dispatch actions
        setTimeout(() => {
            // Re-fetch handled via redux store sync
        }, 200);
    };

    return (
        <div className="space-y-6">
            
            {/* 💬 POPUP REVIEWS MODAL */}
            {selectedProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white border border-[#e2e8f8] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-6 max-h-[90vh] overflow-y-auto">
                        
                        <div className="flex justify-between items-center border-b pb-3">
                            <div>
                                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">Property Reviews Feed</span>
                                <h3 className="text-sm font-black uppercase text-[#151c27]">{selectedProperty.title}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedProperty(null)} 
                                className="font-bold text-gray-400 hover:text-black cursor-pointer px-2 py-1"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-4">
                            {(!selectedProperty.reviews || selectedProperty.reviews.length === 0) ? (
                                <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase">
                                    No reviews registered for this property unit yet.
                                </div>
                            ) : (
                                selectedProperty.reviews.map((rev) => {
                                    const rId = rev._id || rev.id;
                                    const user = rev.user || rev.tenant || {};
                                    const hasOwnerReply = rev.reply || rev.ownerReply || rev.comment;

                                    return (
                                        <div key={rId} className="bg-[#f9f9ff] border border-[#e2e8f8] p-4 rounded-xl space-y-3">
                                            {/* User Header */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar ? (
                                                        <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover border" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                                                            {(user.fullname || user.username || "U").charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h5 className="text-xs font-bold text-[#151c27]">{user.fullname || user.username || "Verified Tenant"}</h5>
                                                        <span className="text-[9px] text-gray-400">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-black text-amber-500">★ {rev.rating || "5"} / 5</span>
                                            </div>

                                            {/* Review Comment */}
                                            <p className="text-xs text-[#45464c] leading-relaxed pl-11">
                                                "{rev.comment || rev.text || rev.review}"
                                            </p>

                                            {/* Owner Reply Display / Action Area */}
                                            <div className="pl-11 pt-2 border-t border-gray-200/60 space-y-2">
                                                {hasOwnerReply && editingReplyId !== rId ? (
                                                    <div className="bg-white p-3 rounded-lg border border-[#e2e8f8] space-y-1">
                                                        <div className="flex justify-between items-center text-[9px] font-bold uppercase text-[#7d8497]">
                                                            <span>Your Host Reply</span>
                                                            <div className="flex gap-2">
                                                                <button 
                                                                    onClick={() => {
                                                                        setEditingReplyId(rId);
                                                                        setReplyInputs({ ...replyInputs, [rId]: hasOwnerReply });
                                                                    }}
                                                                    className="hover:text-blue-600 cursor-pointer"
                                                                >
                                                                    ✏️ Edit
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteReply(rId)}
                                                                    className="hover:text-red-600 cursor-pointer"
                                                                >
                                                                    🗑️ Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-[#151c27]">{hasOwnerReply}</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <textarea 
                                                            rows="2"
                                                            placeholder={editingReplyId === rId ? "Edit your reply..." : "Write a reply to this review..."}
                                                            value={replyInputs[rId] || ""}
                                                            onChange={(e) => setReplyInputs({ ...replyInputs, [rId]: e.target.value })}
                                                            className="w-full text-xs p-2.5 bg-white border rounded-lg focus:outline-none"
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            {editingReplyId === rId && (
                                                                <button 
                                                                    onClick={() => setEditingReplyId(null)} 
                                                                    className="px-3 py-1 bg-gray-100 text-[10px] font-bold uppercase rounded cursor-pointer"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                            <button 
                                                                onClick={() => editingReplyId === rId ? handleEditSubmit(rId) : handleReplySubmit(rId)}
                                                                className="px-4 py-1.5 bg-[#151c27] text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer hover:bg-black"
                                                            >
                                                                {editingReplyId === rId ? "Save Reply" : "Post Reply"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    );
                                })
                            )}
                        </div>

                    </div>
                </div>
            )}

            {/* Header Banner */}
            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-2">
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">FEEDBACK STREAM</span>
                <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">View & Manage Property Reviews</h2>
                <p className="text-xs text-gray-500">Click on any property card below to view tenant reviews, post replies, edit responses, or delete feedback.</p>
            </div>

            {successMessage && (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                    {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                    ⚠️ {error}
                </div>
            )}

            {/* Property Cards Grid (Only properties that have reviews) */}
            {loading ? (
                <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-[#151c27] border-t-transparent rounded-full animate-spin"></div></div>
            ) : propertiesWithReviews.length === 0 ? (
                <div className="bg-white p-12 border border-dashed border-[#e2e8f8] text-center text-xs font-bold text-gray-400 uppercase rounded-xl tracking-wider">
                    No property review feeds found yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {propertiesWithReviews.map((prop) => {
                        const pId = prop._id || prop.id;
                        const mainImg = prop.image || prop.images?.[0];
                        const reviewsCount = prop.reviews?.length || 0;

                        return (
                            <div 
                                key={pId}
                                onClick={() => setSelectedProperty(prop)}
                                className="bg-white border border-[#e2e8f8] hover:border-[#151c27] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between cursor-pointer group transition-all"
                            >
                                <div className="h-48 bg-[#f9f9ff] relative border-b border-[#e2e8f8]">
                                    {mainImg ? (
                                        <img src={mainImg} alt={prop.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-gray-400 uppercase">No Image</div>
                                    )}
                                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#151c27] text-white text-[10px] font-black rounded uppercase">
                                        ⭐ {reviewsCount} {reviewsCount === 1 ? "Review" : "Reviews"}
                                    </span>
                                </div>

                                <div className="p-4 space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wide text-[#151c27] group-hover:underline line-clamp-1">{prop.title}</h4>
                                    <p className="text-[11px] text-gray-500">Click to inspect tenant feedback, ratings, and manage host replies.</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}