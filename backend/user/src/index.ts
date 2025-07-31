import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import {createClient} from 'redis';
import userRoutes from "./routes/User.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";
import cors from "cors";




dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
connectDb();

connectRabbitMQ();

export const redisClient = createClient({
  url:process.env.REDIS_URL,
})


redisClient.connect()
.then(()=>console.log("connected to redis"))
.catch(console.error)
const port =process.env.PORT || 5000;

app.use("/api/v1",userRoutes);

app.listen(port,()=>{
  console.log(`Server is running on ${port}`);
})
