const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { sendMail } = require("../utils/mailer.js");
const { generateToken } = require("../utils/jwt");
const { sendResponse, sendError } = require("../utils/response");

class AuthService {
  // REGISTER
  async register(req, res) {
    let { fullName, emailAddress, password } = req.body;

    try {
      emailAddress = emailAddress.toLowerCase();

      const existing = await User.findOne({ emailAddress });
      if (existing) return sendError(res, 400, "Email already exists");

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 10 * 60 * 1000;

      const newUser = new User({
        fullName,
        emailAddress,
        password: hashedPassword,
        otp,
        otpExpires,
      });

      try {
        await sendMail(
          emailAddress,
          "FindItHub - Verify Your Email",
          `<p>Your verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`
        );
      } catch (mailErr) {
        return sendError(res, 500, "Email failed. Registration aborted.");
      }

      await newUser.save();
      return sendResponse(res, 200, "OTP sent to email for verification");
    } catch (err) {
      console.error(err);
      return sendError(res, 500, err.message);
    }
  }

  // VERIFY OTP
  async verifyOtp(req, res) {
    let { emailAddress, otp } = req.body;

    try {
      emailAddress = emailAddress.toLowerCase();

      const user = await User.findOne({ emailAddress });
      if (!user) return sendError(res, 404, "User not found");
      if (user.isVerified) return sendError(res, 400, "User already verified");
      if (user.otp !== otp) return sendError(res, 400, "Invalid OTP");
      if (Date.now() > user.otpExpires)
        return sendError(res, 400, "OTP expired");

      // Mark verified and clear OTP fields
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save();

      // Generate login token (same as in login)
      const token = generateToken({ userId: user._id });

      // Return success with token + user data (same structure as login)
      return sendResponse(res, 200, "Email verified successfully", {
        token,
        user: {
          userId: user._id,
          fullName: user.fullName,
          emailAddress: user.emailAddress,
        },
      });
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  }

  // LOGIN
  async login(req, res) {
    let { emailAddress, password } = req.body;

    try {
      emailAddress = emailAddress.toLowerCase();

      const user = await User.findOne({ emailAddress });
      if (!user) return sendError(res, 404, "User not found");
      if (!user.isVerified)
        return sendError(res, 403, "Please verify your email first");

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return sendError(res, 400, "Invalid credentials");

      const token = generateToken({ userId: user._id });

      return sendResponse(res, 200, "Login successful", {
        token,
        user: {
          userId: user._id,
          fullName: user.fullName,
          emailAddress: user.emailAddress,
        },
      });
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  }

  // FORGOT PASSWORD
  async forgotPassword(req, res) {
    let { emailAddress } = req.body;
    try {
      emailAddress = emailAddress.toLowerCase();

      const user = await User.findOne({ emailAddress });
      if (!user) return sendError(res, 404, "No user found with that email");

      const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const resetOtpExpires = Date.now() + 10 * 60 * 1000;

      user.resetOtp = resetOtp;
      user.resetOtpExpires = resetOtpExpires;
      await user.save();

      await sendMail(
        emailAddress,
        "Reset Your Password - OTP",
        `<p>Your password reset code is <b>${resetOtp}</b>. It expires in 10 minutes.</p>`
      );

      return sendResponse(res, 200, "Reset OTP sent to your email");
    } catch (err) {
      console.error(err);
      return sendError(res, 500, "Internal server error");
    }
  }

  // RESET PASSWORD
  async resetPassword(req, res) {
    let { emailAddress, otp, newPassword } = req.body;

    try {
      emailAddress = emailAddress.toLowerCase();

      const user = await User.findOne({ emailAddress });
      if (!user) return sendError(res, 404, "User not found");
      if (user.resetOtp !== otp) return sendError(res, 400, "Invalid OTP");
      if (Date.now() > user.resetOtpExpires)
        return sendError(res, 400, "OTP expired");

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetOtp = undefined;
      user.resetOtpExpires = undefined;
      await user.save();

      return sendResponse(res, 200, "Password reset successful");
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  }

  // CHANGE PASSWORD (AUTH REQUIRED)
  async changePassword(req, res) {
    const userId = req.user.userId;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    try {
      const user = await User.findById(userId);
      if (!user) return sendError(res, 404, "User not found");

      const valid = await bcrypt.compare(oldPassword, user.password);
      if (!valid) return sendError(res, 400, "Old password is incorrect");
      if (newPassword !== confirmPassword)
        return sendError(res, 400, "Passwords do not match");

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      return sendResponse(res, 200, "Password changed successfully");
    } catch (err) {
      return sendError(res, 500, err.message);
    }
  }

  // UPDATE PROFILE
  // UPDATE PROFILE (AUTH REQUIRED)
async updateProfile(req, res) {
  const userId = req.user.userId; // userId is extracted from token (middleware)
  const { fullName } = req.body;

  try {
    if (!fullName || fullName.trim() === "") {
      return sendError(res, 400, "Full name is required");
    }

    const user = await User.findById(userId);
    if (!user) return sendError(res, 404, "User not found");

    user.fullName = fullName.trim();
    await user.save();

    return sendResponse(res, 200, "Profile updated successfully", {
      user: {
        userId: user._id,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
      },
    });
  } catch (err) {
    console.error(err);
    return sendError(res, 500, err.message);
  }
}

}

module.exports = { AuthService };
