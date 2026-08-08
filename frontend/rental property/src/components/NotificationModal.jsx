import React from "react";

export default function NotificationModal({ isOpen, onClose, notifications = [], onMarkAllAsRead }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center bg-[#080808]/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-[#1c1b1b] border border-[#353535] w-full max-w-lg rounded-none shadow-2xl overflow-hidden flex flex-col p-6 space-y-6 max-h-[85vh] text-[#e5e2e1] my-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b border-[#353535] pb-4">
                    <div>
                        <span className="text-[9px] font-bold text-[#c4c7c7] uppercase tracking-[0.2em] block">System Activity Center</span>
                        <h3 className="text-xs font-bold uppercase text-[#e5e2e1] tracking-wider mt-1"> Notifications ({notifications.length})</h3>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="font-bold text-[#8e9192] hover:text-[#5ddda1] cursor-pointer px-2 py-1 text-sm transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Notifications Stream */}
                <div className="overflow-y-auto space-y-3 flex-1 pr-1">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-xs font-bold text-[#8e9192] uppercase tracking-widest">
                            No notifications logged in your account database yet.
                        </div>
                    ) : (
                        notifications.map((notif, index) => (
                            <div key={notif._id || index} className="p-4 rounded-none border border-[#353535] bg-[#0e0e0e] flex items-start gap-4 shadow-xl">
                                <span className="text-sm shrink-0 pt-0.5 text-[#5ddda1]">🔔</span>
                                <div className="flex-1 space-y-1.5">
                                    <p className="text-xs font-sans text-[#e5e2e1] leading-relaxed">
                                        {notif.message}
                                    </p>
                                    <span className="text-[9px] text-[#8e9192] font-mono block tracking-wider">
                                        {new Date(notif.createdAt || Date.now()).toLocaleDateString()} at {new Date(notif.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-[#353535] flex justify-between items-center">
                    {onMarkAllAsRead && notifications.length > 0 && (
                        <button 
                            type="button"
                            onClick={onMarkAllAsRead}
                            className="text-[10px] font-bold uppercase tracking-widest text-[#5ddda1] hover:underline cursor-pointer"
                        >
                            Mark All as Read
                        </button>
                    )}
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="px-6 py-3 bg-[#5ddda1] text-[#003823] text-[10px] font-bold uppercase tracking-widest rounded-none hover:bg-[#08a56e] cursor-pointer transition-all shadow-lg ml-auto"
                    >
                        Close Feed
                    </button>
                </div>

            </div>
        </div>
    );
}