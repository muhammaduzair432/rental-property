import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../Models/user.model.js";
import { ApiError } from "../utils/apiError.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
    try {
        // 1. Extract the token cleanly
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // 2. BULLETPROOF CHECK: Ensure it exists, isn't undefined, and isn't an empty string
        if (!token || typeof token !== "string" || token.trim() === "") {
            return res.status(401).json({ success: false, message: "Unauthorized request. Token is missing or empty." });
        }

        // 3. Safety Check: Ensure your secret key is loaded from .env
        if (!process.env.ACCESS_TOKEN_SECRET) {
            return res.status(500).json({ success: false, message: "Internal Server Error: Access token secret is missing." });
        }

        // 4. Verify token strings safely
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // 5. Fetch user document from database first
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid access token - User record not found." });
        }

        // 🛑 STRICT SUSPENSION CHECK: Directly return a 403 JSON response
        if (user.isSuspended === true) {
            return res.status(403).json({
                success: false,
                message: "ACCOUNT_SUSPENDED: Your account has been locked by an administrator. You cannot perform actions or use the platform."
            });
        }

        req.user = user;
        next();
    } catch (error) {
        // Handle JWT expiration or tampering safely without crashing server
        return res.status(401).json({ 
            success: false, 
            message: error.message || "Invalid or expired access token." 
        });
    }
});

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access Denied. Role '${req.user.role}' is unauthorized to access this endpoint.`
            });
        }

        next();
    };
};