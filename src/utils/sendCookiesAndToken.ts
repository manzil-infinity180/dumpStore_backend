import jwt from "jsonwebtoken";
import { IUser } from "../models/userModel.js";
import { Response } from "express";
import mongoose from "mongoose";
const signToken = (id: mongoose.Schema.Types.ObjectId) => {
  console.log(id);
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

export const sendCookiesAndToken = async (user: IUser, res: Response) => {
  console.log("--------user-----------");
  console.log(user);
  if (!user._id) throw new Error("user._id is not found for token");
  console.log(user._id);
  const token = signToken(user._id);
  // storing the token in cookie with the name 'jwt'
  console.log(token);
  await res.cookie("jwt", token, {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    // sameSite: process.env.NODE_ENV === "Development" ? "lax" : "none",
    sameSite: "none",
    // secure : false // development
    secure: true, // prod
  });
};
