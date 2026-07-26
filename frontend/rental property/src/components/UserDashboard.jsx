import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../store/propertySlice.js"; 
import PropertyDetailsModal from "./PropertyDetailsModal.jsx";
import { useNavigate } from "react-router-dom";

export default function UserDashboard({ searchQuery = "", selectedFilter = "all" }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // 🕵️ Selected property ID state for opening the details modal
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);

    // 🕵️ Inspect the global properties state block from propertySlice

    // const { properties, loading, error } = propertiesState;
    const propertiesState = useSelector((state) => state.properties) || {};
const { properties = [], loadingList = false, errorList = null } = propertiesState;

    useEffect(() => {
        dispatch(fetchProperties());
    }, [dispatch]);

    // 🔍 DEBUG LOG: Check what the component is receiving from Redux
    // console.log("=== RENDER STATE CHECK ===", { properties, loadinglist });

    // Fallback safely to an empty array if properties is undefined
    const safeProperties = Array.isArray(properties) ? properties : [];

    // 🎯 Your exact filter logic maintained cleanly
    const filteredProperties = safeProperties.filter(item => {
        if (!item) return false;

        const matchesSearch = (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.location || "").toLowerCase().includes(searchQuery.toLowerCase());

        const isHouse = (item.description || "").toLowerCase().includes("house") || (item.type || "").toLowerCase() === "house";
        const isVilla = (item.description || "").toLowerCase().includes("villa") || (item.type || "").toLowerCase() === "villa";
        const isApartment = (item.description || "").toLowerCase().includes("apartment") || (item.type || "").toLowerCase() === "apartment";

        const matchesType = selectedFilter === "all" || 
            (selectedFilter === "house" && isHouse) ||
            (selectedFilter === "villa" && isVilla) ||
            (selectedFilter === "apartment" && isApartment);

        
        return matchesSearch && matchesType;
    });



    // if (loading) {
    //     return (
    //         <div className="flex flex-col items-center justify-center p-12 space-y-3">
    //             <div className="w-6 h-6 border-2 border-[#151c27] border-t-transparent rounded-full animate-spin"></div>
    //             <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">
    //                 Redux Thunk dispatch syncing database pipelines...
    //             </div>
    //         </div>
    //     );
    // }

    // Use loadingList here so opening the modal won't re-render the dashboard background!
if (loadingList) {
    return (
        <div className="flex flex-col items-center justify-center p-12 space-y-3">
            <div className="w-6 h-6 border-2 border-[#151c27] border-t-transparent rounded-full animate-spin"></div>
            <div className="text-[10px] font-bold tracking-widest text-gray-400 uppercase font-mono">
                Syncing marketplace catalog...
            </div>
        </div>
    );
}

    if (errorList) {
        return (
            <div className="bg-red-50 text-red-700 p-4 text-xs font-bold uppercase border border-red-200 rounded-md tracking-wider">
                ⚠️ Error: {errorList}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* 🔍 PROPERTY DETAILS MODAL (Triggers when selectedPropertyId is set) */}
            {selectedPropertyId && (
                <PropertyDetailsModal 
                    propertyId={selectedPropertyId} 
                    onClose={() => setSelectedPropertyId(null)} 
                />
            )}

            <div>
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">REAL ESTATE CATALOG</span>
                <h2 className="text-xl font-bold uppercase tracking-tight text-[#151c27]">Available Accommodations</h2>
            </div>

            {filteredProperties.length === 0 ? (
                <div className="bg-white p-12 border border-dashed border-[#e2e8f8] text-center text-xs font-bold text-gray-400 uppercase rounded-md tracking-wider">
                    No verified properties matched your active searching parameters.
                    <br />
                    <span className="text-[10px] lowercase text-gray-300 font-mono block mt-2">
                        (Check browser console logs to verify database payload array length)
                    </span>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProperties.map((item) => (
                        <div key={item._id || item.id} className="bg-white border border-[#e2e8f8] rounded-md overflow-hidden shadow-xs flex flex-col justify-between hover:border-gray-400 transition-all animate-fadeIn">

                            <div className="h-48 bg-[#f9f9ff] relative border-b border-[#e2e8f8]">
                                {item.image || item.images?.[0] ? (
                                    <img src={item.image || item.images?.[0]} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] font-bold tracking-widest text-gray-400 uppercase">No Image Record</div>
                                )}
                                <span className="absolute bottom-3 left-3 px-2 py-1 bg-[#151c27] text-white text-[10px] font-black rounded uppercase tracking-wider">
                                    ${item.pricePerNight || item.price || "0"} / night
                                </span>
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[9px] font-black uppercase text-[#7d8497] tracking-wider">
                                        <span>{item.type || "Space"}</span>
                                        <span className="text-emerald-600">● Live Status</span>
                                    </div>
                                    <h4 className="text-xs font-bold uppercase tracking-wide text-[#151c27] line-clamp-1">{item.title || "Premium Suite Asset"}</h4>
                                    <p className="text-[11px] text-[#45464c] line-clamp-2 leading-relaxed">{item.description || "No descriptive logs registered on server storage nodes."}</p>
                                </div>

                                {/* 🎯 Triggers modal popup with the property ID */}
                             <button 
    onClick={() => navigate(`/property/${item._id || item.id}`)}
    className="w-full py-2 bg-white hover:bg-[#151c27] text-[#151c27] hover:text-white border border-[#151c27] text-[10px] font-bold uppercase tracking-widest rounded transition-all cursor-pointer text-center"
>
    View Details & Book
</button>
                            </div>

                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}