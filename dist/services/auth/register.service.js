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
exports.registerService = void 0;
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
    const user = yield prisma_1.default.user.create({
        data: Object.assign(Object.assign({}, body), { password: hashedPassword, referralCode }),
        omit: { password: true },
    });
    if (body.referralCode) {
        const referrer = yield prisma_1.default.user.findFirst({
            where: {
                referralCode: body.referralCode,
            },
        });
        if (referrer) {
            yield prisma_1.default.coupon.create({
                data: {
                    userId: user.id,
                    code: `WELCOME-${(0, nanoid_1.nanoid)(6)}`,
                    discount: 10,
                    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    status: "active",
                    amount: 1,
                },
            });
            yield prisma_1.default.user.update({
                where: { id: referrer.id },
                data: {
                    point: (referrer.point || 0) + 10000,
                },
            });
        }
    }
    return user;
});
exports.registerService = registerService;
