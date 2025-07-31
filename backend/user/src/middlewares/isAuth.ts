import { NextFunction, Request, Response } from "express";
import { IUser } from "../model/User.js";
import jwt, { JwtPayload } from "jsonwebtoken"
export interface AuthenticatedRequest extends Request{
user?:IUser|null;
}

export const isAuth =async(req:AuthenticatedRequest,res:Response,next:NextFunction):Promise<void>=>{
  try{
   const authHeader =req.headers.authorization;
  
   if(!authHeader || !authHeader.startsWith("Bearer "))
   {
    res.status(401).json({
      message:"Please login - no auth header",
    })
    return;
   }

   const token =authHeader.split(" ")[1];

   const decodedToken= jwt.verify(token,process.env.JWT_SECRET as string) as JwtPayload ;

   if(!decodedToken || !decodedToken.user){
    res.status(401).json({
      message:"Invalid Token"
    });
    return;
   }
   
   req.user=decodedToken.user;
   next();
  }
  catch(err)
  {
    res.status(401).json({
      message:"Please Login- Jwt error ",
    })
  }
}