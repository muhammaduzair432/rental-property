import { app } from "./app.js";
import dotenv from "dotenv"
import { connectDB } from "./DataBase/db.js";
import dns from "dns"

// change dns 
dns.setServers(["1.1.1.1","8.8.8.8"]);

dotenv.config({
    path:'./.env'
})

// Initialize DB (connection caching happens in db.js)
connectDB()
  .then(() => console.log("DB connection initiated"))
  .catch((error) => console.log("mongodb connection failed", error));

export default app;
