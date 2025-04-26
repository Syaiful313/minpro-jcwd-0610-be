import { NextFunction, Request, Response } from "express";
import { fromBuffer } from "file-type";

export const fileFilter = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as { [fieldName: string]: Express.Multer.File[] };
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/avif",
      "image/jpg",
      "image/webp",
      "image/heif",
      "image/heic",
    ];

    for (const fieldName in files) {
      const fileArray = files[fieldName];
      for (const file of fileArray) {
        const type = await fromBuffer(file.buffer);
        if (!type || !allowedTypes.includes(type?.mime)) {
          throw new Error(`File type ${type?.mime} is not allowed`);
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
