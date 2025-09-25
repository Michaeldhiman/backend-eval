import { FaUserSecret } from 'react-icons/fa';
import { FaVideo } from "react-icons/fa";
import { AiOutlineSend } from "react-icons/ai";
import { useForm } from 'react-hook-form';
import Cookies from "js-cookie";
import axios from 'axios';
import { socket } from '../../server';
import { useAuthContext } from '../../context/AuthContext';
import { useEffect, useRef, useState } from 'react';

const ChatArea = ({user1, user2}) => {
  const {setMessages, messages} = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [allMessages, setAllMessages] = useState(null);
  const bottomRef = useRef(null);
  const formRef = useRef(null);
  const {setCalling} = useAuthContext();

  /*Single object of all messages = {
  left,
  message
  }*/
  // console.log(user2);

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }, [user2, messages, allMessages]);
  

  // get users messages
  useEffect(()=>{
    setMessages([]);
    if(user2){
      setLoading(true);
    const token = Cookies.get("chat-app-token");
    axios.get(`https://chat-app-server-se59.onrender.com/api/v1/messages/messages/${user2?._id}`, {
      headers:{
        token
      }
    }).then((res)=>{
    const data = res?.data?.data;
    // console.log(data);
    const currUserMessages = data?.currUserMessages
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  .map(userData => ({...userData, left: false }));

    const otherUserMessages = data?.otherUserMessages
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  .map(userData => ({...userData, left: true })); 
    const mergedMessages = [
    ...currUserMessages,
    ...otherUserMessages
    ];
    const allMessages = mergedMessages.sort((a, b) =>
  new Date(a.createdAt) - new Date(b.createdAt)
);
    setAllMessages(allMessages);
    setLoading(false);

    }).catch((err)=>{console.log(err);
      setLoading(false);
    });
    }
  }, [user2])


  const { register, handleSubmit } = useForm();
  const sendMessage = (data)=>{
    // console.log(data);
    // console.log(user2?._id);
    formRef.current?.reset();

    socket.emit("new-message", {user:user1, user2, message:data?.message});
    
    setMessages([...messages, {left:false, message:data?.message}])

    const token = Cookies.get("chat-app-token");
    axios.post("https://chat-app-server-se59.onrender.com/api/v1/messages/create", {...data, user2Id:user2?._id}, {
      headers:{
        token
      }
    }).then(()=>console.log("message saved!!!"))
    .catch((err)=>console.log(err));
  }// Both users have to send messages to connect

  if(!user2 || !user1){
    return(
    <div className='w-full h-full flex justify-center items-center'>
      <p className='font-bold text-xl rounded-full p-10 xl:text-5xl text-slate-600 bg-slate-800'>No user selected</p>
    </div>
  )
  }

  if(loading){
    return <p>Loading...</p>
  }
  
  return(
    <div className='flex flex-col h-full'>
      <div className='flex items-center h-[8.3%] px-2 py-3 border-b-slate-800 border-b-2 justify-between'>
        <div className='w-full flex gap-3 items-center'>
          {user2?.image?<img src={user2?.image} alt="user2-pic" className='w-8 cursor-pointer h-8 rounded-full' />:(<FaUserSecret size={40} className='rounded-full cursor-pointer'/>)}
          <div className='flex flex-col'>
            <p className='text-sm font-bold'>{user2?.username}</p>
            <p className='text-xs font-light'>{user2?.email}</p>
          </div>
        </div>
        <FaVideo 
        onClick={()=>{
          // initate a Video Call by socket.io and then recive it and then add peer to peer conneection in it
          socket.emit("new-video-call", { user:user1, user2 });
          setCalling(true);
        }}
        className='w-8 cursor-pointer h-8'/>
      </div>
      {/* Chat area: */}
      <div className='h-[84%] gap-20 w-full overflow-y-scroll overflow-x-hidden scrollbar px-2 py-4 flex flex-col'>
        { allMessages && allMessages?.map((messageData)=>{
            if(messageData.left){
            {/* {Sender} */}
        {/**Reciver */}
            return(
              <div key={messageData?._id} className='relative w-full'>
          <div className='bg-red-500 absolute px-8 py-3 left-3 rounded-full w-fit rounded-bl-none'>
            <p className='text-white font-light text-lg  max-w-64'>{messageData?.message}</p>
          </div>
        </div>
            )
          }
          return (
            <div key={messageData?._id} className='relative w-[100%] bg-black'>
          <div className='bg-green-500 absolute px-8 py-3 right-3 rounded-full w-fit rounded-br-none'>
            <p className='text-white font-light text-lg max-w-64'>{messageData?.message}</p>
          </div>
        </div>
          )
          })
        }
        {messages && messages?.length > 0 && messages?.map((messageData, i)=>{
          if(messageData.left){
            {/* {Sender} */}
        {/**Reciver */}
            return(
              <div key={i} className='relative w-full'>
          <div className='bg-red-500 absolute px-8 py-3 left-3 rounded-full w-fit rounded-bl-none'>
            <p className='text-white font-light text-lg  max-w-64'>{messageData?.message}</p>
          </div>
        </div>
            )
          }
          return (
            <div key={i} className='relative w-[100%] bg-black'>
          <div className='bg-green-500 absolute px-8 py-3 right-3 rounded-full w-fit rounded-br-none'>
            <p className='text-white font-light text-lg max-w-64'>{messageData?.message}</p>
          </div>
        </div>
          )
        })}
        <div ref={bottomRef}/>
      <div>
      </div>
      </div>
      <form ref={formRef} onSubmit={handleSubmit(sendMessage)} className='w-full h-[11%] p-4 bg-slate-800 flex gap-8 items-center'>
        <div className='flex flex-col justify-center gap-3 w-[90%] h-[90%]'>
          <input 
        {...register("message", {
          required:{
            message:"Message is required",
            value:true
          }
        })}
        type="text" autoComplete='off' className='text-4xl bg-transparent  outline-none p-8 focus:border h-[90%] focus:border-slate-600 rounded-full' placeholder='Message...'/>
        
        </div>
        <button className='mx-3 text-center text-xl items-center h-fit w-fit font-bold px-4 py-3 flex gap-2 rounded-lg cursor-pointer hover:bg-slate-700'>
          <AiOutlineSend size={34}/>
        </button>
        
      </form>
    </div>
  )
  
}

export default ChatArea
