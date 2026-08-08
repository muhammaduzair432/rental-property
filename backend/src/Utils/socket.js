import Pusher from "pusher";

let pusherInstance = null;

try {
    if (process.env.PUSHER_APP_ID && process.env.PUSHER_KEY && process.env.PUSHER_SECRET && process.env.PUSHER_CLUSTER) {
        pusherInstance = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true
        });
        console.log("✅ Pusher initialized successfully");
    } else {
        console.warn("⚠️ Pusher environment variables missing. Real-time notifications will be disabled.");
    }
} catch (error) {
    console.error("❌ Failed to initialize Pusher:", error);
}

// Keep the same function signature as before to avoid breaking changes across controllers
export const sendLiveNotification = (targetUserId, eventName, payload) => {
    try {
        if (!pusherInstance) {
            console.warn("⚠️ Cannot send Pusher notification: Pusher is not initialized.");
            return false;
        }

        if (!targetUserId) {
            console.error("⚠️ Cannot send live notification: Target User ID is undefined.");
            return false;
        }

        const safePayload = {
            notificationId: payload?.notificationId || "",
            message: payload?.message || "New activity detected.",
            bookingId: payload?.bookingId || "",
            createdAt: payload?.createdAt || new Date(),
            status: payload?.status || undefined
        };

        // Each user has a dedicated private channel named `user-<userId>`
        const channelName = `user-${targetUserId.toString()}`;

        // Trigger the event asynchronously
        pusherInstance.trigger(channelName, eventName, safePayload)
            .then(() => {
                console.log(`⚡ Live alert pushed to channel [${channelName}] with event [${eventName}]`);
            })
            .catch(error => {
                console.error(`❌ Pusher trigger failed for channel [${channelName}]:`, error);
            });

        return true;
    } catch (error) {
        console.error("❌ CRITICAL NON-BLOCKING PUSHER SYSTEM FAILURE:", error.message);
        return false;
    }
};

// No-op for backwards compatibility
export const initializeSocket = (server) => {
    return null;
};