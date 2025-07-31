import mongoose from "mongoose";

const connectDb=async()=>{
  const url=process.env.MONGO_URI;
  if(!url)
  {
    throw new Error("No Mongo URI Provided");
  }
  try{

    await mongoose.connect(url,{
      dbName:"chat_app"
    });

    console.log("Connected to mongodb");

  }
  catch(err){
    console.error("Failed  to connect with db",err);
    process.exit(1);
  }
}

export default connectDb ;