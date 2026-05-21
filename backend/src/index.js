import { app } from "./app.js";
import dotenv from "dotenv"
import { connectDB } from "./DataBase/db.js";
import http from "http"; // Built-in Node.js module
import { initializeSocket } from "./utils/socket.js"; // Import your new socket initialization tool
import dns from "dns"

// change dns 
dns.setServers(["1.1.1.1","8.8.8.8"]);

dotenv.config({
    path:'./.env'
})
const server = http.createServer(app);
// Initialize your in-app real-time socket cluster layer
initializeSocket(server);

connectDB ()
.then (()=>{
    server.listen(process.env.PORT||8000, ()=>{
        console.log( `server is running at ${process.env.PORT}`);
        
    })
    app.on('error',()=>{
        console.log('error',error);
        throw error;
        
    })
  
})
.catch((error)=>{
    console.log("mongodb connection failed", error);
    
}
)
