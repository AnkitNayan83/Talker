import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuthRequest } from "../utils/type";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET!;

export async function userAuth(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) return next({ message: "no token found", status: 401 });

    if (!authHeader.startsWith("Bearer"))
        return next({ message: "wrong token format", status: 401 });

    const jwtToken = authHeader.split(" ")[1];

    if (!jwtToken) return next({ message: "no token found", status: 401 });

    try {
        const payload = jwt.verify(jwtToken, JWT_SECRET) as {
            userId: string;
            isMember: boolean;
            isVerified: Date;
            hasNotification: boolean;
        };
        req.user = {
            id: payload.userId,
            isMember: payload.isMember,
            isVerified: payload.isVerified,
            hasNotification: payload.hasNotification,
        };
        next();
    } catch (error) {
        next(error);
    }
}
