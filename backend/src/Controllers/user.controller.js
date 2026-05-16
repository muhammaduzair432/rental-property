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

export { registerUser, loginUser };
