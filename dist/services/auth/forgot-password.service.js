"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgotPasswordService = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const env_1 = require("../../config/env");
const prisma_1 = __importDefault(require("../../config/prisma"));
const nodemailer_1 = require("../../lib/nodemailer");
const api_error_1 = require("../../utils/api-error");
const ForgotPasswordService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = body;
        const user = yield prisma_1.default.user.findFirst({
            where: {
                email,
            },
        });
        if (!user) {
            throw new api_error_1.ApiError(404, "User not found");
        }
        const token = (0, jsonwebtoken_1.sign)({ id: user.id }, env_1.JWT_SECRET_FORGOT_PASSWORD, {
            expiresIn: "15m",
        });
        const link = `${env_1.BASE_URL_FE}/auth/reset-password/${token}`;
        nodemailer_1.transporter.sendMail({
            to: email,
            subject: "Link Reset Password",
            html: `<a href="${link}" target="_blank">Reset password here</a>`,
        });
        return { message: "Email sent successfully" };
    }
    catch (error) {
        throw error;
    }
});
exports.ForgotPasswordService = ForgotPasswordService;
