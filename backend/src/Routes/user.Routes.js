import { Router } from "express";
import { registerUser } from "../Controllers/user.controller.js";
import { uploadfile } from "../Middlewares/multer.middleware.js";
import { verifyOTP } from "../Controllers/verifyOtp.controller.js";
import { loginUser } from "../Controllers/user.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router();
router.route("/registerUser").post(uploadfile.single("avatar"), registerUser);
router.route("/verifyOTP").post(verifyOTP);
router.route("/loginUser").post(loginUser);

export default router;
