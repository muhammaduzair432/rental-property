import { Property } from "../Models/property.model.js";
import { Notification } from "../Models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../Models/user.model.js"; 
import { Booking } from "../Models/booking.model.js"
import { Review } from "../Models/review.model.js";
import { Log } from "../Models/log.model.js";

// =========================================================================
// 1. FETCH UNAPPROVED PROPERTIES FEED (GET /api/v2/admin/properties/pending)
// =========================================================================
export const getPendingPropertiesFeed = asyncHandler(async (req, res) => {
    const pendingListings = await Property.find({ isApproved: false })
        .sort({ createdAt: -1 })
        .populate({
            path: "owner",
            select: "fullname username email avatar"
        });

    return res.status(200).json({
        success: true,
        message: "Pending administrative property verification feed loaded.",
        count: pendingListings.length,
        data: pendingListings
    });
});

// =========================================================================
// 2. APPROVE PROPERTY LISTING (PUT /api/v2/admin/properties/approve/:propertyId)
// =========================================================================
export const approvePropertyListing = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
        throw new ApiError(404, "Target property listing record not found.");
    }

    if (property.isApproved === true) {
        return res.status(400).json({ success: false, message: "This listing has already been verified and approved." });
    }

    property.isApproved = true;
    await property.save();

    const dbAlert = await Notification.create({
        ownerId: property.owner,
        roleTarget: "owner",
        message: `Congratulations! Your property listing "${property.title}" has been reviewed and APPROVED by the administration. It is now live for public booking.`
    });

    return res.status(200).json({
        success: true,
        message: "Property listing successfully verified and published live.",
        notificationLogged: dbAlert._id,
        data: property
    });
});

// =========================================================================
// 3. REJECT / PURGE PROPERTY LISTING (DELETE /api/v2/admin/properties/reject/:propertyId)
// =========================================================================
export const rejectPropertyListing = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    const property = await Property.findByIdAndDelete(propertyId);
    if (!property) {
        throw new ApiError(404, "Target property listing record not found.");
    }

    await Notification.create({
        ownerId: property.owner,
        roleTarget: "owner",
        message: `Administrative Notice: Your property listing "${property.title}" was declined during review and removed from our platform.`
    });

    return res.status(200).json({
        success: true,
        message: "Property listing rejected and permanently purged from system database."
    });
});

// =========================================================================
// =========================================================================
// 4. FETCH ALL REGISTERED USERS DIRECTORY (EXCLUDING ADMINS) (GET /api/v2/admin/users)
// 👉 FLOWCHART FEATURE: Fetches clear visibility of every tenant and owner account
// =========================================================================
export const getAllUsersDirectory = asyncHandler(async (req, res) => {
    // Exclude administrators so only users and owners appear in the management directory
    const users = await User.find({ role: { $ne: "admin" } })
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Platform user profile account directory loaded successfully (excluding admins).",
        count: users.length,
        data: users
    });
});

// =========================================================================
// 5. ADMINISTRATIVE ROLE OVERRIDE MUTATION (PUT /api/v2/admin/users/role/:userId)
// =========================================================================
export const updateAccountRoleOverride = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { targetRole } = req.body;

    if (!targetRole || !["user", "owner", "admin"].includes(targetRole)) {
        throw new ApiError(400, "Invalid role parameter assignment specified.");
    }

    const account = await User.findById(userId);
    if (!account) {
        throw new ApiError(404, "Target user account record not found.");
    }

    account.role = targetRole;
    await account.save();

    return res.status(200).json({
        success: true,
        message: `Account role updated to "${targetRole}" successfully.`,
        data: {
            userId: account._id,
            username: account.username,
            role: account.role
        }
    });
});

// =========================================================================
// 6. ACCOUNT SUSPENSION & UNLOCK SYSTEM (PUT /api/v2/admin/users/suspend/:userId)
// =========================================================================
export const administrativeUserSuspendToggle = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { suspend } = req.body; // Can accept explicit boolean or toggle current state

    if (req.user._id.toString() === userId.toString()) {
        return res.status(400).json({ 
            success: false, 
            message: "Action Denied. You cannot suspend your own admin root session account." 
        });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
        throw new ApiError(404, "Target user account record not found.");
    }

    const newSuspensionState = typeof suspend === "boolean" ? suspend : !targetUser.isSuspended;

    targetUser.isSuspended = newSuspensionState;
    await targetUser.save({ validateBeforeSave: false });

    await Log.create({
        actionType: newSuspensionState ? "USER_ACCOUNT_SUSPENDED" : "USER_ACCOUNT_UNSUSPENDED",
        description: `Admin [${req.user.username}] successfully ${newSuspensionState ? "suspended and locked" : "unsuspended and unlocked"} account [${targetUser.username}].`,
        performedBy: req.user._id
    });

    return res.status(200).json({
        success: true,
        message: `User account [${targetUser.username}] has been successfully ${newSuspensionState ? "suspended & locked" : "unsuspended & unlocked"}.`,
        data: targetUser
    });
});

// =========================================================================
// 7. VIEW ALL GLOBAL PLATFORM BOOKINGS (GET /api/v2/admin/bookings/all)
// =========================================================================
export const getGlobalBookingsMatrix = asyncHandler(async (req, res) => {
    const bookings = await Booking.find()
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "fullname username email" })
        .populate({ path: "property", select: "title price location owner" });

    return res.status(200).json({
        success: true,
        message: "Global transaction matrix loaded successfully.",
        count: bookings.length,
        data: bookings
    });
});

// =========================================================================
// 8. COMPILE INTEL SYSTEM REPORTS (GET /api/v2/admin/operations/reports)
// =========================================================================
export const getSystemSummaryReports = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalTenants = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    const totalBookingsCount = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });
    const rejectedBookings = await Booking.countDocuments({ status: "rejected" });

    const completedTransactions = await Booking.find({ status: "confirmed" }).select("totalPrice");
    const grossPlatformVolume = completedTransactions.reduce((sum, b) => sum + b.totalPrice, 0);
    const estimatedPlatformCommissionRevenue = grossPlatformVolume * 0.10; 

    return res.status(200).json({
        success: true,
        message: "Flowchart analytical system reports compiled successfully.",
        reports: {
            usersSummaryReport: {
                totalRegisteredAccounts: totalUsers,
                tenantCount: totalTenants,
                hostOwnerCount: totalOwners,
                administratorCount: totalAdmins
            },
            bookingsSummaryReport: {
                totalReservationsProcessed: totalBookingsCount,
                pendingCount: pendingBookings,
                confirmedCount: confirmedBookings,
                cancelledCount: cancelledBookings,
                rejectedCount: rejectedBookings
            },
            earningsFinancialReport: {
                grossPlatformVolume: grossPlatformVolume,
                platformCommissionTierRate: "10%",
                netPlatformCommissionEarnings: estimatedPlatformCommissionRevenue,
                hostPayoutsShare: grossPlatformVolume - estimatedPlatformCommissionRevenue
            }
        }
    });
});

// =========================================================================
// 9. ADMINISTRATIVE REVIEW MODERATION BOARD
// =========================================================================
export const administrativeReviewPurge = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
        throw new ApiError(404, "Target review record not found.");
    }

    await Log.create({
        actionType: "REVIEW_MODERATION_PURGE",
        description: `Admin [${req.user.username}] forcefully removed user review ID [${reviewId}] due to a moderation check violation.`,
        performedBy: req.user._id
    });

    return res.status(200).json({
        success: true,
        message: "Target user review permanently deleted from the system by administrator command."
    });
});

export const getAllSystemReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find().populate("user property").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

// =========================================================================
// 10. SYSTEM LIVE LOGS AUDIT TRAIL
// =========================================================================
export const getSystemAuditLogs = asyncHandler(async (req, res) => {
    const logs = await Log.find()
        .sort({ createdAt: -1 })
        .populate({ path: "performedBy", select: "username role email" })
        .limit(100);

    return res.status(200).json({
        success: true,
        message: "System historical logging audit trail loaded successfully.",
        count: logs.length,
        data: logs
    });
});

// Target user details dossier view
export const getTargetUserDetails = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(404, "Target user record not found.");
    }

    let bookings = [];
    let properties = [];
    let grossEarnings = 0;

    if (user.role === "owner") {
        properties = await Property.find({ owner: userId });
        const propertyIds = properties.map(p => p._id);
        
        bookings = await Booking.find({ property: { $in: propertyIds } })
            .populate("property", "title price location")
            .populate("user", "fullname username email");

        grossEarnings = bookings
            .filter(b => b.status === "confirmed")
            .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    } else {
        bookings = await Booking.find({ user: userId })
            .populate("property", "title price location")
            .populate("user", "fullname username email");
    }

    return res.status(200).json({
        success: true,
        data: {
            user,
            bookings,
            properties,
            earningsSummary: { grossEarnings }
        }
    });
});

export const getAdminNotifications = asyncHandler(async (req, res) => {
    if (req.user?.role !== "admin") {
        throw new ApiError(403, "Access denied. Admins only.");
    }

    const notifications = await Notification.find({ roleTarget: "admin" })
        .sort({ createdAt: -1 })
        .limit(50);

    return res.status(200).json({
        success: true,
        count: notifications.length,
        notifications
    });
});