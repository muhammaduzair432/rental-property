import React from "react";

export default function NotificationModal({ isOpen, onClose, notifications = [] }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white border border-[#e2e8f8] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col p-6 space-y-6 max-h-[85vh]">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b pb-3">
                    <div>
                        <span className="text-[9px] font-bold text-[#7d8497] uppercase tracking-widest">System Activity Center</span>
                        <h3 className="text-sm font-black uppercase text-[#151c27]">Role-Based Notifications ({notifications.length})</h3>
                    </div>
                    <button onClick={onClose} className="font-bold text-gray-400 hover:text-black cursor-pointer px-2 py-1 text-sm">✕</button>
                </div>

                {/* Notifications Stream */}
                <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-xs font-bold text-gray-400 uppercase">
                            No notifications logged in your account database yet.
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif._id} className="p-4 rounded-xl border border-[#e2e8f8] bg-[#f9f9ff] flex items-start gap-3 shadow-2xs">
                                <span className="text-base shrink-0 pt-0.5">🔔</span>
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs font-medium text-[#151c27] leading-relaxed">
                                        {notif.message}
                                    </p>
                                    <span className="text-[9px] text-gray-400 font-mono block">
                                        {new Date(notif.createdAt || Date.now()).toLocaleDateString()} at {new Date(notif.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-2 border-t text-right">
                    <button onClick={onClose} className="px-5 py-2 bg-[#151c27] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-black cursor-pointer">
                        Close Feed
                    </button>
                </div>

            </div>
        </div>
    );
}