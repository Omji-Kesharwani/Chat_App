import multer from "multer";
import {CloudinaryStorage} from 'multer-storage-cloudinary'
import cloudinary from "../config/cloudinary.js";


const storage = new CloudinaryStorage({
  cloudinary:cloudinary,
  params:{
    folder:"chat-images",
    allowed_formats:["jpg","png","jpeg","gif","webp"],
    transformation:[
      {width:600, height:600, crop:"limit"},
      {quality:60},
      {fetch_format: "webp"}
    ],
  } as any ,
});

export const upload= multer({
  storage,
  limits:{
    fileSize:5*1024*1024,
  },
  fileFilter:(req,file,cb)=>{
    if(file.mimetype.startsWith("image/")){
      cb(null,true);
    }
    else{
      cb(new Error("Only image allowed."));
    }
  }
})