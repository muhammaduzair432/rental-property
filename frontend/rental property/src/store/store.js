import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice.js";
import propertyReducer from "./propertySlice.js"; // 👈 1. Import propertySlice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer, // 👈 2. Add 'properties' key here exactly!
  },
});