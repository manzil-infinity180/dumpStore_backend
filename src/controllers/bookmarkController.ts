import { NextFunction, Request, Response } from "express";
import { Bookmark } from "../models/bookmarkModel.js";
import mongoose, { Error } from "mongoose";
import { type IUser, User } from "../models/userModel.js";

const getBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO : Implement authenication
    const bookmark = await Bookmark.findById(req.body.id);
    res.status(200).json({
      status: "sucess",
      message: "Fetched bookmark data",
      data: bookmark,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

const getAllBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO :  implement req.user and get your bookmark only
    const bookmark = await Bookmark.find();
    res.status(200).json({
      status: "sucess",
      message: "Fetched bookmark data",
      data: bookmark,
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
    if (!title || !link || !tag) {
      throw new Error("Title, Link, Tag is compulsory fields");
    }

    const bookmark = await Bookmark.create(req.body);
    // @ts-ignore
    const user = await User.findById({ _id: req.user._id });
    // console.log("user");
    // @ts-ignore
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
    await Bookmark.findByIdAndDelete({ _id: req.body.id }, req.body);
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

/*
const pushBookmarkToTopics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Bookmark.findByIdAndDelete({ _id: req.body.id }, req.body);
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
*/

export { createNewBookmark, updateBookmark, deleteBookmark };
