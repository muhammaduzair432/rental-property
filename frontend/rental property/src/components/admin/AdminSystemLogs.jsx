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
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl border border-[#e2e8f8] shadow-xs space-y-2">
                <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">OPERATIONAL AUDIT TRAIL</span>
                <h2 className="text-2xl font-bold uppercase text-[#151c27] tracking-tight">System Audit Logs ({systemLogs.length})</h2>
                <p className="text-xs text-gray-500">Real-time historical event logs recorded across administrator and user actions.</p>
            </div>

            <div className="bg-white rounded-xl border border-[#e2e8f8] overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-[#e2e8f8] text-[#7d8497] uppercase font-bold text-[9px]">
                            <th className="py-3 px-4">Action Type</th>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4">Performed By</th>
                            <th className="py-3 px-4 text-right">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f8] font-medium text-[#151c27]">
                        {systemLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-[#f9f9ff]">
                                <td className="py-3 px-4 font-bold font-mono text-blue-600">{log.actionType}</td>
                                <td className="py-3 px-4">{log.description}</td>
                                <td className="py-3 px-4">{log.performedBy?.username || "Admin"} ({log.performedBy?.role})</td>
                                <td className="py-3 px-4 text-right text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}