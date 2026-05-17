import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: [1, "Rating must be at least 1 star."],
      max: [5, "Rating cannot exceed 5 stars."],
    },
    comment: {
      type: String,
      required: [true, "Comment text is required."],
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensures a single user can leave at most one voluntary review per property listing
reviewSchema.index({ user: 1, property: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);