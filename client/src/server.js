import { io } from 'socket.io-client';
import { config } from './config';

// console.log(config.serverUrl);


// "undefined" means the URL will be computed from the `window.location` object
const URL = config.serverUrl;

export const socket = io(URL, {withCredentials:true, autoConnect:true});