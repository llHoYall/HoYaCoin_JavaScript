const WebSockets = require("ws");
const Blokchain = require("./blockchain");

const { getLastBlock } = Blokchain;

// Message Types
const GET_LATEST = "GET_LATEST";
const GET_ALL = "GET_ALL";
const BLOCKCHAIN_RSP = "BLOCKCHAIN_RSP";

// Message Creators
const getLatest = () => {
  return {
    type: GET_LATEST,
    data: null
  };
};

const getAll = () => {
  return {
    type: GET_ALL,
    data: null
  };
};

const blockchainResponse = data => {
  return {
    type: BLOCKCHAIN_RSP,
    data
  };
};

const sockets = [];

const getSockets = () => sockets;

const startP2PServer = server => {
  const ws_server = new WebSockets.Server({ server });
  ws_server.on("connection", ws => {
    initSocketConnection(ws);
  });
  console.log("HoYaCoin P2P server running");
};

const initSocketConnection = ws => {
  sockets.push(ws);
  handleSocketMessage(ws);
  handleSocketError(ws);
  sendMessage(ws, getLatest());
};

const parseData = data => {
  try {
    return JSON.parse(data);
  } catch (e) {
    console.log(e);
    return null;
  }
};

const handleSocketMessage = ws => {
  ws.on("message", data => {
    const message = parseData(data);
    if (message === null) {
      return;
    }
    console.log(message);
    switch (message.type) {
      case GET_LATEST:
        sendMessage(ws, getLastBlock());
        break;
    }
  });
};

const sendMessage = (ws, message) => ws.send(JSON.stringify(message));

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
