import { useState, useEffect } from 'react';
import { socket } from "../server";
import { AuthContext } from './AuthContext';
import Cookies from "js-cookie";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContextProvider = ({children})=>{
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [user2, setUser2] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [onCall, setOnCall] = useState(false);
  const [calling, setCalling] = useState(false);
  const [callingUser, setCallingUser] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [peer, setPeer] = useState(null);// other user stream
  const [participants, setParticipants] = useState(null);
  const navigate = useNavigate();
  // check if user is alreADY LOGGED IN(through js cookies)
  useEffect(()=>{
    const token = Cookies.get("chat-app-token");
    // console.log(token);
    
    if(token){
      setIsLoading(true);
      axios.get("https://chat-app-server-se59.onrender.com/api/v1/users/user/info", {headers:{
        token,
      }}).then((res)=>{
        setUser(res.data?.data.user);
        // console.log(res.data?.data.user);
        setIsLoading(false);
        navigate("/");
        
      }).catch((err)=>{
        console.log(err);
        setIsLoading(false);
        navigate("/login");
      }
    )
    }else{
      navigate("/login");
    }
    
  }, []);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    // socket.on('foo', onFooEvent);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <AuthContext.Provider value={{isConnected, setUser, user, isLoading, onlineUsers, user2, onCall, setCalling, setOnCall, calling, setUser2, setOnlineUsers, messages, setMessages, callingUser, setCallingUser, localStream, setLocalStream, peer, setPeer, participants, setParticipants}}>
      {isLoading?(
        <p className='flex-center font-bold text-xl'>Loading...</p>
      ):(children)}
    </AuthContext.Provider>
  );
}