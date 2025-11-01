const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/user");
const { sendMail } = require("../utils/mailer.js");
const { generateToken, verifyToken } = require("../utils/jwt");

class AuthService {

  async register(req, res) {
    const { fullName, emailAddress, password } = req.body;

    try {
      const existing = await User.findOne({ emailAddress });
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000; // 10 min expiry

      const newUserData = {
        fullName,
        emailAddress,
        password: hashedPassword,
        otp,
        otpExpires,
      };

      try {
        await sendMail(
          emailAddress,
          "FindItHub - Verify Your Email",
          `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`
        );
      } catch (mailErr) {
        return res
          .status(500)
          .json({ message: "Email failed. Registration aborted." });
      }
      const user = new User(newUserData);
      await user.save();

      return res
        .status(200)
        .json({ message: "OTP sent to email for verification" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  async verifyOtp(req, res) {
    const { emailAddress, otp } = req.body;
  
    try {
      const user = await User.findOne({ emailAddress });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      if (user.isVerified)
        return res.status(400).json({ message: "User already verified" });
  
      if (user.otp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });
  
      if (Date.now() > user.otpExpires)
        return res.status(400).json({ message: "OTP expired" });
  
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: "Email verified successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  
  async login(req, res) {
    const { emailAddress, password } = req.body;
    const user = await User.findOne({ emailAddress });
  
    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email first" });
  
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });
  
    const token = generateToken({ userId: user._id });
  
    // Include user info in response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        fullName: user.fullName,
        emailAddress: user.emailAddress
      }
    });
  }
  

  async forgotPassword(req, res) {
    const { emailAddress } = req.body;
    try {
      const user = await User.findOne({ emailAddress });
      if (!user) {
        return res.status(404).json({ message: "No user found with that email" });
      }
  
      const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const resetOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
      user.resetOtp = resetOtp;
      user.resetOtpExpires = resetOtpExpires;
      await user.save();
  
      await sendMail(
        emailAddress,
        "Reset Your Password - OTP",
        `<p>Your password reset code is <b>${resetOtp}</b>.</p><p>This OTP will expire in 10 minutes.</p>`
      );
  
      return res.status(200).json({ message: "Reset OTP sent to your email" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async resetPassword(req, res) {
    const { emailAddress, otp, newPassword, confirmPassword } = req.body;
  
    try {
      const user = await User.findOne({ emailAddress });
      if (!user) return res.status(404).json({ message: "User not found" });
  
      if (user.resetOtp !== otp)
        return res.status(400).json({ message: "Invalid OTP" });
  
      if (Date.now() > user.resetOtpExpires)
        return res.status(400).json({ message: "OTP expired" });
  
      if (newPassword !== confirmPassword)
        return res.status(400).json({ message: "Passwords do not match" });
  
      user.password = await bcrypt.hash(newPassword, 10);
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }

  // Change password (authenticated)
  async changePassword(req, res) {
    const userId = req.user.userId; // from JWT middleware
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Old password is incorrect" });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  }
}

module.exports = { AuthService };
