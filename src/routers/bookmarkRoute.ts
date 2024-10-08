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
  searchBookmark,
  updateBookmark,
  uploadBookmarkImage,
} from "../controllers/bookmarkController.js";
import { isAuthenticated } from "../controllers/authController.js";
import { UploadSingleImage } from "../utils/UploadImages.js";
router.use(isAuthenticated);
/** GET  */
router.get("/get-bookmark/:id", getBookMark);
router.get("/get-all-bookmark", getAllBookMark);
router.get("/get-my-profile", getMyProfile);
/** POST */
router.post("/get-bookmark-by-topics", getBookmarkByTopic);
router.post("/create-bookmark", createNewBookmark);
router.post("/search-bookmark", searchBookmark);
/** PATCH */
router.patch("/update-bookmark", updateBookmark);
router.patch("/add-bookmark-topic", addBookmarkTopic);
router.patch("/upload-bookmark-image", UploadSingleImage, uploadBookmarkImage);
/** DELETE */
router.delete("/delete-bookmark/:id", deleteBookmark);

export { router };
