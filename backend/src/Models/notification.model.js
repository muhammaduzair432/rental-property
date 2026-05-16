import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);