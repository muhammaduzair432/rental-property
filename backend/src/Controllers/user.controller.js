import { User } from "../Models/user.model.js";
import { ApiError } from "../Utils/apiError.js";
import { ApiResponse } from "../Utils/apiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { generateOTP } from "../Utils/generateOtp.js";
import { verifyOTP } from "./verifyOtp.controller.js";
import { sendEmail } from "../Utils/sendEmail.js";
import { Log } from "../Models/log.model.js";
import { Notification } from "../Models/notification.model.js"; // 👈 Add this line at the top



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

// Your exact function inside your user controller
   const resendOTP = async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const otp = generateOTP();
  
      user.otp = otp;
      user.otpExpiry = Date.now() + 2 * 60 * 1000;
  
      await user.save();
  
      await sendEmail(email, `Your new OTP is ${otp}`);
  
      res.json({ message: "OTP resent" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };


const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password, username } = req.body;
    const normalizedUsername = username?.toLowerCase().trim();
    const normalizedEmail = email?.toLowerCase().trim();
    const normalizedFullname = fullname?.trim();

    if (
        [normalizedFullname, normalizedEmail, password, normalizedUsername].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required");
    }

    // ================= USERNAME VALIDATION =================

    // 1. Username must be 3-20 characters
    if (normalizedUsername.length < 3 || normalizedUsername.length > 20) {
        throw new ApiError(400, "username must be between 3 and 20 characters");
    }

    // 2. Username can only contain letters, numbers, _ and -
    if (!/^[a-zA-Z0-9_-]+$/.test(normalizedUsername)) {
        throw new ApiError(
            400,
            "username can only contain letters, numbers, underscore (_) and hyphen (-)"
        );
    }

    // 3. Username must contain at least one letter and at least one number
    const hasLetter = /[a-zA-Z]/.test(normalizedUsername);
    const hasNumber = /[0-9]/.test(normalizedUsername);

    if (!hasLetter || !hasNumber) {
        throw new ApiError(
            400,
            "username must contain at least one letter and one number"
        );
    }

    // ================= PASSWORD VALIDATION =================

    // Password must be at least 8 characters
    if (password.length < 8) {
        throw new ApiError(400, "password must be at least 8 characters");
    }

    // ================= EXISTING CODE =================

    const existedUser = await User.findOne({
        $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
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
    let user;
    try {
        user = await User.create({
            fullname: normalizedFullname,
            email: normalizedEmail,
            password,
            username: normalizedUsername,
            avatar: avatar?.secure_url || "",
            otp,
            otpExpiry: Date.now() + 2 * 60 * 1000, // 2 min
            isVerified: false,
        });
    } catch (error) {
        if (error?.code === 11000) {
            const duplicateField = Object.keys(error.keyValue || {})[0];
            throw new ApiError(409, `${duplicateField} already exists`);
        }
        throw error;
    }

    // 🔥 FLOWCHART AUDIT LOG: Track new registrations automatically
    await Log.create({
        actionType: "USER_REGISTRATION",
        description: `New user registration completed for account: [${user.username}] with role: [${user.role}].`,
        performedBy: user._id
    });

    // send email
    await sendEmail(user.email, `Your OTP is ${otp}`);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken",
    );
    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user ");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdUser,
                "user registerd successfully, Please verify your otp",
            ),
        );
});;



// login section
const loginUser = asyncHandler(async (req, res) => {
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


// Add inside your notification or user/admin controller file:
export const getMyNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Fetch all notifications mapped to this user's ID
    const notifications = await Notification.find({ ownerId: userId })
        .sort({ createdAt: -1 })
        .limit(50);

    return res.status(200).json({
        success: true,
        count: notifications.length,
        notifications // Matches your backend response key
    });
});

// =========================================================================
// TOGGLE USER / OWNER PORTAL MODE (PUT /api/v2/users/switch-role)
// =========================================================================
export const switchPortalRole = asyncHandler(async (req, res) => {
    const { targetRole } = req.body; // Expects "user" or "owner"

    if (!targetRole || !["user", "owner"].includes(targetRole)) {
        throw new ApiError(400, "Invalid portal mode. You can only switch between 'user' and 'owner'.");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, "User account record not found.");
    }

    // Safety lock: Prevent admins from accidentally locking themselves out of the admin portal via this toggle
    if (user.role === "admin") {
        return res.status(403).json({
            success: false,
            message: "Action Denied. Administrators must use the admin control panel."
        });
    }

    // Update active operational role
    user.role = targetRole;
    await user.save({ validateBeforeSave: false });

    // Log the portal switch event
    await Log.create({
        actionType: "PORTAL_ROLE_SWITCH",
        description: `User [${user.username}] switched their active portal mode to [${targetRole}].`,
        performedBy: user._id
    });

    return res.status(200).json({
        success: true,
        message: `Successfully switched portal mode to ${targetRole}. All your previous data remains securely linked.`,
        data: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
});

export { registerUser, loginUser, becomeOwner, promoteToAdmin, logoutUser, updateProfile,resendOTP };
