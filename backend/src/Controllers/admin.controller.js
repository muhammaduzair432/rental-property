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
    // Flowchart Step 1: Query only listings where approval verification is false
    const pendingListings = await Property.find({ isApproved: false })
        .sort({ createdAt: -1 })
        .populate({
            path: "owner",
            select: "fullname username email avatar" // View creator's credentials
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

    // Flowchart Action A: Mutate state validation flag to true
    property.isApproved = true;
    await property.save();

    // Flowchart Notification: Log historical verification closure status for the Host Owner
    const dbAlert = await Notification.create({
        ownerId: property.owner, // Targets the creator host account
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

    // Flowchart Action B: Locate and drop the record instantly from the database
    const property = await Property.findByIdAndDelete(propertyId);
    if (!property) {
        throw new ApiError(404, "Target property listing record not found.");
    }

    // Flowchart Notification: Log rejection fallback history context in database for the Host
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

;

// =========================================================================
// 4. FETCH ALL REGISTERED USERS DIRECTORY (GET /api/v2/admin/users)
// 👉 FLOWCHART FEATURE: Fetches clear visibility of every account on the platform
// =========================================================================
export const getAllUsersDirectory = asyncHandler(async (req, res) => {
    // Pulls all users, showing oldest or newest registration cycles, stripping password hashes
    const users = await User.find()
        .select("-password -refreshToken")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Platform user profile account directory loaded successfully.",
        count: users.length,
        data: users
    });
});

// =========================================================================
// 5. ADMINISTRATIVE ROLE OVERRIDE MUTATION (PUT /api/v2/admin/users/role/:userId)
// 👉 FLOWCHART FEATURE: Forcefully upgrades/downgrades role assignments
// =========================================================================
export const updateAccountRoleOverride = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { targetRole } = req.body; // e.g., "user", "owner", "admin"

    // Guard against undefined or empty body mutations
    if (!targetRole || !["user", "owner", "admin"].includes(targetRole)) {
        throw new ApiError(400, "Invalid role parameter assignment specified.");
    }

    const account = await User.findById(userId);
    if (!account) {
        throw new ApiError(404, "Target user account record not found.");
    }

    // Mutate the role flag explicitly
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
// 6. PERMANENT PROFILE PURGE SYSTEM (DELETE /api/v2/admin/users/delete/:userId)
// 👉 FLOWCHART FEATURE: Wipes out users and cleans up references
// =========================================================================
export const administrativeUserPurge = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Safety Lock: Prevent the admin from accidentally deleting their own root session account
    if (req.user._id.toString() === userId.toString()) {
        return res.status(400).json({ success: false, message: "Action Denied. You cannot delete your own admin account." });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
        throw new ApiError(404, "Target user account record not found.");
    }

    // CASCADE CLEANUP MATRIX (Ensures your DB remains clean without broken string dead links):
    if (userToDelete.role === "owner") {
        // If they are a host, delete their properties and any bookings linked to those properties
        const ownerProperties = await Property.find({ owner: userId }).select("_id");
        const propertyIds = ownerProperties.map(p => p._id);

        await Booking.deleteMany({ property: { $in: propertyIds } });
        await Property.deleteMany({ owner: userId });
    } else {
        // If they are a standard tenant, clean up their booking reservation logs
        await Booking.deleteMany({ user: userId });
    }

    // Remove the core user profile document entry atomicity check
    await User.findByIdAndDelete(userId);

    return res.status(200).json({
        success: true,
        message: `User account [${userToDelete.username}] and all associated reference records purged successfully.`
    });
});
 

// =========================================================================
// 7. VIEW ALL GLOBAL PLATFORM BOOKINGS (GET /api/v2/admin/bookings/all)
// 👉 FLOWCHART FEATURE: Complete global visibility of every reservation
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
// 👉 FLOWCHART FEATURE: View detailed summary reports (Users, Bookings, Earnings)
// =========================================================================
export const getSystemSummaryReports = asyncHandler(async (req, res) => {
    // A. Users Report Breakdown
    const totalUsers = await User.countDocuments();
    const totalTenants = await User.countDocuments({ role: "user" });
    const totalOwners = await User.countDocuments({ role: "owner" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // B. Bookings Report Breakdown
    const totalBookingsCount = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const confirmedBookings = await Booking.countDocuments({ status: "confirmed" });
    const cancelledBookings = await Booking.countDocuments({ status: "cancelled" });
    const rejectedBookings = await Booking.countDocuments({ status: "rejected" });

    // C. Earnings Financial Metrics Aggregation
    const completedTransactions = await Booking.find({ status: "confirmed" }).select("totalPrice");
    const grossPlatformVolume = completedTransactions.reduce((sum, b) => sum + b.totalPrice, 0);
    
    // Assuming a standard 10% platform commission matching boilerplate business rules
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
// 9. ADMINISTRATIVE REVIEW MODERATION BOARD (DELETE /api/v2/admin/reviews/delete/:reviewId)
// 👉 FLOWCHART FEATURE: Wipes any toxic or fraudulent review from the system
// =========================================================================
export const administrativeReviewPurge = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
        throw new ApiError(404, "Target review record not found.");
    }

    // Log the deletion action dynamically into our system logs collection
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

// =========================================================================
// 10. SYSTEM LIVE LOGS AUDIT TRAIL (GET /api/v2/admin/operations/system-logs)
// 👉 FLOWCHART FEATURE: Operational logging trail
// =========================================================================
export const getSystemAuditLogs = asyncHandler(async (req, res) => {
    const logs = await Log.find()
        .sort({ createdAt: -1 })
        .populate({ path: "performedBy", select: "username role email" })
        .limit(100); // Caps it to the latest 100 entries to optimize connection performance

    return res.status(200).json({
        success: true,
        message: "System historical logging audit trail loaded successfully.",
        count: logs.length,
        data: logs
    });
});