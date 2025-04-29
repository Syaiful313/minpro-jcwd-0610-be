import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
} from "../config/env";

cloudinary.config({
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  cloud_name: CLOUDINARY_CLOUD_NAME,
});

const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);
  return readable;
};

export const cloudinaryUpload = (
  file: Express.Multer.File,
  folder: string = ""
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const readableStream = bufferToStream(file.buffer);

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) return reject(err);

        if (!result)
          return reject(new Error("Upload failed: No result returned"));

        resolve(result);
      }
    );

    readableStream.pipe(uploadStream);
  });
};

const extractPublicIdFromUrl = (secureUrl: string): string => {
    return secureUrl.replace(/^.*\/upload\/v\d+\//, "").replace(/\.[^.]+$/, "");
  };
  
  export const cloudinaryRemove = async (secureUrl: string) => {
    const publicId = extractPublicIdFromUrl(secureUrl);
    return await cloudinary.uploader.destroy(publicId);
  };