import { Router } from "express";
import {registerUser}from "../Controllers/user.controller.js"
import { uploadfile } from "../Middlewares/multer.middleware.js";

const router= Router()
router.route("/registerUser").post( uploadfile.single(
    "avatar"
        
    
    
)
,registerUser)

export default router 