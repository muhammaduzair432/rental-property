import { Router } from "express";
import { 
    browseProperties, 
    createProperty, 
    getPropertyDetails, 
    toggleFavoriteProperty, 
    getMyFavorites,
    addPropertyReview, 
    getPropertyReviews,
    updatePropertyReview,
    deletePropertyReview,
    getMyProperties,         // Flowchart Step 4
    updateProperty,          // Flowchart Step 4
    deleteProperty,          // Flowchart Step 4
    getOwnerPropertiesReviews, // 🔥 Injected for Owner Review Management
    replyToReview,             // 🔥 Injected for Owner Review Management
    updateOwnerReply,          // 🔥 Injected for Owner Review Management
    deleteOwnerReply,
    getOwnerEarningsOverview   // 🔥 Injected for Owner Earnings Overview
} from "../Controllers/property.controller.js";
import { verifyJwt, authorizeRoles } from "../Middlewares/auth.middleware.js"; 
import { uploadfile } from "../Middlewares/multer.middleware.js";

const router = Router();

// =========================================================================
// TENANT & PUBLIC BROWSING ENDPOINTS
// =========================================================================

// 1. Tenant Browse Feed
router.route("/browse").get(verifyJwt, browseProperties);

// 2. View Property Details Path
router.route("/details/:propertyId").get(verifyJwt, getPropertyDetails);

// =========================================================================
// FAVORITES INTERACTION PIPELINE
// =========================================================================
router.route("/favorite/:propertyId").post(verifyJwt, toggleFavoriteProperty);
router.route("/favorites/my-list").get(verifyJwt, getMyFavorites);

// =========================================================================
// REVIEWS INTERACTION PIPELINE (TENANT LEVEL)
// =========================================================================
router.route("/review/:propertyId").post(verifyJwt, authorizeRoles("user"), addPropertyReview);
router.route("/reviews/:propertyId").get(verifyJwt, getPropertyReviews);
router.route("/review/edit/:reviewId").put(verifyJwt, authorizeRoles("user"), updatePropertyReview);
router.route("/review/delete/:reviewId").delete(verifyJwt, authorizeRoles("user"), deletePropertyReview);

// =========================================================================
// 🔥 FLOWCHART STEP 4: OWNER PROPERTY INVENTORY MANAGEMENT ENDPOINTS
// =========================================================================

// A. Store Property with Multiple Images (Sends approval notification request to Admin)
router.route("/store").post(
    verifyJwt, 
    authorizeRoles("owner"), 
    uploadfile.array("images", 10), 
    createProperty
);

// B. View My Properties List Section (Shows only properties owned by the active host)
router.route("/my-inventory").get(verifyJwt, authorizeRoles("owner"), getMyProperties);

// C. Update Property Listing Details
router.route("/update/:propertyId").put(
    verifyJwt, 
    authorizeRoles("owner"), 
    uploadfile.array("images", 10), 
    updateProperty
);

// D. Permanently Remove Property Listing from DB
router.route("/delete/:propertyId").delete(verifyJwt, authorizeRoles("owner"), deleteProperty);

// =========================================================================
// 🔥 NEW FLOWCHART FEATURE: OWNER REVIEW MANAGEMENT PIPELINE
// =========================================================================

// E. Fetch all reviews left by users across this host's property listings
router.route("/owner/reviews-feed").get(verifyJwt, authorizeRoles("owner"), getOwnerPropertiesReviews);

// F. Reply/Comment on a specific user review card
router.route("/owner/review/reply/:reviewId").post(verifyJwt, authorizeRoles("owner"), replyToReview);

// G. Update/Edit an existing host reply description string
router.route("/owner/review/reply/edit/:reviewId").put(verifyJwt, authorizeRoles("owner"), updateOwnerReply);

// H. Delete/Wipe a host reply response from the card layout view
router.route("/owner/review/reply/delete/:reviewId").delete(verifyJwt, authorizeRoles("owner"), deleteOwnerReply);

// I. Get Owner Earnings Overview
router.route("/owner/earnings-overview").get(verifyJwt, authorizeRoles("owner"), getOwnerEarningsOverview);

export default router;