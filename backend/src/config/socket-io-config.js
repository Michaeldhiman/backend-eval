import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "../app.js";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "https://client-chat-app-liard.vercel.app"],
    methods: ["GET", "POST"],
    credentials:true
  }
});

/**
 * onlineUser = {
    socketId, 
    mongodbId,
    userDetails:{
      userbname,
      email, 
      pic
    }
  }
 */

let onlineUsers = [];

io.on("connection", (socket) => {
  socket.on("user-joined", (data)=>{

    const newUser = {
      socketId:socket?.id,
      mongodbId:data?._id,
      unreadMessages:0,
      userDetails:{
        username:data?.username,
        email:data?.email,
        image: data?.pic
      }
    }
    const isUserExisting = onlineUsers.some((user)=>user?.mongodbId===data._id);
    if(!isUserExisting){
      onlineUsers.push(newUser);
    }
    io.emit("get-online-users", {users:onlineUsers, disconnectedUser:null, newUser});
  });

  // send message to a particular user
  socket.on("new-message", ({user/**Sending message */, user2/**Reciving message */, message})=>{
    // console.log(message, user2);

    const currUser2 = onlineUsers.find((user)=>user?.mongodbId === user2._id);
    const currUserData = onlineUsers.find((onlineUser)=>onlineUser?.userDetails?.email === user?.email);// Sending user data
    
    console.log("user2: ", currUser2);// for delay of messaging[removing can cuse bugs]
    
    
    io.to(currUser2?.socketId).emit("new-message-recived", {user:currUserData, message});
  });

  // User disconnected
  socket.on("disconnect", ()=>{
    const disconnectedUser = onlineUsers?.find((onlineUser)=>onlineUser?.socketId === socket.id);
    onlineUsers = onlineUsers.filter((user)=>user.socketId!==socket.id);
    io.emit("get-online-users", {users:onlineUsers, disconnectedUser, newUser:null});
    
  });

  // video calling part
  socket.on("new-video-call", (data)=>{
    const sender = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user?._id);
    const reciver = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user2?._id);
    io.to(reciver?.socketId).emit("video-call-notification", {sender});
  });

  socket.on("accepted-call", (participants)=>{
    const reciver = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === participants?.caller?.mongodbId);
    const sender = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === participants?.reciver?._id);
    const sendParticipants = {
      caller:reciver,
      reciver:sender
    }
    io.to(reciver?.socketId).emit("peer-to-peer", {sender, signalData:null, participants:sendParticipants});
  });

  socket.on("peer-to-peer", (data)=>{
    const sender = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user?._id);
    const reciver = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user2?.mongodbId);
    
    // console.log("sender, reciver: ", sender, reciver);
    
    io.to(reciver?.socketId).emit("peer-to-peer", {sender, signalData:data?.signalData, participants:data?.participants});
  });


  socket.on("toggle-video", (data)=>{
    const sender = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user?._id);
    const reciver = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user2?.mongodbId);
    io.to(reciver?.socketId).emit("toggle-video", null);
  });

  socket.on("toggle-audio", (data)=>{
    const sender = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user?._id);
    const reciver = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user2?.mongodbId);
    io.to(reciver?.socketId).emit("toggle-audio", null);
  });

  socket.on("end-call", (data)=>{
    const sender = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user?._id);
    const reciver = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user2?.mongodbId);
    io.to(reciver?.socketId).emit("end-call", null);
  });

  socket.on("call-notification-rejected", (data)=>{
    const sender = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user?._id);
    const reciver = onlineUsers.find((onlineUser)=>onlineUser?.mongodbId === data?.user2?.mongodbId);
    io.to(reciver?.socketId).emit("call-notification-rejected", null);
  })

  
});

export default httpServer;