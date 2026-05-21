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
export const sendLiveNotification = (targetUserId, eventName, payload) => {
    if (!ioInstance) {
        console.error("Socket.io engine has not been initialized yet!");
        return false;
    }

    const targetSocketId = userSocketMap[targetUserId.toString()];

    if (targetSocketId) {
        // If the owner is active in-app right now, emit the message down their personal pipeline instantly!
        ioInstance.to(targetSocketId).emit(eventName, payload);
        console.log(`⚡ Live alert pushed to active User [${targetUserId}] via socket channel [${targetSocketId}]`);
        return true;
    }

    console.log(`💤 Target User [${targetUserId}] is currently offline. Notification stored silently in MongoDB.`);
    return false;
};