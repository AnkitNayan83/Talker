import express from "express";
import { deleteUser, getUser, updateUser } from "../controller/userController";
import { userAuth } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:id", getUser);

router.put("/:id", userAuth, updateUser);

router.delete("/:id", userAuth, deleteUser);

export default router;
