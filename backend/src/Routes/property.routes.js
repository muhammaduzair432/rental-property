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
    getMyProperties,    // 🔥 Injected for Flowchart Step 4
    updateProperty,     // 🔥 Injected for Flowchart Step 4
    deleteProperty      // 🔥 Injected for Flowchart Step 4
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
// REVIEWS INTERACTION PIPELINE
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
    authorizeRoles("owner"), // Optional: Locks creation strictly to verified host accounts
    uploadfile.array("images", 10), 
    createProperty
);

// B. View My Properties List Section (Shows only properties owned by the active host)
router.route("/my-inventory").get(verifyJwt, authorizeRoles("owner"), getMyProperties);

// C. Update Property Listing Details
router.route("/update/:propertyId").put(verifyJwt, authorizeRoles("owner"), updateProperty);

// D. Permanently Remove Property Listing from DB
router.route("/delete/:propertyId").delete(verifyJwt, authorizeRoles("owner"), deleteProperty);

export default router;