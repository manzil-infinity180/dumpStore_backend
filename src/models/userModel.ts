import mongoose, { Schema, model } from "mongoose";
// Define a User interface
export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  id: string;
  displayName: string;
  emails?: { value: string };
  photos?: { value: string };
  provider: string;
  posts?: Schema.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  id: {
    type: String,
    required: [true, "Required field"],
  },
  displayName: {
    type: String,
    required: [true, "Display Name is required field"],
  },
  emails: {
    type: String,
  },
  photos: {
    type: String,
  },
  provider: {
    type: String,
    enum: ["google", "github"],
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Bookmark",
    },
  ],
});

export const User = model<IUser>("User", userSchema);
