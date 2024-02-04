import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../utils/type";
import db from "../utils/db";

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user;
        if (!user) return next({ message: "unauthorized", status: 401 });

        const pageSize = 10;
        const pageNumber = parseInt(req.query.page as string) || 1;
        const skipPage = (pageNumber - 1) * pageSize;
        const userId = user.id;

        const notifications = await db.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            take: pageSize,
            skip: skipPage,
        });

        if (user.hasNotification) {
            await db.user.update({
                where: {
                    id: userId,
                },
                data: {
                    hasNotification: false,
                },
            });
        }

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        next(error);
    }
};
