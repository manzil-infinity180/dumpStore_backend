import { Router } from "express";
import { stripePaymentIntent } from "../controllers/paymentController.js";
const router = Router();

router.post("/create-payment-intent", stripePaymentIntent);
export { router };
