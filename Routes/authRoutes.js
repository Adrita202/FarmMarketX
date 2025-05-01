const express = require("express");
const router = express.Router();
const authController = require("../Controllers/authController");

// Register Farmer
router.post("/registerFarmer", authController.registerFarmer);

// Register Wholesaler
router.post("/registerWholesaler", authController.registerWholesaler);

// Login
router.post("/login", authController.login);

// Send OTP
router.post("/send-otp", authController.sendOtp);

//router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
