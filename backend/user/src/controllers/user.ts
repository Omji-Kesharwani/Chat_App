import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import User from "../model/User.js";

export const loginUser =TryCatch(async(req,res)=>{

  const {email}= req.body
  const rateLimitKey =`otp:ratelimit:${email}`
  const rateLimit =await redisClient.get(rateLimitKey)
  if(rateLimit)
  {
    res.status(429).json({
      messsage:"Too many requests .Please wait before requesting for new otp."
    });
    return ;
  }

  const otp=Math.floor(100000+Math.random()*900000).toString();

  const otpKey=`otp:${email}`;

  await redisClient.set(otpKey,otp,{
    EX:300,
  })

  await redisClient.set(rateLimitKey,"true",{
    EX:60,
  });

  const message ={
    to:email,
    subject:"Your otp code",
    body:`Your OTP is ${otp}.`,
  }

  await publishToQueue("send-otp",message)

  res.status(200).json({
    message:"OTP sent to your mail"
  })
})

export const verifyUser=TryCatch(async(req,res)=>{
 const {email,otp:enteredOtp} = req.body;

 if(!email || !enteredOtp)
 {
  res.status(400).json({
    message:"Email and OTP Required",
  });
  return;
 }

 const otpKey=`otp:${email}`;
 const storedOtp=await redisClient.get(otpKey);
 if(!storedOtp || storedOtp!==enteredOtp)
 {
  res.status(400).json({
  message:"Entered OTP is not correct",
  })
  return;
 }

 await redisClient.del(otpKey);
 let user=await User.findOne({email});

 if(!user){
  const name=email.slice(0,8);
  user=await User.create({name,email});
 }

 const token =generateToken(user);

 res.json({
  message:"User verified",
  user,
  token
 })
})

export const myProfile =TryCatch(async(req:AuthenticatedRequest,res)=>{
  const user =req.user ;
  res.json(user);
})


export const updateName=TryCatch(async(req:AuthenticatedRequest,res)=>{
  const user = await User.findById(req.user?._id);

  if (!user) {
    res.status(401).json({
      message: "Please Login",
    });
    return;
  }

  const { name } = req.body;
  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({
      message: "A valid name is required",
    });
    return;
  }

  user.name = name.trim();
  await user.save();

  const token = generateToken(user);
  res.json({
    message: "User updated successfully",
    user,
    token,
  });
})

export const getAllUsers = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const users =  await User.find();

  res.json(users);
});

export const getAUser = TryCatch(async(req,res)=>{
  const user = await User.findById(req.params.id);

  res.json(user);
})