import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import propertyReducer from "./propertySlice.js";
import bookingReducer from "./bookingSlice.js"; // 👈 1. Import bookingSlice
import favoriteReducer from "./favoriteSlice.js";
import profileReducer from "./profileSlice.js"
import ownerDashboardReducer from "./ownerDashboardSlice.js"; // 👈 2. Import ownerDashboardSlice
import ownerEarningsReducer from "./ownerEarningsSlice.js"; // 👈 3. Import ownerEarningsSlice
import ownerReviewsReducer from "./ownerReviewsSlice.js";
import adminReducer from "./adminSlice.js";
import notificationsReducer from "./notificationsSlice.js"; // 👈 4. Import notificationsSlice
export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer,
    booking: bookingReducer, // 👈 2. Register 'booking' slice
    favorite: favoriteReducer,
    profile: profileReducer,
    ownerDashboard: ownerDashboardReducer,
    ownerEarnings: ownerEarningsReducer, // 👈 3. Register 'ownerEarnings' slice
    ownerReviews: ownerReviewsReducer,
    admin: adminReducer,
    notifications: notificationsReducer, // 👈 4. Register 'notifications' slice
  },
});