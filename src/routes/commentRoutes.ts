import express from "express";
import { userAuth } from "../middleware/authMiddleware";
import {
    commentOnPost,
    deleteComment,
    getComment,
    getPostComments,
    likeComment,
    replyOnComment,
} from "../controller/commentController";

const router = express.Router();

router.get("/post/:id", getPostComments);
router.get("/:id", getComment);

router.post("/reply/:id", userAuth, replyOnComment);
router.post("/like/:id", userAuth, likeComment);
router.post("/:id", userAuth, commentOnPost);

router.delete("/:id", userAuth, deleteComment);

export default router;
