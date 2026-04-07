export const resendOTP = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  const otp = generateOTP();

  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendEmail(email, `Your new OTP is ${otp}`);

  res.json({ message: "OTP resent" });
};