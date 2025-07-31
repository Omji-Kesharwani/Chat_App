"use client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, {Toaster} from "react-hot-toast"




export const user_service=process.env.NEXT_PUBLIC_USER_SERVICE;
export const chat_service=process.env.NEXT_PUBLIC_CHAT_SERVICE;

export interface User{
  _id:string,
  name:string,
  email:string,
}

export interface Chat{
  _id:string,
  users:string[],
  latestMessage:{
    text:string,
    sender:string
  };
  createdAt:string,
  updatedAt:string,
  unseenCount?:number;
}


export interface Chats{
  _id:string,
  user:User,
  chat:Chat
}

interface AppContextType{
  user:User|null;
  loading:boolean;
  isAuth:boolean;
  setUser:React.Dispatch<React.SetStateAction<User|null>>;
  setIsAuth:React.Dispatch<React.SetStateAction<boolean>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser:()=>Promise<void>;
  fetchUsers:()=>Promise<void>;
  fetchChats:()=>Promise<void>;
  chats:Chats[]|null;
  users:User[] | null ;
  setChats:React.Dispatch<React.SetStateAction<Chats[]|null>>
}

const AppContext = createContext<AppContextType|undefined>(undefined);

interface AppProviderProps{
  children:ReactNode;
}

export const AppProvider:React.FC<AppProviderProps> = ({children})=>{
  const [user,setUser]=useState<User|null>(null)
  const [isAuth,setIsAuth]=useState<boolean>(false)
  const [loading,setLoading]=useState<boolean>(true);

  async function fetchUser(){
    try{
       const token =Cookies.get("token");

       const {data}=await axios.get(`${user_service}/api/v1/me`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
       });
       setUser(data);
       setIsAuth(true);
       setLoading(false);
    }
    catch(err){
      console.log(err);
      setLoading(false);
    }
  }
 
   async function logoutUser(){
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("User Logged Out");
   }

   const [chats,setChats]=useState<Chats[] | null>(null)

   async function fetchChats(){
      const token= Cookies.get("token");
    try{
     const {data} = await axios.get(`${chat_service}/api/v1/chat/all`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
     });

     setChats(data.chats)

    }
    catch(err){

    }
   }



  const [users,setUsers]=useState<User[]|null>(null);

  async function fetchUsers(){
    const token =Cookies.get("token");
    try{
       const {data} =await axios.get(`${user_service}/api/v1/user/all`,{
        headers:{
          Authorization:`Bearer ${token}`
        }
       });

       setUsers(data);

    }
    catch(err){
      console.log(err);
    }
  }

  useEffect(()=>{
    fetchUser();
    fetchChats();
    fetchUsers();
  },[]);
  return (
    <AppContext.Provider value={{user,setUser,isAuth,setIsAuth,loading,setLoading,logoutUser,fetchChats,fetchUsers,chats,users,setChats,}}>
      {children}
      <Toaster/>
      </AppContext.Provider>

  );
};

export const useAppData=():AppContextType=>{
  const context=useContext(AppContext)
  if(!context){
    throw new Error("useappdata must be used with AppProvider");
  }
  return context ;
}

export { AppContext };

