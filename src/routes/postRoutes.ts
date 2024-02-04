import express from "express";
import { userAuth } from "../middleware/authMiddleware";
import {
    createPost,
    deletePost,
    getFeedPost,
    getPost,
    likePost,
    updatePost,
} from "../controller/postController";

const router = express.Router();

router.get("/feed", userAuth, getFeedPost);
router.get("/:id", userAuth, getPost);

router.post("/", userAuth, createPost);
router.post("/:id", userAuth, likePost);

router.put("/:id", userAuth, updatePost);

router.delete("/:id", userAuth, deletePost);

export default router;
