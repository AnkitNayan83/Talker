import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../utils/type";
import db from "../utils/db";
import { NotificationType } from "@prisma/client";

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
                type: NotificationType.POST,
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

        res.status(201).json({
            success: true,
            reply,
        });
    } catch (error) {
        next(error);
    }
};

export const likeComment = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return next({ message: "unauthorized", status: 401 });
    } catch (error) {
        next(error);
    }
};
