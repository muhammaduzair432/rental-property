import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import propertyReducer from "./propertySlice.js";
import bookingReducer from "./bookingSlice.js"; // 👈 1. Import bookingSlice
import favoriteReducer from "./favoriteSlice.js";
import profileReducer from "./profileSlice.js"
import ownerDashboardReducer from "./ownerDashboardSlice.js"; // 👈 2. Import ownerDashboardSlice
import ownerEarningsReducer from "./ownerEarningsSlice.js"; // 👈 3. Import ownerEarningsSlice
export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer,
    booking: bookingReducer, // 👈 2. Register 'booking' slice
    favorite: favoriteReducer,
    profile: profileReducer,
    ownerDashboard: ownerDashboardReducer,
    ownerEarnings: ownerEarningsReducer // 👈 3. Register 'ownerDashboard' slice
  },
});