import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/sendEmail";
import { AuthRequest } from "../utils/type";
import db from "../utils/db";
import dotenv from "dotenv";
import { validationResult } from "express-validator";
import { generateVerificationToken } from "../lib/tokens";
import { generateUserName } from "../lib/user";

dotenv.config();

const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;

export const Register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return next({ message: "email is not valid", status: 400 });

        const { email, firstName, lastName, password } = req.body;

        if (!email) return next({ message: "email is required", status: 400 });

        if (!firstName) return next({ message: "name is required", status: 400 });

        if (!password) return next({ message: "password is required", status: 400 });

        if (password.length < 6)
            return next({ message: "password must have 6 letters", status: 400 });

        const checkEmail = await db.user.findFirst({
            where: {
                email,
            },
        });

        if (checkEmail) return next({ message: "This email is already registered", status: 401 });

        const userName = await generateUserName(firstName, lastName);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.user.create({
            data: {
                email,
                firstName,
                lastName,
                userName,
                hashedPassword,
            },
        });

        const verificationToken = await generateVerificationToken(email);
        //? FIX THIS IN PRODUCTION
        const body = `<div><a href="http://localhost:3000/verify-email?token=${verificationToken.token}">Click here</a> to verify your email</div>`;

        await sendMail(verificationToken.email, body);

        res.status(201).json({
            message: "Verification link sent to your emil.",
            user: newUser,
        });
    } catch (error: any) {
        next({ message: error.message, status: 500 });
        console.log(error);
    }
};

export const Login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return next({ message: "email is not valid", status: 400 });

        const { email, password } = req.body;
        if (!password) return next({ message: "password is required", status: 400 });
        if (!email) return next({ message: "email is required", status: 400 });

        const user = await db.user.findUnique({
            where: {
                email: email as string,
            },
        });

        if (!user) return next({ message: "wrong username or password", status: 401 });

        const comparePassword = await bcrypt.compare(password, user.hashedPassword!);

        if (!comparePassword) return next({ message: "wrong username or password", status: 401 });

        if (!user.emailVerified) {
            const verificationToken = await generateVerificationToken(email);
            //? FIX THIS IN PRODUCTION
            const body = `<div><a href="http://localhost:3000/verify-email?token=${verificationToken.token}">Click here</a> to verify your email</div>`;

            await sendMail(verificationToken.email, body);

            res.status(200).json({
                success: false,
                message: "email not verified",
                user,
            });
        } else {
            const token = jwt.sign(
                {
                    userId: user.id,
                    isMember: user.isMember,
                    isVerified: user.emailVerified,
                    hasNotification: user.hasNotification,
                },
                process.env.JWT_SECRET!,
                {
                    expiresIn: "7d",
                    algorithm: "HS256",
                }
            );
            res.status(200).json({
                success: true,
                message: "user logged in successfully",
                user: { ...user, token },
            });
        }
    } catch (error) {
        next(error);
    }
};

export const VerifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.query.token;
        if (!token) {
            return next({ message: "No token found in the url", status: 400 });
        }

        const existingToken = await db.verificationToken.findFirst({
            where: {
                token: token as string,
            },
        });

        if (!existingToken) {
            return next({ message: "Invalid email token", status: 401 });
        }

        const isExpired = new Date(existingToken.expires) < new Date();

        if (isExpired) {
            return next({ message: "Email Token expired", status: 401 });
        }

        const existingUser = await db.user.findFirst({
            where: {
                email: existingToken.email,
            },
        });

        if (!existingUser) {
            return next({ message: "no user found with this email please register.", status: 404 });
        }

        await db.user.update({
            where: {
                id: existingUser.id,
            },
            data: {
                emailVerified: new Date(),
            },
        });

        await db.verificationToken.delete({
            where: {
                id: existingToken.id,
            },
        });

        return res.status(200).json({ message: "email verified successfully" });
    } catch (error) {
        next(error);
    }
};

export const verifyJWTToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user) {
        return res.status(200).json({ message: "Token verified" });
    } else {
        return next({ message: "Token Expired", status: 401 });
    }
};
