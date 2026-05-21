import { Server } from "socket.io";

// Dictionary to map a unique MongoDB user ID string to their real-time active socket connection ID
const userSocketMap = {}; 

let ioInstance = null;

export const initializeSocket = (server) => {
    // Mount Socket.io on top of your Node HTTP server instance
    ioInstance = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Match your frontend URL profile config
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE"]
        }
    });

    ioInstance.on("connection", (socket) => {
        // Capture the connecting User ID sent from the frontend handshake query parameters
        const userId = socket.handshake.query.userId;
        
        if (userId && userId !== "undefined") {
            userSocketMap[userId] = socket.id;
            console.log(`🔌 Real-Time Socket Map Connected: User [${userId}] linked to Socket ID [${socket.id}]`);
        }

        socket.on("disconnect", () => {
            if (userId) {
                delete userSocketMap[userId];
                console.log(`❌ Real-Time Socket Map Disconnected: User [${userId}] cleared`);
            }
        });
    });

    return ioInstance;
};

// 🔥 PRODUCTION CORE: Send a push message directly to a target user inside the app
// Inside src/utils/socket.js

export const sendLiveNotification = (targetUserId, eventName, payload) => {
    try {
        // 1. Core Safeguard: Ensure the primary socket engine instance is actively running
        if (!ioInstance) {
            console.error("⚠️ Real-time Socket Engine has not been initialized yet!");
            return false;
        }

        // 2. Fallback validation bounds for the receiver's ID object mapping
        if (!targetUserId) {
            console.error("⚠️ Cannot send live notification: Target User ID is undefined.");
            return false;
        }

        const targetSocketId = userSocketMap[targetUserId.toString()];

        // 3. Check if the Owner is online or offline in-app right now
        if (targetSocketId) {
            // Secure fallback layout values to prevent key evaluation exceptions
            const safePayload = {
                notificationId: payload?.notificationId || "",
                message: payload?.message || "New activity detected.",
                bookingId: payload?.bookingId || "",
                createdAt: payload?.createdAt || new Date()
            };

            // Emit safely down their personal pipeline channel
            ioInstance.to(targetSocketId).emit(eventName, safePayload);
            console.log(`⚡ Live alert pushed to active User [${targetUserId}] via channel [${targetSocketId}]`);
            return true;
        }

        // 4. If the owner is offline, log a message rather than letting it throw an error
        console.log(`💤 Target User [${targetUserId}] is currently offline. Notification stored fallback inside MongoDB.`);
        return false;

    } catch (socketError) {
        // Catch-all safety boundary grid keeps the main Express server from crashing or hanging up
        console.error("❌ CRITICAL NON-BLOCKING SOCKET SYSTEM FAILURE:", socketError.message);
        return false;
    }
};