import { User } from "../Models/user.model.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { generateOTP } from "../Utils/generateOtp.js";
import { verifyOTP } from "./verifyOtp.controller.js";
import { sendEmail } from "../Utils/sendEmail.js";
import jwt from "jsonwebtoken";

const generateaccessTokenAndRefreshToken = async (userid) => {
  try {
    const user = await User.findById(userid);
    const accessToken = await user.generateAccessToken();

    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("TOKEN ERROR:", error);
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  // console.log("==== WHAT POSTMAN SENT ====");
  // console.log("Text Data (req.body):", req.body);
  // console.log("File Data (req.file):", req.file);
  // console.log("===========================");

  const { fullname, email, password, username } = req.body;
  if (
    [fullname, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields are required");
  }
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (existedUser) {
    throw new ApiError(409, "user with username, email already exists");
  }
  const avatarLocalPath = req.file?.path;

  let avatar = null;

  if (avatarLocalPath) {
    avatar = await uploadOnCloudinary(avatarLocalPath);
  }

  const otp = generateOTP();
  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    // role: role || "user",
    avatar: avatar?.secure_url || "",
    otp,
    otpExpiry: Date.now() + 10 * 60 * 1000, // 10 min
    isVerified: false,
  });
  // send email
  await sendEmail(user.email, `Your OTP is ${otp}`);
  const createdUser = await User.findById(user._id).select(
    " -password -refreshTokken",
  );

  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user ");
  }

  // step: 9 return response
  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdUser,
        "user registerd successfully, Please verify your otp",
      ),
    );
});

// login section
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if ([email, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "all fields are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "user not found with this email");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  if (!user.isVerified) {
    return res.status(403).json({
      message:
        "Account not verified. Please verify your account before logging in.",
    });
  }
  const { accessToken, refreshToken } =
    await generateaccessTokenAndRefreshToken(user._id);
    
  const logggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  logggedInUser.refreshToken = refreshToken;
  const updatedUser = await logggedInUser.save({ validateBeforeSave: false });
  const options = {
    httpOnly: true,
    secure: true,
    // by enabling these options you can oly modify cookies from server  and can not modify from frontend
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: updatedUser, accessToken, refreshToken },
        "User logged In Successfully",
      ),
    );
});
// =========================================================================
// LOGOUT USER (POST /api/v2/users/logout)
// =========================================================================
 const logoutUser = asyncHandler(async (req, res) => {
    // 1. Clear out the refreshToken field inside the user's MongoDB document.
    // req.user._id is populated safely by your verifyJwt middleware.
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined // Completely removes the token string reference
            }
        },
        {
            new: true
        }
    );

    // 2. Configure cookie clearance options matching your login settings exactly
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    };

    // 3. Clear both session token slots from the client's cookie jar and return response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully."));
});


// =========================================================================
// PRODUCTION-GRADE PROFILE UPDATE (PUT /api/v2/users/update-profile)
// =========================================================================
const updateProfile = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;
    const userId = req.user._id;

    // 1. Fetch the target user document
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User profile not found." });
    }

    // 2. Checking Unique Username Conflicts if changed
    if (username && username.trim() !== "" && username.toLowerCase() !== user.username) {
        const usernameExists = await User.findOne({ username: username.toLowerCase() });
        if (usernameExists) {
            return res.status(409).json({ success: false, message: "Username is already taken." });
        }
        user.username = username.toLowerCase();
    }

    // 3. Checking Unique Email Conflicts if changed
    if (email && email.trim() !== "" && email.toLowerCase() !== user.email) {
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
            return res.status(409).json({ success: false, message: "Email is already registered to another account." });
        }
        user.email = email.toLowerCase();
    }

    // 4. Update simple text fields if provided
    if (fullname && fullname.trim() !== "") {
        user.fullname = fullname.trim();
    }

    // 5. Update Password safely (triggers your schema pre-save bcrypt hook automatically) [cite: 2076]
    if (password && password.trim() !== "") {
        if (password.trim().length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
        }
        user.password = password.trim(); 
    }

    // 6. Handle Avatar Change & Old Cloudinary Asset Cleanup
    if (req.file) {
        // A. If the user already has an avatar, extract its public_id to delete it
        if (user.avatar && user.avatar.trim() !== "") {
            try {
                // Cloudinary URLs look like: .../upload/v123456/public_id.png
                // This clean regex line splits the URL and grabs the file name without extension
                const oldPublicId = user.avatar.split("/").pop().split(".")[0];
                
                if (oldPublicId) {
                    await deleteFromCloudinary(oldPublicId); // Purges the old ghost file
                }
            } catch (cleanupError) {
                console.error("Non-blocking old avatar cleanup failed:", cleanupError);
            }
        }

        // B. Upload the incoming fresh avatar file [cite: 2077]
        const avatarLocalPath = req.file.path;
        const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
        
        if (uploadedAvatar) {
            user.avatar = uploadedAvatar.secure_url || uploadedAvatar.url || "";
        }
    }

    // 7. Commit changes to MongoDB
    await user.save({ validateBeforeSave: false });

    // 8. CRITICAL SECURITY FIX: Fetch a clean object and completely delete password tracking keys
    const sanitizedUser = await User.findById(userId).select("-password -refreshToken");

    return res.status(200).json({
        success: true,
        message: "Profile details updated securely.",
        user: sanitizedUser
    });
});
// =========================================================================
// 1. SELF-UPGRADE: BECOME AN OWNER (PUT /api/v2/users/become-owner)
// =========================================================================
 const becomeOwner = asyncHandler(async (req, res) => {
    // req.user._id is populated safely by your verifyJwt middleware
    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not located." });
    }

    // Safety checks: Prevent redundant updates or admin downgrades
    if (user.role === "owner") {
        return res.status(400).json({ success: false, message: "You are already registered as an owner." });
    }
    if (user.role === "admin") {
        return res.status(400).json({ success: false, message: "Administrators cannot be converted into owners." });
    }

    // Modify the role status string safely
    user.role = "owner";
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true,
        message: "Congratulations! Your account has been upgraded to Owner status. Please log out and back in to refresh your session.",
        role: user.role
    });
});

// =========================================================================
// 2. ADMIN ONLY: PROMOTE A USER TO ADMIN (PUT /api/v2/users/admin/promote)
// =========================================================================
 const promoteToAdmin = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: "Target profile user email parameter is required." });
    }

    // Look up the targeted user account by email
    const targetUser = await User.findOne({ email });

    if (!targetUser) {
        return res.status(404).json({ success: false, message: "No registered user found with that email address." });
    }

    if (targetUser.role === "admin") {
        return res.status(400).json({ success: false, message: "This user already has administrative permissions." });
    }

    // Elevate the target user's role status string to admin
    targetUser.role = "admin";
    await targetUser.save({ validateBeforeSave: false });

    return res.status(200).json({
        success: true,
        message: `User ${targetUser.username} has been successfully promoted to Admin status.`,
        data: {
            username: targetUser.username,
            email: targetUser.email,
            role: targetUser.role
        }
    });
});

export { registerUser, loginUser, becomeOwner, promoteToAdmin, logoutUser , updateProfile};
