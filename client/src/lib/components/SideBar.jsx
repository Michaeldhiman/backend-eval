import React, { useState } from 'react'
import { FiVideo } from "react-icons/fi";
import { FaUserSecret } from "react-icons/fa";
import UserCard from './UserCard';

const SideBar = ({onlineUsers, user}) => {
    // console.log(onlineUsers);
    const [search, setSearch] = useState("");
    let usersShown = [];
    if(search && onlineUsers){
      usersShown = onlineUsers?.filter((onlineUser)=>onlineUser!==null)?.filter((onlineUser)=>onlineUser?.mongodbId !== user?._id).filter((onlineUser)=>onlineUser?.userDetails.username?.toLowerCase()?.includes(search?.toLowerCase())||onlineUser?.userDetails.email?.toLowerCase()?.includes(search?.toLowerCase()))?.sort((a, b)=>b?.unreadMessages - a?.unreadMessages);
    }else{
      usersShown = onlineUsers?.filter((onlineUser)=>onlineUser!==null)?.filter((onlineUser)=>onlineUser?.mongodbId !== user?._id)?.sort((a, b)=>b?.unreadMessages - a?.unreadMessages);
    }
  return (
    <div className='flex flex-col overflow-hidden'>
      <div className='border-b-2 border-b-slate-800 flex items-center justify-between px-3 py-2'>
        <div className='flex items-center gap-4'>
          <FiVideo size={56} className='text-slate-700'/>
        <h3 className='text-2xl font-bold text-slate-700'>VidChat</h3>
        </div>
        {user?.pic?<img src={user?.pic} alt="user-pic" className='w-10 cursor-pointer h-10 rounded-full' />:(<FaUserSecret size={30} className='rounded-full cursor-pointer'/>)}
      </div>
      <div className='flex justify-center'>
        <input 
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        type="text" placeholder='Search here...' className='bg-slate-700 font-medium outline-none text-white xl:px-4 xl:py-3 px-3  py-2 w-full shadow shadow-slate-600 focus:border focus:border-slate-600'/>
      </div>
      <div className='flex py-2 max-h-screen h-screen scrollbar flex-col overflow-y-scroll overflow-x-hidden text-white font-bold'>
      {usersShown?.length>0?usersShown?.map((onlineUser)=>{
        
            return(
                
                    <UserCard key={onlineUser?.socketId} user={{...onlineUser?.userDetails, _id:onlineUser?.mongodbId, socketId:onlineUser?.socketId, unreadMessages:onlineUser?.unreadMessages}}/>
                  );
                }):(<div className='w-full h-full flex justify-center items-center'>
                  <p className='font-bold text-slate-700 text-3xl'>No User Found!</p>
                </div>)}
      </div>
    </div>
  )
}

export default SideBar;
