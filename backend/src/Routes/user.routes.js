import { Router } from "express";
import { 
    registerUser, 
    resendOTP, 
    loginUser, 
    logoutUser, 
    updateProfile, 
    becomeOwner, 
    promoteToAdmin, 
    getMyNotifications,
    switchPortalRole // 🔥 Injected for seamless User <-> Owner portal toggling
} from "../Controllers/user.controller.js";
import { uploadfile } from "../Middlewares/multer.middleware.js";
import { verifyOTP } from "../Controllers/verifyOtp.controller.js";
import { verifyJwt, authorizeRoles } from "../Middlewares/auth.middleware.js";

const router = Router();

router.route("/registerUser").post(uploadfile.single("avatar"), registerUser);
router.route("/verifyOTP").post(verifyOTP);
router.route("/loginUser").post(loginUser);

// 🔥 Secure Logout Endpoint
router.route("/logout").post(verifyJwt, logoutUser);
router.route("/resend-otp").post(resendOTP);

// ==========================================
// PROFILE UPDATE PATH ROUTE
// ==========================================
router.route("/update-profile").put(
    verifyJwt, 
    uploadfile.single("avatar"), 
    updateProfile
);

// =========================================================================
// ROLE TRANSITION & PORTAL SWITCHING ENDPOINTS
// =========================================================================

// 1. Public Self-Upgrade: Any logged-in default tenant can run this to become an owner
router.route("/become-owner").put(verifyJwt, becomeOwner);

// 2. Dual-Role Portal Switcher: Allows a user to toggle back and forth between "user" and "owner" modes safely
router.route("/switch-role").put(verifyJwt, switchPortalRole);

// 3. Admin Assignment: Strictly locked to users who ALREADY possess an "admin" role string status
router.route("/admin/promote").put(
    verifyJwt, 
    authorizeRoles("admin"), // 🛡️ Security lock: blocks access from non-admin accounts
    promoteToAdmin
);

router.route("/notifications").get(verifyJwt, getMyNotifications);

export default router;