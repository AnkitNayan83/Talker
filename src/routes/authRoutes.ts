import express from "express";
import { Login, Register, VerifyEmail, verifyJWTToken } from "../controller/authController";
import { body } from "express-validator";
import { userAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", body("email").isEmail().normalizeEmail(), Register);
router.post("/login", body("email").isEmail().normalizeEmail(), Login);

router.post("/verify-email", VerifyEmail);
router.post("/verify-jwt", userAuth, verifyJWTToken);

export default router;
