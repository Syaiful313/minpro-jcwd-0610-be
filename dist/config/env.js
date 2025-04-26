"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLOUDINARY_API_SECRET = exports.CLOUDINARY_API_KEY = exports.CLOUDINARY_NAME = exports.BASE_URL_FE = exports.GMAIL_APP_PASSWORD = exports.GMAIL_EMAIL = exports.JWT_SECRET_FORGOT_PASSWORD = exports.JWT_SECRET_KEY = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT;
exports.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
exports.JWT_SECRET_FORGOT_PASSWORD = process.env.JWT_SECRET_FORGOT_PASSWORD;
exports.GMAIL_EMAIL = process.env.GMAIL_EMAIL;
exports.GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
exports.BASE_URL_FE = process.env.BASE_URL_FE;
exports.CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
exports.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
exports.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
