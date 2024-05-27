import express from "express";
import { Login, Register, VerifyEmail } from "../controller/authController";
import { body } from "express-validator";

const router = express.Router();

router.post("/register", body("email").isEmail().normalizeEmail(), Register);
router.post("/login", body("email").isEmail().normalizeEmail(), Login);
router.post("/verify-email", VerifyEmail);

export default router;
