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
  handleSocketError(socket);
  socket.on("message", data => {
    console.log(data);
  });
  setTimeout(() => {
    socket.send("welcome");
  }, 5000);
};

const handleSocketError = ws => {
  const closeSocketConnection = ws => {
    ws.close();
    sockets.splice(sockets.indexOf(ws), 1);
  };
  ws.on("close", () => closeSocketConnection(ws));
  ws.on("error", () => closeSocketConnection(ws));
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
