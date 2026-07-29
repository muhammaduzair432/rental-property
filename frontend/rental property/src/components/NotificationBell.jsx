import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserNotifications } from "../store/notificationsSlice.js";
import NotificationModal from "./NotificationModal.jsx";

export default function NotificationBell() {
    const dispatch = useDispatch();
    const { items = [] } = useSelector((state) => state.notifications || {});
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ⚡ Store the ISO timestamp of when the user last opened the notifications modal
    const [lastSeenTimestamp, setLastSeenTimestamp] = useState(() => {
        return localStorage.getItem("lastSeenNotificationTimestamp") || "1970-01-01T00:00:00.000Z";
    });

    useEffect(() => {
        dispatch(fetchUserNotifications());
        // Live poll sync every 15 seconds to catch new incoming alerts dynamically
        const interval = setInterval(() => {
            dispatch(fetchUserNotifications());
        }, 15000);
        return () => clearInterval(interval);
    }, [dispatch]);

    // ⚡ Dynamically calculate EXACT number of notifications created AFTER the last seen timestamp
    const unreadNewCount = items.filter((notif) => {
        const notifTime = new Date(notif.createdAt || Date.now()).getTime();
        const lastSeenTime = new Date(lastSeenTimestamp).getTime();
        return notifTime > lastSeenTime;
    }).length;

    const handleOpenModal = () => {
        setIsModalOpen(true);
        
        // When modal opens, mark everything currently in the list as "seen" by saving the current time
        const currentTimestamp = new Date().toISOString();
        setLastSeenTimestamp(currentTimestamp);
        localStorage.setItem("lastSeenNotificationTimestamp", currentTimestamp);
    };

    return (
        <>
            <button 
                onClick={handleOpenModal}
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e2e8f8] bg-[#f9f9ff] text-[#151c27] hover:bg-gray-100 transition-all cursor-pointer"
                title="View Notifications"
            >
                <div className="relative flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#151c27]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    
                    {/* 🔴 Dynamic Red Counter Badge (Excludes all previously viewed notifications) */}
                    {unreadNewCount > 0 && (
                        <span className="absolute -top-1.5 -right-2 bg-red-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                            {unreadNewCount > 9 ? "9+" : unreadNewCount}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">Notifications</span>
            </button>

            <NotificationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                notifications={items}
            />
        </>
    );
}