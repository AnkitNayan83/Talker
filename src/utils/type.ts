import { Request } from "express";

export type AuthRequest = Request & {
    user?: { id: string; isMember: boolean; isVerified: Date; hasNotification: boolean };
};
