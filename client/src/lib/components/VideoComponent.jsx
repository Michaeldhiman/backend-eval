// import React, { useState } from 'react'
import { FiCamera, FiCameraOff } from 'react-icons/fi';
import {IoMdMicOff} from "react-icons/io"
import { useAuthContext } from '../../context/AuthContext'
import Video from './Video';
import { MdCallEnd, MdMic } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { socket } from '../../server';

const VideoComponent = ({hungUpCall}) => {
    const {peer, localStream, participants, user} = useAuthContext();
    const [isMicOn, setIsMicOn] = useState(!!localStream?.getAudioTracks()[0].enabled || true);
    const [isCameraOn, setIsCameraOn] = useState(!!localStream?.getVideoTracks()[0].enabled || true);
    // console.log(peer, localStream);
    // const [isOtherUserClick, setOtherUser] = useState(true);

  useEffect(()=>{
    setIsCameraOn(localStream?.getVideoTracks()[0].enabled);
    setIsMicOn(!!localStream?.getAudioTracks()[0].enabled);
  }, [localStream])

    const handleCameraOn = ()=>{
      const videoTracks = localStream.getVideoTracks()[0];
      videoTracks.enabled = !videoTracks.enabled;
      setIsCameraOn(videoTracks?.enabled);
      const initiator = participants?.caller?.mongodbId.toString() === user?._id?.toString();
  let otherUser = null;
  if(initiator){
     otherUser = participants?.reciver;
  }else{
    otherUser = participants?.caller;
  }

      socket.emit("toggle-video", {user, user2:otherUser});
    }

    const handleMicOn = ()=>{
      const audioTracks = localStream.getAudioTracks()[0];
      audioTracks.enabled = !audioTracks.enabled;
      setIsMicOn(audioTracks?.enabled);
      const initiator = participants?.caller?.mongodbId.toString() === user?._id?.toString();
  let otherUser = null;
  if(initiator){
     otherUser = participants?.reciver;
  }else{
    otherUser = participants?.caller;
  }

      socket.emit("toggle-audio", {user, user2:otherUser});
    }

    
  return (
    <>
    {localStream && peer &&(
        <div className='absolute z-50 bg-slate-700 h-screen w-screen'>
      {localStream && <Video localstream={localStream} className={"w-36 h-36 absolute -top-4 left-[18.4%]"}/>}
      {peer && peer?.stream && <Video localstream={peer?.stream} className={"w-full h-full"}/>}
      <div className='absolute bottom-0 bg-black w-full p-4 flex justify-center items-center gap-3'>

        <button 
        onClick={hungUpCall}
        className='cursor-pointer p-3 bg-red-700 text-white rounded-md'>
          <MdCallEnd size={30}/>
        </button>
        <button 
        onClick={handleCameraOn}
        className='p-3 bg-blue-800 rounded-md'>
          {isCameraOn?<FiCamera size={30}/>:<FiCameraOff size={30}/>}
        </button>
        <button
        onClick={handleMicOn}
        className='p-3 bg-blue-800 rounded-md'>
          {isMicOn?<MdMic size={30}/>:<IoMdMicOff size={30} />}
        </button>
      </div>
    </div>
    )}
    </>
  )
}

export default VideoComponent;
