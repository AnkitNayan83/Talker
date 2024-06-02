import express from "express";
import { userAuth } from "../middleware/authMiddleware";
import {
    createPost,
    deletePost,
    getFeedPost,
    getPost,
    likePost,
    unlikePost,
    updatePost,
} from "../controller/postController";

const router = express.Router();

router.get("/feed", getFeedPost);
router.get("/:id", userAuth, getPost);

router.post("/", userAuth, createPost);
router.post("/unlike/:id", userAuth, unlikePost);
router.post("/:id", userAuth, likePost);

router.put("/:id", userAuth, updatePost);

router.delete("/:id", userAuth, deletePost);

export default router;
