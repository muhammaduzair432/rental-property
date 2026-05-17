import { Router } from "express";
import { registerUser } from "../Controllers/user.controller.js";
import { uploadfile } from "../Middlewares/multer.middleware.js";
import { verifyOTP } from "../Controllers/verifyOtp.controller.js";
import { loginUser , logoutUser, updateProfile} from "../Controllers/user.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";
import { becomeOwner, promoteToAdmin } from "../Controllers/user.controller.js";
import { authorizeRoles } from "../Middlewares/auth.middleware.js";

const router = Router();
router.route("/registerUser").post(uploadfile.single("avatar"), registerUser);
router.route("/verifyOTP").post(verifyOTP);
router.route("/loginUser").post(loginUser);
// 🔥 ADDED: Secure Logout Endpoint
router.route("/logout").post(verifyJwt, logoutUser)

// ==========================================
// 🔥 THE FIX: PROFILE UPDATE PATH ROUTE
// ==========================================
// This maps the PUT request and parses form-data fields cleanly
router.route("/update-profile").put(
    verifyJwt, 
    uploadfile.single("avatar"), 
    updateProfile
);

// =========================================================================
// ROLE TRANSITION ENDPOINTS
// =========================================================================

// 1. Public Self-Upgrade: Any logged-in default tenant can run this to become an owner
router.route("/become-owner").put(verifyJwt, becomeOwner);

// 2. Admin Assignment: Strictly locked to users who ALREADY possess an "admin" role string status
router.route("/admin/promote").put(
    verifyJwt, 
    authorizeRoles("admin"), // 🛡️ Security lock: blocks access from non-admin accounts
    promoteToAdmin
);

export default router;
