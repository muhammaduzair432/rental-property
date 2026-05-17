import mongoose, { Schema } from "mongoose";

const favoriteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Speeds up filtering lists for specific users
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
  },
  { timestamps: true }
);

// Production Guard: Composite unique index rules out duplicate data inserts
favoriteSchema.index({ user: 1, property: 1 }, { unique: true });

export const Favorite = mongoose.model("Favorite", favoriteSchema);