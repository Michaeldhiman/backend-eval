import React, { useEffect, useRef } from 'react'

const Video = ({localstream, className}) => {
    const videoRef = useRef(null);
    useEffect(()=>{
        videoRef.current.srcObject = localstream;
    }, [localstream])
  return (
    <video ref={videoRef} autoPlay playsInline className={`rounded-md ${className}`}>
    </video>
  )
}

export default Video
