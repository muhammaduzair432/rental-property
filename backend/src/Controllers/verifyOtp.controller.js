export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (
    user.otp !== Number(otp) ||
    user.otpExpiry < Date.now()
  ) {
    return res.status(400).json({
      message: "Invalid or expired OTP",
    });
  }

  // mark verified
  user.isVerified = true;

  // clear OTP
  user.otp = null;
  user.otpExpiry = null;

  await user.save();

  return res.json(200,{ 
    message: "Account verified successfully",
  });
};