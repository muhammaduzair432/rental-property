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
    const { allReviews = [], loading, successMessage, error } = useSelector((state) => state.ownerReviews || {});

    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [replyInputs, setReplyInputs] = useState({}); // { [reviewId]: "replyText" }
    const [editingReplyId, setEditingReplyId] = useState(null);

    useEffect(() => {
        dispatch(fetchOwnerReviewsFeed());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage || error) {
            const timer = setTimeout(() => dispatch(clearReviewNotice()), 3000);
            return () => clearTimeout(timer);
        }
    }, [successMessage, error, dispatch]);

    // ⚡ Group flat reviews array by Property ID
    const propertiesMap = {};
    allReviews.forEach((rev) => {
        const prop = rev.property;
        if (!prop) return;
        const pId = prop._id || prop.id;
        if (!propertiesMap[pId]) {
            propertiesMap[pId] = {
                ...prop,
                reviews: []
            };
        }
        propertiesMap[pId].reviews.push(rev);
    });

    const groupedProperties = Object.values(propertiesMap);
    const activePropertyModal = groupedProperties.find(p => (p._id || p.id) === selectedPropertyId);

    const handleReplySubmit = async (reviewId) => {
        const replyText = replyInputs[reviewId];
        if (!replyText?.trim()) return;

        const result = await dispatch(replyToReviewAction({ reviewId, replyText }));
        if (replyToReviewAction.fulfilled.match(result)) {
            setReplyInputs({ ...replyInputs, [reviewId]: "" });
            dispatch(fetchOwnerReviewsFeed());
        }
    };

    const handleEditSubmit = async (reviewId) => {
        const replyText = replyInputs[reviewId];
        if (!replyText?.trim()) return;

        const result = await dispatch(updateOwnerReplyAction({ reviewId, replyText }));
        if (updateOwnerReplyAction.fulfilled.match(result)) {
            setEditingReplyId(null);
            setReplyInputs({ ...replyInputs, [reviewId]: "" });
            dispatch(fetchOwnerReviewsFeed());
        }
    };

    const handleDeleteReply = async (reviewId) => {
        if (window.confirm("Are you sure you want to remove this reply?")) {
            const result = await dispatch(deleteOwnerReplyAction(reviewId));
            if (deleteOwnerReplyAction.fulfilled.match(result)) {
                dispatch(fetchOwnerReviewsFeed());
            }
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
            {/* 💬 POPUP REVIEWS MODAL */}
            {activePropertyModal && (
                <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-[#080808]/90 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-[#1c1b1b] border border-[#353535] w-full max-w-2xl rounded-none shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
                        
                        {/* Modal Header */}
                        <div className="bg-[#0e0e0e] border-b border-[#353535] px-6 py-5 flex justify-between items-center sticky top-0 z-10">
                            <div>
                                <span className="text-[9px] font-bold text-[#5ddda1] uppercase tracking-[0.25em] block">Feedback Stream</span>
                                <h3 className="text-sm font-serif font-bold uppercase text-[#e5e2e1] tracking-wide mt-0.5">{activePropertyModal.title}</h3>
                            </div>
                            <button 
                                onClick={() => setSelectedPropertyId(null)} 
                                className="font-bold text-[#8e9192] hover:text-[#5ddda1] cursor-pointer px-2 py-1 text-sm transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Reviews List */}
                        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
                            {activePropertyModal.reviews.map((rev) => {
                                const rId = rev._id || rev.id;
                                const user = rev.user || {};
                                const hostReply = rev.reply;

                                return (
                                    <div key={rId} className="bg-[#0e0e0e] border border-[#353535] p-5 rounded-none space-y-3.5 shadow-xl">
                                        
                                        {/* User Header with Avatar */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-[#444748]" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-[#1c1b1b] text-[#5ddda1] border border-[#444748] font-bold flex items-center justify-center text-xs">
                                                        {(user.fullname || user.username || "U").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div>
                                                    <h5 className="text-xs font-bold text-[#e5e2e1]">{user.fullname || user.username || "Verified Tenant"}</h5>
                                                    <span className="text-[9px] text-[#8e9192] font-mono">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs font-black text-[#5ddda1] font-mono bg-[#083823] px-2 py-0.5 border border-[#5ddda1]">★ {rev.rating || "5"} / 5</span>
                                        </div>

                                        {/* Review Comment */}
                                        <p className="text-xs text-[#c4c7c7] font-sans leading-relaxed pl-12">
                                            "{rev.comment}"
                                        </p>

                                        {/* Owner Reply Section */}
                                        <div className="pl-12 pt-3 border-t border-[#353535] space-y-3">
                                            {hostReply && editingReplyId !== rId ? (
                                                <div className="bg-[#1c1b1b] p-3.5 rounded-none border border-[#353535] space-y-1.5 shadow-md">
                                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-[#5ddda1]">
                                                        <span>Your Host Response</span>
                                                        <div className="flex gap-3">
                                                            <button 
                                                                onClick={() => {
                                                                    setEditingReplyId(rId);
                                                                    setReplyInputs({ ...replyInputs, [rId]: hostReply });
                                                                }}
                                                                className="hover:text-white cursor-pointer transition-colors"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteReply(rId)}
                                                                className="hover:text-[#ffb4ab] cursor-pointer transition-colors text-[#ffb4ab]"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-[#e5e2e1] font-sans">{hostReply}</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2.5">
                                                    <textarea 
                                                        rows="2"
                                                        placeholder={editingReplyId === rId ? "Edit your response..." : "Write a professional response to this tenant review..."}
                                                        value={replyInputs[rId] || ""}
                                                        onChange={(e) => setReplyInputs({ ...replyInputs, [rId]: e.target.value })}
                                                        className="w-full text-xs p-3 bg-[#1c1b1b] border border-[#444748] rounded-none text-[#e5e2e1] focus:outline-none focus:border-[#5ddda1] placeholder:text-[#8e9192] resize-none"
                                                    />
                                                    <div className="flex justify-end gap-2.5">
                                                        {editingReplyId === rId && (
                                                            <button 
                                                                onClick={() => setEditingReplyId(null)} 
                                                                className="px-4 py-2 bg-[#1c1b1b] text-[#c4c7c7] border border-[#444748] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer hover:bg-[#353535]"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => editingReplyId === rId ? handleEditSubmit(rId) : handleReplySubmit(rId)}
                                                            className="px-5 py-2 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-md transition-all"
                                                        >
                                                            {editingReplyId === rId ? "Save Response" : "Post Response"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>
            )}

            {/* Hero Banner with Themed Visual & Dark Vignette Filter */}
            <div className="relative w-full h-64 sm:h-80 bg-[#0e0e0e] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-end p-6 sm:p-10">
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=90')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30"></div>

                <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        FEEDBACK STREAM
                    </span>
                    <h2 className="text-xl sm:text-3xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">
                        View & Manage Property Reviews
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        Click on any property asset card below to inspect tenant feedback ratings, post official replies, or manage host responses.
                    </p>
                </div>
            </div>

            {successMessage && (
                <div className="bg-[#083823]/50 text-[#5ddda1] border border-[#5ddda1] px-4 py-3.5 rounded-none text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                    <span>✓</span> {successMessage}
                </div>
            )}
            {error && (
                <div className="bg-[#1c1b1b] text-[#ffb4ab] border border-[#444748] px-4 py-3.5 rounded-none text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2">
                    <span>⚠️</span> {error}
                </div>
            )}

            {/* Property Cards Grid (Compact & Stylized) */}
            {loading ? (
                <div className="p-16 flex flex-col items-center justify-center space-y-3 bg-[#1c1b1b] border border-[#353535]">
                    <div className="w-8 h-8 border-2 border-[#5ddda1] border-t-transparent rounded-none animate-spin"></div>
                    <div className="text-[10px] font-bold tracking-[0.25em] text-[#8e9192] uppercase font-mono">
                        Retrieving Review Feeds...
                    </div>
                </div>
            ) : groupedProperties.length === 0 ? (
                <div className="bg-[#1c1b1b] p-12 border border-dashed border-[#444748] text-center text-xs font-bold text-[#8e9192] uppercase rounded-none tracking-widest shadow-2xl">
                    No property review feeds found yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {groupedProperties.map((prop) => {
                        const pId = prop._id || prop.id;
                        const mainImg = prop.images?.[0] || prop.image || "";
                        const reviewsCount = prop.reviews.length;

                        return (
                            <div 
                                key={pId}
                                onClick={() => setSelectedPropertyId(pId)}
                                className="bg-[#1c1b1b] border border-[#353535] hover:border-[#5ddda1] rounded-none overflow-hidden shadow-2xl flex flex-col justify-between cursor-pointer group transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="h-40 bg-[#0e0e0e] relative border-b border-[#353535] overflow-hidden">
                                    {mainImg ? (
                                        <img src={mainImg} alt={prop.title} className="w-full h-full object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-[#8e9192] uppercase tracking-wider">No Asset Image</div>
                                    )}
                                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 bg-[#080808]/90 text-[#5ddda1] text-[9px] font-black rounded-none uppercase tracking-wider border border-[#5ddda1]">
                                        ⭐ {reviewsCount} {reviewsCount === 1 ? "Review" : "Reviews"}
                                    </span>
                                </div>

                                <div className="p-4 space-y-1.5">
                                    <h4 className="text-xs font-serif font-bold uppercase tracking-wide text-[#e5e2e1] group-hover:text-[#5ddda1] transition-colors line-clamp-1">{prop.title}</h4>
                                    <p className="text-[10px] text-[#8e9192] uppercase tracking-wider">Inspect tenant feedback →</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

        </div>
    );
}