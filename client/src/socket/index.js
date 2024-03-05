import {io} from 'socket.io-client';

const options = {
  "force new connection": true,
  reconnectionAttempts: "Infinity", // avoid having user reconnect manually in order to prevent dead clients after a server restart
  timeout : 10000, // before connect_error and connect_timeout are emitted.
  transports : ["websocket"]
}

//const socket = io('/', options);
//const socket = io.connect("localhost:4444", options);
const socket = io.connect("https://serbot.online:4444", options);

export default socket;