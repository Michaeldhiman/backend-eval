import { FaUserSecret } from 'react-icons/fa';
import { MdCall, MdCallEnd } from "react-icons/md";

const VideoNotification = ({onCall, calling, callingUser, handleJoinCall, cancelCallNotification, user, user2, onlineUsers}) => {


  // console.log({onCall, calling, callingUser});
  


  return (calling && !onCall && callingUser)?(
    <div className='absolute bg-transparent flex-center h-screen w-screen flex-col'>
      <div className='bg-white text-black p-8 flex-col text-4xl rounded-t-full gap-3 flex-center'>
      {callingUser?.userDetails?.image?<img className='w-20 h-20 rounded-full' src={callingUser?.userDetails?.image} alt="user-pic" />:<FaUserSecret size={80} className='rounded-full cursor-pointer text-black'/>}
        <p className='text-center font-bold'>{callingUser?.userDetails?.username} is calling</p>
        <p className='text-center font-semibold text-lg'>{callingUser?.userDetails?.email}</p>
        <div className='flex gap-4'>
            <button 
            onClick={handleJoinCall}
            className='p-3 cursor-pointer text-2xl bg-green-600 rounded-full'><MdCall className='text-white' size={28}/></button>
            <button 
            onClick={()=>cancelCallNotification({user:user, user2:callingUser})}
            className='p-3 cursor-pointer text-2xl bg-red-600 rounded-full'><MdCallEnd className='text-white' size={28}/></button>
        </div>
      </div>
    </div>
  ):(calling && !callingUser && !onCall)?(
    <div className='bg-transparent absolute flex-center h-screen w-screen'>
      <div className='flex flex-col gap-3 justify-center items-center bg-slate-800 p-4 rounded-lg'>
        <p className='text-xl p-4 rounded-full'>Calling {user2?.email?.length>23?`${user2?.email?.substring(0, 27)}...`:user2?.email}</p>
        <button 
        onClick={()=>{
          const otherUser = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId.toString() === user2?._id);
          cancelCallNotification({user, user2:otherUser});
        }}
        className='p-4 cursor-pointer text-xl bg-red-500 w-fit rounded-full'>Cancel</button>
      </div>
    </div>
  ):null;
}

export default VideoNotification
