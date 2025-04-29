import multer from "multer";

export const uploader = (fileLimits: number = 2) => {
  const storage = multer.memoryStorage();

  const limits = {
    fileSize: fileLimits * 1024 * 1024,
  };

  return multer({ storage, limits });
};
