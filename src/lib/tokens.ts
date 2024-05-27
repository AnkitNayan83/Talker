import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import db from "../utils/db";

export const generateVerificationToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    const existingToken = await db.verificationToken.findFirst({
        where: {
            email,
        },
    });

    if (existingToken) {
        await db.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            email,
            token,
            expires,
        },
    });

    return verificationToken;
};

export const generateOTP = async (email: string) => {
    const token = crypto.randomInt(100_000, 1_000_000).toString();

    const expires = new Date(new Date().getTime() + 10 * 60 * 1000);

    const existingToken = await db.oTP.findFirst({
        where: {
            email,
        },
    });

    if (existingToken) {
        await db.oTP.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const otp = await db.oTP.create({
        data: {
            email,
            value: token,
            expirationDate: expires,
        },
    });

    return otp;
};
