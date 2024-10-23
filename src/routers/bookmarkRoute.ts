import { Router } from "express";
const router = Router();
import {
  addBookmarkTopic,
  createNewBookmark,
  deleteAllBookmarkByTopics,
  deleteBookmark,
  getAllBookMark,
  getAllChromeBookmark,
  getBookMark,
  getBookmarkByTopic,
  getMyProfile,
  searchBookmark,
  updateBookmark,
  updateBookmarkOrder,
  uploadBookmarkImage,
  uploadImageToCloud,
} from "../controllers/bookmarkController.js";
import { isAuthenticated, logout } from "../controllers/authController.js";
import { UploadBookmarkFile, UploadSingleImage } from "../utils/UploadImages.js";
router.use(isAuthenticated);
/** GET  */
router.get("/get-bookmark/:id", getBookMark);
router.get("/get-all-bookmark", getAllBookMark);
router.get("/get-my-profile", getMyProfile);
router.get("/logout", logout);
/** POST */
router.post("/get-bookmark-by-topics", getBookmarkByTopic);
router.post("/create-bookmark", createNewBookmark);
router.post("/search-bookmark", searchBookmark);
router.post("/upload-image-to-cloud", UploadSingleImage, uploadImageToCloud);
router.post("/upload-all-chrome-bookmark", UploadBookmarkFile, getAllChromeBookmark);
/** PATCH */
router.patch("/update-bookmark", updateBookmark);
router.patch("/add-bookmark-topic", addBookmarkTopic);
router.patch("/upload-bookmark-image", UploadSingleImage, uploadBookmarkImage);
router.post("/save-order", updateBookmarkOrder);
/** DELETE */
router.delete("/delete-bookmark/:id", deleteBookmark);
router.delete("/delete-bookmark-by-topics", deleteAllBookmarkByTopics);

export { router };
