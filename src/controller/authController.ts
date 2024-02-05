import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from "../utils/sendEmail";
import { generateOTP } from "../utils/generateOpt";
import db from "../utils/db";
import dotenv from "dotenv";
import { validationResult } from "express-validator";

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

        const otp = generateOTP();
        const expirationDate = new Date(
            new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
        );

        await db.oTP.create({
            data: {
                userId: newUser.id,
                value: otp,
                expirationDate,
                isValid: true,
            },
        });

        const body = `<div> Your one time password is: <h1> ${otp} </h1> This otp is valid for 10 miniutes only!</div>`;

        sendMail(email, body);

        res.status(201).json({
            message: "user created",
            user: newUser,
        });
    } catch (error: any) {
        next({ message: error.message, status: 500 });
        console.log(error);
    }
};

const generateUserName = async (firstName: string, lastName: string) => {
    let counter = 1;
    let userName = firstName + lastName + counter;

    while (!(await isUsernameUnique(userName))) {
        counter++;
        userName = firstName + lastName + counter;
    }

    return userName;
};

const isUsernameUnique = async (userName: string) => {
    const isUsername = await db.user.findFirst({
        where: {
            userName,
        },
    });

    if (isUsername) return false;

    return true;
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
            const otp = generateOTP();
            const expirationDate = new Date(
                new Date().getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60 * 1000
            );

            await db.oTP.create({
                data: {
                    userId: user.id,
                    value: otp,
                    expirationDate,
                    isValid: true,
                },
            });
            const body = `<div> Your one time password is: <h1> ${otp} </h1> This otp is valid for 10 miniutes only!</div>`;
            sendMail(email, body);
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
                token,
                user,
            });
        }
    } catch (error) {
        next(error);
    }
};

export const VerifyOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, otp } = req.body;
        const user = await db.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) return next({ message: "no user found with this id", status: 404 });

        const optInDb = await db.oTP.findUnique({
            where: {
                value: otp,
                userId,
            },
        });
        if (!optInDb) return next({ message: "wrong otp", status: 401 });

        if (!optInDb.isValid) return next({ message: "wrong otp", status: 401 });

        const currentTime = new Date();

        if (currentTime > optInDb.expirationDate) {
            return next({ message: "OTP Expired", status: 401 });
        }

        const verifiedUser = await db.user.update({
            where: {
                id: userId,
            },
            data: {
                emailVerified: new Date(),
            },
        });

        await db.oTP.update({
            where: {
                id: optInDb.id,
            },
            data: {
                isValid: false,
            },
        });

        const token = jwt.sign(
            {
                userId: user.id,
                isMember: user.isMember,
                isVerified: verifiedUser.emailVerified,
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
            token,
            user: verifiedUser,
        });
    } catch (error) {
        next(error);
    }
};
