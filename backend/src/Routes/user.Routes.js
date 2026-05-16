import { Router } from "express";
import {registerUser}from "../Controllers/user.controller.js"
import { uploadfile } from "../Middlewares/multer.middleware.js";
import { verifyOTP } from "../Controllers/verifyOtp.controller.js";

const router= Router()
router.route("/registerUser").post( uploadfile.single(
    "avatar"
        
    
    
)
,registerUser)
router.route("/verifyOTP").post(verifyOTP)

export default router 