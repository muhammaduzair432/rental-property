import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../Models/user.model.js";
import { ApiError } from "../Utils/apiError.js";

export const verifyJwt = asyncHandler(async (req, _, next) => {

    try {
        // 1. Extract the token cleanly
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        // 2. BULLETPROOF CHECK: Ensure it exists, isn't undefined, and isn't an empty string
        if (!token || typeof token !== "string" || token.trim() === "") {
            throw new ApiError(401, "Unauthorized request. Token is missing or empty.");
        }

        // 3. Safety Check: Ensure your secret key is loaded from .env
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new ApiError(500, "Internal Server Error: Access token secret is missing in .env config.");
        }

        // 4. Verify token strings safely
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        
        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        // Keeps the error processing inside your custom ApiError boundary wrapper
        throw new ApiError(401, error.message || "Invalid access token");
    }
});

export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // verifyJwt runs right before this, guaranteeing req.user exists
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }

        // Intercept request if user's role is not whitelisted for this route
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access Denied. Role '${req.user.role}' is unauthorized to access this endpoint.`
            });
        }

        next(); // Authorization cleared! Pass to the controller
    };
};
