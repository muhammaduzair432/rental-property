import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app = express();

// Parse allowed origins from .env
const allowedOrigins = process.env.CORS_ORIGIN
  ?.split(",")
  .map((origin) => origin.trim()) || ["http://localhost:5173"];

// 1. React Frontend CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    // 2. THIS IS CRITICAL: Allows cookies to be sent back and forth
    credentials: true,
  })
);

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Routers
import userRouter from "./Routes/user.Routes.js";
import propertyRouter from "./Routes/property.Routes.js";
import bookingRouter from "./Routes/booking.Routes.js";
import adminRouter from "./Routes/admin.Routes.js";

app.use("/api/v2/users", userRouter);
app.use("/api/v2/properties", propertyRouter);
app.use("/api/v2/bookings", bookingRouter);
app.use("/api/v2/admin", adminRouter);

export { app };