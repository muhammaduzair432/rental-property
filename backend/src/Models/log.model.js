import mongoose, { Schema } from "mongoose";

const logSchema = new Schema(
    {
        actionType: {
            type: String,
            required: true // e.g., "USER_REGISTRATION", "PROPERTY_CREATED", "BOOKING_CONFIRMED"
        },
        description: {
            type: String,
            required: true
        },
        performedBy: {
            type: Schema.Types.ObjectId,
            ref: "User" // Tracks down exactly which account triggered the event
        },
        ipAddress: {
            type: String
        }
    },
    { timestamps: true }
);

export const Log = mongoose.model("Log", logSchema);