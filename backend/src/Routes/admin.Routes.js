import { Router } from "express";
import { 
    getPendingPropertiesFeed, 
    approvePropertyListing, 
    rejectPropertyListing 
} from "../Controllers/admin.controller.js";
import { verifyJwt, authorizeRoles } from "../Middlewares/auth.middleware.js";

const router = Router();

// Apply global security validation locks across all downstream endpoints sequentially
router.use(verifyJwt);
router.use(authorizeRoles("admin")); // Enforces that req.user.role strictly equals "admin"

// Admin Workflow Mapping
router.route("/properties/pending").get(getPendingPropertiesFeed);
router.route("/properties/approve/:propertyId").put(approvePropertyListing);
router.route("/properties/reject/:propertyId").delete(rejectPropertyListing);

export default router;