import express from "express";
import { Login, Register, VerifyOTP } from "../controller/authController";

const router = express.Router();

router.post("/register", Register);
router.post("/login", Login);
router.post("/verify-otp", VerifyOTP);

export default router;
