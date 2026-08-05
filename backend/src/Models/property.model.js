import mongoose, { Schema } from "mongoose";

const propertySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      default: "house",
      enum: ["house", "apartment", "villa"], // 👈 Officially restricts and validates types
      lowercase: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String, // Primary cover image fallback
    },

    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],

    amenities: [
      {
        type: String,
      },
    ],

    image: {
      type: String, // Primary cover image fallback
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ⚡ Add an index to make type-based searches lightning fast on MongoDB
propertySchema.index({ type: 1, location: 1, price: 1 });

export const Property = mongoose.model("Property", propertySchema);