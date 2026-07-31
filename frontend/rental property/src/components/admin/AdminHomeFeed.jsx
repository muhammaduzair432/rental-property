import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPendingProperties, approveProperty, rejectProperty } from "../../store/adminSlice.js";

export default function AdminHomeFeed() {
    const dispatch = useDispatch();
    const { pendingProperties = [] } = useSelector((state) => state.admin || {});
    const [inspectedProperty, setInspectedProperty] = useState(null);

    useEffect(() => {
        dispatch(fetchPendingProperties());
    }, [dispatch]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
            {/* 🔍 Inspect Property Details Modal */}
            {inspectedProperty && (
                <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-[#080808]/90 backdrop-blur-md p-4 overflow-y-auto">
                    <div className="bg-[#1c1b1b] border border-[#353535] w-full max-w-2xl rounded-none shadow-2xl p-6 sm:p-8 relative max-h-[95vh] overflow-y-auto space-y-6 my-auto">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b border-[#353535] pb-4 sticky top-0 bg-[#1c1b1b] z-10">
                            <div>
                                <span className="text-[9px] font-bold text-[#5ddda1] uppercase tracking-[0.25em]">Inspection Mode</span>
                                <h3 className="text-sm sm:text-base font-serif font-bold uppercase text-[#e5e2e1] tracking-wide mt-0.5">Property Verification Details</h3>
                            </div>
                            <button 
                                onClick={() => setInspectedProperty(null)} 
                                className="font-bold text-[#8e9192] hover:text-[#5ddda1] cursor-pointer px-2 py-1 text-sm transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Property Images Grid */}
                            <div className="grid grid-cols-2 gap-3 h-56 sm:h-72 bg-[#0e0e0e] border border-[#353535] overflow-hidden">
                                {inspectedProperty.images?.length > 0 ? (
                                    inspectedProperty.images.map((img, idx) => (
                                        <img key={idx} src={img} alt="" className="w-full h-full object-cover filter contrast-110" />
                                    ))
                                ) : (
                                    <div className="col-span-2 flex items-center justify-center text-xs font-bold text-[#8e9192] uppercase tracking-wider">No Images Provided</div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-base sm:text-lg font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">{inspectedProperty.title}</h4>
                                <p className="text-xs text-[#c4c7c7] font-sans">📍 {inspectedProperty.location} • <strong className="text-[#5ddda1] font-bold">${inspectedProperty.price} / night</strong></p>
                            </div>

                            <div className="space-y-2">
                                <span className="text-[9px] font-bold text-[#5ddda1] uppercase tracking-[0.2em] block">Description</span>
                                <p className="text-xs text-[#c4c7c7] font-sans leading-relaxed bg-[#0e0e0e] p-4 border border-[#353535]">{inspectedProperty.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#353535] text-xs">
                                <div className="space-y-1">
                                    <strong className="text-[#8e9192] uppercase text-[9px] tracking-wider block">Category Type</strong> 
                                    <span className="font-bold uppercase text-[#e5e2e1]">{inspectedProperty.category || inspectedProperty.propertyType || "Standard Listing"}</span>
                                </div>
                                <div className="space-y-1">
                                    <strong className="text-[#8e9192] uppercase text-[9px] tracking-wider block">Verification Status</strong> 
                                    <span className="text-[#ffdf9e] font-bold uppercase text-[10px] tracking-wider">● Awaiting Admin Approval</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4 border-t border-[#353535]">
                            <button 
                                onClick={() => { dispatch(approveProperty(inspectedProperty._id)); setInspectedProperty(null); }} 
                                className="flex-1 py-3 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-lg transition-all"
                            >
                                Approve & Publish
                            </button>
                            <button 
                                onClick={() => { dispatch(rejectProperty(inspectedProperty._id)); setInspectedProperty(null); }} 
                                className="flex-1 py-3 bg-[#1c1b1b] hover:bg-[#ffb4ab] text-[#ffb4ab] hover:text-[#380007] border border-[#444748] hover:border-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-lg transition-all"
                            >
                                Reject & Purge
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Banner with Themed Visual & Dark Vignette Filter */}
            <div className="relative w-full h-64 sm:h-80 bg-[#0e0e0e] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-end p-6 sm:p-10">
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=90')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30"></div>

                <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        ADMIN VERIFICATION QUEUE
                    </span>
                    <h2 className="text-xl sm:text-3xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">
                        Pending Properties ({pendingProperties.length})
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        Review newly submitted host listings before publishing them live to the public marketplace.
                    </p>
                </div>
            </div>

            {/* Pending Properties Grid */}
            {pendingProperties.length === 0 ? (
                <div className="bg-[#1c1b1b] p-12 border border-dashed border-[#444748] text-center text-xs font-bold text-[#8e9192] uppercase rounded-none tracking-widest shadow-2xl">
                    No pending property listings awaiting review.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingProperties.map((prop) => {
                        const owner = prop.owner || {};
                        const mainImg = prop.images?.[0] || "";

                        return (
                            <div key={prop._id} className="bg-[#1c1b1b] border border-[#353535] hover:border-[#5ddda1] rounded-none overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1">
                                
                                <div className="h-48 bg-[#0e0e0e] relative border-b border-[#353535] overflow-hidden">
                                    {mainImg ? (
                                        <img src={mainImg} alt="" className="w-full h-full object-cover filter contrast-110" />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-xs font-bold text-[#8e9192] uppercase tracking-wider">NO IMAGE</div>
                                    )}
                                    <span className="absolute bottom-3 left-3 px-3 py-1.5 bg-[#080808]/90 text-[#5ddda1] text-[10px] font-black rounded-none uppercase tracking-wider border border-[#5ddda1]">
                                        ${prop.price} / night
                                    </span>
                                </div>

                                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3">
                                        <h4 className="text-xs sm:text-sm font-serif font-bold uppercase tracking-wide text-[#e5e2e1] line-clamp-1">{prop.title}</h4>
                                        
                                        {/* 👤 Host Details with Avatar */}
                                        <div className="flex items-center gap-3 bg-[#0e0e0e] p-3 rounded-none border border-[#353535]">
                                            {owner.avatar ? (
                                                <img src={owner.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-[#444748]" />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-[#1c1b1b] text-[#5ddda1] border border-[#444748] font-bold flex items-center justify-center text-xs uppercase">
                                                    {(owner.fullname || owner.username || "H").charAt(0)}
                                                </div>
                                            )}
                                            <div className="overflow-hidden">
                                                <span className="text-[10px] font-bold text-[#e5e2e1] block truncate">{owner.fullname || owner.username}</span>
                                                <span className="text-[9px] text-[#8e9192] font-mono block truncate">{owner.email}</span>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => setInspectedProperty(prop)}
                                            className="w-full py-2 bg-[#1c1b1b] hover:bg-[#353535] border border-[#444748] text-[#e5e2e1] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer transition-all shadow-md"
                                        >
                                            Inspect Property Details
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 pt-3 border-t border-[#353535]">
                                        <button 
                                            onClick={() => dispatch(approveProperty(prop._id))} 
                                            className="flex-1 py-2.5 bg-[#5ddda1] hover:bg-[#08a56e] text-[#003823] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-md transition-all"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => dispatch(rejectProperty(prop._id))} 
                                            className="flex-1 py-2.5 bg-[#1c1b1b] hover:bg-[#ffb4ab] text-[#ffb4ab] hover:text-[#380007] border border-[#444748] hover:border-[#ffb4ab] text-[10px] font-bold uppercase tracking-widest rounded-none cursor-pointer shadow-md transition-all"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}