import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GithubStrategy } from "passport-github2";
import { IUser, User } from "../models/userModel.js";
import mongoose from "mongoose";

// Passport serialization
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

passport.deserializeUser(function (
  user: Express.User & { _id: mongoose.Types.ObjectId },
  cb
) {
  process.nextTick(function () {
    return cb(null, user);
  });
});
let req: Request;
// Google Strategy
const clientID = process.env.GOOGLE_CLIENT_ID_NEW;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET_NEW;
const github_clientID = process.env.GITHUB_CLIENT_ID;
const github_clientSecret = process.env.GITHUB_CLIENT_SECRET;
if (!clientID || !clientSecret) {
  throw new Error("Something wrong with Google Client Id and Secret");
} else if (!github_clientID || !github_clientSecret) {
  throw new Error("Something wrong with Github Client Id and Secret");
}
passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: "/auth/google/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void
    ) => {
      // Here you would typically find or create a user in your database

      // TODO : Is user existed or not
      const user: Pick<IUser, "id" | "displayName" | "emails" | "photos" | "provider"> = {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile._json.email,
        photos: profile._json.picture,
        provider: "google",
      };
      const alreadyExistedUser = await User.findOne({
        emails: user.emails,
      });
      if (alreadyExistedUser) {
        return done(null, alreadyExistedUser);
      }
      //   TODO : Check is _id field is required ?
      const newUser = new User(user);
      await newUser.save();
      return done(null, newUser);
    }
  )
);

// Github
passport.use(
  new GithubStrategy(
    {
      clientID: github_clientID,
      clientSecret: github_clientSecret,
      callbackURL: "/auth/github/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: (error: any, user?: any) => void
    ) => {
      const user: Pick<IUser, "id" | "displayName" | "emails" | "photos" | "provider"> = {
        id: profile.id,
        displayName: profile.displayName || profile.username,
        emails: profile._json.email,
        photos: profile._json.avatar_url,
        provider: "github",
      };

      const alreadyExistedUser = await User.findOne({
        emails: user.emails,
      });
      if (alreadyExistedUser) {
        return done(null, alreadyExistedUser);
      }
      console.log("From Github");
      //   TODO : Check is _id field is required ?
      const newUser = new User(user);
      await newUser.save();
      return done(null, newUser);
    }
  )
);

/**
 * User interface we defined and the Express.User type expected by Passport.
 * In the strategy callbacks, we've updated the done function's type to explicitly use Express.User.
 */
// passport.serializeUser((user, done) => {
//   done(null, user);
// });

// passport.deserializeUser((user: Express.User ,done) => {
//   done(null, user);
// });
export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;
    if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }
    if (!token) {
      throw new Error("OOPs, Firstly you have to logined in !!");
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
    console.log(decode);
    const currentloginedUser = await User.findById(decode.id);
    req.user = currentloginedUser;
    next();
  } catch (err) {
    res.status(400).json({
      status: "failed",
      message: (err as Error).message,
    });
  }
};
