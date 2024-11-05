import { Router } from "express";
const router = Router();
import passport from "passport";
import "../controllers/authController.js";
import { type IUser } from "../models/userModel.js";

// Google Router
router.get("/google", passport.authenticate("google", { scope: ["profile", "email", "https://www.googleapis.com/auth/calendar"] }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/login/success",
    failureRedirect: "/login/fail",
  })
);

// Github Router
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", {
    successReturnToOrRedirect: "/login/success",
    failureRedirect: "/login/fail",
  })
);

// twitter router 
router.get("/twitter", passport.authenticate("twitter"));
router.get(
  "/twitter/callback",
  passport.authenticate("twitter", {
    successReturnToOrRedirect: "/login/twitter/success",
    failureRedirect: "/login/fail",
  })
);

export { router };
