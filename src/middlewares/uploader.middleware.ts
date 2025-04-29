import { NextFunction, Request, Response } from "express";
import core, { fromBuffer } from "file-type/core";
import multer from "multer";
import { ApiError } from "../utils/api-error";

export class UploaderMiddleware {
  upload = (fileSize: number = 2) => {
    const storage = multer.memoryStorage();

    const limits = { fileSize: fileSize * 1024 * 1024 };

    return multer({ storage, limits });
  };

  fileFilter = (allowedTypes: core.MimeType[]) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      for (const fieldname in files) {
        const fileArray = files[fieldname];

        for (const file of fileArray) {
          const type = await fromBuffer(file.buffer);

          if (!type || !allowedTypes.includes(type.mime)) {
            throw new ApiError(400, `File type ${type?.mime} is not allowed`);
          }
        }
      }

      next();
    };
  };
}