import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app = express();

// 1. React Frontend CORS Configuration
app.use(
  cors({
    // Replace with your exact React frontend URL (e.g., http://localhost:5173 for Vite or 3000 for CRA)
    // Best practice: use an environment variable so it adapts to production easily
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", 
    
    // 2. THIS IS CRITICAL: Allows cookies to be sent back and forth
    credentials: true, 
  })
);

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added 'extended: true' to fix Express warnings
app.use(express.static("public")); // Changed "path" to "public" as a standard folder name
app.use(cookieParser());

export { app };

// Routers
import userRouter from "./Routes/user.Routes.js";
import propertyRouter from "./Routes/property.Routes.js";
import bookingRouter from "./Routes/booking.Routes.js";
import adminRouter from "./Routes/admin.Routes.js";

app.use("/api/v2/users", userRouter);
app.use("/api/v2/properties", propertyRouter);
app.use("/api/v2/bookings", bookingRouter);
app.use("/api/v2/admin", adminRouter);