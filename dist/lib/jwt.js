"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTokenReset = exports.verifyToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const env_1 = require("../config/env");
const verifyToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).send({
            message: "Authorization failed, token is missing",
        });
        return;
    }
    req.path;
    (0, jsonwebtoken_1.verify)(token, env_1.JWT_SECRET_KEY, (err, payload) => {
        if (err) {
            if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                res.status(401).send({
                    message: "Authorization failed, token is expired",
                });
                return;
            }
            else {
                res.status(401).send({
                    message: "Authorization failed, token is invalid",
                });
                return;
            }
        }
        res.locals.user = payload;
        next();
    });
};
exports.verifyToken = verifyToken;
const verifyTokenReset = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).send({
            message: "Authorization failed ,token is missing",
        });
        return;
    }
    (0, jsonwebtoken_1.verify)(token, env_1.JWT_SECRET_FORGOT_PASSWORD, (err, payload) => {
        if (err) {
            if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                res.status(401).send({
                    message: "Token is expired",
                });
                return;
            }
            else {
                res.status(401).send({
                    message: "Token is invalid",
                });
                return;
            }
        }
        res.locals.user = payload;
        next();
    });
};
exports.verifyTokenReset = verifyTokenReset;
