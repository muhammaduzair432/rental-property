import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app= express()
app.use(cors())

app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("path"))
app.use(cookieParser())
export {app};
import userRouter from "./Routes/user.Routes.js"
app.use("/api/v2/users",userRouter)