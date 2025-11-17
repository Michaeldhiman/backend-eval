import { io } from 'socket.io-client';
import { config } from './config';

// console.log(config.serverUrl);

const URL = config.serverUrl;

export const socket = io(URL, {withCredentials:true, autoConnect:true});