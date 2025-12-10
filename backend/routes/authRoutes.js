import express from "express";
import { signup, login } from "../controllers/authController.js";
import { generateOtp, verifyOtp } from "../controllers/otpController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/sent-otp", generateOtp);
router.post("/verify-otp", verifyOtp);

export default router;
