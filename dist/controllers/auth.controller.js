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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = exports.ForgotPasswordController = exports.loginController = exports.registerController = void 0;
const register_service_1 = require("../services/auth/register.service");
const login_service_1 = require("../services/auth/login.service");
const forgot_password_service_1 = require("../services/auth/forgot-password.service");
const reset_password_service_1 = require("../services/auth/reset-password.service");
const registerController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, register_service_1.registerService)(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
});
exports.registerController = registerController;
const loginController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, login_service_1.loginService)(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
});
exports.loginController = loginController;
const ForgotPasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield (0, forgot_password_service_1.ForgotPasswordService)(req.body);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
});
exports.ForgotPasswordController = ForgotPasswordController;
const resetPasswordController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = Number(res.locals.user.id);
        const result = yield (0, reset_password_service_1.resetPasswordService)(userId, req.body.password);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
});
exports.resetPasswordController = resetPasswordController;
