import express from "express" ;
import dotenv from "dotenv"
import { startSendOtpConsumer } from "./consumers/otpConsumer.js";
dotenv.config();


startSendOtpConsumer();
const app=express();


app.listen(process.env.PORT,()=>{
  console.log(`Server is running on port ${process.env.PORT}`);
});