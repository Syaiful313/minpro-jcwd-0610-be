"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResetPassword = exports.validateForgotPassword = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.body)("fullName").notEmpty().withMessage("Name is required").isString(),
    (0, express_validator_1.body)("email").notEmpty().withMessage("Email is not valid").isEmail(),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array()[0].msg });
            return;
        }
        next();
    },
];
exports.validateLogin = [
    (0, express_validator_1.body)("email").notEmpty().withMessage("Email is not valid").isEmail(),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array()[0].msg });
            return;
        }
        next();
    },
];
exports.validateForgotPassword = [
    (0, express_validator_1.body)("email").notEmpty().withMessage("Email is not valid").isEmail(),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array()[0].msg });
            return;
        }
        next();
    },
];
exports.validateResetPassword = [
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array()[0].msg });
            return;
        }
        next();
    },
];
