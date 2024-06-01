import { NextFunction, Response } from "express";
import { AuthRequest } from "../utils/type";
import db from "../utils/db";
import { NotificationType } from "@prisma/client";

export const getFeedPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const pageSize = 10;
        const pageNumber = parseInt(req.query.page as string) || 1;
        const skipPage = (pageNumber - 1) * pageSize;

        const posts = await db.post.findMany({
            take: pageSize,
            skip: skipPage,
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: true,
                comments: {
                    include: {
                        user: true,
                        commentReplies: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                likes: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        res.status(200).json({ success: true, posts });
    } catch (error) {
        next(error);
    }
};

export const getPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const post = await db.post.findFirst({
            where: {
                id,
            },
            include: {
                comments: {
                    include: {
                        user: true,
                        commentReplies: {
                            include: {
                                user: true,
                            },
                        },
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

        res.status(200).json({
            success: true,
            post,
        });
    } catch (error) {
        next(error);
    }
};

export const createPost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (user === undefined) return next({ message: "unauthorized", status: 401 });
        if (user.isVerified === undefined)
            return next({ message: "user not verified", status: 401 });

        const userId = user.id;
        const { body } = req.body;
        if (!body) return next({ message: "tweet cannot be empty", status: 400 });
        const newPost = await db.post.create({
            data: {
                userId,
                body,
            },
        });

        await db.notification.create({
            data: {
                message: "Tweet posted successfully",
                userId,
                type: NotificationType.POST,
                refPostId: newPost.id,
            },
        });

        await db.user.update({
            where: {
                id: userId,
            },
            data: {
                hasNotification: true,
            },
        });

        res.status(201).json({
            success: true,
            post: newPost,
        });
    } catch (error) {
        next(error);
    }
};

export const updatePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        const { body } = req.body;

        if (!user) return next({ message: "unauthorized", staatus: 401 });
        if (user.isVerified === undefined)
            return next({ message: "user not verified", status: 401 });

        if (!user.isMember) return next({ message: "only members can update post", status: 401 });

        if (!body) return next({ message: "tweet cannot be empty", status: 400 });

        const postId = req.params.id;
        const userId = user.id;

        const checkPost = await db.post.findFirst({
            where: {
                id: postId,
                userId,
            },
        });

        if (!checkPost) return next({ message: "no post found", status: 404 });

        const updatedPost = await db.post.update({
            where: {
                id: postId,
                userId,
            },
            data: {
                body,
            },
        });

        await db.notification.create({
            data: {
                message: "Tweet updated successfully",
                userId,
                type: NotificationType.POST,
                refPostId: postId,
            },
        });

        await db.user.update({
            where: {
                id: userId,
            },
            data: {
                hasNotification: true,
            },
        });

        res.status(200).json({ success: true, updatedPost });
    } catch (error) {
        next(error);
    }
};

export const deletePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return next({ message: "unatuhorized", status: 401 });

        if (user.isVerified === undefined)
            return next({ message: "user not verified", status: 401 });

        const postId = req.params.id;
        const userId = user.id;

        const checkPost = await db.post.findFirst({
            where: {
                id: postId,
                userId,
            },
        });

        if (!checkPost) return next({ message: "post not found", status: 404 });

        await db.post.delete({
            where: {
                id: postId,
                userId,
            },
        });

        res.status(200).json({
            success: true,
            message: "post deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const likePost = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return next({ message: "unauthorized", status: 401 });

        if (!user.isVerified) return next({ message: "user not verified", status: 401 });

        const postId = req.params.id;
        const userId = user.id;

        const checkPost = await db.post.findFirst({
            where: {
                id: postId,
            },
        });

        if (!checkPost) return next({ message: "post not found", status: 404 });

        const checkLike = await db.postLike.findFirst({
            where: {
                userId,
                postId,
            },
        });

        if (checkLike) return next({ message: "user already liked this post", status: 400 });

        await db.postLike.create({
            data: {
                userId,
                postId,
            },
        });

        await db.notification.create({
            data: {
                userId: checkPost.userId,
                message: `liked your post`,
                type: NotificationType.POST,
                refPostId: postId,
                refUserId: userId,
            },
        });

        res.status(200).json({
            success: true,
            message: "liked",
        });
    } catch (error) {
        next(error);
    }
};
