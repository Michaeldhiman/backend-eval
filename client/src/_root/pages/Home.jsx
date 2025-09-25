import Peer from 'simple-peer/simplepeer.min.js'
import { useCallback, useEffect, useRef } from 'react'
import { useAuthContext } from '../../context/AuthContext'
import SideBar from '../../lib/components/SideBar';
import ChatArea from '../../lib/components/ChatArea';
import sound from "../../assets/sound.mp3";
import { socket } from '../../server';
import VideoNotification from '../../lib/components/VideoNotification';
import VideoComponent from '../../lib/components/VideoComponent';
import { config } from '../../config';

/**
 * peer = {
 *   peerInstance, // simple-peer object
 *   stream        // remote MediaStream when connected
 * }
 */

const Home = () => {
  const {
    user,
    user2,
    setOnlineUsers,
    isConnected,
    onlineUsers,
    setOnCall,
    setMessages,
    messages,
    onCall,
    calling,
    setCalling,
    callingUser,
    setCallingUser,
    localStream,
    setLocalStream,
    setParticipants,
    peer,
    participants,
    setPeer,
  } = useAuthContext();
  // const [incomingOffer, setIncomingOffer] = useState(null);

  // Store incoming offer signal from caller before call accept
  // const [incomingOfferSignalData, setIncomingOfferSignalData] = useState(null);

  const audioRef = useRef();

  const cancelCallNotification = useCallback((data)=>{
    setCallingUser(null);
    setCalling(false);
    socket.emit("call-notification-rejected", data);
  }, [socket])

  const hungUpCall = useCallback(() => {
    
    if(peer){
      peer?.peerInstance?.destroy();
    }
    setPeer(null);
    if (localStream) {
    localStream?.getTracks().forEach(track => track.stop());
  }
  localStream?.getTracks().forEach(track => track.stop());
    setCalling(false);
    setOnCall(false);
    setCallingUser(null);
    setLocalStream(null);
    setParticipants(null);
    const initiator = participants?.caller?.mongodbId.toString() === user?._id?.toString();
  let otherUser = null;
  if(initiator){
     otherUser = participants?.reciver;
  }else{
    otherUser = participants?.caller;
  }
    socket.emit("end-call", {user, user2:otherUser});
  }, [peer]);

  // Get media devices and set localStream if not already set
  const getMediaDevices = useCallback(async () => {
    try {
      if (localStream) return localStream;
      const constraints = { video: { width: 640, height: 480 }, audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.log("Error in getting localStream: ", error);
    }
  }, [localStream, setLocalStream]);

  // Create and setup peer, returns the Peer instance
  const createPeer = useCallback(async ({initiator, stream, participants, user, otherUser}) => {
  // console.log("=== CREATING PEER ===");
  // console.log("Initiator:", initiator);
  // console.log("Stream:", !!stream);
  // console.log("participants:", participants);
  
  const peerInstance = new Peer({
    initiator,
    stream,
    trickle: true,
    config: {
      iceServers: [
        {
          urls: "turn:global.relay.metered.ca:80",
          username: config.meteredUsername,
          credential: config.meteredPassword,
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: config.meteredUsername,
          credential: config.meteredPassword,
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: config.meteredUsername,
          credential: config.meteredPassword,
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: config.meteredUsername,
          credential: config.meteredPassword,
      },
      ]
    }
  });

  peerInstance.on("signal", (data) => {
    // console.log("📡 Sending signal:", data.type);
    setParticipants(participants);
    socket.emit("peer-to-peer", {signalData:data, user, user2:otherUser, participants});
  });

  peerInstance.on("stream", (remoteStream) => {
    // console.log("🎥 REMOTE STREAM RECEIVED!", remoteStream);
    // console.log("Remote stream tracks:", remoteStream.getTracks().length);
    setPeer((prev) => ({ 
      ...prev, 
      stream: remoteStream
    }));
  });

  peerInstance.on("connect", () => {
    console.log("✅ Peer connected!");
  });

  peerInstance.on("error", (err) => {
    console.error("❌ Peer error:", err);
    hungUpCall();
  });

  peerInstance.on("close", () => {
    console.log("🔌 Peer connection closed");
    hungUpCall();
  });

  return peerInstance;
}, [user, socket, hungUpCall, setPeer]);
  

  // Register yourself when socket connects
  useEffect(() => {
    if (isConnected && user && socket) {
      socket.emit("user-joined", user);
    }
  }, [isConnected, user, socket]);

  // Receives signal from other peer: store offer if initial, else signal existing peer
  const handleCompletePeerToPeer = useCallback(async(data) => {
  // console.log("=== PEER-TO-PEER SIGNAL RECEIVED ===");
  // console.log("Signal data:", data?.signalData);
  // console.log("Current peer exists:", !!peer?.peerInstance);
  // console.log("Signal type:", data?.signalData?.type);
  
  setOnCall(true);
  setCalling(false);
  const initiator = data?.participants?.caller?.mongodbId.toString() === user?._id?.toString();
  let otherUser = null;
  if(initiator){
     otherUser = data?.participants?.reciver;
  }else{
    otherUser = data?.participants?.caller;
  }
  // For caller part: After getting the signal or creating it it is not direcly set we have to directly signal for the user
  if(peer){
    // console.log("==PEER IS CREATED==");
    // console.log("signaling data: ",data?.signalData);
    peer?.peerInstance.signal(data?.signalData);
    return;
  }else{
    const stream = await getMediaDevices();
  
  
  const newPeer = await createPeer({initiator, stream, participants:data?.participants, user, otherUser});
  // send the signal directly 
  if(data?.signalData){
    newPeer?.signal(data?.signalData);
  }
  
  setPeer(prev=>prev?prev: {
    peerInstance:newPeer,
    stream:null
  });
  }
  
}, [peer, user2, user, getMediaDevices, createPeer, setPeer, setOnCall, setCalling]);

  // Receiver (callee) accepts a call
  const handleJoinCall = useCallback(async () => {
   const participants = {
      caller:callingUser,/**_id===mongodbId */
      reciver:user
    }
  socket.emit("accepted-call", participants);
  
}, [callingUser, socket]);

  

  // Socket listeners including messaging flow (unchanged)
  useEffect(() => {
    // Messaging code remains unchanged
    const handleOnlingUsers = ({ users, disconnectedUser, newUser }) => {
      if (!disconnectedUser || disconnectedUser === undefined || onlineUsers?.length <= 0) {
        setOnlineUsers(users);
      } else {
        setOnlineUsers((prev) =>
          prev.map((prevOnlineUser) =>
            prevOnlineUser?.mongodbId !== disconnectedUser?.mongodbId ? prevOnlineUser : null
          )
        );
        setOnlineUsers((prev) => [...prev, newUser]);
      }
    };

    const handleRecivedMessages = ({ user, message }) => {
      audioRef.current.play();
      if (user?.mongodbId?.toString() === user2?._id?.toString()) {
        setMessages([...messages, { left: true, message, user }]);
      } else {
        setOnlineUsers((prev) =>
          prev.map((prevOnlineUser) =>
            prevOnlineUser?.mongodbId.toString() === user?.mongodbId.toString()
              ? { ...prevOnlineUser, unreadMessages: parseInt(prevOnlineUser?.unreadMessages?.toString()) + 1 }
              : prevOnlineUser
          )
        );
      }
    };

    // Video call notification (callee sees popup)
    const handleCallNotification = (data) => {
      if (!calling && !onCall && !callingUser) {
        setCalling(true);
        setCallingUser(data?.sender);
      } else {
        // console.log("call rejected!!!");
        socket.emit("call-notification-rejected",{user:user, user2:data?.sender});
      }
    };

    const handleToggleVideo = ()=>{
      if(peer && peer?.stream){
        const videoTracks = peer?.stream?.getVideoTracks()[0];
        videoTracks.enabled = !videoTracks?.enabled;
      }
    }

    const handleToggleAudio = ()=>{
      if(peer && peer?.stream){
        const audioTracks = peer?.stream?.getAudioTracks()[0];
        audioTracks.enabled = !audioTracks?.enabled;
      }
    }

    const handleEndCall = ()=>{
      
      setLocalStream(null);
      if(peer){
        peer.peerInstance.destroy();
      }
      setPeer(null);
    if (localStream) {
    localStream?.getTracks().forEach(track => track.stop());
  }
  localStream?.getTracks().forEach(track => track.stop());
    setCalling(false);
    setOnCall(false);
    
    setCallingUser(null);
    setLocalStream(null);
    setParticipants(null);
    } 

    const handleRejectedNotification = ()=>{
      setCallingUser(null);
      setCalling(false);
    }

    socket.on("get-online-users", handleOnlingUsers);
    socket.on("new-message-recived", handleRecivedMessages);
    socket.on("video-call-notification", handleCallNotification);
    // socket.on("call-accepted", handleCallerPeer);
    socket.on("peer-to-peer", handleCompletePeerToPeer);
    socket.on("toggle-video", handleToggleVideo);
    socket.on("toggle-audio", handleToggleAudio);
    socket.on("end-call", handleEndCall);
    socket.on("call-notification-rejected", handleRejectedNotification)
    return () => {
      socket.off("get-online-users", handleOnlingUsers);
      socket.off("new-message-recived", handleRecivedMessages);
      socket.off("video-call-notification", handleCallNotification);
      // socket.off("call-accepted", handleCallerPeer);
      socket.off("peer-to-peer", handleCompletePeerToPeer);
      socket.off("toggle-video", handleToggleVideo);
      socket.off("toggle-audio", handleToggleAudio);
      socket.off("end-call", handleEndCall);
      socket.off("call-notification-rejected", handleRejectedNotification);
    };
  }, [
    socket,
    messages,
    onlineUsers,
    setOnlineUsers,
    calling,
    onCall,
    callingUser,
    setCalling,
    setCallingUser,
    handleCompletePeerToPeer,
    setMessages,
    user2,
  ]);

  return (
    <div className="w-full h-full flex items-center overflow-hidden">
      <audio ref={audioRef} src={sound} className="hidden"></audio>
      <div className="flex-1/6 h-screen border-r-2 border-r-slate-800 max-h-screen">
        <SideBar onlineUsers={onlineUsers} user={user} />
      </div>
      <div className="flex-1/2 h-screen">
        <ChatArea user1={user} user2={user2} />
      </div>
      <VideoNotification onlineUsers={onlineUsers} cancelCallNotification={cancelCallNotification} user={user} user2={user2} onCall={onCall} calling={calling} callingUser={callingUser} handleJoinCall={handleJoinCall} />
      <VideoComponent hungUpCall={hungUpCall} />
    </div>
  );
};

export default Home;
