"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorMiddleware = (err, _req, res, next) => {
    const status = err.status || 500;
    const message = err.message || "Something went wrong";
    res.status(status).send({ status, message });
};
exports.errorMiddleware = errorMiddleware;
