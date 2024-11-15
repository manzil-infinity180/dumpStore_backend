import dotenv from 'dotenv'
dotenv.config();
import { NextFunction, Request, Response } from "express";
import { Bookmark, IBookMark } from "../models/bookmarkModel.js";
import mongoose, { Error } from "mongoose";
import { type IUser, User } from "../models/userModel.js";
import { UploadImageToCloudinary } from "../utils/UploadImages.js";
// const { google } = require("googleapis");
import * as cheerio from "cheerio"
import { google } from "googleapis";
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
    console.log(req.user);
    //@ts-ignore
    const user = await User.findById({ _id: req.user._id }).populate("posts");
    console.log(user)
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
    const { title, link, tag, calendar } = req.body;
    console.log(calendar);
    console.log(req.body);
    if (!title || !link || !tag) {
      throw new Error("Title, Link, Tag is compulsory fields");
    }
    // TODO : Image Upload Implementation and try to fix the image size(or pixel) before uploading to cloudinary or any other platform
    const domain = new URL(link).hostname;
    if (!process.env.LOGO_FAVICON_URL) throw new Error("Favicon URl is invalid");
    let favicon = process.env.LOGO_FAVICON_URL.replace("<DOMAIN>", domain);
    if (req.body.image?.length > 0) {
      favicon = req.body.image;
    }
    //@ts-ignore
    const user = await User.findById({ _id: req.user._id });
    console.log(user.posts);
    // TODO : if req.file is existed (manual logo) then you need to omit/override the image
    const bookmarkBody: IBookMark = {
      title,
      link,
      tag,
      image: favicon,
      user_id: user._id, // it should be _id not google/github generated id
      position: user.posts?.length + 1,
      ...req.body,
    };
    const bookmark = await Bookmark.create(bookmarkBody);

    // console.log("user");
    user.posts.push(bookmark._id);

    if (req.body.topics) {
      console.log(req.body.topics);
      console.log(typeof req.body.topics);
      const result = user.topics.find(
        (el) => req.body.topics.toLowerCase() == el.toLowerCase()
      );
      console.log(result);
      if (!result) {
        user.topics.push(req.body.topics);
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
/**
 * Getting data now, from Bookmark Model not from User post array
 */
const getAllBookMark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //@ts-ignore
    const allBookmark = await Bookmark.find({ user_id: req.user._id });
    res.status(200).json({
      status: "sucess",
      message: "User all Bookmark Data",
      data: allBookmark,
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
    const user = await User.findById(req.user._id);
    const allBookmark = await Bookmark.find({
      topics: req.body.topics,
      user_id: user._id,
    });
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
    // const { isChecked, image } = req.body;
    console.log(req.body);
    const { isChecked, image, topics } = req.body;
    console.log(isChecked);
    if (isChecked && isChecked.toLowerCase() === "yes" && image.includes("cloudinary")) {
      const domain = new URL(req.body.link).hostname;
      if (!process.env.LOGO_FAVICON_URL) throw new Error("Favicon URl is invalid");
      const favicon = process.env.LOGO_FAVICON_URL.replace("<DOMAIN>", domain);
      req.body.image = favicon;
      console.log(req.body);
    }

    const Updatebookmark = await Bookmark.findByIdAndUpdate(
      { _id: req.body.id },
      req.body
    );
    console.log(req.body);
    const x = await Bookmark.findById(req.body.id);
    // @ts-ignore
    const user = await User.findById({ _id: req.user._id });
    // console.log("user");
    if (topics !== undefined && topics.length) {
      console.log(topics);
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

const updateBookmarkOrder = async (req: Request, res: Response) => {
  const { updatedOrder } = req.body;
  console.log(updatedOrder);
  try {
    for (let item of updatedOrder) {
      const { _id: _, ...rest } = item;
      console.log(rest);
      await Bookmark.findByIdAndUpdate(item._id, rest);
    }
    res.status(200).json({
      status: "success",
      data: "Order Successfully Saved",
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).send("Failed to update order");
  }
};

const deleteBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Bookmark.findByIdAndDelete(req.params.id);
    //@ts-ignore
    const user = await User.findById({ _id: req.user._id });
    //@ts-ignore
    const filterOrder = user.posts.filter((el) => !el._id.equals(req.params.id));
    let newpost: Array<mongoose.Schema.Types.ObjectId> = [];
    //@ts-ignore
    filterOrder.map((el) => newpost.push(el._id));
    user.posts = newpost;
    user.save();
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
const deleteAllBookmarkByTopics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topics } = req.body;
    //@ts-ignore
    const user = await User.findById(req.user._id);
    await Bookmark.deleteMany({ topics, user_id: user._id });
    //@ts-ignore
    // const user = await User.findById({ _id: req.user._id });
    let alltopics = user.topics;
    if (alltopics.length) {
      const filterTopics = alltopics.filter(
        (el) => el.toLowerCase() !== topics.toLowerCase()
      );
      user.topics = filterTopics;
      await user.save();
    }

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
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

const uploadImageToCloud = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new Error("No file found");
    }
    const result = await UploadImageToCloudinary(req, res, next);
    if (result.length === 0 && !result.secure_url) {
      throw new Error("Failed to Upload Image");
    }
    console.log(result);
    res.status(200).json({
      status: "success",
      data: { imageUrl: result.secure_url },
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};
export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_CALENDAR
);
const addRemainderToCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {summary, link, endDate, startDate} = req.body;
    console.log(req.body);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const event = {
      summary: summary,
      description: `As you added remainder for this link ${link}`,
      start: {
        dateTime: startDate,
        timeZone: "UTC",
      },
      end: {
        dateTime: endDate,
        timeZone: "UTC",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 }, // Reminder 30 minutes before
          { method: "email", minutes: 60 * 24 }, // Email reminder a day before
        ],
      },
    };
    console.log(event);
    const result = await calendar.events.insert({
      calendarId: "primary", // Use the primary calendar of the user
      requestBody: event,
    });
    const {kind, etag, id, htmlLink} = result.data
    res.status(200).json({
      status: "success",
      data: {
        kind, etag, id, htmlLink, ...event
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};
const updateRemainderToCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // bookmarkId - I am getting it from directly from frontend side just for bookmark Query
    const {summary, link, endDate, startDate, eventId, bookmarkId} = req.body;
    if(!eventId){
      throw new Error("EventId is missing");
    }
    console.log(req.body);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const event = {
      summary: summary,
      description: `As you added remainder for this link ${link}`,
      start: {
        dateTime: startDate,
        timeZone: "UTC",
      },
      end: {
        dateTime: endDate,
        timeZone: "UTC",
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 30 }, // Reminder 30 minutes before
          { method: "email", minutes: 60 * 24 }, // Email reminder a day before
        ],
      },
    };
    console.log(event);
    const result = await calendar.events.patch({
      calendarId: "primary", // Use the primary calendar of the user
      requestBody: event,
      eventId:eventId
    });
    const {kind, id, htmlLink} = result.data
    const calendarData = {
      kind,
      id,
      htmlLink,
      summary,
      description: event.description,
      start : event.start.dateTime,
      end: event.end.dateTime,
    }
    const bookmarkCalendarData = await Bookmark.findById({_id: bookmarkId});
    bookmarkCalendarData.calendar = calendarData;
    bookmarkCalendarData.save();

    res.status(200).json({
      status: "success",
      data: {
        kind, id, htmlLink, ...event
      },
      message:"Updated Your Remainder"
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};

const deleteRemainder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // bookmarkId - getting it from frontend side
    const {eventId, bookmarkId} = req.body;
    if(!eventId){
      throw new Error("EventId is missing");
    }
    console.log(req.body);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const result = await calendar.events.delete({
      calendarId: "primary", // Use the primary calendar of the user
      eventId: eventId
    });
    const bookmarkCalendarData = await Bookmark.updateOne({_id: bookmarkId}, {
      $unset:{calendar: ""}
    });
    res.status(200).json({
      status: "success",
      message:"Deleted remainder successfully"
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};


const searchBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { searchField } = req.body;
    if (!searchField) {
      throw new Error("Invalid Search Field");
    }
    const result: IBookMark[] = await Bookmark.aggregate([
      {
        $search: {
          index: "default",
          text: {
            query: searchField,
            // path: ["title", "topics", "tag", "link"],
            fuzzy: { maxEdits: 1, prefixLength: 1, maxExpansions: 256 },
            path: {
              wildcard: "*",
            },
          },
        },
      },
    ]);
    console.log(result);

    res.status(200).json({
      status: "success",
      message: "Uploaded Image to Cloudinary",
      length: result.length,
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};
const getAllChromeBookmark = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    console.log(file);
    if (!file) {
      throw new Error("No file received");
    }
    if (file.mimetype != "text/html") {
      throw new Error("Only html files is accepted");
    }
    const fileRead = Buffer.from(req.file.buffer).toString("utf-8");
    if (!fileRead) {
      throw new Error("Getting issues while reading file");
    }
    const $ = cheerio.load(fileRead);
    const user = await User.findById(req.user);
    const bookmarks: Partial<IBookMark>[] = [];
    let position = user.posts.length + 1;
    $("a").each((i, elem) => {
      const title = $(elem).text();
      const link = $(elem).attr("href");
      const domain = new URL(link).hostname;
      if (!process.env.LOGO_FAVICON_URL) throw new Error("Favicon URl is invalid");
      const image = process.env.LOGO_FAVICON_URL.replace("<DOMAIN>", domain);
      const bookmark_object = {
        title,
        link,
        tag: "chrome",
        topics: "chrome",
        image,
        position: position + i,
        topics_position: i,
        user_id: user._id,
      };

      bookmarks.push(bookmark_object);
    });

    // console.log(bookmarks.slice(0, 5));
    const uploadBookmark = await Bookmark.insertMany(bookmarks);
    console.log(uploadBookmark);
    if (!uploadBookmark) {
      throw new Error("Getting issue while uploading to database");
    }
    // user.posts.push(bookmark._id);
    // uploadBookmark.forEach((el) => {
    //   user.posts.push(el._id);
    // });

    const result = user.topics.find(
      (el) => "chrome".toLowerCase() == el.toLowerCase()
    );
    console.log(result);
    if (!result) {
      user.topics.push("chrome");
    }
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Uploaded bro",
      totalBookmarkInserted: uploadBookmark.length,
      // allBookmark: bookmarks,
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: (error as Error).message,
    });
  }
};

const getAllChromeBookmarkFromExtension =async (req: Request, res: Response, next: NextFunction) => {
  try{
    const user = await User.findById(req.user);
    
    const {allbookmark} = req.body;
    // if(allbookmark.length >= 1){
    //   throw new Error("No data arrived");
    // }
    const x : Partial<IBookMark>[] = allbookmark
    console.log(x);
    // console.log(allbookmark);
    const uploadBookmark = await Bookmark.insertMany(allbookmark as Partial<IBookMark>[]);
    const result = user.topics.find(
      (el) => "chrome".toLowerCase() == el.toLowerCase()
    );
    console.log(result);
    if (!result) {
      user.topics.push("chrome");
    }
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Uploaded bro",
      totalBookmarkInserted: uploadBookmark.length,
      // allBookmark: bookmarks,
    });
  }catch(err){
      res.status(400).json({
          status: "failed",
          message: (err as Error).message,
      });
  }
}
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
  searchBookmark,
  deleteAllBookmarkByTopics,
  uploadImageToCloud,
  updateBookmarkOrder,
  getAllChromeBookmark,
  addRemainderToCalendar,
  updateRemainderToCalendar,
  deleteRemainder,
  getAllChromeBookmarkFromExtension
};
