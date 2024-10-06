import { Router } from "express";
const router = Router();
import {
  addBookmarkTopic,
  createNewBookmark,
  deleteBookmark,
  getAllBookMark,
  getBookMark,
  getBookmarkByTopic,
  getMyProfile,
  updateBookmark,
  uploadBookmarkImage,
} from "../controllers/bookmarkController.js";
import { isAuthenticated } from "../controllers/authController.js";
import { UploadSingleImage } from "../utils/UploadImages.js";
router.use(isAuthenticated);
router.get("/get-bookmark/:id", getBookMark);
router.get("/get-all-bookmark", getAllBookMark);
router.get("/get-bookmark-by-topics", getBookmarkByTopic);
router.get("/get-my-profile", getMyProfile);
router.post("/create-bookmark", createNewBookmark);
router.patch("/update-bookmark", updateBookmark);
router.delete("/delete-bookmark/:id", deleteBookmark);
router.patch("/add-bookmark-topic", addBookmarkTopic);
router.patch("/upload-bookmark-image", UploadSingleImage, uploadBookmarkImage);

export { router };
