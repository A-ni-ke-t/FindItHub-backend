const express = require("express");
const router = express.Router();
const { AuthService } = require("../service/auth.service");
const auth = require("../middleware/auth");
const service = new AuthService();

router.post("/register", (req, res) => service.register(req, res));
router.post("/verify-otp", (req, res) => service.verifyOtp(req, res));
router.post("/login", (req, res) => service.login(req, res));
router.post("/forgot-password", (req, res) => service.forgotPassword(req, res));
router.post("/reset-password", (req, res) => service.resetPassword(req, res));
router.post("/change-password", auth, (req, res) => service.changePassword(req, res));

module.exports = router;
