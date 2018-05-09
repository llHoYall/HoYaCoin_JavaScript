const WebSockets = require("ws");

const sockets = [];

const getSockets = () => sockets;

const startP2PServer = server => {
  const ws_server = new WebSockets.Server({ server });
  ws_server.on("connection", ws => {
    initSocketConnection(ws);
  });
  console.log("HoYaCoin P2P server running");
};

const initSocketConnection = socket => {
  sockets.push(socket);
  socket.on("message", data => {
    console.log(data);
  });
  setTimeout(() => {
    socket.send("welcome");
  }, 5000);
};

const connectToPeers = new_peer => {
  const ws = new WebSockets(new_peer);
  ws.on("open", () => {
    initSocketConnection(ws);
  });
};

module.exports = {
  startP2PServer,
  connectToPeers
};
