import { User } from "../Models/user.model.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { generateOTP } from "../Utils/generateOtp.js";
import { verifyOTP } from "./verifyOtp.controller.js";
import { sendEmail } from "../Utils/sendEmail.js";
const registerUser = asyncHandler(async (req, res, next) => {
    // console.log("==== WHAT POSTMAN SENT ====");
    // console.log("Text Data (req.body):", req.body);
    // console.log("File Data (req.file):", req.file);
    // console.log("===========================");
    
    const { fullname, email, password, username } = req.body
    if ([fullname, email, password, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existedUser) {
        throw new ApiError(409, "user with username, email already exists")
    }
    const avatarLocalPath = req.file.path
  
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        
        throw new ApiError(400, "image upload failed")

       
        
    }
    
    const otp = generateOTP();
    const user = await User.create({
        fullname,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar?.secure_url || "",
           otp,
    otpExpiry: Date.now() + 10 * 60 * 1000, // 10 min
    isVerified: false,
    })
      // send email
  await sendEmail(user.email, `Your OTP is ${otp}`);
     const createdUser = await User.findById(user._id).select(" -password -refreshTokken")

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user ")
    }
    // step: 9 return response 
    return res.status(201).json(
        new ApiResponse(201, createdUser, "user registerd successfully, Please verify your otp")
    )

})

export {registerUser}

