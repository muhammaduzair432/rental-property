import { Router } from "express";
import { 
    createBooking, 
    getMyBookings, 
    cancelBooking,
    getOwnerBookingDashboard, // Added for Owner Flow
    acceptBookingRequest,     // Added for Owner Flow
    rejectBookingRequest      // Added for Owner Flow
} from "../Controllers/booking.controller.js";
import { verifyJwt, authorizeRoles } from "../Middlewares/auth.middleware.js";

const router = Router();

// Apply core token validation guard across all downstream endpoints
router.use(verifyJwt); // Secures all downstream endpoints in this file 

// ==========================================
// TENANT/USER ACTION PIPELINE
// ==========================================
router.route("/request").post(authorizeRoles("user"), createBooking);
router.route("/my-list").get(authorizeRoles("user"), getMyBookings);
router.route("/cancel/:bookingId").put(authorizeRoles("user"), cancelBooking);

// ==========================================
// OWNER/HOST MANAGEMENT PIPELINE
// ==========================================
// Dashboard overviews tracking incoming booking request notifications
router.route("/owner/dashboard").get(authorizeRoles("owner"), getOwnerBookingDashboard);

// Flowchart resolution paths updating DB state and notifying the tenant user
router.route("/owner/accept/:bookingId").put(authorizeRoles("owner"), acceptBookingRequest);
router.route("/owner/reject/:bookingId").put(authorizeRoles("owner"), rejectBookingRequest);

export default router;