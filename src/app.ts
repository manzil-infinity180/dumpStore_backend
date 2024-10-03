import express, { NextFunction, Request, Response } from "express";
export const app = express();
import CookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { router as AuthRouter } from "./routers/authRoute.js";
import { router as BookmarkRouter } from "./routers/bookmarkRoute.js";
import { IUser } from "./models/userModel.js";
import { sendCookiesAndToken } from "./utils/sendCookiesAndToken.js";
import { isAuthenticated } from "./controllers/authController.js";

app.use(CookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
    credentials: true,
  })
);

if (!process.env.SESSION_SECRET) {
  throw new Error("Express Session for Passport is Invalid");
}

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.authenticate("session"));
app.use("/auth", AuthRouter);
app.use("/api", BookmarkRouter);
app.get("/", (req: Request, res: Response) => {
  res.send("Server is Up and Running");
});
// login success router

app.get("/login/success", async (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    const user = req.user as IUser;
    console.log(req.user);
    await sendCookiesAndToken(user, res);
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
});
app.get("/login/hello", isAuthenticated, (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    const user = req.user as IUser;
    console.log(req.user);
    res.send(`Welcome ${user.displayName}`);
  } else {
    res.redirect("/login");
  }
});
