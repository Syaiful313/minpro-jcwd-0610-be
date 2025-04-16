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
exports.loginService = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const api_error_1 = require("../../utils/api-error");
const argon_1 = require("../../lib/argon");
const jsonwebtoken_1 = require("jsonwebtoken");
const env_1 = require("../../config/env");
const loginService = (body) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = body;
        const user = yield prisma_1.default.user.findFirst({
            where: {
                email,
            },
        });
        if (!user) {
            throw new api_error_1.ApiError(404, "User not found");
        }
        const isPasswordValid = yield (0, argon_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new api_error_1.ApiError(401, "Invalid password");
        }
        const { password: pass } = user, userWithoutPassword = __rest(user, ["password"]);
        const token = (0, jsonwebtoken_1.sign)({ id: user.id }, env_1.JWT_SECRET_KEY, { expiresIn: "2h" });
        return Object.assign(Object.assign({}, userWithoutPassword), { token });
    }
    catch (error) {
        throw error;
    }
});
exports.loginService = loginService;
