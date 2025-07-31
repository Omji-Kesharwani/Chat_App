import TryCatch from "../config/TryCatch.js";
import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Messages.js";
import axios, { create } from "axios";
import { getRecieverSocketId, io } from "../config/socket.js";

export const createNewChat=TryCatch(async(req:AuthenticatedRequest,res:Response)=>{
  const userId = req.user?._id ;
  const {otherUserId} =req.body;
  if(!otherUserId)
  {
    res.status(400).json({
      message:"Other userId is required .",
    });
  }

  const existingChat = await Chat.findOne({
    users:{$all:[userId,otherUserId],$size:2}
  });

   if(existingChat){
    res.json({
      message:"This chat already exist .",
      chatId:existingChat._id ,
    });
    return;
   }
   
   const newChat = await Chat.create({
    users:[userId,otherUserId],
   }) ;
   res.status(201).json({
    message:"New chat created",
    chatId:newChat._id,
   })
})

export const getAllChats =TryCatch(async(req:AuthenticatedRequest,res:Response)=>{
 const userId =req.user?._id;
 if(!userId)
 {
   res.status(400).json({message:"User id is required ."})
   return;
 }

 const chats = await Chat.find({users:userId}).sort({updatedAt:-1})

 const chatWithUserData =await Promise.all(
  chats.map(async(chat)=>{
    const otherUserId =chat.users.find((id)=> id!==userId)
    const unseenCount =await Messages. countDocuments({
     chatId:chat._id,
     sender:{$ne:userId},
     seen:false,
 });

     try{
        const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);

        return{
          user:data,
          chat:{
            ...chat.toObject(),
            latestMessage:chat.latestMessage || null ,
            unseenCount,
          },
        };
     }
     catch(err){
     console.log(err);
     return{
      user:{_id:otherUserId,name:"Unknown User"},
       chat:{
            ...chat.toObject(),
            latestMessage:chat.latestMessage || null ,
            unseenCount,
          },
     }
     }
  })
 );

 res.json({
  chats:chatWithUserData
 })

})


export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;
  const imageFile = req.file;

   if(!senderId)
   {
    res.status(401).json({
      message:"Unauthorized",
    });
    return;
   }
  if (!chatId) {
    res.status(400).json({ message: "chatId is required." });
    return;
  }

  if(!text && !imageFile)
  {
     res.status(400).json({ message: " Either text or image is required." });
    return;
  }

  const chat =await Chat.findById(chatId);
  if(!chat)
  {
    res.status(404).json({
      message:"Chat not found",
    });
    return;
  }
  const isUserInChat =chat.users.some((userId)=> userId.toString()===senderId.toString()
);

if(!isUserInChat)
{
  res.status(403).json({
    message:"You are not participant of this chat",
  });
  return;
}

const otherUserId =chat.users.find((userId)=>userId.toString()!==senderId.toString());

if(!otherUserId)
   {
    res.status(401).json({
      message:"No other user",
    });
    return;
   }

   const recieverSocketId=getRecieverSocketId(otherUserId.toString())

   let isRecieverInChatRoom = false

   if(recieverSocketId){
     const recieverSocket = io.sockets.sockets.get(recieverSocketId)

     if(recieverSocket && recieverSocket.rooms.has(chatId) ){
      isRecieverInChatRoom =true;
     }
   }

  // Prepare message data
  const messageData: any = {
    chatId,
    sender: senderId,
    text: text || "",
    seen: isRecieverInChatRoom,
    seenAt:isRecieverInChatRoom? new Date() :undefined,
  };

  if (imageFile) {
    // Assuming you store the image and save its path/url
    messageData.image = {
      url:imageFile.path,
      publicId:imageFile.filename
    };

    messageData.messageType="image";
    messageData.text=text||"";
  }
  else{
    messageData.text=text;
    messageData.messageType="text";
  }

  // Create the message
  const message = new Messages(messageData);
   const savedMessage =await message.save();

   const latestMessageText = imageFile ?"📷 Image":text
 

  await Chat.findByIdAndUpdate(chatId,
    { latestMessage:{
       text:latestMessageText,
       sender:senderId
    } ,
    updatedAt:new Date(),

  },{new:true});

  io.to(chatId).emit("newMessage",savedMessage)
  if(recieverSocketId){
    io.to(recieverSocketId).emit("newMessage",savedMessage);
  }

  const senderSocketId= getRecieverSocketId(senderId.toString());

  if(senderSocketId){
    io.to(senderSocketId).emit("newMessage",savedMessage);
  }

  if(isRecieverInChatRoom && senderSocketId)
  {
    io.to(senderSocketId).emit("messagesSeen",{
      chatId:chatId,
      seenBy:otherUserId,
      messageIds:[savedMessage._id]
    })
  }
  res.status(201).json({
    message: savedMessage,
   sender: senderId,
  });
});

export const getMessagesByChat = TryCatch(async(req:AuthenticatedRequest,res)=>{
  const userId = req.user?._id;
  const { chatId } = req.params;

   if(!chatId)
 	{
	 res.status(400).json({message:"Chat id is required."})
   return;
  }

   if(!userId)
 	{
	 res.status(401).json({message:"Unauthorized"})
   return;
  }

  const chat = await Chat.findById(chatId)

   if(!chat)
 	{
	 res.status(404).json({message:"Chat not found"})
   return;
  }

   const isUserInChat =chat.users.some((userId)=> userId.toString()===userId.toString()
);

if(!isUserInChat)
{
  res.status(403).json({
    message:"You are not participant of this chat",
  });
  return;
}

const messagesToMarkSeen = await Messages.find({
  chatId:chatId,
  sender:{$ne:userId},
  seen:false,
});

await Messages.updateMany({
  chatId:chatId,
  sender:{$ne:userId},
  seen:false,
},{
  seen:true,
  seenAt:new Date(),
 }
);


const messages = await Messages.find({chatId}).sort({createdAt:-1}) ;

const otherUserId = chat.users.find((id)=>id !== userId);

try{
 const {data} = await axios.get(
  `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
 );

 if(!otherUserId)
 {
  res.status(400).json({message:"Other user not found",data:data})
  return;
 }

 if(messagesToMarkSeen.length >0){
  const otherUserSocketId = getRecieverSocketId(otherUserId.toString())
  
  if(otherUserSocketId)
  {
    io.to(otherUserSocketId).emit("messagesSeen",{
      chatId:chatId,
      seenBy:userId,
      messages:messagesToMarkSeen.map((msg)=>msg._id)
    })
  }
}
 res.json({
  messages,
  user:data,
 });
}
catch(err){
 console.log(err);
 res.json({
  messages,
  user:{
    _id:otherUserId,
    name:"Unknown User"
  }
 })
}

}
);