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
exports.resetPasswordService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const argon_1 = require("../../lib/argon");
const api_error_1 = require("../../utils/api-error");
const resetPasswordService = (userId, password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma_1.default.user.findFirst({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new api_error_1.ApiError(404, "User not found");
        }
        const hashedPassword = yield (0, argon_1.hashPassword)(password);
        yield prisma_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedPassword,
            },
        });
        return { message: "Password reset successfully" };
    }
    catch (error) {
        throw error;
    }
});
exports.resetPasswordService = resetPasswordService;
