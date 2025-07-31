import express from "express"
import dotenv from "dotenv"
import connectDb from "./config/db.js";
import chatRoutes from "./routes/Chat.js";
import cors from "cors"
import { app,server } from "./config/socket.js";
dotenv.config();

const port = process.env.PORT  ;
connectDb();
app.use(express.json())
app.use(cors());
app.use("/api/v1",chatRoutes)
server.listen(port,()=>{
  console.log(`Server is running on port ${port}`);
});