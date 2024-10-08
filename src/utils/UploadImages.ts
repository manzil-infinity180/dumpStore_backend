import { NextFunction, Request, Response } from "express";
import multer from "multer";
import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryFile extends Express.Multer.File {
  buffer: Buffer;
}
export const UploadSingleImage = upload.single("photo");
export const UploadImageToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<UploadApiResponse | UploadApiErrorResponse> => {
  try {
    const file = req.file as CloudinaryFile;
    if (!file) {
      throw new Error("No file founded!");
    }
    const imageSize = 3 * 1024 * 1024;
    if (imageSize < req.file.size) {
      throw new Error("Your file must be less than 3 MB");
    }
    if (!req.file || req.file.fieldname !== "photo") {
      throw new Error("Something Goes wrong with req.file.fieldname, it should be photo");
    }
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "dumpStore", // Optional: Folder name in Cloudinary
      quality: "auto:good",
      use_filename: true,
      width: 200,
      overwrite: true,
    });
    return result;
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};