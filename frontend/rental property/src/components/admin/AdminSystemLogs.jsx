import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSystemLogs } from "../../store/adminSlice.js";

export default function AdminSystemLogs() {
    const dispatch = useDispatch();
    const { systemLogs = [] } = useSelector((state) => state.admin || {});

    useEffect(() => {
        dispatch(fetchSystemLogs());
    }, [dispatch]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 text-[#e5e2e1] font-sans antialiased p-1 sm:p-2 lg:p-4">
            
            {/* Hero Banner with Themed Visual & Dark Vignette Filter */}
            <div className="relative w-full h-64 sm:h-80 bg-[#0e0e0e] border border-[#353535] rounded-none overflow-hidden shadow-2xl flex flex-col justify-end p-6 sm:p-10">
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=90')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/30"></div>

                <div className="relative z-10 space-y-2 max-w-2xl">
                    <span className="text-[9px] sm:text-[10px] font-bold text-[#5ddda1] uppercase tracking-[0.3em]">
                        OPERATIONAL AUDIT TRAIL
                    </span>
                    <h2 className="text-xl sm:text-3xl font-serif font-bold uppercase text-[#e5e2e1] tracking-tight">
                        System Audit Logs ({systemLogs.length})
                    </h2>
                    <p className="text-xs sm:text-sm text-[#c4c7c7] font-sans leading-relaxed">
                        Real-time historical event logs recorded across administrator actions, user operations, and security checkpoints.
                    </p>
                </div>
            </div>

            {/* System Audit Logs Table Card */}
            <div className="bg-[#1c1b1b] rounded-none border border-[#353535] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-[#353535] bg-[#0e0e0e] text-[#8e9192] uppercase font-bold text-[9px] tracking-[0.2em]">
                                <th className="py-4 px-5">Action Type</th>
                                <th className="py-4 px-5">Description</th>
                                <th className="py-4 px-5">Performed By</th>
                                <th className="py-4 px-5 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#353535] font-medium text-[#e5e2e1]">
                            {systemLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-12 text-center text-xs font-bold text-[#8e9192] uppercase tracking-widest">
                                        No system audit logs recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                systemLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-[#0e0e0e] transition-colors">
                                        <td className="py-4 px-5 font-mono font-bold text-[#5ddda1] tracking-wide">
                                            {log.actionType}
                                        </td>
                                        <td className="py-4 px-5 text-[#c4c7c7] font-sans leading-relaxed">{log.description}</td>
                                        <td className="py-4 px-5 text-[#e5e2e1] font-sans">
                                            <span className="font-bold uppercase tracking-wide">{log.performedBy?.username || "Admin"}</span>
                                            <span className="text-[9px] text-[#8e9192] uppercase tracking-wider block font-mono">({log.performedBy?.role || "system"})</span>
                                        </td>
                                        <td className="py-4 px-5 text-right font-mono text-[#8e9192]">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}