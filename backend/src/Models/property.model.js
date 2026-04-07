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

    price: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    images: [
      {
        type: String, // cloudinary URLs
      },
    ],

    amenities: [
      {
        type: String,
      },
    ],

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

export const Property = mongoose.model("Property", propertySchema);