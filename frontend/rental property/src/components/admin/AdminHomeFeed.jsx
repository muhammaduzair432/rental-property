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
        <div className="space-y-6">
            
            {/* 🔍 Inspect Property Details Modal (Instant Local Data Render - No 404s) */}
            {inspectedProperty && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white border border-[#e2e8f8] w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <div>
                                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">Inspection Mode</span>
                                <h3 className="text-sm font-black uppercase text-[#151c27]">Property Verification Details</h3>
                            </div>
                            <button onClick={() => setInspectedProperty(null)} className="font-bold text-gray-400 hover:text-black cursor-pointer px-2 py-1">✕</button>
                        </div>

                        <div className="space-y-4">
                            {/* Property Images Grid */}
                            <div className="grid grid-cols-2 gap-2 h-64 bg-gray-50 rounded-xl overflow-hidden">
                                {inspectedProperty.images?.length > 0 ? (
                                    inspectedProperty.images.map((img, idx) => (
                                        <img key={idx} src={img} alt="" className="w-full h-full object-cover" />
                                    ))
                                ) : (
                                    <div className="col-span-2 flex items-center justify-center text-xs font-bold text-gray-400 uppercase">No Images Provided</div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-base font-bold uppercase text-[#151c27]">{inspectedProperty.title}</h4>
                                <p className="text-xs text-gray-500">{inspectedProperty.location} • <strong className="text-emerald-600">${inspectedProperty.price} / night</strong></p>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-wider block">Description</span>
                                <p className="text-xs text-[#45464c] leading-relaxed bg-[#f9f9ff] p-3 rounded-lg border border-[#e2e8f8]">{inspectedProperty.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs">
                                <div>
                                    <strong className="text-gray-400 uppercase text-[9px] block">Category Type</strong> 
                                    <span className="font-bold uppercase text-[#151c27]">{inspectedProperty.category || inspectedProperty.propertyType || "Standard Listing"}</span>
                                </div>
                                <div>
                                    <strong className="text-gray-400 uppercase text-[9px] block">Verification Status</strong> 
                                    <span className="text-amber-600 font-bold uppercase text-[10px]">Awaiting Admin Approval</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t">
                            <button onClick={() => { dispatch(approveProperty(inspectedProperty._id)); setInspectedProperty(null); }} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer">Approve & Publish</button>
                            <button onClick={() => { dispatch(rejectProperty(inspectedProperty._id)); setInspectedProperty(null); }} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer">Reject & Purge</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Banner */}
            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-2">
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">ADMIN VERIFICATION QUEUE</span>
                <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">Pending Properties ({pendingProperties.length})</h2>
                <p className="text-xs text-gray-500">Review newly submitted host listings before publishing them live to the public marketplace.</p>
            </div>

            {pendingProperties.length === 0 ? (
                <div className="bg-white p-12 border border-dashed border-[#e2e8f8] text-center text-xs font-bold text-gray-400 uppercase rounded-xl tracking-wider">
                    No pending property listings awaiting review.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingProperties.map((prop) => {
                        const owner = prop.owner || {};
                        const mainImg = prop.images?.[0] || "";

                        return (
                            <div key={prop._id} className="bg-white border border-[#e2e8f8] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
                                <div className="h-48 bg-[#f9f9ff] relative border-b">
                                    {mainImg ? <img src={mainImg} alt="" className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-xs font-bold text-gray-400">NO IMAGE</div>}
                                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-[#151c27] text-white text-[10px] font-black rounded uppercase">${prop.price} / night</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <h4 className="text-xs font-bold uppercase tracking-wide text-[#151c27] line-clamp-1">{prop.title}</h4>
                                    
                                    {/* 👤 Host Details with Actual Avatar */}
                                    <div className="flex items-center gap-2.5 bg-[#f9f9ff] p-2.5 rounded-lg border border-[#e2e8f8]">
                                        {owner.avatar ? (
                                            <img src={owner.avatar} alt="" className="w-8 h-8 rounded-full object-cover border" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[#151c27] text-white font-bold flex items-center justify-center text-xs uppercase">
                                                {(owner.fullname || owner.username || "H").charAt(0)}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <span className="text-[10px] font-bold text-[#151c27] block truncate">{owner.fullname || owner.username}</span>
                                            <span className="text-[9px] text-gray-400 block truncate">{owner.email}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setInspectedProperty(prop)}
                                        className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-[#151c27] text-[10px] font-bold uppercase rounded cursor-pointer"
                                    >
                                        Inspect Property Details
                                    </button>

                                    <div className="flex items-center gap-2 pt-2 border-t">
                                        <button onClick={() => dispatch(approveProperty(prop._id))} className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase rounded cursor-pointer">Approve</button>
                                        <button onClick={() => dispatch(rejectProperty(prop._id))} className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase rounded cursor-pointer">Reject</button>
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