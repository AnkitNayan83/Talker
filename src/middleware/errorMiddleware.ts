import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

type AuthRequest = Request & { user?: User };

export const errorMiddleware = (err: any, req: AuthRequest, res: Response, next: NextFunction) => {
    const defaultErrors = {
        statusCode: err.status || 500,
        message: err.message || "Something went wrong",
    };
    res.status(defaultErrors.statusCode).json({ message: defaultErrors.message, success: false });
};
