const express = require("express");
const router = express.Router();
const Controller = require("../controller/index");

// ─── Auth ───────────────────────────
router.post("/register", Controller.register);
router.post("/login", Controller.login);

// ─── OTP ────────────────────────────
router.post("/verify-otp", Controller.verifyOtp);
router.post("/resend-otp", Controller.resendOtp);

// ─── Password ───────────────────────
router.post("/forgot-password", Controller.forgotPassword);
router.post("/reset-password", Controller.resetPassword);

module.exports = router;
