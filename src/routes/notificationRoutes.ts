import express from "express";
import { userAuth } from "../middleware/authMiddleware";
import { getNotifications } from "../controller/notificationController";

const router = express.Router();

router.get("/", userAuth, getNotifications);

export default router;
