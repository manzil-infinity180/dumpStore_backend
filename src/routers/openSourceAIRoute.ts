import { Router } from "express";
import {
  generateBybart,
  genereatedTagNsummaryByAI,
} from "../controllers/aiEnhancement.js";
const router = Router();
router.post("/get-tags-summary-openai", genereatedTagNsummaryByAI);
router.post("/get-tags-summary-bart", generateBybart);
export { router };
