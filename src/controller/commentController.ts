import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../utils/type";
import db from "../utils/db";
import { NotificationType } from "@prisma/client";

export const getComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const commentId = req.params.id;

        const comment = await db.comment.findFirst({
            where: {
                id: commentId,
            },
            include: {
                user: true,
                commentReplies: {
                    include: {
                        user: true,
                        likes: {
                            include: {
                                user: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                likes: {
                    include: {
                        user: true,
                    },
                },
                post: {
                    include: {
                        user: true,
                    },
                },
                parentComment: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({ success: true, comment });
    } catch (error) {
        next(error);
    }
};

export const getPostComments = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const postId = req.params.id;

    if (!postId) return next({ message: "Post id not found", status: 400 });

    try {
        const post = await db.post.findUnique({
            where: {
                id: postId,
            },
            include: {
                comments: {
                    include: {
                        user: true,
                        commentReplies: {
                            include: {
                                user: true,
                            },
                            orderBy: {
                                createdAt: "desc",
                            },
                        },
                        likes: {
                            include: {
                                user: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                user: true,
                likes: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!post) return next({ message: "Post does not exists" });

        const comments = post.comments;
        return res.status(200).json({ success: true, comments });
    } catch (error) {
        next(error);
    }
};

export const commentOnPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return next({ message: "unauthorized", status: 401 });
        const postId = req.params.id;
        const { data } = req.body;

        if (!data) return next({ message: "reply on a comment cannot be empty", status: 400 });

        const checkPost = await db.post.findFirst({
            where: {
                id: postId,
            },
        });

        if (!checkPost) return next({ message: "post not found", status: 404 });

        const comment = await db.comment.create({
            data: {
                userId: user.id,
                postId,
                body: data,
            },
        });

        await db.notification.create({
            data: {
                userId: checkPost.userId,
                message: "commented on post",
                type: NotificationType.COMMENT,
                refPostId: postId,
                refUserId: user.id,
            },
        });

        await db.user.update({
            where: {
                id: user.id,
            },
            data: {
                hasNotification: true,
            },
        });

        res.status(201).json({
            success: true,
            comment,
        });
    } catch (error) {
        next(error);
    }
};

export const replyOnComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { data } = req.body;
        const commentId = req.params.id;

        if (!data) return next({ message: "reply on a comment cannot be empty", status: 400 });

        if (!user) return next({ message: "unauthorized", status: 401 });
        const userId = user.id;

        const checkComment = await db.comment.findFirst({
            where: {
                id: commentId,
            },
        });

        if (!checkComment)
            return next({
                message: "comment for which this reply is posted is not present",
                status: 404,
            });

        const reply = await db.comment.create({
            data: {
                userId,
                parentCommentId: commentId,
                body: data,
            },
        });

        await db.notification.create({
            data: {
                userId: checkComment.userId,
                message: "replied to your comment",
                type: NotificationType.COMMENT,
                refUserId: user.id,
                refCommentId: commentId,
            },
        });

        res.status(201).json({
            success: true,
            reply,
        });
    } catch (error) {
        next(error);
    }
};

export const likeComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return next({ message: "unauthorized", status: 401 });

        const commentId = req.params.id;

        const checkComment = await db.comment.findFirst({
            where: {
                id: commentId,
            },
        });

        if (!checkComment) return next({ message: "comment does not exists", status: 404 });

        const checkLike = await db.commentLike.findFirst({
            where: {
                commentId,
                userId: user.id,
            },
        });

        if (checkLike) return next({ message: "User already liked this comment", status: 400 });

        await db.commentLike.create({
            data: {
                commentId,
                userId: user.id,
            },
        });

        await db.notification.create({
            data: {
                userId: checkComment.userId,
                message: "liked your comment",
                type: NotificationType.COMMENT,
                refUserId: user.id,
                refCommentId: commentId,
            },
        });

        res.status(200).json({
            message: "user liked this comment",
        });
    } catch (error) {
        next(error);
    }
};

export const unlikeComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return next({ message: "unauthorized", status: 401 });

        const commentId = req.params.id;

        const checkComment = await db.comment.findFirst({
            where: {
                id: commentId,
            },
        });

        if (!checkComment) return next({ message: "comment does not exists", status: 404 });

        const checkLike = await db.commentLike.findFirst({
            where: {
                commentId,
                userId: user.id,
            },
        });

        if (!checkLike) return next({ message: "User did't liked this comment", status: 400 });

        await db.commentLike.delete({
            where: {
                commentId_userId: {
                    commentId,
                    userId: user.id,
                },
            },
        });
        res.status(200).json({
            message: "user unliked this comment",
        });
    } catch (error) {
        next(error);
    }
};

export const deleteComment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return next({ message: "unauthorized", status: 401 });

        const commentId = req.params.id;
        const userId = user.id;

        const checkComment = await db.comment.findFirst({
            where: {
                id: commentId,
                userId,
            },
        });

        if (!checkComment) return next({ message: "comment does not exists", status: 404 });

        await db.comment.delete({
            where: {
                id: commentId,
                userId,
            },
        });

        res.status(200).json({ success: true, message: "comment deleted successfully" });
    } catch (error) {
        next(error);
    }
};
