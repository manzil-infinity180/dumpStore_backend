import { NextFunction, Request, Response } from "express";
import { Bookmark, IBookMark } from "../models/bookmarkModel.js";
import mongoose, { Error } from "mongoose";
import { type IUser, User } from "../models/userModel.js";
import { UploadImageToCloudinary } from "../utils/UploadImages.js";

const getBookMark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);
    res.status(200).json({
      status: "sucess",
      message: "Bookmark Data Fetched",
      data: bookmark,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};
const getMyProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const user = await User.findById({ _id: req.user._id }).populate("posts");
    res.status(200).json({
      status: "sucess",
      message: "User Data Fetched",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};
const createNewBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, link, tag } = req.body;
    console.log(req.body);
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

    if (req.body.topics) {
      console.log(req.body.topics);
      const result = user.topics.filter((el) => {
        console.log(el);
        return req.body.topic === el;
      });
      console.log(result);
      if (!result) {
        // user.topics.push(req.body.topics);
      }
    }
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
const getAllBookMark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //@ts-ignore
    const allBookmark = await User.findById({ _id: req.user._id }).populate("posts");
    res.status(200).json({
      status: "sucess",
      message: "Updated Bookmark Data",
      data: allBookmark.posts,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

const getBookmarkByTopic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.body.topics);
    //@ts-ignore
    const allBookmark = await Bookmark.find({ topics: req.body.topics });
    res.status(200).json({
      status: "sucess",
      message: "Updated Bookmark Data",
      data: allBookmark,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};
// const getBookMarkByTags = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     //@ts-ignore
//     const allBookmark = await Bookmark.find({ tags: req.body.tags });
//     res.status(200).json({
//       status: "sucess",
//       message: "Updated Bookmark Data",
//       data: allBookmark,
//     });
//   } catch (err) {
//     res.status(400).json({
//       status: "failed",
//       message: (err as Error).message,
//     });
//   }
// };
const updateBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Updatebookmark = await Bookmark.findByIdAndUpdate(
      { _id: req.body.id },
      req.body
    );
    console.log(req.body);
    const x = await Bookmark.findById(req.body.id);
    // @ts-ignore
    const user = await User.findById({ _id: req.user._id });
    // console.log("user");
    console.log(req.body.topics.toLowerCase());
    const { topics } = req.body;
    if (topics as string) {
      console.log(user.topics);
      const result = user.topics.some((el) => {
        return topics.toLowerCase() === el.toLowerCase();
      });
      console.log(result);
      if (!result) {
        user.topics.push(req.body.topics);
        await user.save();
      }
    }

    console.log(x);
    res.status(200).json({
      status: "sucess",
      message: "Updated Bookmark Data",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

const deleteBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Bookmark.findByIdAndDelete(req.params.id);
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

// TODO : get bookmark by topic and set default as all
// TODO : on selecting on any  tag fetch the data only for tag (get data by tag)

export {
  createNewBookmark,
  updateBookmark,
  deleteBookmark,
  addBookmarkTopic,
  uploadBookmarkImage,
  getAllBookMark,
  getBookMark,
  getBookmarkByTopic,
  getMyProfile,
};
