const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    emailAddress: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },

    // OTP fields
    otp: String,
    otpExpires: Date,

    resetOtp: String,
    resetOtpExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
