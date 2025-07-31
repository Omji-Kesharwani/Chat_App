"use client"
import ChatSidebar from '@/components/ChatSidebar';
import Loading from '@/components/Loading';
import { chat_service, useAppData, User, user_service } from '@/context/AppContext'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';
import ChatHeader from '@/components/ChatHeader';
import ChatMessages from '@/components/ChatMessages';
import MessageInput from '@/components/MessageInput';
import { SocketData } from '@/context/SocketContext';

export interface Message{
  _id:string;
  chatId:string;
  sender:string;
  text?:string;
  image?:{
    url:string;
    publicId:string;
  };
  messageType:"text"|"image";
  seen:boolean;
  seenAt?: string;
  createdAt:string;
}
const ChatApp = () => {
  const { 
     loading,
     isAuth ,
     logoutUser,
     chats,
     user:loggedInUser,
     users,
     fetchChats,
     setChats} = useAppData();

  const {onlineUsers , socket}=SocketData()
  console.log(onlineUsers)

  const [selectedUser,setSelectedUser]=useState<string|null>(null);
  const[message,setMessage]=useState("");
  const [sidebarOpen,setSidebarOpen]=useState<boolean>(false);
  const [messages,setMessages]=useState<Message[]|null>(null);
  const [user,setUser]=useState<User|null>(null);
  const [showAllUser,setShowAllUser]=useState(false);
  const [isTyping,setIsTyping]=useState(false);
  const [typingTimeOut,setTypingTimeOut]=useState<NodeJS.Timeout | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  useEffect(() => {
    if (selectedUser) {
      fetchChat();
      setIsTyping(false)

      resetUnseenCount(selectedUser);~

      console.log("Joining chat room:", selectedUser);
      socket?.emit("joinChat", selectedUser);

      return()=>{
        console.log("Leaving chat room:", selectedUser);
        socket?.emit("leaveChat",selectedUser)
      };
    }
    // eslint-disable-next-line
  }, [selectedUser,socket]);

  useEffect(()=>{
    return ()=>{
      if(typingTimeOut){
        clearTimeout(typingTimeOut)
      }
    }
  },[typingTimeOut])

  useEffect(()=>{


    if (!socket || !selectedUser) return;
    
    socket?.on("newMessage",(message)=>{
      console.log('Recieved new message :',message);

      if(selectedUser === message.chatId){
        setMessages((prev)=>{
          const currentMessages= prev || [];
          const messageExit =currentMessages.some(
            (msg)=>msg._id===message._id
          ) 

          if(!messageExit)
          {
            return [...currentMessages,message]
          }
          return currentMessages
        });
        moveChatToTop(message.chatId,message,false)
      }
      else{
        moveChatToTop(message.chatId,message,true);
      }
    });


    socket?.on("messagesSeen",(data)=>{
      console.log("Message seen by:",data);

      if(selectedUser === data.chatId)
      {
        setMessages((prev)=>{
          if(!prev) return null ;

          return prev.map((msg)=>{
            if(msg.sender === loggedInUser?._id && data.messageIds && data.messageIds.includes(msg._id)){
              return{
                ...msg,
                seen:true,
                seenAt:new Date().toString()
              }
            }
            else if(msg.sender===loggedInUser?._id && !data.messageIds){
              return{
                  ...msg,
                seen:true,
                seenAt:new Date().toString()
              }
            }
            return msg ;
          })
        })
      }
    })
    console.log("Setting up typing event listeners for chat:", selectedUser);
    

    socket.on("userTyping",(data)=>{
      console.log("Received userTyping event:", data);
      if(data.chatId === selectedUser && data.userId !== loggedInUser?._id)
      {
        console.log("Setting isTyping to true");
        setIsTyping(true);
      }
    })
    
    socket.on("userStoppedTyping",(data)=>{
      console.log("Received userStoppedTyping event:", data);
      if(data.chatId === selectedUser && data.userId !== loggedInUser?._id)
      {
        console.log("Setting isTyping to false");
        setIsTyping(false);
      }
    })

    return ()=>{
      console.log("Cleaning up typing event listeners");
      socket?.off("messagesSeen")
      socket?.off("newMessage")
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
    }
  },[socket,selectedUser,loggedInUser?._id,setChats])

  // Show loading while checking authentication
  if (loading) {
    return <Loading />;
  }

  // If not authenticated after loading, don't render anything (will redirect)
  if (!isAuth) {
    return null;
  }

  // User is authenticated, show chat page

  const handleLogout =()=>logoutUser();

  async function fetchChat(){
    const token = Cookies.get("token")
    try{
      const {data}=await axios.get(`${chat_service}/api/v1/message/${selectedUser}`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );
    setMessages(data.messages);
    setUser(data.user);
    await fetchChats();
    }
    catch(err){
      console.log(err);
      toast.error("Failed to load the messages");
    }
  }

  const moveChatToTop = (chatId:string,newMessage:any,updatedUnseenCount=true)=>{
    setChats((prev)=>{
      if(!prev) return null;

      const updatedChats = [...prev]
      const chatIndex = updatedChats.findIndex(
        chat=>chat.chat._id===chatId
      ); 

      if(chatIndex!==-1){
        const [moveChat]=updatedChats.splice(chatIndex,1);
        const updatedChat = {
          ...moveChat,
          chat:{
            ...moveChat.chat,
            latestMessage:{
              text:newMessage.text,
              sender:newMessage.sender
            },
            updatedAt: new Date().toString(),

            unseenCount:updatedUnseenCount && newMessage.sender !== loggedInUser?._id ?(moveChat.chat.unseenCount || 0)+1 : moveChat.chat.unseenCount || 0,
          },
        };

        updatedChats.unshift(updatedChat)
      }
      return  updatedChats ;
      });
  };


  const resetUnseenCount =(chatId:string)=>{
    setChats((prev)=>{
      if(!prev) return null ;

      return prev.map((chat)=>{
        if(chat.chat._id ===chatId){
          return {
            ...chat,
            chat:{
              ...chat.chat,
              unseenCount:0
            }
          }
        }
        return chat ;
      })
    })
  }
  async function createChat(u:User){
    try{
  const token =Cookies.get("token");
  const {data}=await axios.post(`${chat_service}/api/v1/chat/new`,{
    userId: loggedInUser?._id,
    otherUserId: u._id
  },{
    headers:{
      Authorization:`Bearer ${token}`
    }
  }
);
setSelectedUser(data.chatId);
setShowAllUser(false);
await fetchChats();
    }
    catch(err){
      toast.error("Failed to start the chat");
    }
  }
  
  const handleMessageSend = async(e:any,imageFile?:File | null)=>{
    e.preventDefault();

    if(!message.trim() && !imageFile) return;
    if(!selectedUser)
      return;

    //socket work

    if(typingTimeOut){
      clearTimeout(typingTimeOut);
      setTypingTimeOut(null)
    }

    socket?.emit("stopTyping",{
      chatId:selectedUser,
      userId:loggedInUser?._id
    })



    const token =Cookies.get("token");

    try{
      const formData=new FormData();
      formData.append("chatId",selectedUser); // Correct field name for chat ID
      if(message.trim()){
        formData.append("text",message);
      }
      if(imageFile){
        formData.append("image",imageFile); // Correct field name for image
      }
      const {data}=await axios.post(`${chat_service}/api/v1/message`,formData,{
        headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"multipart/form-data",
        }
      });

      setMessages((prev)=>{
        const currentMessages =prev ||[]
        const messageExists = currentMessages.some(
          (msg)=>msg._id===data.message._id
        );

        if(!messageExists){
          return [...currentMessages,data.message]
        }

        return currentMessages ;
      });
      setMessage("");

    

      const displayText =imageFile ?"📷 image":message

        moveChatToTop(
        selectedUser!,{
          text:displayText,
          sender:data.sender
        },
        false
      )
    }
    catch(err:any){
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to send the message");
      }
    }
  }

  const handleTyping=(value:string)=>{
    setMessage(value);
    if(!selectedUser || !socket) return;

    if(value.trim()){
      console.log("Emitting typing event for chat:", selectedUser);
      socket.emit("typing",{
        chatId:selectedUser,
        userId:loggedInUser?._id
      });
    }

    if(typingTimeOut)
    {
      clearTimeout(typingTimeOut);
    }

    const timeout = setTimeout(()=>{
      console.log("Emitting stopTyping event for chat:", selectedUser);
      socket.emit("stopTyping",{
        chatId:selectedUser,
        userId:loggedInUser?._id
      });
    },2000);

    setTypingTimeOut(timeout);
  };

  return (
    <div className='min-h-screen flex bg-gray-900 text-white relative overflow-hidden'>
      <ChatSidebar 
      sidebarOpen={sidebarOpen} 
      setSidebarOpen={setSidebarOpen} 
      showAllUsers={showAllUser} 
      setShowAllUsers={setShowAllUser}
      users={users}
      loggedInUser={loggedInUser}
      chats={chats}
      selectedUser={selectedUser}
      setSelectedUser={setSelectedUser}
      handleLogout={handleLogout} 
      createChat={createChat}
      onlineUsers={onlineUsers}/>

      <div className='flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10 '>
      
      <ChatHeader
       user={user}
       setSidebarOpen={setSidebarOpen} 
       isTyping={isTyping}
       onlineUsers={onlineUsers}
       />

       <ChatMessages 
       selectedUser={selectedUser}
       messages={messages}
       loggedInUser={loggedInUser}
       />

       <MessageInput 
       selectedUser={selectedUser} message={message}
       setMessage={handleTyping}
       handleMessageSend={handleMessageSend}/>
      </div>
    </div>

    
  );
};

export default ChatApp
