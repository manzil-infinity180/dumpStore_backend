import { Router } from "express";
const router = Router();
import {
  addBookmarkTopic,
  createNewBookmark,
  deleteBookmark,
  updateBookmark,
  uploadBookmarkImage,
} from "../controllers/bookmarkController.js";
import { isAuthenticated } from "../controllers/authController.js";
import { UploadSingleImage } from "../utils/UploadImages.js";
router.use(isAuthenticated);
router.post("/create-bookmark", createNewBookmark);
router.patch("/update-bookmark", updateBookmark);
router.delete("/delete-bookmark", deleteBookmark);
router.patch("/add-bookmark-topic", addBookmarkTopic);
router.patch("/upload-bookmark-image", UploadSingleImage, uploadBookmarkImage);

export { router };
