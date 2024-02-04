import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../utils/type";
import db from "../utils/db";

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) return next({ message: "id not found", status: 400 });
        const user = await db.user.findUnique({
            where: {
                id,
            },
            include: {
                posts: true,
                comments: true,
                likedComment: true,
                likedPost: true,
            },
        });

        if (!user) return next({ message: "user not found", status: 400 });

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { firstName, lastName, userName, profileImage, coverImage, bio } = req.body;

        if (!id) return next({ message: "user id not found", status: 400 });
        if (!userId) return next({ message: "unauthorized", status: 401 });
        if (id !== userId) {
            return next({ message: "unauthorized ", status: 401 });
        }

        if (!firstName) return next({ message: "first name cannot be empty", status: 401 });

        if (!userName) return next({ message: "username cannot be empty", status: 401 });

        const checkUserName = await db.user.findUnique({
            where: {
                userName,
                NOT: {
                    id: userId,
                },
            },
        });

        if (checkUserName) return next({ message: "This username has been taken", status: 409 });

        const updateUser = await db.user.update({
            where: {
                id: userId,
            },
            data: {
                firstName,
                lastName,
                userName,
                profileImage,
                coverImage,
                bio,
            },
        });

        res.status(200).json({
            success: true,
            user: updateUser,
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!id) return next({ message: "user id not found", status: 400 });
        if (!userId) return next({ message: "unauthorized", status: 401 });
        if (id !== userId) {
            return next({ message: "unauthorized ", status: 401 });
        }

        await db.user.delete({
            where: {
                id: userId,
            },
        });
        res.status(200).json({
            success: true,
            message: "user deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
