
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
    deletePropertyReview
} from "../Controllers/property.controller.js";
import { verifyJwt, authorizeRoles } from "../Middlewares/auth.middleware.js"; 
import { uploadfile } from "../Middlewares/multer.middleware.js";

const router = Router();

// 1. Tenant Browse Feed
router.route("/browse").get(verifyJwt, browseProperties);

// 2. View Property Details Path
// Uses a dynamic :propertyId parameter token wildcard segment
router.route("/details/:propertyId").get(verifyJwt, getPropertyDetails);
// Favorites Pipeline
router.route("/favorite/:propertyId").post(verifyJwt, toggleFavoriteProperty);
router.route("/favorites/my-list").get(verifyJwt, getMyFavorites);

// Reviews Pipeline (Create & Read)
router.route("/review/:propertyId").post(verifyJwt, authorizeRoles("user"), addPropertyReview);
router.route("/reviews/:propertyId").get(verifyJwt, getPropertyReviews);

// 🔥 ADDED THIS: Reviews Pipeline (Update & Delete)
// They take a dynamic :reviewId path token wildcard segment parameter
router.route("/review/edit/:reviewId").put(verifyJwt, authorizeRoles("user"), updatePropertyReview);
router.route("/review/delete/:reviewId").delete(verifyJwt, authorizeRoles("user"), deletePropertyReview);



// 3. Store Property with Multiple Images
// CRITICAL FIX: verifyJwt must go FIRST to populate req.user before createProperty checks it!
router.route("/store").post(
    verifyJwt, 
    uploadfile.array("images", 10), 
    createProperty
);

export default router;