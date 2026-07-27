import React, { useState } from "react";

export default function OwnerDashboard() {
    const [activeTab, setActiveTab] = useState("home");

    return (
        <div className="space-y-6">
            
            {/* Owner Sub-Toolbar / Tabs */}
            <div className="flex items-center gap-2 border-b border-[#e2e8f8] pb-3 overflow-x-auto">
                <button
                    onClick={() => setActiveTab("home")}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        activeTab === "home" ? "bg-[#151c27] text-white" : "bg-white border border-[#e2e8f8] text-[#7d8497] hover:text-[#151c27]"
                    }`}
                >
                    🏠 Overview Home
                </button>
                <button
                    onClick={() => setActiveTab("add-property")}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        activeTab === "add-property" ? "bg-[#151c27] text-white" : "bg-white border border-[#e2e8f8] text-[#7d8497] hover:text-[#151c27]"
                    }`}
                >
                    ➕ Add Property
                </button>
                <button
                    onClick={() => setActiveTab("my-properties")}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        activeTab === "my-properties" ? "bg-[#151c27] text-white" : "bg-white border border-[#e2e8f8] text-[#7d8497] hover:text-[#151c27]"
                    }`}
                >
                    🏢 My Properties
                </button>
                <button
                    onClick={() => setActiveTab("earnings")}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        activeTab === "earnings" ? "bg-[#151c27] text-white" : "bg-white border border-[#e2e8f8] text-[#7d8497] hover:text-[#151c27]"
                    }`}
                >
                    💰 Earnings & Payouts
                </button>
                <button
                    onClick={() => setActiveTab("manage-reviews")}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                        activeTab === "manage-reviews" ? "bg-[#151c27] text-white" : "bg-white border border-[#e2e8f8] text-[#7d8497] hover:text-[#151c27]"
                    }`}
                >
                    ⭐ Manage Reviews
                </button>
            </div>

            {/* Dynamic Content Rendering Based on Active Tab */}
            {activeTab === "home" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-1">
                        <span className="text-[10px] font-bold text-[#7d8497] uppercase">Active Listings</span>
                        <h3 className="text-2xl font-black text-[#151c27]">4 Properties</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-1">
                        <span className="text-[10px] font-bold text-[#7d8497] uppercase">Total Revenue (MTD)</span>
                        <h3 className="text-2xl font-black text-emerald-600">$24,500</h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#e2e8f8] shadow-xs space-y-1">
                        <span className="text-[10px] font-bold text-[#7d8497] uppercase">Average Rating</span>
                        <h3 className="text-2xl font-black text-[#151c27]">4.88 ⭐</h3>
                    </div>
                </div>
            )}

            {activeTab === "add-property" && (
                <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#151c27]">Register New Rental Unit</h3>
                    {/* Add property form inputs go here */}
                    <p className="text-xs text-gray-500">Form fields for title, category type, location, price per night, and image upload...</p>
                </div>
            )}

            {activeTab === "my-properties" && (
                <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#151c27] mb-4">Properties Management Stream</h3>
                    <p className="text-xs text-gray-500">Listing cards with Edit / Delete controls will render here.</p>
                </div>
            )}

            {activeTab === "earnings" && (
                <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#151c27] mb-4">Earnings Analytics</h3>
                    <p className="text-xs text-gray-500">Payout summaries and transaction logs will render here.</p>
                </div>
            )}

            {activeTab === "manage-reviews" && (
                <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#151c27] mb-4">Tenant Reviews Stream</h3>
                    <p className="text-xs text-gray-500">Reviews and feedback replies will render here.</p>
                </div>
            )}

        </div>
    );
}