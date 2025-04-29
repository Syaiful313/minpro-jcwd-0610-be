import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_SECRET_FORGOT_PASSWORD =
  process.env.JWT_SECRET_FORGOT_PASSWORD;
export const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
export const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
export const BASE_URL_FE = process.env.BASE_URL_FE;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
