import { app } from "./app.js";
import dotenv from "dotenv"
import { connectDB } from "./DataBase/db.js";
import dns from "dns"

// change dns 
dns.setServers(["1.1.1.1","8.8.8.8"]);

dotenv.config({
    path:'./.env'
})
connectDB ()
.then (()=>{
    app.listen(process.env.PORT||8000, ()=>{
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
