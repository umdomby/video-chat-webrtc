const path = require('path');
const express = require('express');
const app = express();
const ACTIONS = require('./src/socket/actions');
const fs = require("fs");
const privateKey = fs.readFileSync(path.resolve(__dirname, './cert/serbotonline/privkey.pem'));
const certificate = fs.readFileSync(path.resolve(__dirname, './cert/serbotonline/cert.pem'));
const ca = fs.readFileSync(path.resolve(__dirname, './cert/serbotonline/chain.pem'));
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};
const https = require('https');
const httpsServer = https.createServer(credentials, app);
const io = require('socket.io')(httpsServer);

function getClientRooms() {
  const {rooms} = io.sockets.adapter;

  return Array.from(rooms.keys())
      .filter(roomID => roomID.length < 8);
}
function shareRoomsInfo() {
  io.emit(ACTIONS.SHARE_ROOMS, {
    rooms: getClientRooms()
  })
}
io.on('connection', socket => {
  shareRoomsInfo();

  socket.on(ACTIONS.JOIN, config => {
    const {room: roomID} = config;
    const {rooms: joinedRooms} = socket;

    if (Array.from(joinedRooms).includes(roomID)) {
      return console.warn(`Already joined to ${roomID}`);
    }

    const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

    clients.forEach(clientID => {
      io.to(clientID).emit(ACTIONS.ADD_PEER, {
        peerID: socket.id,
        createOffer: false
      });

      socket.emit(ACTIONS.ADD_PEER, {
        peerID: clientID,
        createOffer: true,
      });
    });

    socket.join(roomID);
    shareRoomsInfo();
  });

  function leaveRoom() {
    const {rooms} = socket;

    Array.from(rooms)
      // LEAVE ONLY CLIENT CREATED ROOM
      .filter(roomID => roomID.length < 8)
      .forEach(roomID => {

        const clients = Array.from(io.sockets.adapter.rooms.get(roomID) || []);

        clients
          .forEach(clientID => {
          io.to(clientID).emit(ACTIONS.REMOVE_PEER, {
            peerID: socket.id,
          });

          socket.emit(ACTIONS.REMOVE_PEER, {
            peerID: clientID,
          });
        });

        socket.leave(roomID);
      });

    shareRoomsInfo();
  }

  socket.on(ACTIONS.LEAVE, leaveRoom);
  socket.on('disconnecting', leaveRoom);

  socket.on(ACTIONS.RELAY_SDP, ({peerID, sessionDescription}) => {
    io.to(peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerID: socket.id,
      sessionDescription,
    });
  });

  socket.on(ACTIONS.RELAY_ICE, ({peerID, iceCandidate}) => {
    io.to(peerID).emit(ACTIONS.ICE_CANDIDATE, {
      peerID: socket.id,
      iceCandidate,
    });
  });

});

const publicPath = path.join(__dirname, 'build');
app.use(express.static(publicPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

require('dotenv').config()
const port = process.env.SERVER_PORT_HTTPS || 4444
httpsServer.listen(port, () => {
  console.log(`HTTPS Server running on port ${port}`);
});
