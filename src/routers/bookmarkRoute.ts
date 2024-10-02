import { Router } from "express";
const router = Router();
import {
  createNewBookmark,
  deleteBookmark,
  updateBookmark,
} from "../controllers/bookmarkController.js";
import { isAuthenticated } from "../app.js";

// router.get("/bookmark");
// router.get('/all-bookmark', )
router.use(isAuthenticated);
router.post("/create", createNewBookmark);
router.patch("/update", updateBookmark);
router.delete("/delete", deleteBookmark);

export { router };
