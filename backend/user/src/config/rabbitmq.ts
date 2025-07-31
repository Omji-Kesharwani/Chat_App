import amqp from "amqplib"

let channel:amqp.Channel;
export const connectRabbitMQ= async()=>{
  try{
     
    const connection = await amqp.connect({
      protocol:"amqp",
      hostname:process.env.Rabbitmq_Hostname,
      port:5672,
      username:process.env.Rabbitmq_Username,
      password:process.env.Rabbitmq_Password
    });

    channel= await connection.createChannel();
    console.log("✅ Connected to RabbitMQ")
  }
  catch(err){
    console.log("Failed to connect to the rabbitmq",err);
    
  }
};

export const publishToQueue =async(queueName:string,message:any)=>{
 if(!channel)
 {
   console.log("Rabbitmq channel is not instantiated yet");
   return;
 }

 await channel.assertQueue(queueName,{
  durable:true
 });

 channel.sendToQueue(queueName,Buffer.from(JSON.stringify(message)),{
  persistent:true
 })
}