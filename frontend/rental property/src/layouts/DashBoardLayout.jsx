import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function Dashboard() {
    // 1. Grab user authorization state payload straight from Redux state cache
    const { user } = useSelector((state) => state.auth);

    // Guard Clause: If user session data doesn't exist, route back to access gateway
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    return (
        <div className="min-h-[calc(100vh-37px)] w-full bg-[#f9f9ff] text-[#151c27] p-4 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* GLOBAL DASHBOARD METRIC HEADER ZONE */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-[#e2e8f8] gap-4">
                    <div>
                        <span className="text-[10px] font-bold tracking-widest text-[#7d8497] uppercase">
                            Workspace Channel Console
                        </span>
                        <h1 className="text-2xl font-bold tracking-tight uppercase mt-0.5">
                            Welcome Back, {user.fullname || user.username}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className="text-[10px] font-bold tracking-wider px-3 py-1 bg-[#151c27] text-white rounded-full uppercase">
                            Role: {user.role}
                        </span>
                    </div>
                </div>

                {/* 🌟 BRANCH A: RENTAL CLIENT CONSOLE ("user") */}
                {user.role === "user" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-md border border-[#e2e8f8] shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Your Active Bookings</h3>
                                <div className="border border-dashed border-[#e2e8f8] p-8 text-center rounded text-xs text-gray-400 font-medium">
                                    No pending property bookings or active check-ins observed.
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-md border border-[#e2e8f8] shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Quick Actions</h3>
                                <button className="w-full py-2 bg-[#151c27] text-white text-xs font-semibold rounded uppercase tracking-wider hover:bg-black transition-all cursor-pointer">
                                    Explore Properties
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🌟 BRANCH B: LANDLORD MANAGEMENT PORTAL ("owner") */}
                {user.role === "owner" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-md border border-[#e2e8f8] shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Your Structural Listings</h3>
                                <div className="border border-dashed border-[#e2e8f8] p-8 text-center rounded text-xs text-gray-400 font-medium">
                                    You have not published any rental assets yet.
                                </div>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-md border border-[#e2e8f8] shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-3">Landlord Desk</h3>
                                <button className="w-full py-2 bg-[#151c27] text-white text-xs font-semibold rounded uppercase tracking-wider hover:bg-black transition-all cursor-pointer">
                                    Add New Property
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 🌟 BRANCH C: INFRASTRUCTURE CLUSTER CONTROL PANEL ("admin") */}
                {user.role === "admin" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
                        <div className="bg-white p-5 rounded-md border border-[#e2e8f8] shadow-sm text-center">
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">System Users</span>
                            <p className="text-3xl font-extrabold text-[#151c27] mt-1">--</p>
                        </div>
                        <div className="bg-white p-5 rounded-md border border-[#e2e8f8] shadow-sm text-center">
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Verified Properties</span>
                            <p className="text-3xl font-extrabold text-[#151c27] mt-1">--</p>
                        </div>
                        <div className="bg-white p-5 rounded-md border border-[#e2e8f8] shadow-sm text-center md:col-span-1">
                            <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Platform Revenue</span>
                            <p className="text-3xl font-extrabold text-[#10b981] mt-1">$0.00</p>
                        </div>
                        <div className="md:col-span-3 bg-white p-6 rounded-md border border-[#e2e8f8] shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-2">Administrative Actions</h3>
                            <p className="text-xs text-gray-400 mb-4">Global operations parameters matrix visibility is enabled.</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}