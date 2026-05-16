import { Router } from "express";
import { browseProperties, createProperty } from "../Controllers/property.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js"; // Ensure this matches your filename
import { uploadfile } from "../Middlewares/multer.middleware.js";

const router = Router();

// 1. Tenant Browse Feed
router.route("/browse").get(verifyJwt, browseProperties);

// 2. Store Property with Multiple Images
// CRITICAL FIX: verifyJwt must go FIRST to populate req.user before createProperty checks it!
router.route("/store").post(
    verifyJwt, 
    uploadfile.array("images", 10), 
    createProperty
);

export default router;