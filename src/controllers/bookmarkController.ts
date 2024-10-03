import { NextFunction, Request, Response } from "express";
import { Bookmark, IBookMark } from "../models/bookmarkModel.js";
import mongoose, { Error } from "mongoose";
import { type IUser, User } from "../models/userModel.js";
import { UploadImageToCloudinary } from "../utils/UploadImages.js";

const createNewBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, link, tag } = req.body;
    if (!title || !link || !tag) {
      throw new Error("Title, Link, Tag is compulsory fields");
    }
    // TODO : Image Upload Implementation and try to fix the image size(or pixel) before uploading to cloudinary or any other platform
    const domain = new URL(link).hostname;
    if (!process.env.LOGO_FAVICON_URL) throw new Error("Favicon URl is invalid");
    const favicon = process.env.LOGO_FAVICON_URL.replace("<DOMAIN>", domain);
    // TODO : if req.file is existed (manual logo) then you need to omit/override the image
    const bookmarkBody: IBookMark = {
      title,
      link,
      tag,
      image: favicon,
      ...req.body,
    };
    const bookmark = await Bookmark.create(bookmarkBody);
    // @ts-ignore
    const user = await User.findById({ _id: req.user._id });
    // console.log("user");
    user.posts.push(bookmark._id);
    await user.save();
    console.log(user);
    res.status(200).json({
      status: "sucess",
      message: "New Dump Data is Inserted",
      data: bookmark,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

const updateBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Updatebookmark = await Bookmark.findByIdAndUpdate(
      { _id: req.body.id },
      req.body
    );
    res.status(200).json({
      status: "sucess",
      message: "Updated Bookmark Data",
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

const deleteBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Bookmark.findByIdAndDelete({ _id: req.body.id });
    res.status(200).json({
      status: "sucess",
      message: "Deleted Bookmark Data",
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

const addBookmarkTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookmark = await Bookmark.findById({ _id: req.body.id });
    if (!bookmark) {
      throw new Error("Not found any Bookmark with this data");
    }
    const { topics }: Pick<IBookMark, "topics"> = req.body;
    const addTopics = await Bookmark.findByIdAndUpdate({ _id: req.body.id }, { topics });

    res.status(200).json({
      status: "sucess",
      message: `Added topic ${topics} to bookmark`,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

const uploadBookmarkImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new Error("No file found");
    }
    const result = await UploadImageToCloudinary(req, res, next);
    if (result.length === 0 && !result.secure_url) {
      throw new Error("Failed to Upload Image");
    }
    if (!req.query.id) {
      throw new Error("Something Went Wrong with bookmark id");
    }
    const bookmark = await Bookmark.findById(req.query.id);
    bookmark.image = result.secure_url;
    await bookmark.save();
    res.status(200).json({
      status: "success",
      message: "Uploaded Image to Cloudinary",
      data: bookmark,
      newImage: bookmark.image,
    });
  } catch (err) {}
};

export {
  createNewBookmark,
  updateBookmark,
  deleteBookmark,
  addBookmarkTopic,
  uploadBookmarkImage,
};
