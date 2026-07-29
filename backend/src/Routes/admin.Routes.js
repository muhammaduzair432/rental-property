import { Router } from "express";
import { 
    getPendingPropertiesFeed, 
    approvePropertyListing, 
    rejectPropertyListing,
    getAllUsersDirectory,       // 🔥 Injected for User Management
    updateAccountRoleOverride,  // 🔥 Injected for User Management
    administrativeUserPurge,
    getGlobalBookingsMatrix,    // 🔥 Injected for Bookings & Ops
    getSystemSummaryReports,    // 🔥 Injected for Bookings & Ops
    administrativeReviewPurge,  // 🔥 Injected for Bookings & Ops
    getSystemAuditLogs ,
    getAllSystemReviews,        // 🔥 Injected for User Management
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
router.route("/users").get(getAllUsersDirectory);
router.route("/users/role/:userId").put(updateAccountRoleOverride);
router.route("/users/purge/:userId").delete(administrativeUserPurge);
router.route("/bookings/all").get(getGlobalBookingsMatrix);
router.route("/operations/reports").get(getSystemSummaryReports);
router.route("/reviews/delete/:reviewId").delete(administrativeReviewPurge);
router.route("/operations/system-logs").get(getSystemAuditLogs);
router.route("/reviews/all").get(getAllSystemReviews);

export default router;