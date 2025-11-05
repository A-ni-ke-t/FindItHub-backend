const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, 
    trim: true,
  },
  password: { type: String, required: true },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date },
});

module.exports = mongoose.model("User", userSchema);
