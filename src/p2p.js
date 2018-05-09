const WebSockets = require("ws");

const sockets = [];

const startP2PServer = server => {
  const ws_server = new WebSockets.Server({ server });
  ws_server.on("connection", ws => {
    console.log(`Hello ${ws}`);
  });
  console.log("HoYaCoin P2P server running");
};

module.exports = {
  startP2PServer
};
