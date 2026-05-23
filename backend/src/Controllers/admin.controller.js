import { Property } from "../Models/property.model.js";
import { Notification } from "../Models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

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