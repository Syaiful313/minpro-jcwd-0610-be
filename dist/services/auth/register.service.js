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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerService = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../config/prisma"));
const argon_1 = require("../../lib/argon");
const api_error_1 = require("../../utils/api-error");
const nanoid_1 = require("nanoid");
const registerService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.default.user.findFirst({
        where: {
            email: body.email,
        },
    });
    if (existingUser) {
        throw new api_error_1.ApiError(400, "Email already exists");
    }
    const referralCode = (0, nanoid_1.nanoid)(8);
    const hashedPassword = yield (0, argon_1.hashPassword)(body.password);
    const { referralCode: inputReferralCode } = body, userData = __rest(body, ["referralCode"]);
    let referredById = null;
    if (inputReferralCode) {
        const referrer = yield prisma_1.default.user.findFirst({
            where: {
                referralCode: inputReferralCode,
            },
        });
        if (referrer) {
            referredById = referrer.id;
        }
    }
    const user = yield prisma_1.default.user.create({
        data: Object.assign(Object.assign({}, userData), { password: hashedPassword, referralCode, referredBy: referredById, role: userData.role || client_1.Role.USER }),
    });
    if (referredById) {
        yield prisma_1.default.referral.create({
            data: {
                userId: user.id,
                pointsAwarded: 10000,
                discountCoupon: `WELCOME-${(0, nanoid_1.nanoid)(8)}`,
            },
        });
        yield prisma_1.default.coupon.create({
            data: {
                userId: user.id,
                code: `WELCOME-${(0, nanoid_1.nanoid)(8)}`,
                discount: 10,
                amount: 1,
                expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
                isUsed: false,
            },
        });
        const referrer = yield prisma_1.default.user.findUnique({
            where: { id: referredById },
        });
        if (referrer) {
            yield prisma_1.default.user.update({
                where: { id: referrer.id },
                data: {
                    point: referrer.point + 10000,
                    expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
                },
            });
        }
    }
    const { password } = user, userWithoutPassword = __rest(user, ["password"]);
    return userWithoutPassword;
});
exports.registerService = registerService;
