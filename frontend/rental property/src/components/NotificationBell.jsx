import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserNotifications } from "../store/notificationsSlice.js";
import { fetchAdminNotifications } from "../store/adminSlice.js";
import NotificationModal from "./NotificationModal.jsx";
import pusherClient from "../lib/pusherClient.js";

export default function NotificationBell({ notifications: propNotifications }) {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth?.user);
    const isAdmin = user?.role === "admin";
    
    // 🛡️ Safe fallback extraction across various Redux store schemas
    const adminState = useSelector((state) => state.admin || {});
    const notificationState = useSelector((state) => state.notifications || {});

    const adminNotifications = adminState.adminNotifications || adminState.notifications || [];
    const userItems = notificationState.items || notificationState.notifications || notificationState.data || [];

    const items = propNotifications || (isAdmin ? adminNotifications : userItems);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // ⚡ Persistent storage key for dismissed/seen notification IDs
    const dismissedStorageKey = isAdmin ? "adminDismissedNotificationIds" : `dismissedNotificationIds_${user?._id || "guest"}`;

    // Load dismissed notification IDs from localStorage
    const [dismissedIds, setDismissedIds] = useState(() => {
        try {
            const saved = localStorage.getItem(dismissedStorageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        // Initial fetch based on role
        if (isAdmin) {
            dispatch(fetchAdminNotifications());
        } else {
            dispatch(fetchUserNotifications());
        }

        let channel;

        if (user?._id && pusherClient) {
            channel = pusherClient.subscribe(`user-${user._id}`);
            
            const handleUpdate = () => {
                if (isAdmin) dispatch(fetchAdminNotifications());
                else dispatch(fetchUserNotifications());
            };

            channel.bind('NEW_BOOKING_ALERT', handleUpdate);
            channel.bind('BOOKING_STATUS_UPDATE', handleUpdate);
            channel.bind('new-notification', handleUpdate);
        }

        const interval = setInterval(() => {
            if (isAdmin) {
                dispatch(fetchAdminNotifications());
            } else {
                dispatch(fetchUserNotifications());
            }
        }, 60000); // 60 seconds fallback poll

        return () => {
            clearInterval(interval);
            if (channel) {
                channel.unbind_all();
                channel.unsubscribe();
            }
        };
    }, [dispatch, isAdmin, user?._id]);

    // ⚡ Count ONLY notifications whose ID has NOT been dismissed/seen yet
    const unreadNewCount = items.filter((notif, index) => {
        const notifId = notif._id || notif.id || `notif_${index}`;
        
        // If backend explicitly marks it as read, skip it
        if (notif.isRead === true || notif.read === true) return false;

        // If this ID is recorded in our dismissed list, it has been seen
        if (dismissedIds.includes(notifId)) return false;

        return true;
    }).length;

    const handleOpenModal = () => {
        setIsModalOpen(true);
        
        // When modal opens, capture all current notification IDs and mark them as dismissed/seen
        const currentIds = items.map((notif, index) => notif._id || notif.id || `notif_${index}`);
        const updatedDismissed = Array.from(new Set([...dismissedIds, ...currentIds]));
        
        setDismissedIds(updatedDismissed);
        localStorage.setItem(dismissedStorageKey, JSON.stringify(updatedDismissed));
    };

    return (
        <div className="relative inline-flex items-center shrink-0">
            <button 
                type="button"
                onClick={handleOpenModal}
                className="relative inline-flex items-center gap-2 px-3 py-2 rounded-none border border-[#444748] bg-[#1c1b1b] text-[#e5e2e1] hover:bg-[#2a2a2a] hover:border-[#5ddda1] transition-all cursor-pointer shadow-md"
                title="View Notifications"
            >
                <div className="relative inline-flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#5ddda1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    
                    {/* 🟥 Small, Sharp Square Counter Badge */}
                    {unreadNewCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#5ddda1] text-[#003823] font-bold text-[8px] min-w-[14px] h-[14px] px-0.5 rounded-none flex items-center justify-center shadow-md ring-1 ring-[#1c1b1b]">
                            {unreadNewCount > 9 ? "+9" : unreadNewCount}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline text-[#c4c7c7]">Notifications</span>
            </button>

            <NotificationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                notifications={items}
            />
        </div>
    );
}