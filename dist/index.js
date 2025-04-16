"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const sample_router_1 = __importDefault(require("./routes/sample.router"));
const auth_router_1 = __importDefault(require("./routes/auth.router"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/samples", sample_router_1.default);
app.use("/auth", auth_router_1.default);
app.use(error_middleware_1.errorMiddleware);
app.listen(env_1.PORT, () => {
    console.log(`Server listening on port : ${env_1.PORT}`);
});
